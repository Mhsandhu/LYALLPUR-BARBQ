const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// ───── MongoDB Connection Config (production-grade) ─────
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
  retryReads: true,
  heartbeatFrequencyMS: 10000,
};

let dbConnected = false;

function connectWithRetry(retries = 5, delay = 5000) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[DB] MONGODB_URI not set in .env — cannot connect.');
    return;
  }

  console.log(`[DB] Connecting to MongoDB Atlas...`);
  mongoose
    .connect(uri, MONGO_OPTIONS)
    .then(() => {
      console.log('[DB] MongoDB Atlas connected successfully.');
      dbConnected = true;
    })
    .catch((err) => {
      console.error(`[DB] Connection failed: ${err.message}`);
      if (retries > 0) {
        console.log(`[DB] Retrying in ${delay / 1000}s... (${retries} attempts left)`);
        setTimeout(() => connectWithRetry(retries - 1, Math.min(delay * 1.5, 30000)), delay);
      } else {
        console.error('[DB] All retry attempts exhausted. Will keep trying via event listeners.');
      }
    });
}

// ───── Connection Event Monitoring ─────
mongoose.connection.on('connected', () => {
  dbConnected = true;
  console.log('[DB] MongoDB connection established.');
});

mongoose.connection.on('disconnected', () => {
  dbConnected = false;
  console.warn('[DB] MongoDB disconnected. Auto-reconnecting in 5s...');
  setTimeout(() => connectWithRetry(5, 5000), 5000);
});

mongoose.connection.on('error', (err) => {
  dbConnected = false;
  console.error(`[DB] MongoDB error: ${err.message}`);
});

// ───── Middleware ─────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ───── Routes ─────
app.use('/api/admin', require('./routes/admin'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/deals', require('./routes/deals'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/settings', require('./routes/settings'));

// Health check route
app.get('/api/health', async (req, res) => {
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const dbState = states[mongoose.connection.readyState] || 'Unknown';
  res.json({
    status: dbConnected ? 'OK' : 'DEGRADED',
    server: 'Lyallpur BarBQ API',
    port: PORT,
    database: dbState,
    uptime: Math.floor(process.uptime()) + 's',
    timestamp: new Date().toISOString(),
  });
});

// ───── Graceful Shutdown ─────
function gracefulShutdown(signal) {
  console.log(`\n[Server] ${signal} received — shutting down gracefully...`);
  mongoose.connection.close().then(() => {
    console.log('[DB] MongoDB connection closed.');
    process.exit(0);
  }).catch(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ───── Start Server (don't wait for DB — start immediately) ─────
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('   🔥 LYALLPUR BARBQ SERVER RUNNING');
  console.log('========================================');
  console.log(`   Port:      ${PORT}`);
  console.log(`   Health:    http://localhost:${PORT}/api/health`);
  console.log(`   Admin:     http://localhost:${PORT}/${process.env.ADMIN_SECRET_PATH || 'admin'}`);
  console.log('========================================\n');
});

// Start DB connection with retry (server keeps running regardless)
connectWithRetry();
