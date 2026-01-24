const { sequelize } = require('../sequelize');
const { QueryTypes } = require('sequelize');

async function addTelegramColumns() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('\x1b[36m%s\x1b[0m', '🔄 ADDING TELEGRAM COLUMNS TO USERS TABLE...');
    console.log('='.repeat(60));

    // Check if columns exist
    const results = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'apicts_db'}' 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME IN ('telegramUserId', 'telegramUsername')
    `, { type: QueryTypes.SELECT });

    const existingColumns = Array.isArray(results) && results.length > 0 
      ? results.map(r => r.COLUMN_NAME) 
      : [];

    // Add telegramUserId if it doesn't exist
    if (!existingColumns.includes('telegramUserId')) {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN telegramUserId BIGINT NULL COMMENT 'Telegram user ID (numeric)'
      `);
      console.log('\x1b[32m%s\x1b[0m', '   ✅ Added telegramUserId column');
    } else {
      console.log('\x1b[33m%s\x1b[0m', '   ⚠️  telegramUserId column already exists');
    }

    // Add telegramUsername if it doesn't exist
    if (!existingColumns.includes('telegramUsername')) {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN telegramUsername VARCHAR(255) NULL COMMENT 'Telegram username (@username)'
      `);
      console.log('\x1b[32m%s\x1b[0m', '   ✅ Added telegramUsername column');
    } else {
      console.log('\x1b[33m%s\x1b[0m', '   ⚠️  telegramUsername column already exists');
    }

    console.log('\n' + '='.repeat(60));
    console.log('\x1b[32m%s\x1b[0m', '✅ TELEGRAM COLUMNS ADDED SUCCESSFULLY!');
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
  addTelegramColumns().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { addTelegramColumns };
