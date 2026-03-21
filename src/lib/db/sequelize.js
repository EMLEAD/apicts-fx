const { Sequelize } = require('sequelize');
const config = require('./config');

// Explicitly require mysql2 to ensure it's loaded
const mysql2 = require('mysql2');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectModule: mysql2,  // Explicitly set the dialect module
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions || {},
    timezone: dbConfig.timezone
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('\x1b[32m%s\x1b[0m', '   ✅ Testing connection... SUCCESS');
    return true;
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `   ❌ Connection test failed: ${error.message}`);
    return false;
  }
};

module.exports = { sequelize, testConnection };

