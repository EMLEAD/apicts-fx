import { NextResponse } from 'next/server';
import { VlogPost, User } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const posts = await VlogPost.findAll({
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching vlog posts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin', 'manager'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const post = await VlogPost.create({
      ...body,
      authorId: auth.user.id
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating vlog post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

