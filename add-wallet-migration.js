const { addWalletColumns } = require('./src/lib/db/migrations/add-wallet-columns');

addWalletColumns()
  .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

