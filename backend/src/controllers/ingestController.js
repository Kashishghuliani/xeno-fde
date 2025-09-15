const { Tenant, Customer, Order, Product } = require('../models');
const { Sequelize } = require('sequelize');

async function syncShopify(tenantId) {
  const tenant = await Tenant.findByPk(tenantId);
  if (!tenant || !tenant.api_key) throw new Error('Shopify credentials missing');

  // ===== Fetch and upsert Customers =====
  const customers = (await fetchCustomersFromShopify(tenant)) || [];
  for (const c of customers) {
    if (!c.id || !c.email) continue;
    await Customer.upsert({
      tenant_id: tenantId,
      shopify_customer_id: c.id.toString(),
      first_name: c.first_name || '',
      last_name: c.last_name || '',
      email: c.email
    });
  }

  // ===== Fetch and upsert Orders =====
  const orders = (await fetchOrdersFromShopify(tenant)) || [];
  const existingOrders = await Order.findAll({
    where: { tenant_id: tenantId },
    attributes: ['shopify_order_id']
  });
  const existingOrderIds = new Set(existingOrders.map(o => o.shopify_order_id));

  for (const o of orders) {
    if (!o.id || !o.customer?.id) continue;

    const dbCustomer = await Customer.findOne({
      where: { tenant_id: tenantId, shopify_customer_id: o.customer.id.toString() }
    });
    if (!dbCustomer) continue; // skip if customer not found

    if (!existingOrderIds.has(o.id.toString())) {
      await Order.create({
        tenant_id: tenantId,
        shopify_order_id: o.id.toString(),
        customer_id: dbCustomer.id,
        total_price: parseFloat(o.total_price || 0),
        createdAt: o.created_at ? new Date(o.created_at) : new Date()
      });
    }
  }

  // ===== Recalculate total_spent =====
  const customerTotals = await Order.findAll({
    where: { tenant_id: tenantId },
    attributes: ['customer_id', [Sequelize.fn('SUM', Sequelize.col('total_price')), 'total']],
    group: ['customer_id']
  });

  await Customer.update({ total_spent: 0 }, { where: { tenant_id: tenantId } });
  for (const t of customerTotals) {
    await Customer.update({ total_spent: parseFloat(t.get('total')) }, { where: { id: t.customer_id } });
  }

  // ===== Fetch and upsert Products =====
  const products = (await fetchProductsFromShopify(tenant)) || [];
  for (const p of products) {
    if (!p.id) continue;
    await Product.upsert({
      tenant_id: tenantId,
      shopify_product_id: p.id.toString(),
      title: p.title || 'Untitled Product',
      price: parseFloat(p.variants?.[0]?.price || 0)
    });
  }
}

module.exports = { syncShopify };
