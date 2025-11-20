import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { Plan, Transaction } from '@/lib/db/models';
import { initializeTransaction } from '@/lib/paystack/client';

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId } = body;

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

    const numericAmount = Number(plan.price);
    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Invalid plan price' }, { status: 400 });
    }

    if (!auth.user.email) {
      return NextResponse.json({ error: 'User email is required to initialize payment' }, { status: 400 });
    }

    // Initialize Paystack transaction
    const paystackResponse = await initializeTransaction({
      email: auth.user.email,
      amount: numericAmount * 100, // Convert to kobo (Paystack uses kobo)
      metadata: {
        userId: auth.user.id,
        planId: plan.id,
        planName: plan.name,
        description: `Subscription payment for ${plan.name}`,
        type: 'subscription'
      }
    });

    const { reference, authorization_url: authorizationUrl, access_code: accessCode } = paystackResponse.data;

    // Create pending transaction
    await Transaction.create({
      userId: auth.user.id,
      type: 'deposit', // Using deposit type for subscription payments
      status: 'pending',
      amount: numericAmount,
      currency: plan.currency || 'NGN',
      description: `Subscription payment for ${plan.name}`,
      metadata: {
        planId: plan.id,
        planName: plan.name,
        subscriptionPayment: true,
        paystack: {
          reference,
          accessCode,
          authorizationUrl
        }
      }
    });

    return NextResponse.json(
      {
        authorizationUrl,
        reference,
        accessCode,
        plan: {
          id: plan.id,
          name: plan.name,
          price: numericAmount,
          currency: plan.currency
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Subscription payment initialization error:', error);
    return NextResponse.json({ error: error.message || 'Payment initialization failed' }, { status: 500 });
  }
}


