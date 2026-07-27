import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { Transaction, User, Product, Plan } from '@/lib/db/models';

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, purpose, proofOfPayment, planId, productId, walletId, quantity } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    if (!proofOfPayment) {
      return NextResponse.json({ error: 'Proof of payment image is required' }, { status: 400 });
    }

    if (!purpose || !['wallet_funding', 'plan_payment', 'product_purchase'].includes(purpose)) {
      return NextResponse.json({ error: 'Valid purpose is required' }, { status: 400 });
    }

    const dbUser = await User.findByPk(auth.user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const numericAmount = Number(amount);

    const metadata = {
      paymentMethod: 'direct_transfer',
      paymentStatus: 'awaiting_verification',
      proofOfPayment,
      purpose
    };

    let description = '';
    let targetCurrency = null;
    let exchangeRate = null;
    let txType = 'exchange';

    if (purpose === 'plan_payment') {
      if (!planId) {
        return NextResponse.json({ error: 'Plan ID is required for plan payment' }, { status: 400 });
      }
      const plan = await Plan.findByPk(planId);
      if (!plan || plan.status !== 'active') {
        return NextResponse.json({ error: 'Plan not found or inactive' }, { status: 404 });
      }
      metadata.planId = planId;
      metadata.planName = plan.name;
      metadata.subscriptionPayment = true;
      description = `Bank transfer payment for ${plan.name} plan`;
    } else if (purpose === 'product_purchase') {
      if (!productId) {
        return NextResponse.json({ error: 'Product ID is required for product purchase' }, { status: 400 });
      }
      if (!walletId || !walletId.trim()) {
        return NextResponse.json({ error: 'Destination wallet address is required' }, { status: 400 });
      }
      const product = await Product.findByPk(productId);
      if (!product || !product.isActive) {
        return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 });
      }
      metadata.productId = productId;
      metadata.productName = product.name;
      metadata.walletId = walletId.trim();
      metadata.quantity = Number(quantity) || 0;
      metadata.transactionType = 'product_buy';
      targetCurrency = product.name;
      exchangeRate = Number(product.sellRate) || null;
      description = `Bank transfer for ${Number(quantity) || 0} USD of ${product.name}`;
    } else {
      txType = 'deposit';
      description = 'DEPOSIT';
    }

    const newTransaction = await Transaction.create({
      userId: dbUser.id,
      type: txType,
      status: 'pending',
      amount: numericAmount,
      currency: 'NGN',
      targetCurrency,
      exchangeRate,
      description,
      metadata
    });

    return NextResponse.json({
      success: true,
      message: 'Proof of payment submitted. Awaiting admin verification.',
      transaction: newTransaction
    }, { status: 201 });

  } catch (error) {
    console.error('Direct transfer error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process direct transfer' },
      { status: 500 }
    );
  }
}
