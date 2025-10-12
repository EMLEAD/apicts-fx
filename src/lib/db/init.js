const { testConnection, sequelize } = require('./sequelize');
const { syncDatabase } = require('./models');

let isInitialized = false;

const initializeDatabase = async () => {
  if (isInitialized) {
    console.log('\x1b[33m%s\x1b[0m', '⚠️  Database already initialized');
    return true;
  }

  console.log('\n' + '='.repeat(60));
  console.log('\x1b[36m%s\x1b[0m', '🔄 INITIALIZING DATABASE CONNECTION...');
  console.log('='.repeat(60));

  try {
    // Test connection
    const connected = await testConnection();
    
    if (!connected) {
      console.log('\n' + '='.repeat(60));
      console.log('\x1b[31m%s\x1b[0m', '❌ DATABASE CONNECTION FAILED');
      console.log('='.repeat(60));
      console.error('\x1b[31m%s\x1b[0m', '   ❌ Could not connect to MySQL database');
      console.error('\x1b[33m%s\x1b[0m', '   📝 Troubleshooting:');
      console.error('      1. Check if MySQL is running');
      console.error('      2. Verify .env.local credentials');
      console.error('      3. Make sure database "apicts_db" exists');
      console.error('      4. Check MySQL port (default: 3306)');
      console.error('\x1b[33m%s\x1b[0m', '   📖 See QUICK_START.md for setup instructions');
      console.log('='.repeat(60) + '\n');
      return false;
    }

    // Sync database tables
    console.log('\x1b[36m%s\x1b[0m', '🔄 Synchronizing database tables...');
    await syncDatabase({ alter: true });
    
    isInitialized = true;
    
    console.log('\n' + '='.repeat(60));
    console.log('\x1b[32m%s\x1b[0m', '✅ DATABASE CONNECTED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\x1b[32m%s\x1b[0m', '   ✅ MySQL connection established');
    console.log('\x1b[32m%s\x1b[0m', '   ✅ Tables synchronized');
    console.log('\x1b[36m%s\x1b[0m', '   📊 Available models: User, Contact');
    console.log('\x1b[36m%s\x1b[0m', '   🌐 API endpoints ready at /api/*');
    console.log('='.repeat(60) + '\n');
    
    return true;
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('\x1b[31m%s\x1b[0m', '❌ DATABASE INITIALIZATION ERROR');
    console.log('='.repeat(60));
    console.error('\x1b[31m%s\x1b[0m', `   ❌ Error: ${error.message}`);
    console.error('\x1b[33m%s\x1b[0m', '   📖 Check BACKEND_SETUP.md for setup instructions');
    console.log('='.repeat(60) + '\n');
    return false;
  }
};

// Initialize on module load
if (process.env.NODE_ENV !== 'production') {
  initializeDatabase();
}

module.exports = { initializeDatabase };

