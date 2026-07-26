const { sequelize } = require('../sequelize');

async function addBankAccountToSiteSettings() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('\x1b[36m%s\x1b[0m', '🔄 ADDING bankAccount COLUMN TO site_settings TABLE...');
    console.log('='.repeat(60));

    await sequelize.query(`
      ALTER TABLE site_settings
      ADD COLUMN bankAccount JSON DEFAULT NULL
    `);

    console.log('\x1b[32m%s\x1b[0m', '   ✅ Added bankAccount column to site_settings');

    console.log('\n' + '='.repeat(60));
    console.log('\x1b[32m%s\x1b[0m', '✅ MIGRATION SUCCESSFUL!');
    console.log('='.repeat(60) + '\n');

    await sequelize.close();
    return true;
  } catch (error) {
    if (error.message && error.message.includes('Duplicate column')) {
      console.log('\x1b[33m%s\x1b[0m', '   ⚠️  Column already exists, skipping...');
      await sequelize.close();
      return true;
    }
    console.log('\x1b[31m%s\x1b[0m', '❌ MIGRATION ERROR: ' + error.message);
    await sequelize.close();
    return false;
  }
}

if (require.main === module) {
  addBankAccountToSiteSettings().then((ok) => process.exit(ok ? 0 : 1)).catch(() => process.exit(1));
}

module.exports = { addBankAccountToSiteSettings };
