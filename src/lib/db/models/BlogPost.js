const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BlogPost = sequelize.define('BlogPost', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    featuredImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft'
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    seoMeta: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'blog_posts'
  });

  return BlogPost;
};

