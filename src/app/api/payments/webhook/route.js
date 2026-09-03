import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { Transaction, User } from '@/lib/db/models';
import { getSecretKey } from '@/lib/paystack/client';
import { activateSubscription } from '@/lib/subscription/activate';

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

function isValidSignature(rawBody, signature) {
  if (!signature) return false;
  const secret = getSecretKey();
  const hash = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

async function findTransaction(userId, reference) {
  const transactions = await Transaction.findAll({
    where: { userId, type: 'deposit' },
    order: [['createdAt', 'DESC']],
    limit: 50
  });

  return transactions.find((trx) => {
    const meta = parseMetadata(trx.metadata);
    return meta.paystack?.reference === reference;
  }) || null;
}

async function creditDeposit(userId, reference, verificationData) {
  const transaction = await findTransaction(userId, reference);

  if (!transaction) {
    return { credited: false, reason: 'not_found' };
  }

  if (transaction.status === 'completed') {
    return { credited: false, reason: 'already_completed', transaction };
  }

  if (transaction.status === 'failed') {
    return { credited: false, reason: 'already_failed', transaction };
  }

  const amount = Number(verificationData.amount) / 100;
  const user = await User.findByPk(userId);

  if (!user) {
    return { credited: false, reason: 'user_not_found', transaction };
  }

  await Transaction.sequelize.transaction(async (t) => {
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
      { transaction: t }
    );

    const currentBalance = Number(user.walletBalance) || 0;
    await user.update({ walletBalance: currentBalance + amount }, { transaction: t });
  });

  return { credited: true, transaction };
}

async function handleSubscription(userId, reference, verificationData) {
  const transaction = await findTransaction(userId, reference);

  if (!transaction) {
    return { credited: false, reason: 'not_found' };
  }

  if (transaction.status === 'completed') {
    return { credited: false, reason: 'already_completed', transaction };
  }

  if (transaction.status === 'failed') {
    return { credited: false, reason: 'already_failed', transaction };
  }

  const meta = parseMetadata(transaction.metadata);
  const amount = Number(verificationData.amount) / 100;

  await Transaction.sequelize.transaction(async (t) => {
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
      { transaction: t }
    );

    const user = await User.findByPk(userId, { transaction: t });
    const currentBalance = Number(user.walletBalance) || 0;
        await user.update({ walletBalance: currentBalance + amount }, { transaction: t });
      });

      await activateSubscription({
        userId,
        planId: meta.planId,
        reference,
        transactionId: transaction.id,
        amount
      });

  return { credited: true, transaction };
}

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!isValidSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const data = event.data || {};
      const reference = data.reference;
      const userId = data.metadata?.userId;

      if (reference && userId) {
        const matching = await findTransaction(userId, reference);
        const isSubscription = matching && parseMetadata(matching.metadata)?.subscriptionPayment === true;

        const result = isSubscription
          ? await handleSubscription(userId, reference, data)
          : await creditDeposit(userId, reference, data);

        if (!result.credited && result.reason === 'already_completed') {
          return NextResponse.json({ received: true, status: 'already_completed' });
        }
        if (!result.credited && result.reason === 'already_failed') {
          return NextResponse.json({ received: true, status: 'already_failed' });
        }
        return NextResponse.json({ received: true, credited: result.credited });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
