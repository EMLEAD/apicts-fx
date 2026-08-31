import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { Transaction, User } from '@/lib/db/models';
import { verifyTransaction } from '@/lib/paystack/client';

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

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 });
    }

    const paystackResponse = await verifyTransaction(reference);
    const verificationData = paystackResponse.data;

    if (verificationData.status !== 'success') {
      const isFinal = ['failed', 'abandoned', 'reversed'].includes(verificationData.status);
      return NextResponse.json(
        {
          error: isFinal
            ? 'Payment was declined or cancelled on Paystack'
            : 'Transaction has not been completed on Paystack yet',
          paystackStatus: verificationData.status,
          final: isFinal
        },
        { status: 400 }
      );
    }

    const amount = Number(verificationData.amount) / 100;

    const transactions = await Transaction.findAll({
      where: { userId: auth.user.id, type: 'deposit' },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    const transaction = transactions.find((trx) => {
      const meta = parseMetadata(trx.metadata);
      return meta.paystack?.reference === reference;
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Matching transaction not found' }, { status: 404 });
    }

    if (transaction.status === 'completed') {
      return NextResponse.json({ success: true, message: 'Transaction already verified' }, { status: 200 });
    }

    if (transaction.status === 'failed') {
      return NextResponse.json({ error: 'Transaction has already been marked as failed' }, { status: 400 });
    }

    const user = await User.findByPk(auth.user.id);

    await Transaction.sequelize.transaction(async (sequelizeTransaction) => {
      const currentMeta = parseMetadata(transaction.metadata);
      await transaction.update(
        {
          status: 'completed',
          processedAt: new Date(),
          amount,
          metadata: {
            ...currentMeta,
            paystack: {
              ...(currentMeta.paystack || {}),
              verification: verificationData
            }
          }
        },
        { transaction: sequelizeTransaction }
      );

      const currentBalance = Number(user.walletBalance) || 0;
      const newBalance = currentBalance + amount;
      await user.update({ walletBalance: newBalance }, { transaction: sequelizeTransaction });
    });

    await user.reload();

    return NextResponse.json({ success: true, amount, walletBalance: Number(user.walletBalance) }, { status: 200 });
  } catch (error) {
    console.error('Deposit verification error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
