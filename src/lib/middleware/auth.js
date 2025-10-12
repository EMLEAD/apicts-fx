const { verifyToken } = require('../utils/jwt');
const { User } = require('../db/models');

const authenticate = async (req) => {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'No token provided' };
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return { authenticated: false, error: 'Invalid token' };
    }

    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return { authenticated: false, error: 'User not found or inactive' };
    }

    return { authenticated: true, user };
  } catch (error) {
    return { authenticated: false, error: error.message };
  }
};

module.exports = { authenticate };

