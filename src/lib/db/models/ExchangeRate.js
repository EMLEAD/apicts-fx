const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ExchangeRate = sequelize.define('ExchangeRate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    fromCurrency: {
      type: DataTypes.STRING,
      allowNull: false
    },
    toCurrency: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rate: {
      type: DataTypes.DECIMAL(15, 6),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    tableName: 'exchange_rates'
  });

  return ExchangeRate;
};

