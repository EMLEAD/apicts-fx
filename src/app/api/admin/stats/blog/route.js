import { NextResponse } from 'next/server';
import { BlogPost } from '@/lib/db/models';
import jwt from 'jsonwebtoken';
import { User } from '@/lib/db/models';

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

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const total = await BlogPost.count();
    const published = await BlogPost.count({ where: { status: 'published' } });
    const views = await BlogPost.sum('views') || 0;

    return NextResponse.json({
      total,
      published,
      views
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

