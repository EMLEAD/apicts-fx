require('dotenv').config({ path: '.env.local' });
const { sequelize } = require('./src/lib/db/sequelize');
const migration = require('./src/lib/db/migrations/add-documents-table');

async function runMigration() {
  try {
    console.log('🔄 Starting documents table migration...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    const queryInterface = sequelize.getQueryInterface();
    await migration.up(queryInterface, sequelize.Sequelize);
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
