import { Transaction, User, Plan, UserPlan, Referral } from '@/lib/db/models';
import emailService from '@/lib/email/service';
import telegramService from '@/lib/telegram/service';

export async function activateSubscription({ userId, planId, reference, transactionId, amount }) {
  const plan = await Plan.findByPk(planId);
  if (!plan) {
    throw new Error('Plan not found');
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const result = await Transaction.sequelize.transaction(async (t) => {
    const existingSubscription = await UserPlan.findOne({
      where: { userId: user.id, planId: plan.id },
      transaction: t
    });

    let subscription;
    if (existingSubscription) {
      subscription = await existingSubscription.update(
        {
          status: 'active',
          startedAt: new Date(),
          metadata: {
            ...(existingSubscription.metadata || {}),
            transactionId,
            paymentReference: reference
          }
        },
        { transaction: t }
      );
    } else {
      subscription = await UserPlan.create(
        {
          userId: user.id,
          planId: plan.id,
          status: 'active',
          startedAt: new Date(),
          metadata: {
            transactionId,
            paymentReference: reference
          }
        },
        { transaction: t }
      );
    }

    let commissionTransaction = null;
    let referrerForNotification = null;

    const commissionRate = Number(plan.referralCommissionRate || 0);
    const commissionEligible = user.referredBy && commissionRate > 0;

    if (commissionEligible) {
      const referrer = await User.findByPk(user.referredBy, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (referrer) {
        const commissionAmount = (Number(amount) * commissionRate) / 100;
        const referrerBalance = Number(referrer.walletBalance) || 0;
        await referrer.update(
          { walletBalance: referrerBalance + commissionAmount },
          { transaction: t }
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
          { transaction: t }
        );

        await Referral.create(
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
          { transaction: t }
        );

        referrerForNotification = {
          email: referrer.email,
          username: referrer.username,
          commissionAmount,
          walletBalance: referrerBalance + commissionAmount
        };
      }
    }

    return { subscription, commissionTransaction, referrerForNotification };
  });

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

  let telegramWarning = null;

  if (plan.telegramGroupId && user.telegramUserId) {
    const addResult = await telegramService.addUserToGroupSafe(plan.telegramGroupId, parseInt(user.telegramUserId));

    if (addResult.ok) {
      await telegramService.sendWelcomeMessage(
        parseInt(user.telegramUserId),
        plan.name,
        plan.telegramGroupInviteLink
      );
      console.log(`✅ Added user ${user.username} to ${plan.name} Telegram group`);
    } else {
      telegramWarning = addResult.error;
      console.error(`❌ Error adding user ${user.username} to ${plan.name} Telegram group:`, addResult.error);
    }
  } else if (plan.telegramGroupId) {
    telegramWarning = 'You don\'t have a Telegram account linked. Link one in Settings to access the premium group.';
  }

  if (telegramWarning && result.subscription) {
    try {
      await result.subscription.update({
        metadata: {
          ...(result.subscription.metadata || {}),
          telegramWarning,
          telegramWarningAt: new Date().toISOString()
        }
      });
    } catch (e) {
      console.error('Failed to persist telegram warning:', e.message);
    }
  }

  return { ...result, telegramWarning, telegramOk: !telegramWarning };
}
