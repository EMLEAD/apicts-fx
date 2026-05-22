const { AffiliateLink, sequelize } = require('./src/lib/db/models');
(async () => {
  try {
    await sequelize.authenticate();
    await AffiliateLink.sync({ alter: true });
    console.log("AffiliateLink table synced!");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
