import { NextResponse } from 'next/server';
import { BlogComment, User, BlogPost } from '@/lib/db/models';
import jwt from 'jsonwebtoken';

async function authenticateUser(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'No token provided' };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'apicts_super_secret_jwt_key_2024_secure_random_string_change_in_production');
    
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return { authenticated: false, error: 'User not found' };
    }

    return { authenticated: true, user, userId: decoded.userId };
  } catch (error) {
    return { authenticated: false, error: 'Invalid token' };
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
    const { id } = params;
    const postId = await resolvePostId(id);
    
    if (!postId) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const comments = await BlogComment.findAll({
      where: {
        postId: postId,
        parentId: null, // Only top-level comments
        status: 'approved'
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'profilePicture']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Get replies for each comment
    for (let comment of comments) {
      const replies = await BlogComment.findAll({
        where: {
          parentId: comment.id,
          status: 'approved'
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePicture']
        }],
        order: [['createdAt', 'ASC']]
      });
      comment.dataValues.replies = replies;
    }

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch comments',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await authenticateUser(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const postId = await resolvePostId(id);
    
    if (!postId) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    const comment = await BlogComment.create({
      postId: postId,
      userId: auth.userId,
      content: content.trim(),
      parentId: parentId || null,
      status: 'approved'
    });

    // Fetch the comment with user data
    const commentWithUser = await BlogComment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'profilePicture']
      }]
    });

    return NextResponse.json({ comment: commentWithUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ 
      error: 'Failed to create comment',
      details: error.message 
    }, { status: 500 });
  }
}

