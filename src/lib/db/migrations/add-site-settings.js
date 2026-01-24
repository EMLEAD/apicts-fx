const { QueryTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('\x1b[36m%s\x1b[0m', '🔄 Running migration: add-site-settings');

    // Check if table exists
    const tables = await queryInterface.sequelize.query(
      `SHOW TABLES LIKE 'site_settings'`,
      { type: QueryTypes.SELECT }
    );

    if (tables.length > 0) {
      console.log('\x1b[33m%s\x1b[0m', '   ⚠️  site_settings table already exists');
      return;
    }

    // Create site_settings table
    await queryInterface.createTable('site_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      logoUrl: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'URL to the site logo image'
      },
      logoWidth: {
        type: Sequelize.INTEGER,
        defaultValue: 42,
        comment: 'Logo width in pixels'
      },
      logoHeight: {
        type: Sequelize.INTEGER,
        defaultValue: 42,
        comment: 'Logo height in pixels'
      },
      socialLinks: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Social media links'
      },
      contactInfo: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Contact information'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Whether this settings configuration is active'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    console.log('\x1b[32m%s\x1b[0m', '   ✅ Created site_settings table');

    // Insert default settings
    await queryInterface.sequelize.query(`
      INSERT INTO site_settings (id, logoUrl, logoWidth, logoHeight, socialLinks, contactInfo, isActive, createdAt, updatedAt)
      VALUES (
        UUID(),
        '/images/apicts-logo.jpg',
        42,
        42,
        JSON_OBJECT(
          'youtube', 'https://www.youtube.com/@apictsforex',
          'twitter', '',
          'linkedin', '',
          'instagram', '',
          'facebook', '',
          'telegram', ''
        ),
        JSON_OBJECT(
          'email', 'support@apicts.com',
          'phone', '+2348139399978',
          'address', 'Km 18, Topaz Plaza, New Road, Lekki Ajah, Lagos'
        ),
        true,
        NOW(),
        NOW()
      )
    `);

    console.log('\x1b[32m%s\x1b[0m', '   ✅ Inserted default site settings');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('\x1b[36m%s\x1b[0m', '🔄 Reverting migration: add-site-settings');
    await queryInterface.dropTable('site_settings');
    console.log('\x1b[32m%s\x1b[0m', '   ✅ Dropped site_settings table');
  }
};
