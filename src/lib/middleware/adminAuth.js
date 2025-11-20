import { User } from '@/lib/db/models';
import jwt from 'jsonwebtoken';

export const ADMIN_ROLES = ['super_admin', 'admin', 'moderator'];
export const SUPER_ADMIN_ONLY = ['super_admin'];

export async function authenticateAdmin(request, options = {}) {
  const { allowRoles = ADMIN_ROLES } = options;

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'No token provided' };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return { authenticated: false, error: 'User not found' };
    }

    if (!allowRoles.includes(user.role)) {
      return { authenticated: false, error: 'Unauthorized' };
    }

    return { authenticated: true, user };
  } catch (error) {
    return { authenticated: false, error: error.message };
  }
}

export function hasRole(user, roles = ADMIN_ROLES) {
  if (!user) return false;
  return roles.includes(user.role);
}
