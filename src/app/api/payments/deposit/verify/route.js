import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { Transaction, User } from '@/lib/db/models';
import { verifyTransaction } from '@/lib/paystack/client';

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
      return NextResponse.json({ error: 'Transaction has not been completed yet' }, { status: 400 });
    }

    const amount = Number(verificationData.amount) / 100;

    const transactions = await Transaction.findAll({
      where: { userId: auth.user.id, type: 'deposit' },
      order: [['createdAt', 'DESC']]
    });

    const transaction = transactions.find((trx) => trx.metadata?.paystack?.reference === reference);

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
      await transaction.update(
        {
          status: 'completed',
          processedAt: new Date(),
          amount,
          metadata: {
            ...transaction.metadata,
            paystack: {
              ...(transaction.metadata?.paystack || {}),
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
