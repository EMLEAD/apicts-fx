const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BlogLike = sequelize.define('BlogLike', {
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
    }
  }, {
    timestamps: true,
    tableName: 'blog_likes',
    indexes: [
      {
        unique: true,
        fields: ['postId', 'userId']
      }
    ]
  });

  return BlogLike;
};

