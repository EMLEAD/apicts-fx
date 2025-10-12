import { NextResponse } from 'next/server';
const { Contact } = require('@/lib/db/models');

// POST - Create new contact message
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create contact message
    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message
    });

    return NextResponse.json(
      {
        message: 'Contact message sent successfully',
        contact
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact creation error:', error);
    return NextResponse.json(
      { error: 'Failed to send message', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Get all contact messages (Admin only - you can add auth middleware)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    const where = {};
    if (status) {
      where.status = status;
    }

    const contacts = await Contact.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json(
      {
        contacts: contacts.rows,
        total: contacts.count,
        limit,
        offset
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts', details: error.message },
      { status: 500 }
    );
  }
}

