import { NextResponse } from 'next/server';
import { User } from '@/lib/db/models';
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
    if (!user || user.role !== 'admin') {
      return { authenticated: false, error: 'Unauthorized' };
    }

    return { authenticated: true, user };
  } catch (error) {
    return { authenticated: false, error: error.message };
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const user = await User.findByPk(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await user.update({ isActive: true });

    return NextResponse.json({ 
      message: 'User verified successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error verifying user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

