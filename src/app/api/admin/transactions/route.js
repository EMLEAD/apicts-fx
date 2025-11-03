import { NextResponse } from 'next/server';
import { Transaction, User } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const transactions = await Transaction.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

