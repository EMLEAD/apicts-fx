const { sequelize } = require('../sequelize');

async function addBlogCommentsAndLikes() {
  try {
    const queryInterface = sequelize.getQueryInterface();

    // Create blog_comments table
    await queryInterface.createTable('blog_comments', {
      id: {
        type: 'CHAR(36)',
        defaultValue: sequelize.literal('(UUID())'),
        primaryKey: true,
        allowNull: false
      },
      postId: {
        type: 'CHAR(36)',
        allowNull: false
      },
      userId: {
        type: 'CHAR(36)',
        allowNull: false
      },
      content: {
        type: 'TEXT',
        allowNull: false
      },
      parentId: {
        type: 'CHAR(36)',
        allowNull: true
      },
      status: {
        type: 'VARCHAR(20)',
        defaultValue: 'approved',
        allowNull: false
      },
      createdAt: {
        type: 'DATETIME',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: 'DATETIME',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    console.log('✅ blog_comments table created');

    // Create blog_likes table
    await queryInterface.createTable('blog_likes', {
      id: {
        type: 'CHAR(36)',
        defaultValue: sequelize.literal('(UUID())'),
        primaryKey: true,
        allowNull: false
      },
      postId: {
        type: 'CHAR(36)',
        allowNull: false
      },
      userId: {
        type: 'CHAR(36)',
        allowNull: false
      },
      createdAt: {
        type: 'DATETIME',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: 'DATETIME',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    console.log('✅ blog_likes table created');

    // Add unique index on postId and userId for blog_likes
    await queryInterface.addIndex('blog_likes', ['postId', 'userId'], {
      unique: true,
      name: 'unique_user_post_like'
    });

    console.log('✅ Unique index added for blog_likes');

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run migration
addBlogCommentsAndLikes();

