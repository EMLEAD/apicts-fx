import { NextResponse } from 'next/server';
import { BlogPost, User } from '@/lib/db/models';
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

    const posts = await BlogPost.findAll({
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
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
    const post = await BlogPost.create({
      ...body,
      authorId: auth.userId
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

