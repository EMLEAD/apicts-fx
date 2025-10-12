import { NextResponse } from 'next/server';
const { User } = require('@/lib/db/models');
const { authenticate } = require('@/lib/middleware/auth');

// GET - Get all users (Admin only)
export async function GET(request) {
  try {
    // You can add authentication middleware here
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    const users = await User.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json(
      {
        users: users.rows,
        total: users.count,
        limit,
        offset
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}

