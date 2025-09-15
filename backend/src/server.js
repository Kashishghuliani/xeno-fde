const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./sequelize');
const { Tenant } = require('./models');
const { syncShopify } = require('./controllers/syncController');
const dashboardController = require('./controllers/dashboardController');
const authRoutes = require('./routes/auth');
const tenantMiddleware = require('./middleware/tenantMiddleware'); // ✅ added

const app = express();
const PORT = process.env.PORT || 4000;

// ===== CORS Setup =====
app.use(cors({
  origin: 'https://xeno-fde.vercel.app',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));

// ===== Body Parser =====
app.use(express.json());

// ===== Root Route =====
app.get('/', (req, res) => {
  res.json({
    status: 'Backend is running!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ===== Auth Routes =====
app.use('/api/auth', authRoutes);

// ===== Auth Middleware =====
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });

  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'supersecret');
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ===== Helper for error-wrapped routes =====
function wrapAsync(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      console.error(`❌ Error in ${req.path}:`, err);
      res.status(500).json({ error: 'Server error' });
    }
  };
}

// ===== Dashboard Routes (with tenantMiddleware & error logging) =====
app.get('/api/dashboard/metrics', authMiddleware, tenantMiddleware, wrapAsync(dashboardController.getMetrics));
app.get('/api/dashboard/recent-orders', authMiddleware, tenantMiddleware, wrapAsync(dashboardController.recentOrders));
app.get('/api/dashboard/top-customers', authMiddleware, tenantMiddleware, wrapAsync(dashboardController.topCustomers));
app.get('/api/dashboard/top-products', authMiddleware, tenantMiddleware, wrapAsync(dashboardController.topProducts));
app.get('/api/dashboard/orders-by-date', authMiddleware, tenantMiddleware, wrapAsync(dashboardController.ordersByDate));
app.get('/api/dashboard/customers-by-date', authMiddleware, tenantMiddleware, wrapAsync(dashboardController.customersByDate));

// ===== Shopify Sync Route =====
app.post('/api/sync/shopify', authMiddleware, tenantMiddleware, wrapAsync(syncShopify));

// ===== Start Server =====
async function initServer() {
  try {
    await sequelize.sync();
    console.log('✅ Database & models synced');

    // Create default tenant if none exists
    let tenant = await Tenant.findByPk(1);
    if (!tenant) {
      tenant = await Tenant.create({
        name: 'Main Tenant',
        shopify_store: process.env.SHOPIFY_STORE
      });
      console.log('✅ Created main tenant');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server init error:', err);
  }
}

initServer();
