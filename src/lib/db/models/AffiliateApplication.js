const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AffiliateApplication = sequelize.define('AffiliateApplication', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    fullName: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    companyName: {
      type: DataTypes.STRING(160),
      allowNull: true
    },
    website: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        isUrl(value) {
          if (value && !/^https?:\/\//i.test(value)) {
            throw new Error('Website must be a valid URL');
          }
        }
      }
    },
    audienceDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    audienceSize: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    trafficSources: {
      type: DataTypes.JSON,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'affiliate_applications'
  });

  return AffiliateApplication;
};

