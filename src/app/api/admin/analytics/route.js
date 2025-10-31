import { NextResponse } from 'next/server';
import { User, Transaction, BlogPost, VlogPost } from '@/lib/db/models';
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

    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsers = await User.count({
      where: {
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    const totalTransactions = await Transaction.count();
    const totalRevenue = await Transaction.sum('amount', {
      where: { status: 'completed' }
    }) || 0;

    const monthlyRevenue = await Transaction.sum('amount', {
      where: {
        status: 'completed',
        createdAt: { [Op.gte]: startOfMonth }
      }
    }) || 0;

    const blogViews = await BlogPost.sum('views') || 0;
    const vlogViews = await VlogPost.sum('views') || 0;

    const topPages = await BlogPost.findAll({
      order: [['views', 'DESC']],
      limit: 5,
      attributes: ['title', 'slug', 'views'],
      where: { status: 'published' }
    });

    // Mock user growth data
    const userGrowth = await User.findAll({
      attributes: [
        [User.sequelize.fn('DATE', User.sequelize.col('createdAt')), 'date'],
        [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
      ],
      group: [User.sequelize.fn('DATE', User.sequelize.col('createdAt'))],
      order: [[User.sequelize.fn('DATE', User.sequelize.col('createdAt')), 'ASC']],
      limit: 30
    });

    return NextResponse.json({
      totalUsers,
      activeUsers,
      newUsers,
      totalTransactions,
      totalRevenue,
      monthlyRevenue,
      blogViews,
      vlogViews,
      topPages: topPages.map(p => ({ path: `/blog/${p.slug}`, views: p.views })),
      userGrowth: userGrowth,
      transactions: [] // Mock transaction data
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

