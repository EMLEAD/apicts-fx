import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { Transaction, User, Product } from '@/lib/db/models';
import { initializeTransaction } from '@/lib/paystack/client';
import { getRequestOrigin } from '@/lib/utils/url';

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, amount, walletId, paymentMethod } = body;

    // Validation
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const quantity = Number(amount);
    if (!quantity || Number.isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'Amount to buy must be greater than zero' }, { status: 400 });
    }

    if (!walletId || typeof walletId !== 'string' || !walletId.trim()) {
      return NextResponse.json({ error: 'Wallet ID is required' }, { status: 400 });
    }

    if (!['wallet', 'card'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    // Fetch Product
    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 });
    }

    const sellRate = Number(product.sellRate);
    if (!sellRate || Number.isNaN(sellRate) || sellRate <= 0) {
      return NextResponse.json({ error: 'Product exchange rate is not configured properly' }, { status: 400 });
    }

    // Calculate cost in NGN (sellRate is NGN/USD)
    const costInNgn = Math.round(quantity * sellRate * 100) / 100;

    const dbUser = await User.findByPk(auth.user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Pay from Account Wallet
    if (paymentMethod === 'wallet') {
      const userBalance = Number(dbUser.walletBalance) || 0;
      if (userBalance < costInNgn) {
        return NextResponse.json({ error: `Insufficient wallet balance. You need NGN ${costInNgn.toLocaleString()} but only have NGN ${userBalance.toLocaleString()}` }, { status: 400 });
      }

      // Deduct balance and create Transaction in a DB transaction block
      let newTransaction;
      await Transaction.sequelize.transaction(async (t) => {
        dbUser.walletBalance = userBalance - costInNgn;
        await dbUser.save({ transaction: t });

        newTransaction = await Transaction.create({
          userId: dbUser.id,
          type: 'exchange',
          status: 'pending', // pending admin fulfillment
          amount: costInNgn,
          currency: 'NGN',
          targetCurrency: product.name,
          exchangeRate: sellRate,
          description: `Bought ${quantity} USD of ${product.name} using Account Wallet`,
          metadata: {
            walletId,
            quantity,
            productName: product.name,
            productId: product.id,
            transactionType: 'product_buy',
            paymentMethod: 'wallet',
            paymentStatus: 'paid'
          }
        }, { transaction: t });
      });

      return NextResponse.json({
        success: true,
        paymentRequired: false,
        transaction: newTransaction,
        walletBalance: Number(dbUser.walletBalance)
      }, { status: 201 });
    }

    // 2. Pay via Card (Paystack)
    if (paymentMethod === 'card') {
      if (!dbUser.email) {
        return NextResponse.json({ error: 'User email is required to initialize Card payment' }, { status: 400 });
      }

      const description = `Purchase ${quantity} USD of ${product.name} via Card`;
      const callbackUrl = `${getRequestOrigin(request)}/payment/callback`;
      const paystackResponse = await initializeTransaction({
        email: dbUser.email,
        amount: costInNgn,
        callbackUrl,
        metadata: {
          userId: dbUser.id,
          type: 'product_purchase',
          productId,
          walletId,
          quantity,
          costInNgn,
          description
        }
      });

      const { reference, authorization_url: authorizationUrl, access_code: accessCode } = paystackResponse.data;

      const newTransaction = await Transaction.create({
        userId: dbUser.id,
        type: 'exchange',
        status: 'pending',
        amount: costInNgn,
        currency: 'NGN',
        targetCurrency: product.name,
        exchangeRate: sellRate,
        description,
        metadata: {
          walletId,
          quantity,
          productName: product.name,
          productId: product.id,
          transactionType: 'product_buy',
          paymentMethod: 'card',
          paymentStatus: 'unpaid',
          paystack: {
            reference,
            accessCode,
            authorizationUrl
          }
        }
      });

      return NextResponse.json({
        success: true,
        paymentRequired: true,
        authorizationUrl,
        reference,
        transaction: newTransaction
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Purchase initialization error:', error);
    return NextResponse.json({ error: error.message || 'Purchase initialization failed' }, { status: 500 });
  }
}
