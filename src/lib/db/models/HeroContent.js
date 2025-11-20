const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HeroContent = sequelize.define('HeroContent', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    badge: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Badge text (e.g., "🇳🇬 CAC Registered • Leading Exchange Provider")'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Global Currency Exchange'
    },
    titleHighlight: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Made Simple'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Hero description text'
    },
    ctaPrimaryText: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Get Started Now'
    },
    ctaPrimaryLink: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '/register'
    },
    ctaSecondaryText: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'View Live Rates'
    },
    ctaSecondaryLink: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '/rates'
    },
    rating: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '4.9/5 Rating'
    },
    customerCount: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '10,000+'
    },
    customerLabel: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Happy Customers'
    },
    carouselImages: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of image URLs for carousel'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional metadata for future use'
    }
  }, {
    timestamps: true,
    tableName: 'hero_content'
  });

  return HeroContent;
};

