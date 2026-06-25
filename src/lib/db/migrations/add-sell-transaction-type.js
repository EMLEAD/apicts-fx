const { sequelize } = require('../sequelize');
const { QueryTypes } = require('sequelize');

async function addSellTransactionType() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('\x1b[36m%s\x1b[0m', '🔄 ADDING "sell" TO TRANSACTIONS TYPE ENUM...');
    console.log('='.repeat(60));

    // Modify the type column to include 'sell'
    await sequelize.query(`
      ALTER TABLE transactions 
      MODIFY COLUMN type ENUM('deposit', 'withdrawal', 'exchange', 'transfer', 'referral', 'sell') NOT NULL
    `);
    
    console.log('\x1b[32m%s\x1b[0m', '   ✅ Added "sell" to transaction type enum');

    console.log('\n' + '='.repeat(60));
    console.log('\x1b[32m%s\x1b[0m', '✅ MIGRATION SUCCESSFUL!');
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
  addSellTransactionType().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { addSellTransactionType };
