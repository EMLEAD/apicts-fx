import { NextResponse } from 'next/server';
import { BlogLike, BlogPost } from '@/lib/db/models';
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

async function resolvePostId(id) {
  // Check if id is a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  if (isUUID) {
    return id;
  } else {
    // Look up by slug
    const post = await BlogPost.findOne({
      where: { slug: id, status: 'published' },
      attributes: ['id']
    });
    return post ? post.id : null;
  }
}

export async function GET(request, { params }) {
  try {
    const auth = await authenticateUser(request);
    
    if (!auth.authenticated) {
      return NextResponse.json({ liked: false, count: 0 }, { status: 200 });
    }

    const { id } = params;
    const postId = await resolvePostId(id);
    
    if (!postId) {
      return NextResponse.json({ liked: false, count: 0 }, { status: 200 });
    }

    const like = await BlogLike.findOne({
      where: {
        postId: postId,
        userId: auth.userId
      }
    });

    const likeCount = await BlogLike.count({
      where: { postId: postId }
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

