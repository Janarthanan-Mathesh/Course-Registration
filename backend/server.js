const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, getDbStatus } = require('./src/config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Database Connection
connectDB();

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/academic-courses', require('./src/routes/academicCourses'));
app.use('/api/universal-courses', require('./src/routes/universalCourses'));
app.use('/api/enrollments', require('./src/routes/enrollments'));
app.use('/api/certificates', require('./src/routes/certificates'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/notifications', require('./src/routes/notifications'));

// Health Check
app.get('/api/health', (req, res) => {
  const db = getDbStatus();
  res.json({
    status: db.connected ? 'OK' : 'DEGRADED',
    message: 'Course Registration API is running',
    db,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const BASE_PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const MAX_PORT_ATTEMPTS = 20;

const startServer = (port, attempt = 0) => {
  const server = app.listen(port, HOST, () => {
    console.log(`Server running on ${HOST}:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use. Trying port ${nextPort}...`);
      startServer(nextPort, attempt + 1);
      return;
    }

    console.error(`Failed to start server on port ${port}:`, error.message);
    process.exit(1);
  });
};

startServer(BASE_PORT);

module.exports = app;
