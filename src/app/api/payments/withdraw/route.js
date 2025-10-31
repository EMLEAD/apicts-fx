import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { Transaction, User } from '@/lib/db/models';
import { createTransferRecipient, initiateTransfer } from '@/lib/paystack/client';

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, currency = 'NGN', reason = 'Wallet withdrawal', accountNumber, bankCode, accountName } = body;

    const numericAmount = Number(amount);
    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 });
    }

    if (!accountNumber || !bankCode || !accountName) {
      return NextResponse.json({ error: 'Account number, bank code, and account name are required' }, { status: 400 });
    }

    const user = await User.findByPk(auth.user.id);
    const currentBalance = Number(user.walletBalance) || 0;

    if (numericAmount > currentBalance) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    const recipientResponse = await createTransferRecipient({
      name: accountName,
      accountNumber,
      bankCode,
      currency
    });

    const recipientCode = recipientResponse.data?.recipient_code;

    if (!recipientCode) {
      return NextResponse.json({ error: 'Failed to create transfer recipient' }, { status: 500 });
    }

    const transferResponse = await initiateTransfer({
      amount: numericAmount,
      reason,
      recipient: recipientCode,
      currency
    });

    const transferData = transferResponse.data;
    const transferStatus = transferData?.status || 'pending';

    await Transaction.sequelize.transaction(async (sequelizeTransaction) => {
      const newBalance = currentBalance - numericAmount;
      await user.update({ walletBalance: newBalance }, { transaction: sequelizeTransaction });

      await Transaction.create(
        {
          userId: auth.user.id,
          type: 'withdrawal',
          status: transferStatus === 'success' ? 'completed' : 'pending',
          amount: numericAmount,
          currency,
          description: reason,
          metadata: {
            paystack: {
              transfer: transferData,
              recipient: recipientResponse.data
            }
          }
        },
        { transaction: sequelizeTransaction }
      );
    });

    await user.reload();

    return NextResponse.json(
      {
        success: true,
        transfer: transferData,
        walletBalance: Number(user.walletBalance)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ error: error.message || 'Withdrawal failed' }, { status: 500 });
  }
}
