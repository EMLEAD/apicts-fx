const { ExchangeRate } = require('./src/lib/db/models');
const { sequelize } = require('./src/lib/db/config'); // Or wherever sequelize is initialized
(async () => {
  try {
    const rates = await ExchangeRate.findAll();
    console.log(JSON.stringify(rates, null, 2));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
