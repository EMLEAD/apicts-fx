const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');

const generateReferralCode = () => {
  return randomBytes(4).toString('hex').toUpperCase();
};

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 30]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100]
      }
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'admin', 'moderator', 'manager', 'support', 'user'),
      defaultValue: 'user'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    firebaseUid: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    walletBalance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'NGN',
      allowNull: false
    },
    referralCode: {
      type: DataTypes.STRING(16),
      allowNull: true,
      unique: true
    },
    referredBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }

        if (!user.referralCode) {
          let codeGenerated = false;
          let attempts = 0;

          while (!codeGenerated && attempts < 5) {
            const code = generateReferralCode();
            const existing = await sequelize.models.User.findOne({ where: { referralCode: code } });
            if (!existing) {
              user.referralCode = code;
              codeGenerated = true;
            }
            attempts += 1;
          }

          if (!codeGenerated) {
            user.referralCode = `${user.username}-${Date.now()}`.toUpperCase();
          }
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }

        if (user.changed('referralCode') && user.referralCode) {
          user.referralCode = user.referralCode.trim().toUpperCase();
        }
      }
    }
  });

  // Instance methods
  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return User;
};

