const mongoose = require('mongoose');
const dns = require('dns');

// SRV lookups used by mongodb+srv can fail on some local DNS resolvers.
// Prefer reliable public resolvers for Atlas discovery.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    if (String(error.message).includes('querySrv')) {
      console.error(
        'SRV DNS lookup failed. Check internet/DNS/VPN/firewall, or use Atlas "Standard connection string" (mongodb://...) instead of mongodb+srv.'
      );
    }
    process.exit(1);
  }
};

connectDB();
