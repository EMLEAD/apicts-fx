import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { Transaction } from '@/lib/db/models';

export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where = { userId: auth.user.id };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const transactions = await Transaction.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return NextResponse.json(
      {
        transactions: transactions.rows,
        total: transactions.count,
        limit,
        offset
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch transactions' }, { status: 500 });
  }
}
