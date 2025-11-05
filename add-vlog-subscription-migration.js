/**
 * Migration script to add requiresSubscription and metadata fields to vlog_posts table
 * Run with: node add-vlog-subscription-migration.js
 */

require('dotenv').config({ path: '.env.local' });
const { sequelize } = require('./src/lib/db/sequelize');
const { QueryTypes } = require('sequelize');

async function migrate() {
  try {
    console.log('🔄 Starting VlogPost migration...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Check if requiresSubscription column exists
    const columns = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'vlog_posts' 
      AND COLUMN_NAME = 'requiresSubscription'
    `, { type: QueryTypes.SELECT });

    if (!columns || columns.length === 0) {
      console.log('📝 Adding requiresSubscription column...');
      await sequelize.query(`
        ALTER TABLE vlog_posts 
        ADD COLUMN requiresSubscription BOOLEAN DEFAULT FALSE NOT NULL
      `, { type: QueryTypes.RAW });
      console.log('✅ Added requiresSubscription column');
    } else {
      console.log('ℹ️  requiresSubscription column already exists');
    }

    // Check if metadata column exists
    const metadataColumns = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'vlog_posts' 
      AND COLUMN_NAME = 'metadata'
    `, { type: QueryTypes.SELECT });

    if (!metadataColumns || metadataColumns.length === 0) {
      console.log('📝 Adding metadata column...');
      await sequelize.query(`
        ALTER TABLE vlog_posts 
        ADD COLUMN metadata JSON NULL
      `, { type: QueryTypes.RAW });
      console.log('✅ Added metadata column');
    } else {
      console.log('ℹ️  metadata column already exists');
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
migrate();

