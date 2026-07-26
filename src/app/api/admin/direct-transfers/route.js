import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';
import { Transaction } from '@/lib/db/models';

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    const where = {
      'metadata.paymentMethod': 'direct_transfer'
    };
    if (status !== 'all') {
      where.status = status;
    }

    const transactions = await Transaction.findAndCountAll({
      where,
      include: [{ association: 'user', attributes: ['id', 'username', 'email'] }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json({
      transactions: transactions.rows,
      total: transactions.count,
      limit,
      offset
    });
  } catch (error) {
    console.error('Fetch direct transfers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch direct transfers', details: error.message },
      { status: 500 }
    );
  }
}
