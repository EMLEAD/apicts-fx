const { sequelize } = require('../sequelize');
const { QueryTypes } = require('sequelize');

async function addTelegramPlanColumns() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('\x1b[36m%s\x1b[0m', '🔄 ADDING TELEGRAM COLUMNS TO PLANS TABLE...');
    console.log('='.repeat(60));

    // Check if columns exist
    const results = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'apicts_db'}' 
      AND TABLE_NAME = 'plans' 
      AND COLUMN_NAME IN ('telegramGroupId', 'telegramGroupInviteLink', 'telegramGroupName', 'hasTelegramGroup')
    `, { type: QueryTypes.SELECT });

    const existingColumns = Array.isArray(results) && results.length > 0 
      ? results.map(r => r.COLUMN_NAME) 
      : [];

    // Add telegramGroupId if it doesn't exist
    if (!existingColumns.includes('telegramGroupId')) {
      await sequelize.query(`
        ALTER TABLE plans 
        ADD COLUMN telegramGroupId VARCHAR(255) NULL COMMENT 'Telegram group/channel ID for this plan'
      `);
      console.log('\x1b[32m%s\x1b[0m', '   ✅ Added telegramGroupId column');
    } else {
      console.log('\x1b[33m%s\x1b[0m', '   ⚠️  telegramGroupId column already exists');
    }

    // Add telegramGroupInviteLink if it doesn't exist
    if (!existingColumns.includes('telegramGroupInviteLink')) {
      await sequelize.query(`
        ALTER TABLE plans 
        ADD COLUMN telegramGroupInviteLink VARCHAR(255) NULL COMMENT 'Permanent invite link to the Telegram group'
      `);
      console.log('\x1b[32m%s\x1b[0m', '   ✅ Added telegramGroupInviteLink column');
    } else {
      console.log('\x1b[33m%s\x1b[0m', '   ⚠️  telegramGroupInviteLink column already exists');
    }

    // Add telegramGroupName if it doesn't exist
    if (!existingColumns.includes('telegramGroupName')) {
      await sequelize.query(`
        ALTER TABLE plans 
        ADD COLUMN telegramGroupName VARCHAR(255) NULL COMMENT 'Name of the Telegram group'
      `);
      console.log('\x1b[32m%s\x1b[0m', '   ✅ Added telegramGroupName column');
    } else {
      console.log('\x1b[33m%s\x1b[0m', '   ⚠️  telegramGroupName column already exists');
    }

    // Add hasTelegramGroup if it doesn't exist
    if (!existingColumns.includes('hasTelegramGroup')) {
      await sequelize.query(`
        ALTER TABLE plans 
        ADD COLUMN hasTelegramGroup TINYINT(1) DEFAULT 0 COMMENT 'Whether this plan has a Telegram group configured'
      `);
      console.log('\x1b[32m%s\x1b[0m', '   ✅ Added hasTelegramGroup column');
    } else {
      console.log('\x1b[33m%s\x1b[0m', '   ⚠️  hasTelegramGroup column already exists');
    }

    console.log('\n' + '='.repeat(60));
    console.log('\x1b[32m%s\x1b[0m', '✅ TELEGRAM PLAN COLUMNS ADDED SUCCESSFULLY!');
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
  addTelegramPlanColumns().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { addTelegramPlanColumns };
