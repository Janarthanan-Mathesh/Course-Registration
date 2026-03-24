import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

const API_PORT = 5000;
const API_PORT_SCAN_SPAN = 0;
const REQUEST_TIMEOUT_MS = 5000;
const HEALTH_TIMEOUT_MS = 900;
const MAX_CANDIDATE_BASES = 60;
const HEALTH_BATCH_SIZE = 8;
const FORCE_MANUAL_API_BASE = String(process.env.EXPO_PUBLIC_API_FORCE_BASE || '').toLowerCase() === 'true';
const MANUAL_API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

const extractBaseUrls = (value) => {
  if (!value) return [];

  const matches = String(value).match(/https?:\/\/[^\s,;]+/g);
  if (matches?.length) {
    return matches.map((entry) => entry.trim().replace(/\/$/, ''));
  }

  return String(value)
    .split(/[\s,;]+/)
    .map((entry) => entry.trim().replace(/\/$/, ''))
    .filter(Boolean);
};

const EXTRA_API_BASES = extractBaseUrls(process.env.EXPO_PUBLIC_API_BASE_URLS);

const extractHost = (value) => {
  if (!value) return '';
  const normalized = String(value).trim();
  if (!normalized) return '';

  // Values can be like:
  // - http://192.168.1.5:8081
  // - 192.168.1.5:8081
  // - exp://192.168.1.5:8081
  const withoutProtocol = normalized.replace(/^[a-z]+:\/\//i, '');
  const hostPort = withoutProtocol.split('/')[0];
  return hostPort.split(':')[0] || '';
};

const getHostsFromRuntime = () => {
  const hosts = [];
  const scriptURL = NativeModules?.SourceCode?.scriptURL || '';
  const match = scriptURL.match(/https?:\/\/([^/:]+):\d+/i);
  if (match?.[1]) hosts.push(match[1]);

  const hostUri = process.env.EXPO_PUBLIC_DEV_SERVER_HOST;
  const envHost = extractHost(hostUri);
  if (envHost) hosts.push(envHost);

  const expoHostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.manifest2?.extra?.expoClient?.hostUri ||
    Constants?.manifest?.debuggerHost ||
    '';
  const constantsHost = extractHost(expoHostUri);
  if (constantsHost) hosts.push(constantsHost);

  return [...new Set(hosts.filter(Boolean))];
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
  return Array.from({ length: API_PORT_SCAN_SPAN + 1 }, (_, idx) => port + idx);
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
  const runtimeHosts = getHostsFromRuntime();
  const usableRuntimeHosts = runtimeHosts.filter((host) => isValidRuntimeHost(host));

  usableRuntimeHosts.forEach((host) => {
    buildPortVariants(API_PORT).forEach((p) => candidates.push(`http://${host}:${p}/api`));
  });

  // Keep manual base always as fallback; this allows explicit LAN overrides.
  if (MANUAL_API_BASE) {
    candidates.push(...expandBaseByPorts(MANUAL_API_BASE.replace(/\/$/, '')));
  }

  EXTRA_API_BASES.forEach((base) => {
    candidates.push(...expandBaseByPorts(base.replace(/\/$/, '')));
  });

  if (Platform.OS === 'android') {
    buildPortVariants(API_PORT).forEach((p) => candidates.push(`http://10.0.2.2:${p}/api`));
  }

  buildPortVariants(API_PORT).forEach((p) => {
    candidates.push(`http://localhost:${p}/api`);
    candidates.push(`http://127.0.0.1:${p}/api`);
  });

  return [...new Set(candidates)].slice(0, MAX_CANDIDATE_BASES);
};

export const getConfiguredApiOrigin = () => {
  const primaryBase = buildCandidateBaseUrls()[0] || MANUAL_API_BASE || '';
  if (!primaryBase) return '';

  try {
    const parsed = new URL(primaryBase);
    return `${parsed.protocol}//${parsed.host}`;
  } catch (_) {
    return '';
  }
};

const withTimeout = async (promise, timeoutMs = REQUEST_TIMEOUT_MS) => {
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

const isNetworkError = (error) =>
  error?.message === 'Network request failed' ||
  error?.message === 'Request timeout' ||
  /network request failed/i.test(error?.message || '');

const findHealthyBase = async (candidates) => {
  for (let i = 0; i < candidates.length; i += HEALTH_BATCH_SIZE) {
    const chunk = candidates.slice(i, i + HEALTH_BATCH_SIZE);
    const checks = await Promise.all(
      chunk.map(async (base) => {
        try {
          const response = await withTimeout(fetch(`${base}/health`, { method: 'GET' }), HEALTH_TIMEOUT_MS);
          return response.ok ? base : null;
        } catch (_) {
          return null;
        }
      })
    );

    const winner = checks.find(Boolean);
    if (winner) return winner;
  }

  return '';
};

const resolveApiBase = async (forceRefresh = false) => {
  if (cachedApiBase && !forceRefresh) return cachedApiBase;
  const candidates = buildCandidateBaseUrls();

  const healthyBase = await findHealthyBase(candidates);
  cachedApiBase = healthyBase || '';
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
    const error = new Error(message);
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
};

const requestWithApiBase = async (method, path, body, token, requestOptions = {}) => {
  const execute = async (base) => {
    const isFormData = Boolean(requestOptions.isFormData);
    const isJsonBody = method !== 'GET' && !isFormData;
    const headers = buildHeaders(token, isJsonBody);
    const payload =
      method === 'GET'
        ? undefined
        : isFormData
        ? body
        : JSON.stringify(body || {});

    const response = await withTimeout(
      fetch(`${base}${path}`, {
        method,
        headers,
        ...(method !== 'GET' ? { body: payload } : {}),
      }),
      REQUEST_TIMEOUT_MS
    );
    return parseResponse(response);
  };

  // 1) Try current base (cached or quickly resolved).
  const candidates = buildCandidateBaseUrls();
  const primaryBase = cachedApiBase || (await resolveApiBase()) || candidates[0] || '';
  if (primaryBase) {
    try {
      const data = await execute(primaryBase);
      cachedApiBase = primaryBase;
      return data;
    } catch (error) {
      if (!isNetworkError(error)) {
        cachedApiBase = primaryBase;
        throw error;
      }
    }
  }

  // 2) If network failed, re-resolve a healthy base and retry once.
  const recoveredBase = await resolveApiBase(true);
  if (recoveredBase) {
    try {
      const data = await execute(recoveredBase);
      cachedApiBase = recoveredBase;
      return data;
    } catch (error) {
      if (!isNetworkError(error)) {
        cachedApiBase = recoveredBase;
        throw error;
      }
    }
  }

  cachedApiBase = '';
  const attempted = candidates.slice(0, 4).join(', ');
  throw new Error(
    `Network request failed. Tried: ${attempted}. Check backend is running on port 5000, phone+PC same network, and firewall allows node/5000.`
  );
};

export const apiGet = async (path, token) => requestWithApiBase('GET', path, null, token);

export const apiPost = async (path, body, token) => {
  return requestWithApiBase('POST', path, body, token, { isFormData: body instanceof FormData });
};

export const apiPut = async (path, body, token) => {
  return requestWithApiBase('PUT', path, body, token, { isFormData: body instanceof FormData });
};

export const apiDelete = async (path, token) => {
  return requestWithApiBase('DELETE', path, null, token);
};
