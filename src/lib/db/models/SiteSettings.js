const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SiteSettings = sequelize.define('SiteSettings', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL to the site logo image'
    },
    logoWidth: {
      type: DataTypes.INTEGER,
      defaultValue: 42,
      comment: 'Logo width in pixels'
    },
    logoHeight: {
      type: DataTypes.INTEGER,
      defaultValue: 42,
      comment: 'Logo height in pixels'
    },
    socialLinks: {
      type: DataTypes.JSON,
      defaultValue: {
        youtube: '',
        twitter: '',
        linkedin: '',
        instagram: '',
        facebook: '',
        telegram: ''
      },
      comment: 'Social media links'
    },
    contactInfo: {
      type: DataTypes.JSON,
      defaultValue: {
        email: 'support@apicts.com',
        phone: '+2348139399978',
        address: 'Km 18, Topaz Plaza, New Road, Lekki Ajah, Lagos'
      },
      comment: 'Contact information'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether this settings configuration is active'
    }
  }, {
    timestamps: true,
    tableName: 'site_settings'
  });

  return SiteSettings;
};
