import { NextResponse } from 'next/server';
import { BlogLike } from '@/lib/db/models';
import jwt from 'jsonwebtoken';

async function authenticateUser(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'apicts_super_secret_jwt_key_2024_secure_random_string_change_in_production');
    
    return { authenticated: true, userId: decoded.userId };
  } catch (error) {
    return { authenticated: false };
  }
}

export async function GET(request, { params }) {
  try {
    const auth = await authenticateUser(request);
    
    if (!auth.authenticated) {
      return NextResponse.json({ liked: false, count: 0 }, { status: 200 });
    }

    const { id } = params;

    const like = await BlogLike.findOne({
      where: {
        postId: id,
        userId: auth.userId
      }
    });

    const likeCount = await BlogLike.count({
      where: { postId: id }
    });

    return NextResponse.json({ 
      liked: !!like, 
      count: likeCount 
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking like:', error);
    return NextResponse.json({ 
      liked: false, 
      count: 0 
    }, { status: 200 });
  }
}

