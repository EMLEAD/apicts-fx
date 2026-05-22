const { Product, sequelize } = require('./src/lib/db/models');
(async () => {
  try {
    await sequelize.authenticate();
    await Product.sync({ alter: true });
    console.log("Product table synced!");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
