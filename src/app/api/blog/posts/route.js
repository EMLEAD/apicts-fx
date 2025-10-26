import { NextResponse } from 'next/server';
import { BlogPost, User } from '@/lib/db/models';
import { Op } from 'sequelize';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const search = searchParams.get('search');

    const where = {
      status: 'published'
    };

    // Add search filter if provided
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { excerpt: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await BlogPost.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'email', 'profilePicture']
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: { exclude: ['authorId'] }
    });

    return NextResponse.json({
      posts: rows,
      total: count,
      limit,
      offset
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch blog posts',
      details: error.message 
    }, { status: 500 });
  }
}

