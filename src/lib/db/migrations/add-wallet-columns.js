const { sequelize } = require('../sequelize');
const { QueryTypes } = require('sequelize');

async function addWalletColumns() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('\x1b[36m%s\x1b[0m', '🔄 ADDING WALLET COLUMNS TO USERS TABLE...');
    console.log('='.repeat(60));

    // Check if columns exist
    const results = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'apicts_db'}' 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('walletBalance', 'currency')
    `, { type: QueryTypes.SELECT });

    const existingColumns = Array.isArray(results) && results.length > 0 
      ? results.map(r => r.COLUMN_NAME) 
      : [];

    // Add walletBalance if it doesn't exist
    if (!existingColumns.includes('walletBalance')) {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN walletBalance DECIMAL(15, 2) DEFAULT 0 NOT NULL
      `);
      console.log('\x1b[32m%s\x1b[0m', '   ✅ Added walletBalance column');
    } else {
      console.log('\x1b[33m%s\x1b[0m', '   ⚠️  walletBalance column already exists');
    }

    // Add currency if it doesn't exist
    if (!existingColumns.includes('currency')) {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN currency VARCHAR(10) DEFAULT 'NGN' NOT NULL
      `);
      console.log('\x1b[32m%s\x1b[0m', '   ✅ Added currency column');
    } else {
      console.log('\x1b[33m%s\x1b[0m', '   ⚠️  currency column already exists');
    }

    console.log('\n' + '='.repeat(60));
    console.log('\x1b[32m%s\x1b[0m', '✅ WALLET COLUMNS ADDED SUCCESSFULLY!');
    console.log('='.repeat(60) + '\n');

    await sequelize.close();
    return true;
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('\x1b[31m%s\x1b[0m', '❌ MIGRATION ERROR');
    console.log('='.repeat(60));
    console.error('\x1b[31m%s\x1b[0m', `   Error: ${error.message}`);
    console.log('='.repeat(60) + '\n');
    await sequelize.close();
    return false;
  }
}

// Run migration if called directly
if (require.main === module) {
  addWalletColumns().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { addWalletColumns };

