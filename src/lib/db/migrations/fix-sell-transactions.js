const { sequelize, Transaction } = require('../models');

async function fixSellTransactions() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('\x1b[36m%s\x1b[0m', '🔧 Fixing Sell Transactions...');
    console.log('='.repeat(60));

    // First, update the enum in the database to include 'sell'
    console.log('\x1b[33m%s\x1b[0m', '  ⏳ Updating transactions table type enum...');
    await sequelize.query(`
      ALTER TABLE transactions 
      MODIFY COLUMN type ENUM('deposit', 'withdrawal', 'exchange', 'transfer', 'referral', 'sell') NOT NULL DEFAULT 'deposit'
    `);
    console.log('\x1b[32m%s\x1b[0m', '  ✅ Enum updated successfully!');

    // Find all transactions where type is empty or we need to fix
    console.log('\x1b[33m%s\x1b[0m', '  ⏳ Finding transactions to fix...');
    const [transactions] = await sequelize.query(`
      SELECT id, metadata FROM transactions
    `);

    let fixedCount = 0;

    for (const tx of transactions) {
      let metadata = tx.metadata;
      if (typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch (e) {
          continue;
        }
      }

      // Check if this is a sell transaction
      const isSellTransaction = 
        metadata?.sellStatus || 
        metadata?.transactionType === 'product_sell' || 
        metadata?.images ||
        tx.description?.toLowerCase().includes('sold');

      if (isSellTransaction) {
        console.log(`  🔧 Fixing transaction ${tx.id}...`);
        await Transaction.update(
          { type: 'sell' },
          { where: { id: tx.id } }
        );
        fixedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\x1b[32m%s\x1b[0m', `✅ Fixed ${fixedCount} transactions!`);
    console.log('='.repeat(60) + '\n');

    await sequelize.close();
    return true;
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('\x1b[31m%s\x1b[0m', '❌ Failed to fix transactions!');
    console.log('='.repeat(60));
    console.error('\x1b[31m%s\x1b[0m', `  Error: ${error.message}`);
    console.log('='.repeat(60) + '\n');
    await sequelize.close();
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  fixSellTransactions().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { fixSellTransactions };
