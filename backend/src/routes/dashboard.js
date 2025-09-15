const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const { getMetrics, ordersByDate, topCustomers } = require('../controllers/dashboardController');

router.get('/metrics', auth, tenantMiddleware, getMetrics);
router.get('/orders-by-date', auth, tenantMiddleware, ordersByDate);
router.get('/top-customers', auth, tenantMiddleware, topCustomers);

module.exports = router;
