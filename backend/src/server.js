// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, Tenant, Customer, Order, Product } = require('./models');
const { syncShopify } = require('./controllers/syncController');

// Import auth routes
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4000;   
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ===== Middleware =====
app.use(cors({
  origin: FRONTEND_URL,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ===== Auth Routes =====
app.use('/api/auth', authRoutes); // register & login now handled here

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

// Metrics
app.get('/api/dashboard/metrics', authMiddleware, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const totalCustomers = await Customer.count({
      where: { tenant_id: tenantId, email: { [require('sequelize').Op.ne]: null } }
    });

    const totalOrders = await Order.count({ where: { tenant_id: tenantId } });
    const revenue = await Order.sum('total_price', { where: { tenant_id: tenantId } }) || 0;

    res.json({
      totalCustomers,
      totalOrders,
      revenue: Number(revenue.toFixed(2))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Recent Orders
app.get('/api/dashboard/recent-orders', authMiddleware, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { Op } = require('sequelize');

    const recentOrders = await Order.findAll({
      where: { tenant_id: tenantId, customer_id: { [Op.ne]: null } },
      include: [{ model: Customer, attributes: ['first_name', 'last_name'] }],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    const seenOrders = new Set();
    const formattedOrders = [];

    for (const order of recentOrders) {
      if (!seenOrders.has(order.shopify_order_id)) {
        formattedOrders.push({
          id: order.shopify_order_id,
          total_price: Number(order.total_price || 0).toFixed(2),
          customer: `${order.Customer.first_name} ${order.Customer.last_name}`,
        });
        seenOrders.add(order.shopify_order_id);
      }
      if (formattedOrders.length >= 10) break;
    }

    res.json(formattedOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recent orders' });
  }
});

// Top Customers
app.get('/api/dashboard/top-customers', authMiddleware, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { Op } = require('sequelize');

    const customers = await Customer.findAll({
      where: { tenant_id: tenantId, email: { [Op.ne]: null } },
      include: [{ model: Order, attributes: ['total_price'] }],
    });

    const customerMap = new Map();

    for (const c of customers) {
      const totalSpent = c.Orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);
      if (customerMap.has(c.email)) {
        const existing = customerMap.get(c.email);
        existing.total_spent += totalSpent;
      } else {
        customerMap.set(c.email, {
          first_name: c.first_name,
          last_name: c.last_name,
          email: c.email,
          total_spent: totalSpent
        });
      }
    }

    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 10)
      .map(c => ({ ...c, total_spent: Number(c.total_spent.toFixed(2)) }));

    res.json(topCustomers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch top customers' });
  }
});

// Top Products
app.get('/api/dashboard/top-products', authMiddleware, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { fn, col, literal } = require('sequelize');

    const topProducts = await Product.findAll({
      where: { tenant_id: tenantId },
      attributes: ['title', [fn('MAX', col('price')), 'price']],
      group: ['title'],
      order: [[literal('price'), 'DESC']],
      limit: 10
    });

    res.json(topProducts.map(p => ({
      title: p.title,
      price: Number(p.getDataValue('price')).toFixed(2)
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

// Orders by Date
app.get('/api/dashboard/orders-by-date', authMiddleware, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { Op } = require('sequelize');

    const orders = await Order.findAll({
      where: { tenant_id: tenantId },
      attributes: ['shopify_order_id', 'createdAt', 'total_price'],
      order: [['createdAt', 'ASC']],
    });

    const seenOrders = new Set();
    const chartData = {};

    for (const o of orders) {
      if (seenOrders.has(o.shopify_order_id)) continue;
      seenOrders.add(o.shopify_order_id);

      const date = o.createdAt.toISOString().split('T')[0];
      if (!chartData[date]) chartData[date] = { orderCount: 0, totalRevenue: 0 };
      chartData[date].orderCount += 1;
      chartData[date].totalRevenue += Number(o.total_price) || 0;
    }

    const result = Object.entries(chartData).map(([date, { orderCount, totalRevenue }]) => ({
      date,
      orderCount,
      totalRevenue: Number(totalRevenue.toFixed(2)),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders by date' });
  }
});

// Customers by Date
app.get('/api/dashboard/customers-by-date', authMiddleware, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { Op } = require('sequelize');

    const customers = await Customer.findAll({
      where: { tenant_id: tenantId, email: { [Op.ne]: null } },
      attributes: ['email', 'createdAt'],
      order: [['createdAt', 'ASC']],
    });

    const seenEmails = new Set();
    const chartData = {};

    for (const c of customers) {
      if (seenEmails.has(c.email)) continue;
      seenEmails.add(c.email);

      const date = c.createdAt.toISOString().split('T')[0];
      chartData[date] = (chartData[date] || 0) + 1;
    }

    const result = Object.entries(chartData).map(([date, newCustomers]) => ({
      date,
      newCustomers,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch customers by date' });
  }
});

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