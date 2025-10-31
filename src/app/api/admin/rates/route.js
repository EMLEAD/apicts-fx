import { NextResponse } from 'next/server';
import { ExchangeRate, User } from '@/lib/db/models';
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

    return { authenticated: true, user, userId: decoded.userId };
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

    const rates = await ExchangeRate.findAll({
      include: [{
        model: User,
        as: 'updatedByUser',
        attributes: ['id', 'username', 'email']
      }],
      order: [['updatedAt', 'DESC']]
    });

    return NextResponse.json({ rates }, { status: 200 });
  } catch (error) {
    console.error('Error fetching rates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const rate = await ExchangeRate.create({
      ...body,
      updatedBy: auth.userId
    });

    return NextResponse.json({ rate }, { status: 201 });
  } catch (error) {
    console.error('Error creating rate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

