import { NextResponse } from 'next/server';
import { User, Transaction, UserDocument } from '@/lib/db/models';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

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

    const { searchParams } = new URL(request.url);
    const usersPage = Math.max(1, parseInt(searchParams.get('usersPage') || '1', 10));
    const activityPage = Math.max(1, parseInt(searchParams.get('activityPage') || '1', 10));
    const limit = 10;

    const verifiedUsers = await User.count({ where: { isActive: true } });
    const unverifiedUsersCount = await User.count({ where: { isActive: false } });
    const unverifiedUsers = await User.findAll({
      where: { isActive: false },
      offset: (usersPage - 1) * limit,
      limit,
      attributes: ['id', 'username', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const allActivity = [];

    const failedTransactions = await Transaction.findAll({
      where: { status: 'failed' },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['username'] }]
    });
    failedTransactions.forEach(t => {
      allActivity.push({
        type: 'Transaction Failed',
        description: `${t.type} of ${t.amount} ${t.currency} failed`,
        timestamp: t.createdAt,
        user: t.user ? { username: t.user.username } : null
      });
    });

    const largeTransactions = await Transaction.findAll({
      where: {
        status: 'completed',
        amount: { [Op.gte]: 100000 },
        createdAt: { [Op.gte]: sevenDaysAgo }
      },
      order: [['amount', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['username'] }]
    });
    largeTransactions.forEach(t => {
      allActivity.push({
        type: 'Large Transaction',
        description: `${t.type} of ${t.amount} ${t.currency} completed`,
        timestamp: t.createdAt,
        user: t.user ? { username: t.user.username } : null
      });
    });

    const pendingVerifications = await UserDocument.findAll({
      where: { verificationStatus: 'pending' },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['username'] }]
    });
    pendingVerifications.forEach(d => {
      allActivity.push({
        type: 'Pending Verification',
        description: `${d.documentType.replace('_', ' ')} submitted for verification`,
        timestamp: d.createdAt,
        user: d.user ? { username: d.user.username } : null
      });
    });

    const rejectedDocuments = await UserDocument.findAll({
      where: { verificationStatus: 'rejected' },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['username'] }]
    });
    rejectedDocuments.forEach(d => {
      allActivity.push({
        type: 'Document Rejected',
        description: `${d.documentType.replace('_', ' ')} verification rejected`,
        timestamp: d.verifiedAt || d.createdAt,
        user: d.user ? { username: d.user.username } : null
      });
    });

    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['username', 'createdAt']
    });
    recentUsers.forEach(u => {
      allActivity.push({
        type: 'New User',
        description: `${u.username} registered on the platform`,
        timestamp: u.createdAt,
        user: { username: u.username }
      });
    });

    allActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const totalActivity = allActivity.length;
    const recentActivity = allActivity.slice((activityPage - 1) * limit, activityPage * limit);

    const suspiciousCount = failedTransactions.length + largeTransactions.length + rejectedDocuments.length;
    const totalLogins = await User.count();
    const failedLogins = failedTransactions.length;

    return NextResponse.json({
      verifiedUsers,
      unverifiedUsers,
      unverifiedUsersCount,
      usersPage,
      usersTotalPages: Math.max(1, Math.ceil(unverifiedUsersCount / limit)),
      suspiciousActivity: suspiciousCount,
      totalLogins,
      failedLogins,
      recentActivity,
      activityPage,
      activityTotalPages: Math.max(1, Math.ceil(totalActivity / limit))
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching security data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

