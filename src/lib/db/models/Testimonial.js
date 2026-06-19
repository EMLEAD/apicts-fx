const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Testimonial = sequelize.define('Testimonial', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    authorName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    authorRole: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    mediaType: {
      type: DataTypes.ENUM('youtube', 'url', 'upload'),
      allowNull: false,
      defaultValue: 'youtube'
    },
    mediaUrl: {
      type: DataTypes.STRING(2048),
      allowNull: false
    },
    cloudinaryPublicId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    thumbnailUrl: {
      type: DataTypes.STRING(2048),
      allowNull: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    timestamps: true,
    tableName: 'testimonials'
  });

  return Testimonial;
};
