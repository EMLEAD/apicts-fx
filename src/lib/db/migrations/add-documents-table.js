const { QueryTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('\x1b[36m%s\x1b[0m', '🔄 Running migration: add-documents-table');

    // Check if table exists
    const tables = await queryInterface.sequelize.query(
      `SHOW TABLES LIKE 'documents'`,
      { type: QueryTypes.SELECT }
    );

    if (tables.length > 0) {
      console.log('\x1b[33m%s\x1b[0m', '   ⚠️  documents table already exists');
      return;
    }

    // Create documents table
    await queryInterface.createTable('documents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fileUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fileSize: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      fileType: {
        type: Sequelize.STRING,
        defaultValue: 'pdf',
        allowNull: false
      },
      thumbnail: {
        type: Sequelize.STRING,
        allowNull: true
      },
      authorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft'
      },
      downloads: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      views: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true
      },
      requiresSubscription: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      accessType: {
        type: Sequelize.ENUM('all', 'subscribers_only', 'specific_plans'),
        defaultValue: 'all',
        allowNull: false
      },
      planIds: {
        type: Sequelize.JSON,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
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

    console.log('\x1b[32m%s\x1b[0m', '   ✅ Created documents table');

    // Add indexes
    await queryInterface.addIndex('documents', ['authorId']);
    await queryInterface.addIndex('documents', ['status']);
    await queryInterface.addIndex('documents', ['accessType']);
    await queryInterface.addIndex('documents', ['slug']);

    console.log('\x1b[32m%s\x1b[0m', '   ✅ Added indexes to documents table');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('\x1b[36m%s\x1b[0m', '🔄 Reverting migration: add-documents-table');
    await queryInterface.dropTable('documents');
    console.log('\x1b[32m%s\x1b[0m', '   ✅ Dropped documents table');
  }
};
