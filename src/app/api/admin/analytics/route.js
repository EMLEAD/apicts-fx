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

    const months = Array.from({ length: 6 }, (_, idx) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - idx), 1);
      date.setHours(0, 0, 0, 0);
      const label = date.toLocaleString('default', { month: 'short' });
      const start = new Date(date);
      const end = new Date(date);
      end.setMonth(end.getMonth() + 1);
      return { label, start, end };
    });

    const userGrowthCounts = await Promise.all(
      months.map(({ start, end }) =>
        User.count({
          where: {
            createdAt: {
              [Op.gte]: start,
              [Op.lt]: end
            }
          }
        })
      )
    );

    const userGrowth = months.map((bucket, index) => ({
      month: bucket.label,
      users: userGrowthCounts[index] || 0
    }));

    const revenueSums = await Promise.all(
      months.map(({ start, end }) =>
        Transaction.sum('amount', {
          where: {
            status: 'completed',
            createdAt: {
              [Op.gte]: start,
              [Op.lt]: end
            }
          }
        })
      )
    );

    const revenueByMonth = months.map((bucket, index) => ({
      month: bucket.label,
      revenue: revenueSums[index] || 0
    }));

    const days = Array.from({ length: 7 }, (_, idx) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - idx));
      date.setHours(0, 0, 0, 0);
      const label = date.toLocaleDateString('default', { weekday: 'short' });
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      return { label, start, end };
    });

    const dailyTransactionCounts = await Promise.all(
      days.map(({ start, end }) =>
        Transaction.count({
          where: {
            createdAt: {
              [Op.gte]: start,
              [Op.lt]: end
            }
          }
        })
      )
    );

    const transactionsByDay = days.map((bucket, index) => ({
      day: bucket.label,
      transactions: dailyTransactionCounts[index] || 0
    }));

    const statusDefinitions = [
      { name: 'Completed', status: 'completed', color: '#22c55e' },
      { name: 'Pending', status: 'pending', color: '#eab308' },
      { name: 'Failed', status: 'failed', color: '#ef4444' }
    ];

    const statusCounts = await Promise.all(
      statusDefinitions.map((statusDef) =>
        Transaction.count({ where: { status: statusDef.status } })
      )
    );

    const transactionStatus = statusDefinitions.map((definition, index) => ({
      name: definition.name,
      value: statusCounts[index] || 0,
      color: definition.color
    }));

    return NextResponse.json({
      totalUsers,
      activeUsers,
      newUsers,
      totalTransactions,
      totalRevenue,
      monthlyRevenue,
      blogViews,
      vlogViews,
      topPages: topPages.map((p) => ({ path: `/blog/${p.slug}`, views: p.views || 0 })),
      userGrowth,
      transactions: transactionsByDay,
      revenueByMonth,
      transactionStatus
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

