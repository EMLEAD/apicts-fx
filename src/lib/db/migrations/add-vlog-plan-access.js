const { QueryTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('\x1b[36m%s\x1b[0m', '🔄 Running migration: add-vlog-plan-access');

    // Check if columns already exist
    const [columns] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM vlog_posts LIKE 'accessType'`,
      { type: QueryTypes.SELECT }
    );

    if (columns) {
      console.log('\x1b[33m%s\x1b[0m', '   ⚠️  Vlog plan access columns already exist');
      return;
    }

    // Add accessType column
    await queryInterface.addColumn('vlog_posts', 'accessType', {
      type: Sequelize.ENUM('all', 'subscribers_only', 'specific_plans'),
      defaultValue: 'all',
      allowNull: false,
      after: 'requiresSubscription'
    });

    console.log('\x1b[32m%s\x1b[0m', '   ✅ Added accessType column');

    // Add planIds column
    await queryInterface.addColumn('vlog_posts', 'planIds', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null,
      after: 'accessType'
    });

    console.log('\x1b[32m%s\x1b[0m', '   ✅ Added planIds column');

    // Update existing records: if requiresSubscription is true, set accessType to 'subscribers_only'
    await queryInterface.sequelize.query(`
      UPDATE vlog_posts 
      SET accessType = 'subscribers_only' 
      WHERE requiresSubscription = true
    `);

    console.log('\x1b[32m%s\x1b[0m', '   ✅ Migrated existing subscription-required vlogs');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('\x1b[36m%s\x1b[0m', '🔄 Reverting migration: add-vlog-plan-access');
    
    await queryInterface.removeColumn('vlog_posts', 'planIds');
    await queryInterface.removeColumn('vlog_posts', 'accessType');
    
    console.log('\x1b[32m%s\x1b[0m', '   ✅ Removed vlog plan access columns');
  }
};
