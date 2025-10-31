import { NextResponse } from 'next/server';
import { Transaction } from '@/lib/db/models';
import jwt from 'jsonwebtoken';
import { User } from '@/lib/db/models';
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

    const total = await Transaction.count();
    const pending = await Transaction.count({ where: { status: 'pending' } });
    const completed = await Transaction.count({ where: { status: 'completed' } });
    const failed = await Transaction.count({ where: { status: 'failed' } });

    const totalRevenue = await Transaction.sum('amount', {
      where: { status: 'completed' }
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Transaction.sum('amount', {
      where: {
        status: 'completed',
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    const recent = await Transaction.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    return NextResponse.json({
      total,
      pending,
      completed,
      failed,
      totalRevenue: totalRevenue || 0,
      monthlyRevenue: monthlyRevenue || 0,
      recent
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

