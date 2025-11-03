import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { Plan, UserPlan, User, Transaction, Referral } from '@/lib/db/models';
import emailService from '@/lib/email/service';

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, status = 'active', metadata = {} } = body;

    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 });
    }

    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const user = await User.findByPk(auth.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingSubscription = await UserPlan.findOne({ where: { userId: user.id, planId: plan.id } });
    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json({ success: true, message: 'Already subscribed to this plan' }, { status: 200 });
    }

    const commissionRate = Number(plan.referralCommissionRate || 0);
    const commissionEligible = user.referredBy && commissionRate > 0 && Number(plan.price) > 0;

    let referrerForNotification = null;

    const result = await UserPlan.sequelize.transaction(async (sequelizeTransaction) => {
      let subscription;
      if (existingSubscription) {
        subscription = await existingSubscription.update(
          {
            status,
            startedAt: status === 'active' ? new Date() : existingSubscription.startedAt,
            metadata: {
              ...(existingSubscription.metadata || {}),
              ...metadata
            }
          },
          { transaction: sequelizeTransaction }
        );
      } else {
        subscription = await UserPlan.create(
          {
            userId: user.id,
            planId: plan.id,
            status,
            startedAt: status === 'active' ? new Date() : null,
            metadata
          },
          { transaction: sequelizeTransaction }
        );
      }

      let commissionTransaction = null;
      let referralRecord = null;

      if (commissionEligible && status === 'active') {
        const referrer = await User.findByPk(user.referredBy, { transaction: sequelizeTransaction, lock: sequelizeTransaction.LOCK.UPDATE });
        if (referrer) {
          const commissionAmount = (Number(plan.price) * commissionRate) / 100;
          const currentBalance = Number(referrer.walletBalance) || 0;
          const newBalance = currentBalance + commissionAmount;

          await referrer.update({ walletBalance: newBalance }, { transaction: sequelizeTransaction });

          commissionTransaction = await Transaction.create(
            {
              userId: referrer.id,
              type: 'referral',
              status: 'completed',
              amount: commissionAmount,
              currency: plan.currency || 'NGN',
              description: `Referral commission from ${user.username} subscribing to ${plan.name}`,
              metadata: {
                referredUserId: user.id,
                referredUsername: user.username,
                planId: plan.id,
                planName: plan.name,
                commissionRate,
                planPrice: plan.price
              },
              processedAt: new Date()
            },
            { transaction: sequelizeTransaction }
          );

          referralRecord = await Referral.create(
            {
              referrerId: referrer.id,
              referredUserId: user.id,
              planId: plan.id,
              commissionAmount,
              status: 'rewarded',
              rewardedAt: new Date(),
              metadata: {
                transactionId: commissionTransaction.id
              }
            },
            { transaction: sequelizeTransaction }
          );

          referrerForNotification = {
            email: referrer.email,
            username: referrer.username,
            commissionAmount,
            walletBalance: Number(referrer.walletBalance) + commissionAmount
          };
        }
      }

      return {
        subscription,
        commissionTransaction,
        referralRecord
      };
    });

    if (result?.commissionTransaction && referrerForNotification) {
      try {
        await emailService.sendTransactionNotification(
          referrerForNotification.email,
          referrerForNotification.username,
          {
            type: 'Referral Commission',
            amount: result.commissionTransaction.amount,
            currency: plan.currency || 'NGN',
            status: 'completed',
            description: `You earned a referral commission for ${plan.name}.`
          }
        );
      } catch (error) {
        console.error('Failed to send referral email:', error.message);
      }
    }

    return NextResponse.json(
      {
        success: true,
        subscription: result.subscription,
        referral: result.referralRecord
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Plan subscription error:', error);
    return NextResponse.json({ error: error.message || 'Subscription failed' }, { status: 500 });
  }
}

