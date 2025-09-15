const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const Tenant = require('./Tenant');

const Product = sequelize.define('Product', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Tenant, key: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  shopify_product_id: {
    type: DataTypes.STRING,
    allowNull: false, // required for syncing
  }
}, { 
  tableName: 'Products',
  indexes: [
    { unique: true, fields: ['shopify_product_id', 'tenant_id'] } // unique per tenant
  ]
});

Product.belongsTo(Tenant, { foreignKey: 'tenant_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

module.exports = Product;
