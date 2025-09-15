const { Customer, Order } = require('../models');
const { Sequelize, Op } = require('sequelize');

async function getMetrics(req, res) {
  const tenantId = req.tenantId;

  // Count only customers who have at least one order
  const totalCustomers = await Customer.count({
    where: { tenant_id: tenantId },
    include: [{ model: Order, required: true }]
  });

  const totalOrders = await Order.count({ where: { tenant_id: tenantId } });

  const revenueRow = await Order.findOne({
    where: { tenant_id: tenantId },
    attributes: [[Sequelize.fn('SUM', Sequelize.col('total_price')), 'revenue']]
  });
  const revenue = parseFloat(revenueRow?.get('revenue') || 0);

  res.json({ totalCustomers, totalOrders, revenue: Number(revenue.toFixed(2)) });
}

async function ordersByDate(req, res) {
  const tenantId = req.tenantId;
  const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 30*24*3600*1000);
  const to = req.query.to ? new Date(req.query.to) : new Date();

  const rows = await Order.findAll({
    where: { tenant_id: tenantId, createdAt: { [Op.between]: [from, to] } },
    attributes: [
      [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'orders'],
      [Sequelize.fn('SUM', Sequelize.col('total_price')), 'revenue']
    ],
    group: ['date'],
    order: [[Sequelize.literal('date'), 'ASC']]
  });

  res.json(rows.map(r => r.get({ plain: true })));
}

async function topCustomers(req, res) {
  const tenantId = req.tenantId;

  // Fetch customers who have at least one order
  const customers = await Customer.findAll({
    where: { tenant_id: tenantId },
    include: [{ model: Order, attributes: ['total_price'], required: true }]
  });

  const customerTotals = customers.map(c => ({
    first_name: c.first_name,
    last_name: c.last_name,
    email: c.email,
    total_spent: c.Orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0)
  }));

  const topCustomers = customerTotals
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 10)
    .map(c => ({ ...c, total_spent: Number(c.total_spent.toFixed(2)) }));

  res.json(topCustomers);
}

module.exports = { getMetrics, ordersByDate, topCustomers };
