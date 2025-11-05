import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { Transaction, User, Plan, UserPlan, Referral } from '@/lib/db/models';
import { verifyTransaction } from '@/lib/paystack/client';
import emailService from '@/lib/email/service';

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

    // Verify with Paystack
    const paystackResponse = await verifyTransaction(reference);
    const verificationData = paystackResponse.data;

    if (verificationData.status !== 'success') {
      return NextResponse.json({ error: 'Transaction has not been completed yet' }, { status: 400 });
    }

    const amount = Number(verificationData.amount) / 100;

    // Find the transaction
    const transactions = await Transaction.findAll({
      where: { userId: auth.user.id },
      order: [['createdAt', 'DESC']]
    });

    const transaction = transactions.find((trx) => 
      trx.metadata?.paystack?.reference === reference && 
      trx.metadata?.subscriptionPayment === true
    );

    if (!transaction) {
      return NextResponse.json({ error: 'Matching subscription transaction not found' }, { status: 404 });
    }

    if (transaction.status === 'completed') {
      // Check if subscription already exists
      const existingSubscription = await UserPlan.findOne({
        where: {
          userId: auth.user.id,
          planId: transaction.metadata.planId,
          status: 'active'
        }
      });

      if (existingSubscription) {
        return NextResponse.json({
          success: true,
          message: 'Subscription already active',
          subscription: existingSubscription
        }, { status: 200 });
      }
    }

    const planId = transaction.metadata.planId;
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const user = await User.findByPk(auth.user.id);

    // Process subscription and payment in a transaction
    const result = await Transaction.sequelize.transaction(async (sequelizeTransaction) => {
      // Update transaction status
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

      // Credit user wallet (subscription payment is treated as deposit)
      const currentBalance = Number(user.walletBalance) || 0;
      const newBalance = currentBalance + amount;
      await user.update({ walletBalance: newBalance }, { transaction: sequelizeTransaction });

      // Create or update subscription
      const existingSubscription = await UserPlan.findOne({
        where: { userId: user.id, planId: plan.id },
        transaction: sequelizeTransaction
      });

      let subscription;
      if (existingSubscription) {
        subscription = await existingSubscription.update(
          {
            status: 'active',
            startedAt: new Date(),
            metadata: {
              ...(existingSubscription.metadata || {}),
              transactionId: transaction.id,
              paymentReference: reference
            }
          },
          { transaction: sequelizeTransaction }
        );
      } else {
        subscription = await UserPlan.create(
          {
            userId: user.id,
            planId: plan.id,
            status: 'active',
            startedAt: new Date(),
            metadata: {
              transactionId: transaction.id,
              paymentReference: reference
            }
          },
          { transaction: sequelizeTransaction }
        );
      }

      // Handle referral commission if applicable
      let commissionTransaction = null;
      let referralRecord = null;
      let referrerForNotification = null;

      const commissionRate = Number(plan.referralCommissionRate || 0);
      const commissionEligible = user.referredBy && commissionRate > 0 && amount > 0;

      if (commissionEligible) {
        const referrer = await User.findByPk(user.referredBy, {
          transaction: sequelizeTransaction,
          lock: sequelizeTransaction.LOCK.UPDATE
        });

        if (referrer) {
          const commissionAmount = (amount * commissionRate) / 100;
          const referrerBalance = Number(referrer.walletBalance) || 0;
          const newReferrerBalance = referrerBalance + commissionAmount;

          await referrer.update(
            { walletBalance: newReferrerBalance },
            { transaction: sequelizeTransaction }
          );

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
            walletBalance: newReferrerBalance
          };
        }
      }

      return {
        subscription,
        commissionTransaction,
        referralRecord,
        referrerForNotification
      };
    });

    // Send referral notification email if applicable
    if (result.commissionTransaction && result.referrerForNotification) {
      try {
        await emailService.sendTransactionNotification(
          result.referrerForNotification.email,
          result.referrerForNotification.username,
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

    await user.reload();

    return NextResponse.json({
      success: true,
      subscription: result.subscription,
      referral: result.referralRecord,
      walletBalance: Number(user.walletBalance)
    }, { status: 200 });
  } catch (error) {
    console.error('Subscription verification error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}

