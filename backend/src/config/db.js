const mongoose = require('mongoose');
const dns = require('dns');

// SRV lookups used by mongodb+srv can fail on some local DNS resolvers.
// Prefer reliable public resolvers for Atlas discovery.
dns.setServers(['8.8.8.8', '1.1.1.1']);

mongoose.set('bufferCommands', false);

const INITIAL_RETRY_MS = 5000;
const MAX_RETRY_MS = 30000;
let retryDelayMs = INITIAL_RETRY_MS;
let reconnectTimer = null;

const dbStatus = {
  connected: false,
  host: '',
  attempts: 0,
  lastError: '',
  lastConnectedAt: null,
};

const scheduleReconnect = () => {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectDB();
  }, retryDelayMs);
  console.warn(`Retrying MongoDB connection in ${Math.round(retryDelayMs / 1000)}s...`);
  retryDelayMs = Math.min(retryDelayMs * 2, MAX_RETRY_MS);
};

const connectDB = async () => {
  dbStatus.attempts += 1;
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    dbStatus.connected = true;
    dbStatus.host = conn.connection.host || '';
    dbStatus.lastError = '';
    dbStatus.lastConnectedAt = new Date().toISOString();
    retryDelayMs = INITIAL_RETRY_MS;
    console.log(`MongoDB Connected: ${dbStatus.host}`);
  } catch (error) {
    dbStatus.connected = false;
    dbStatus.lastError = error.message;
    console.error('Database connection error:', error.message);
    if (String(error.message).includes('querySrv')) {
      console.error(
        'SRV DNS lookup failed. Check internet/DNS/VPN/firewall, or use Atlas "Standard connection string" (mongodb://...) instead of mongodb+srv.'
      );
    }
    scheduleReconnect();
  }
};

mongoose.connection.on('disconnected', () => {
  dbStatus.connected = false;
  console.warn('MongoDB disconnected.');
  scheduleReconnect();
});

mongoose.connection.on('error', (error) => {
  dbStatus.connected = false;
  dbStatus.lastError = error?.message || 'MongoDB connection error';
});

const getDbStatus = () => ({ ...dbStatus, readyState: mongoose.connection.readyState });

module.exports = {
  connectDB,
  getDbStatus,
};
