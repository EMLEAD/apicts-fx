import { NextResponse } from 'next/server';
import { BlogLike, BlogPost } from '@/lib/db/models';
import jwt from 'jsonwebtoken';

async function authenticateUser(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'No token provided' };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'apicts_super_secret_jwt_key_2024_secure_random_string_change_in_production');
    
    return { authenticated: true, userId: decoded.userId };
  } catch (error) {
    return { authenticated: false, error: 'Invalid token' };
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await authenticateUser(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;

    // Check if user already liked this post
    const existingLike = await BlogLike.findOne({
      where: {
        postId: id,
        userId: auth.userId
      }
    });

    if (existingLike) {
      return NextResponse.json({ message: 'Already liked' }, { status: 200 });
    }

    await BlogLike.create({
      postId: id,
      userId: auth.userId
    });

    // Get updated like count
    const likeCount = await BlogLike.count({
      where: { postId: id }
    });

    return NextResponse.json({ liked: true, count: likeCount }, { status: 201 });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json({ 
      error: 'Failed to like post',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateUser(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;

    const deleted = await BlogLike.destroy({
      where: {
        postId: id,
        userId: auth.userId
      }
    });

    if (!deleted) {
      return NextResponse.json({ message: 'Like not found' }, { status: 404 });
    }

    // Get updated like count
    const likeCount = await BlogLike.count({
      where: { postId: id }
    });

    return NextResponse.json({ liked: false, count: likeCount }, { status: 200 });
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json({ 
      error: 'Failed to unlike post',
      details: error.message 
    }, { status: 500 });
  }
}

