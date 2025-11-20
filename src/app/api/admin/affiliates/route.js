import { NextResponse } from 'next/server';
import { AffiliateApplication, User } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';
import { Op } from 'sequelize';

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '20', 10), 1), 100);

    const where = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      where.status = status;
    }

    if (search) {
      const term = `%${search.trim()}%`;
      where[Op.or] = [
        { fullName: { [Op.like]: term } },
        { email: { [Op.like]: term } },
        { companyName: { [Op.like]: term } }
      ];
    }

    const offset = (page - 1) * pageSize;

    const { rows, count } = await AffiliateApplication.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'role']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset
    });

    return NextResponse.json({
      applications: rows,
      pagination: {
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching affiliate applications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin', 'manager'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      companyName,
      website,
      audienceDescription,
      audienceSize,
      trafficSources,
      status = 'pending',
      notes,
      userId
    } = body;

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Full name and email are required' }, { status: 400 });
    }

    const allowedStatus = ['pending', 'approved', 'rejected'];
    if (!allowedStatus.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const application = await AffiliateApplication.create({
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      phone,
      companyName,
      website,
      audienceDescription,
      audienceSize,
      trafficSources,
      status,
      notes,
      userId: userId || null,
      reviewedBy: auth.user.id,
      reviewedAt: status === 'pending' ? null : new Date()
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Error creating affiliate application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}




