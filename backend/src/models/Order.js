const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const Tenant = require('./Tenant');
const Customer = require('./Customer');

const Order = sequelize.define('Order', {
  total_price: { type: DataTypes.FLOAT, allowNull: false },
  shopify_order_id: { type: DataTypes.STRING, allowNull: false },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,   // allow NULL
    references: { model: Customer, key: 'id' },
    onDelete: 'SET NULL',   // don’t break orders if customer deleted
    onUpdate: 'CASCADE',
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Tenant, key: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  }
}, { 
  tableName: 'Orders',
  indexes: [
    { unique: true, fields: ['shopify_order_id', 'tenant_id'] } // unique per tenant
  ]
});

Order.belongsTo(Tenant, { foreignKey: 'tenant_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Order.belongsTo(Customer, { foreignKey: 'customer_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

module.exports = Order;
