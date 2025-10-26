import { NextResponse } from 'next/server';
import { BlogPost, User } from '@/lib/db/models';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const post = await BlogPost.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'email', 'profilePicture']
      }]
    });

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

