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

export async function PATCH(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const post = await BlogPost.findByPk(params.id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await post.update(body);

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const post = await BlogPost.findByPk(params.id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await post.destroy();

    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

