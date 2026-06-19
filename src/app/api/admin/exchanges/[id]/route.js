import { NextResponse } from 'next/server';
import { Transaction, User } from '@/lib/db/models';
import { authenticateAdmin, EXCHANGE_ADMIN_ROLES } from '@/lib/middleware/adminAuth';
import emailService from '@/lib/email/service';

function parseMetadata(metadata) {
  if (!metadata) return {};
  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  }
  return metadata;
}

export async function GET(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: EXCHANGE_ADMIN_ROLES });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const exchange = await Transaction.findOne({
      where: { id: params.id, type: 'exchange' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }]
    });

    if (!exchange) {
      return NextResponse.json({ error: 'Exchange order not found' }, { status: 404 });
    }

    return NextResponse.json({ exchange }, { status: 200 });
  } catch (error) {
    console.error('Error fetching exchange:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch exchange' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: EXCHANGE_ADMIN_ROLES });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, adminNote } = body;

    const allowedStatuses = ['pending', 'completed', 'failed', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Use pending, completed, failed, or cancelled.' }, { status: 400 });
    }

    const exchange = await Transaction.findOne({
      where: { id: params.id, type: 'exchange' }
    });

    if (!exchange) {
      return NextResponse.json({ error: 'Exchange order not found' }, { status: 404 });
    }

    const oldStatus = exchange.status;
    const currentMeta = parseMetadata(exchange.metadata);

    const updatedMeta = {
      ...currentMeta,
      ...(adminNote !== undefined && { adminNote }),
      ...(status === 'cancelled' && { refunded: true }),
      lastUpdatedBy: auth.user.id,
      lastUpdatedAt: new Date().toISOString()
    };

    await exchange.update({
      status,
      metadata: updatedMeta,
      processedAt: status === 'completed' ? new Date() : exchange.processedAt
    });

    if (status !== oldStatus) {
      try {
        const user = await User.findByPk(exchange.userId);
        if (user) {
          const statusLabel =
            status === 'completed' ? 'completed' :
            status === 'cancelled' ? 'refunded' :
            status;

          await emailService.sendTransactionNotification(user.email, user.username, {
            status: statusLabel,
            transactionId: exchange.id,
            type: 'exchange',
            amount: `${exchange.currency || 'NGN'} ${Number(exchange.amount).toLocaleString()}`,
            fromCurrency: exchange.currency || 'NGN',
            toCurrency: exchange.targetCurrency || currentMeta.productName || 'Asset',
            exchangeRate: exchange.exchangeRate || 1,
            fee: exchange.fees || 0,
            description: exchange.description
          });
        }
      } catch (emailError) {
        console.error('Error sending exchange status email:', emailError);
      }
    }

    const updated = await Transaction.findByPk(exchange.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }]
    });

    return NextResponse.json({ exchange: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating exchange:', error);
    return NextResponse.json({ error: error.message || 'Failed to update exchange' }, { status: 500 });
  }
}
