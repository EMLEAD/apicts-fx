const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BlogComment = sequelize.define('BlogComment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'blog_posts',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'blog_comments',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'approved'
    }
  }, {
    timestamps: true,
    tableName: 'blog_comments'
  });

  return BlogComment;
};

