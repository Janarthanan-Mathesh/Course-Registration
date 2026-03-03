import { Platform, NativeModules } from 'react-native';

const API_PORT = 5000;
const MANUAL_API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;
const EXTRA_API_BASES = (process.env.EXPO_PUBLIC_API_BASE_URLS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const getHostFromRuntime = () => {
  const scriptURL = NativeModules?.SourceCode?.scriptURL || '';
  const match = scriptURL.match(/https?:\/\/([^/:]+):\d+/i);
  if (match?.[1]) return match[1];

  const hostUri = process.env.EXPO_PUBLIC_DEV_SERVER_HOST;
  if (!hostUri) return '';
  return hostUri.split(':')[0] || '';
};

const isValidRuntimeHost = (host) => {
  if (!host) return false;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  // Keep local/private IPv4 hosts and ignore tunnel domains for API host inference.
  return /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})$/.test(
    host
  );
};

const buildPortVariants = (basePort) => {
  const port = Number(basePort) || API_PORT;
  return [port, port + 1, port + 2, port + 3, port + 4];
};

const expandBaseByPorts = (baseUrl) => {
  try {
    const parsed = new URL(baseUrl);
    const protocol = parsed.protocol;
    const host = parsed.hostname;
    const path = parsed.pathname.endsWith('/api') ? '/api' : parsed.pathname.replace(/\/$/, '');
    const startPort = parsed.port ? Number(parsed.port) : API_PORT;
    return buildPortVariants(startPort).map((p) => `${protocol}//${host}:${p}${path}`);
  } catch (_) {
    return [baseUrl];
  }
};

const buildCandidateBaseUrls = () => {
  const candidates = [];

  if (MANUAL_API_BASE) {
    candidates.push(...expandBaseByPorts(MANUAL_API_BASE.replace(/\/$/, '')));
  }

  EXTRA_API_BASES.forEach((base) => {
    candidates.push(...expandBaseByPorts(base.replace(/\/$/, '')));
  });

  const runtimeHost = getHostFromRuntime();
  if (isValidRuntimeHost(runtimeHost)) {
    buildPortVariants(API_PORT).forEach((p) => candidates.push(`http://${runtimeHost}:${p}/api`));
  }

  if (Platform.OS === 'android') {
    buildPortVariants(API_PORT).forEach((p) => candidates.push(`http://10.0.2.2:${p}/api`));
  }

  buildPortVariants(API_PORT).forEach((p) => {
    candidates.push(`http://localhost:${p}/api`);
    candidates.push(`http://127.0.0.1:${p}/api`);
  });

  return [...new Set(candidates)];
};

const withTimeout = async (promise, timeoutMs = 6000) => {
  let timeoutHandle;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle);
  }
};

let cachedApiBase = '';

const resolveApiBase = async () => {
  if (cachedApiBase) return cachedApiBase;

  const candidates = buildCandidateBaseUrls();
  for (const base of candidates) {
    try {
      const response = await withTimeout(fetch(`${base}/health`, { method: 'GET' }), 2500);
      if (response.ok) {
        cachedApiBase = base;
        return base;
      }
    } catch (_) {
      // Try next candidate.
    }
  }

  cachedApiBase = candidates[0];
  return cachedApiBase;
};

const buildHeaders = (token, isJson = true) => {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const message = data.message || 'Request failed';
    throw new Error(message);
  }
  return data;
};

const requestWithApiBase = async (method, path, body, token) => {
  const execute = async (base) => {
    const response = await withTimeout(
      fetch(`${base}${path}`, {
        method,
        headers: buildHeaders(token, method !== 'GET'),
        ...(method !== 'GET' ? { body: JSON.stringify(body || {}) } : {}),
      })
    );
    return parseResponse(response);
  };

  const candidates = buildCandidateBaseUrls();
  const orderedCandidates = cachedApiBase
    ? [cachedApiBase, ...candidates.filter((base) => base !== cachedApiBase)]
    : candidates;

  for (const base of orderedCandidates) {
    try {
      const data = await execute(base);
      cachedApiBase = base;
      return data;
    } catch (error) {
      const networkError =
        error?.message === 'Network request failed' ||
        error?.message === 'Request timeout' ||
        /network request failed/i.test(error?.message || '');

      if (!networkError) {
        // Server reached; this is a real API/business error, not connectivity.
        cachedApiBase = base;
        throw error;
      }

    }
  }

  cachedApiBase = '';
  const fallbackBase = (await resolveApiBase()) || orderedCandidates[0] || 'http://localhost:5000/api';
  throw new Error(
    `Network request failed. Ensure backend is running and reachable at ${fallbackBase}.`
  );
};

export const apiGet = async (path, token) => requestWithApiBase('GET', path, null, token);

export const apiPost = async (path, body, token) => {
  return requestWithApiBase('POST', path, body, token);
};

export const apiPut = async (path, body, token) => {
  return requestWithApiBase('PUT', path, body, token);
};

export const apiDelete = async (path, token) => {
  return requestWithApiBase('DELETE', path, null, token);
};
