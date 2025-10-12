const { sequelize } = require('../sequelize');
const UserModel = require('./User');
const ContactModel = require('./Contact');

// Initialize models
const User = UserModel(sequelize);
const Contact = ContactModel(sequelize);

// Define associations here if needed
// Example: User.hasMany(Contact);
// Contact.belongsTo(User);

// Sync database
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('\x1b[32m%s\x1b[0m', '   ✅ Database tables synchronized');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `   ❌ Sync error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Contact,
  syncDatabase
};

