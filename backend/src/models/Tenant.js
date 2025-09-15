const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Tenant = sequelize.define('Tenant', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shopify_store: {
    type: DataTypes.STRING,
    allowNull: true, // changed to optional
    unique: false,
  }
}, {
  tableName: 'Tenants',
});


module.exports = Tenant;
