import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';
import { Contact } from '@/lib/db/models';

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where = {};
    if (unreadOnly) {
      where.isRead = false;
    }

    const contacts = await Contact.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(contacts.count / limit);

    return NextResponse.json({
      success: true,
      messages: contacts.rows,
      pagination: {
        total: contacts.count,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error.message },
      { status: 500 }
    );
  }
}
