import { NextResponse } from 'next/server';
import { Notification } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const notifications = await Notification.findAll({
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { title, message, imageUrl, type, targetUrl, isActive, startsAt, endsAt } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const notification = await Notification.create({
      title,
      message,
      imageUrl: imageUrl || null,
      type: type || 'info',
      targetUrl: targetUrl || null,
      isActive: isActive !== false,
      startsAt: startsAt || null,
      endsAt: endsAt || null
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
