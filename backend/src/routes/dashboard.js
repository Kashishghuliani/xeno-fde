const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenantMiddleware');

const {
  getMetrics,
  ordersByDate,
  topCustomers,
  topProducts,
  recentOrders,
  customersByDate
} = require('../controllers/dashboardController');

// ===== Dashboard Endpoints =====
router.get('/metrics', auth, tenantMiddleware, getMetrics);
router.get('/orders-by-date', auth, tenantMiddleware, ordersByDate);
router.get('/top-customers', auth, tenantMiddleware, topCustomers);
router.get('/top-products', auth, tenantMiddleware, topProducts);
router.get('/recent-orders', auth, tenantMiddleware, recentOrders);
router.get('/customers-by-date', auth, tenantMiddleware, customersByDate);

module.exports = router;
