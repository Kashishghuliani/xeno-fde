const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const Tenant = require('./Tenant');

const Customer = sequelize.define('Customer', {
  first_name: { type: DataTypes.STRING, allowNull: true, defaultValue: '' }, // ✅ safe default
  last_name: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },  // ✅ safe default
  email: { type: DataTypes.STRING, allowNull: true },                        // ✅ nullable email
  total_spent: { type: DataTypes.FLOAT, defaultValue: 0 },
  shopify_customer_id: { type: DataTypes.STRING, allowNull: false },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Tenant, key: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  }
}, {
  tableName: 'Customers',
  indexes: [{ unique: true, fields: ['shopify_customer_id', 'tenant_id'] }]
});

// Relations
Customer.belongsTo(Tenant, { 
  foreignKey: 'tenant_id', 
  onDelete: 'CASCADE', 
  onUpdate: 'CASCADE' 
});

module.exports = Customer;
