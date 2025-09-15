const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const Tenant = require('./Tenant');

const User = sequelize.define('user', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  is_admin: { type: DataTypes.BOOLEAN, defaultValue: false },
});

Tenant.hasMany(User, { foreignKey: 'tenant_id' });
User.belongsTo(Tenant, { foreignKey: 'tenant_id' });

module.exports = User;
