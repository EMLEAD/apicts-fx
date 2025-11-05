import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { User, Transaction } from '@/lib/db/models';

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      recipientUsername,
      recipientEmail,
      recipientId,
      amount,
      currency = 'NGN',
      note = '',
      metadata = {},
      fee = 0
    } = body;

    const numericAmount = Number(amount);
    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 });
    }

    const numericFee = Number(fee) || 0;
    if (numericFee < 0) {
      return NextResponse.json({ error: 'Fee cannot be negative' }, { status: 400 });
    }

    const sender = await User.findByPk(auth.user.id);
    if (!sender) {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 });
    }

    const totalDebit = numericAmount + numericFee;
    const currentBalance = Number(sender.walletBalance) || 0;

    if (totalDebit > currentBalance) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    const recipientWhere = {};
    if (recipientId) {
      recipientWhere.id = recipientId;
    } else if (recipientUsername) {
      recipientWhere.username = recipientUsername;
    } else if (recipientEmail) {
      recipientWhere.email = recipientEmail;
    } else {
      return NextResponse.json({ error: 'Recipient identifier (id, username, or email) is required' }, { status: 400 });
    }

    const recipient = await User.findOne({ where: recipientWhere });

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    if (recipient.id === sender.id) {
      return NextResponse.json({ error: 'You cannot transfer to yourself' }, { status: 400 });
    }

    await Transaction.sequelize.transaction(async (sequelizeTransaction) => {
      const updatedSenderBalance = currentBalance - totalDebit;
      await sender.update({ walletBalance: updatedSenderBalance }, { transaction: sequelizeTransaction });

      const recipientBalance = Number(recipient.walletBalance) || 0;
      const updatedRecipientBalance = recipientBalance + numericAmount;
      await recipient.update({ walletBalance: updatedRecipientBalance }, { transaction: sequelizeTransaction });

      await Transaction.create(
        {
          userId: sender.id,
          type: 'transfer',
          status: 'completed',
          amount: numericAmount,
          currency,
          description: note || 'Wallet transfer',
          metadata: {
            direction: 'debit',
            fee: numericFee,
            recipientId: recipient.id,
            recipientUsername: recipient.username,
            ...metadata
          },
          processedAt: new Date()
        },
        { transaction: sequelizeTransaction }
      );

      await Transaction.create(
        {
          userId: recipient.id,
          type: 'transfer',
          status: 'completed',
          amount: numericAmount,
          currency,
          description: note || 'Wallet transfer',
          metadata: {
            direction: 'credit',
            fee: 0,
            senderId: sender.id,
            senderUsername: sender.username,
            ...metadata
          },
          processedAt: new Date()
        },
        { transaction: sequelizeTransaction }
      );
    });

    await sender.reload();
    await recipient.reload();

    return NextResponse.json(
      {
        success: true,
        transfer: {
          amount: numericAmount,
          currency,
          fee: numericFee,
          note,
          sender: {
            id: sender.id,
            username: sender.username,
            walletBalance: Number(sender.walletBalance)
          },
          recipient: {
            id: recipient.id,
            username: recipient.username,
            walletBalance: Number(recipient.walletBalance)
          }
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json({ error: error.message || 'Transfer failed' }, { status: 500 });
  }
}


