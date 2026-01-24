const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
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
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Cloudinary URL to the PDF file'
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'File size in bytes'
    },
    fileType: {
      type: DataTypes.STRING,
      defaultValue: 'pdf',
      allowNull: false
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Preview image URL'
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
    downloads: {
      type: DataTypes.INTEGER,
      defaultValue: 0
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
      comment: 'Array of plan IDs that can access this document'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'documents'
  });

  return Document;
};
