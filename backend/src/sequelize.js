const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance using Postgres
const sequelize = new Sequelize(
  process.env.DB_NAME,   // xeno_fde_db_hzql
  process.env.DB_USER,   // xeno_fde_db_hzql_user
  process.env.DB_PASS,   // your password
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres', 
    logging: false,      

    dialectOptions: {
      ssl: {
        require: true,            // Enable SSL
        rejectUnauthorized: false // Allow self-signed certs (needed for Render)
      }
    },
  }
);

// Test connection immediately
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
})();

module.exports = sequelize;
