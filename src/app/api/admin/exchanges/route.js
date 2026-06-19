import { NextResponse } from 'next/server';
import { Transaction, User } from '@/lib/db/models';
import { authenticateAdmin, EXCHANGE_ADMIN_ROLES } from '@/lib/middleware/adminAuth';

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: EXCHANGE_ADMIN_ROLES });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search') || '';

    const where = { type: 'exchange' };

    if (status && status !== 'all') {
      where.status = status;
    }

    const exchanges = await Transaction.findAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: 200
    });

    let results = exchanges;

    if (paymentStatus && paymentStatus !== 'all') {
      results = results.filter((tx) => {
        const meta = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata || '{}') : (tx.metadata || {});
        return meta.paymentStatus === paymentStatus;
      });
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      results = results.filter((tx) => {
        const meta = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata || '{}') : (tx.metadata || {});
        return (
          tx.id.toLowerCase().includes(term) ||
          tx.user?.username?.toLowerCase().includes(term) ||
          tx.user?.email?.toLowerCase().includes(term) ||
          meta.productName?.toLowerCase().includes(term) ||
          meta.walletId?.toLowerCase().includes(term) ||
          meta.paystack?.reference?.toLowerCase().includes(term)
        );
      });
    }

    return NextResponse.json({ exchanges: results, total: results.length }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin exchanges:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch exchanges' }, { status: 500 });
  }
}
