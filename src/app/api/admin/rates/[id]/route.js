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

export async function PATCH(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const rate = await ExchangeRate.findByPk(params.id);

    if (!rate) {
      return NextResponse.json({ error: 'Rate not found' }, { status: 404 });
    }

    await rate.update({
      ...body,
      updatedBy: auth.userId,
      lastUpdated: new Date()
    });

    return NextResponse.json({ rate }, { status: 200 });
  } catch (error) {
    console.error('Error updating rate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const rate = await ExchangeRate.findByPk(params.id);
    if (!rate) {
      return NextResponse.json({ error: 'Rate not found' }, { status: 404 });
    }

    await rate.destroy();

    return NextResponse.json({ message: 'Rate deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting rate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

