import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { Plan, Transaction, ExchangeRate, User, UserPlan, Referral } from '@/lib/db/models';
import { initializeTransaction } from '@/lib/paystack/client';
import { getRequestOrigin } from '@/lib/utils/url';
import emailService from '@/lib/email/service';

async function convertPrice(plan) {
  let numericAmount = Number(plan.price);
  if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Invalid plan price');
  }
  let finalCurrency = plan.currency || 'NGN';
  if (finalCurrency === 'USD') {
    const rateObj = await ExchangeRate.findOne({
      where: { fromCurrency: 'USD', toCurrency: 'NGN', isActive: true },
      order: [['createdAt', 'DESC']]
    });
    const rate = rateObj ? Number(rateObj.rate) : 1410;
    numericAmount = numericAmount * rate;
    finalCurrency = 'NGN';
  }
  return { amount: numericAmount, currency: finalCurrency };
}

async function handleReferralCommission(user, plan, amount, t) {
  const commissionRate = Number(plan.referralCommissionRate || 0);
  if (!user.referredBy || commissionRate <= 0 || amount <= 0) return;

  const referrer = await User.findByPk(user.referredBy, { transaction: t, lock: t.LOCK.UPDATE });
  if (!referrer) return;

  const commissionAmount = (amount * commissionRate) / 100;
  const referrerBalance = Number(referrer.walletBalance) || 0;
  await referrer.update({ walletBalance: referrerBalance + commissionAmount }, { transaction: t });

  await Transaction.create({
    userId: referrer.id,
    type: 'referral',
    status: 'completed',
    amount: commissionAmount,
    currency: plan.currency || 'NGN',
    description: `Referral commission from ${user.username} subscribing to ${plan.name}`,
    metadata: { referredUserId: user.id, referredUsername: user.username, planId: plan.id, planName: plan.name, commissionRate, planPrice: plan.price },
    processedAt: new Date()
  }, { transaction: t });

  await Referral.create({
    referrerId: referrer.id, referredUserId: user.id, planId: plan.id,
    commissionAmount, status: 'rewarded', rewardedAt: new Date()
  }, { transaction: t });

  try {
    await emailService.sendTransactionNotification(referrer.email, referrer.username, {
      type: 'Referral Commission', amount: commissionAmount,
      currency: plan.currency || 'NGN', status: 'completed',
      description: `You earned a referral commission for ${plan.name}.`
    });
  } catch (err) {
    console.error('Failed to send referral email:', err.message);
  }
}

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, paymentMethod = 'card' } = body;

    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 });
    }

    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (plan.status !== 'active') {
      return NextResponse.json({ error: 'Plan is not available for subscription' }, { status: 400 });
    }

    const { amount: numericAmount, currency: finalCurrency } = await convertPrice(plan);

    // === Wallet Payment ===
    if (paymentMethod === 'wallet') {
      const user = await User.findByPk(auth.user.id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const userBalance = Number(user.walletBalance) || 0;
      if (userBalance < numericAmount) {
        return NextResponse.json({
          error: `Insufficient wallet balance. You need ${finalCurrency} ${numericAmount.toLocaleString()} but only have ${finalCurrency} ${userBalance.toLocaleString()}`
        }, { status: 400 });
      }

      let subscription;
      await Transaction.sequelize.transaction(async (t) => {
        await user.update({ walletBalance: userBalance - numericAmount }, { transaction: t });

        await Transaction.create({
          userId: user.id,
          type: 'deposit',
          status: 'completed',
          amount: numericAmount,
          currency: finalCurrency,
          description: `Subscription payment for ${plan.name} (Wallet)`,
          metadata: {
            planId: plan.id, planName: plan.name,
            originalPrice: Number(plan.price), originalCurrency: plan.currency,
            subscriptionPayment: true, paymentMethod: 'wallet'
          },
          processedAt: new Date()
        }, { transaction: t });

        const existing = await UserPlan.findOne({
          where: { userId: user.id, planId: plan.id }, transaction: t
        });

        if (existing) {
          subscription = await existing.update({ status: 'active', startedAt: new Date() }, { transaction: t });
        } else {
          subscription = await UserPlan.create({
            userId: user.id, planId: plan.id, status: 'active', startedAt: new Date()
          }, { transaction: t });
        }

        await handleReferralCommission(user, plan, numericAmount, t);
      });

      await user.reload();

      return NextResponse.json({
        success: true, paymentMethod: 'wallet', subscription,
        walletBalance: Number(user.walletBalance)
      }, { status: 201 });
    }

    // === Card Payment (Paystack) ===
    if (!auth.user.email) {
      return NextResponse.json({ error: 'User email is required to initialize payment' }, { status: 400 });
    }

    const paystackResponse = await initializeTransaction({
      email: auth.user.email,
      amount: numericAmount,
      callbackUrl: `${getRequestOrigin(request)}/payment/callback`,
      metadata: {
        userId: auth.user.id, planId: plan.id, planName: plan.name,
        description: `Subscription payment for ${plan.name}`, type: 'subscription'
      }
    });

    const { reference, authorization_url: authorizationUrl, access_code: accessCode } = paystackResponse.data;

    await Transaction.create({
      userId: auth.user.id,
      type: 'deposit',
      status: 'pending',
      amount: numericAmount,
      currency: finalCurrency,
      description: `Subscription payment for ${plan.name}`,
      metadata: {
        planId: plan.id, planName: plan.name,
        originalPrice: Number(plan.price), originalCurrency: plan.currency,
        subscriptionPayment: true,
        paystack: { reference, accessCode, authorizationUrl }
      }
    });

    return NextResponse.json({ authorizationUrl, reference, accessCode, plan: { id: plan.id, name: plan.name, price: numericAmount, currency: plan.currency } }, { status: 201 });
  } catch (error) {
    console.error('Subscription payment initialization error:', error);
    return NextResponse.json({ error: error.message || 'Payment initialization failed' }, { status: 500 });
  }
}
