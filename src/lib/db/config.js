// Next.js automatically loads .env files
// Debug: Log environment variables (remove in production after testing)
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('NODE_ENV:', process.env.NODE_ENV);

module.exports = {
  development: {
    username: process.env.DB_USER || 'apicts',
    password: process.env.DB_PASSWORD || 'L~atk7393',
    database: process.env.DB_NAME || 'eucloudwww1773163351543_',
    host: process.env.DB_HOST || '100.42.177.149',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '+00:00',
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      supportBigNumbers: true,
      bigNumberStrings: true
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  },
  test: {
    username: process.env.DB_USER || 'apicts',
    password: process.env.DB_PASSWORD || 'L~atk7393',
    database: process.env.DB_NAME + '_test' || 'eucloudwww1773163351543__test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
    timezone: '+00:00'
  },
  production: {
    username: process.env.DB_USER || 'apicts',
    password: process.env.DB_PASSWORD || 'L~atk7393',
    database: process.env.DB_NAME || 'eucloudwww1773163351543_',
    host: process.env.DB_HOST || '100.42.177.149',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
    timezone: '+00:00',
   
  }
};

