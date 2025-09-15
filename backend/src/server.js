const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./sequelize');
const { Tenant, Customer, Order, Product } = require('./models'); 
const { syncShopify } = require('./controllers/syncController');

// Import auth routes
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// ===== CORS Setup =====
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser requests
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Handle preflight requests for all routes
app.options('*', cors({
  origin: allowedOrigins,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.use(express.json());

// ===== Root Route (Health Check) =====
app.get('/', (req, res) => {
  res.json({ status: 'Backend is running!', environment: process.env.NODE_ENV || 'development' });
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

// ===== Dashboard Routes =====
// (All your existing dashboard routes remain unchanged)
app.get('/api/dashboard/metrics', authMiddleware, async (req, res) => { /* ... */ });
app.get('/api/dashboard/recent-orders', authMiddleware, async (req, res) => { /* ... */ });
app.get('/api/dashboard/top-customers', authMiddleware, async (req, res) => { /* ... */ });
app.get('/api/dashboard/top-products', authMiddleware, async (req, res) => { /* ... */ });
app.get('/api/dashboard/orders-by-date', authMiddleware, async (req, res) => { /* ... */ });
app.get('/api/dashboard/customers-by-date', authMiddleware, async (req, res) => { /* ... */ });

app.post('/api/sync/shopify', authMiddleware, syncShopify);

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
