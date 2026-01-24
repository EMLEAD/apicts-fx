const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Plan = sequelize.define('Plan', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'NGN'
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'inactive'),
      allowNull: false,
      defaultValue: 'draft'
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    referralCommissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    },
    telegramGroupId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Telegram group/channel ID for this plan'
    },
    telegramGroupInviteLink: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Permanent invite link to the Telegram group'
    },
    telegramGroupName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Name of the Telegram group'
    },
    hasTelegramGroup: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this plan has a Telegram group configured'
    }
  }, {
    timestamps: true,
    tableName: 'plans'
  });

  return Plan;
};
