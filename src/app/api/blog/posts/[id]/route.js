import { NextResponse } from 'next/server';
import { BlogPost, User } from '@/lib/db/models';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Check if id is a UUID (contains hyphens and is 36 chars) or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let post;
    if (isUUID) {
      // Look up by ID (UUID)
      post = await BlogPost.findByPk(id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email', 'profilePicture']
        }]
      });
    } else {
      // Look up by slug
      post = await BlogPost.findOne({
        where: {
          slug: id,
          status: 'published' // Only fetch published posts by slug
        },
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email', 'profilePicture']
        }]
      });
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Increment view count
    post.views += 1;
    await post.save();

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch blog post',
      details: error.message 
    }, { status: 500 });
  }
}

