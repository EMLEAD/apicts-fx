const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VlogPost = sequelize.define('VlogPost', {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
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
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    requiresSubscription: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    accessType: {
      type: DataTypes.ENUM('all', 'subscribers_only', 'specific_plans'),
      defaultValue: 'all',
      allowNull: false,
      comment: 'all = everyone, subscribers_only = any active subscription, specific_plans = specific plan IDs'
    },
    planIds: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of plan IDs that can access this vlog. Empty = all plans if accessType is subscribers_only'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'vlog_posts'
  });

  return VlogPost;
};

