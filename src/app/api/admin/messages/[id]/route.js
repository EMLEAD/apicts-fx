import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';
import { Contact } from '@/lib/db/models';

export async function PUT(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isRead, status } = body;

    const contact = await Contact.findByPk(id);
    if (!contact) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const updates = {};
    if (isRead !== undefined) updates.isRead = isRead;
    if (status) updates.status = status;

    await contact.update(updates);

    return NextResponse.json({ success: true, message: contact });
  } catch (error) {
    console.error('Update message error:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const contact = await Contact.findByPk(id);
    if (!contact) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    await contact.destroy();

    return NextResponse.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
