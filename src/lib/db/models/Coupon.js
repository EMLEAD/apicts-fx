const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Coupon = sequelize.define('Coupon', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue('code', value ? value.trim().toUpperCase() : value);
      }
    },
    type: {
      type: DataTypes.ENUM('percentage', 'fixed', 'free_trial'),
      allowNull: false,
      defaultValue: 'percentage'
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    maxRedemptions: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    minPurchaseAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'NGN'
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'inactive', 'expired'),
      allowNull: false,
      defaultValue: 'draft'
    },
    startsAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endsAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isStackable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'coupons'
  });

  return Coupon;
};


