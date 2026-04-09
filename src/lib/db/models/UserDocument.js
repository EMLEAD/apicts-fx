const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserDocument = sequelize.define('UserDocument', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    documentType: {
      type: DataTypes.ENUM('nin', 'drivers_license', 'voters_card', 'international_passport'),
      allowNull: false,
      comment: 'Type of identification document'
    },
    documentNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Document identification number (can be extracted from image or entered by admin)'
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Full name as appears on document (can be extracted from image or entered by admin)'
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Date of birth from document'
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: true
    },
    documentImageFront: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL to front image of document'
    },
    documentImageBack: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL to back image of document'
    },
    verificationStatus: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected', 'expired'),
      defaultValue: 'pending',
      allowNull: false
    },
    verificationMethod: {
      type: DataTypes.ENUM('manual', 'api', 'automated'),
      defaultValue: 'manual',
      allowNull: false,
      comment: 'How the document was verified'
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when document was verified'
    },
    verifiedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      comment: 'Admin user who verified the document'
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Document expiry date if applicable'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason for rejection if status is rejected'
    },
    apiResponse: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Response from verification API if used'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional document metadata'
    }
  }, {
    tableName: 'user_documents',
    timestamps: true,
    indexes: [
      {
        unique: false,
        fields: ['userId']
      },
      {
        unique: false,
        fields: ['documentType']
      },
      {
        unique: false,
        fields: ['verificationStatus']
      }
    ]
  });

  return UserDocument;
};
