// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenants');
const ingestRoutes = require('./routes/ingest');
const dashboardRoutes = require('./routes/dashboard');
const scheduler = require('./jobs/scheduler');

const app = express();

// ===== Middleware =====
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(bodyParser.json());

// ===== API Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ===== Root Route (Health Check) =====
app.get('/', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// ===== Init Function =====
async function init() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ alter: true }); // dev: auto sync schema
    scheduler.start(); // start scheduled jobs
    console.log('✅ Scheduler started');
  } catch (err) {
    console.error('❌ Error initializing app:', err.message);
    process.exit(1);
  }
}

module.exports = { app, init };
