import { NextResponse } from 'next/server';
import { AffiliateLink, User } from '@/lib/db/models';
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

export async function PUT(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const link = await AffiliateLink.findByPk(id);
    if (!link) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    await link.update(body);

    return NextResponse.json({ success: true, link }, { status: 200 });
  } catch (error) {
    console.error('Error updating:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = params;
    const link = await AffiliateLink.findByPk(id);
    
    if (!link) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    await link.destroy();

    return NextResponse.json({ success: true, message: 'Deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
