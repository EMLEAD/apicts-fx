import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { Transaction, User, Product } from '@/lib/db/models';

export async function POST(request) {
  try {
    console.log('📝 Received sell order request');
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    const { productId, amount, images, cardCount } = body;

    // Validation
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const quantity = Number(amount);
    if (!quantity || Number.isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'Amount to sell must be greater than zero' }, { status: 400 });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'At least one product image is required' }, { status: 400 });
    }

    if (!cardCount || Number(cardCount) <= 0) {
      return NextResponse.json({ error: 'Card count is required' }, { status: 400 });
    }

    // Fetch Product
    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 });
    }

    const buyRate = Number(product.buyRate);
    if (!buyRate || Number.isNaN(buyRate) || buyRate <= 0) {
      return NextResponse.json({ error: 'Product exchange rate is not configured properly' }, { status: 400 });
    }

    // Calculate amount in NGN (buyRate is NGN/USD - what we pay you)
    const amountInNgn = Math.round(quantity * buyRate * 100) / 100;

    const dbUser = await User.findByPk(auth.user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create sell transaction
    console.log('Creating sell transaction...');
    const newTransaction = await Transaction.create({
      userId: dbUser.id,
      type: 'sell',
      status: 'pending', // pending admin verification/approval
      amount: amountInNgn,
      currency: 'NGN',
      targetCurrency: product.name,
      exchangeRate: buyRate,
      description: `Sold ${quantity} USD of ${product.name} (${cardCount} cards/sort)`,
      metadata: {
        quantity,
        productName: product.name,
        productId: product.id,
        images,
        cardCount,
        transactionType: 'product_sell',
        sellStatus: 'pending_verification'
      }
    });
    console.log('✅ Sell transaction created:', newTransaction.id);

    return NextResponse.json({
      success: true,
      transaction: newTransaction
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Sell initialization error:', error);
    return NextResponse.json({ error: error.message || 'Sell initialization failed' }, { status: 500 });
  }
}
