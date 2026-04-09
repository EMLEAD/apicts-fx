const { sequelize } = require('../src/lib/db/sequelize');
const { User, UserDocument } = require('../src/lib/db/models');

async function migrateUserDocuments() {
  try {
    console.log('Starting database migration...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    // Ensure Users table exists first (required for foreign key)
    console.log('Checking Users table...');
    await User.sync({ force: false, alter: false });
    console.log('✓ Users table ready');
    
    // Create UserDocuments table
    console.log('Creating UserDocuments table...');
    await UserDocument.sync({ force: false, alter: true });
    console.log('✓ UserDocuments table created/updated successfully');
    
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateUserDocuments();
