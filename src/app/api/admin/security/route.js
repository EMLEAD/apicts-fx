import { NextResponse } from 'next/server';
import { User, Transaction } from '@/lib/db/models';
import jwt from 'jsonwebtoken';

async function authenticateAdmin(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'No token provided' };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.userId);
    if (!user || !['super_admin', 'admin', 'manager', 'support'].includes(user.role)) {
      return { authenticated: false, error: 'Unauthorized' };
    }

    return { authenticated: true, user };
  } catch (error) {
    return { authenticated: false, error: error.message };
  }
}

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    // Mock security data - in production, this would come from actual security logs
    const verifiedUsers = await User.count({ where: { isActive: true } });
    const unverifiedUsers = await User.findAll({
      where: { isActive: false },
      limit: 10,
      attributes: ['id', 'username', 'email', 'createdAt']
    });

    // Mock suspicious activities
    const suspiciousActivity = [
      {
        type: 'Failed Login',
        description: 'Multiple failed login attempts detected',
        timestamp: new Date(),
        user: { username: 'sample_user' }
      },
      {
        type: 'Unusual Transaction',
        description: 'Large transaction amount detected',
        timestamp: new Date(Date.now() - 3600000),
        user: { username: 'another_user' }
      }
    ];

    return NextResponse.json({
      verifiedUsers,
      unverifiedUsers,
      suspiciousActivity: suspiciousActivity.length,
      totalLogins: 0, // Mock data
      failedLogins: 0, // Mock data
      recentActivity: suspiciousActivity
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching security data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

