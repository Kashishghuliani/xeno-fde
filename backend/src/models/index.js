const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});

// ===== Models =====
const Tenant = sequelize.define('Tenant', {
  name: { type: DataTypes.STRING, allowNull: false },
  shopify_store: DataTypes.STRING,
  api_key: DataTypes.STRING,
  api_secret: DataTypes.STRING
}, { timestamps: true });

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  is_admin: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true });

const Customer = sequelize.define('Customer', {
  shopify_customer_id: { type: DataTypes.STRING, allowNull: false },
  first_name: { type: DataTypes.STRING, allowNull: false },
  last_name: DataTypes.STRING,
  email: { type: DataTypes.STRING, allowNull: false },
  total_spent: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 }
}, { timestamps: true });

const Product = sequelize.define('Product', {
  shopify_product_id: DataTypes.STRING,
  title: DataTypes.STRING,
  price: DataTypes.DECIMAL(12,2)
}, { timestamps: true });

const Order = sequelize.define('Order', {
  shopify_order_id: { type: DataTypes.STRING, allowNull: false },
  total_price: { type: DataTypes.DECIMAL(12,2), allowNull: false }
}, { timestamps: true });


// ===== Associations =====

// Tenant Associations
Tenant.hasMany(User, { foreignKey: 'tenant_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Tenant.hasMany(Customer, { foreignKey: 'tenant_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Tenant.hasMany(Product, { foreignKey: 'tenant_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Tenant.hasMany(Order, { foreignKey: 'tenant_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

User.belongsTo(Tenant, { foreignKey: 'tenant_id' });
Customer.belongsTo(Tenant, { foreignKey: 'tenant_id' });
Product.belongsTo(Tenant, { foreignKey: 'tenant_id' });
Order.belongsTo(Tenant, { foreignKey: 'tenant_id' });

// Customer → Order
Customer.hasMany(Order, { foreignKey: 'customer_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Order.belongsTo(Customer, { foreignKey: 'customer_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

module.exports = {
  sequelize,
  Tenant,
  User,
  Customer,
  Product,
  Order,
};
