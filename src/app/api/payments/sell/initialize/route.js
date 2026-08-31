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
    const { productId, amount, images, cardCount, sellFields } = body;

    // Validation
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const quantity = Number(amount);
    if (!quantity || Number.isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'Amount to sell must be greater than zero' }, { status: 400 });
    }

    // Fetch Product
    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 });
    }

    let configFieldsRaw = [];
    if (Array.isArray(product.sellForm)) {
      configFieldsRaw = product.sellForm;
    } else if (typeof product.sellForm === 'string' && product.sellForm) {
      try {
        const parsed = JSON.parse(product.sellForm);
        if (Array.isArray(parsed)) configFieldsRaw = parsed;
      } catch {
        configFieldsRaw = [];
      }
    }
    const configFields = configFieldsRaw.length > 0
      ? configFieldsRaw
      : [{ key: 'images', label: 'Upload Product Images', type: 'image', required: true }];

    const normalizedFields = Array.isArray(sellFields) ? sellFields : [];

    if (!images || !Array.isArray(images) || images.length === 0) {
      const imageRequired = configFields.find((f) => f.type === 'image' && f.required);
      if (imageRequired) {
        return NextResponse.json({ error: 'At least one product image is required' }, { status: 400 });
      }
    }

    for (const field of configFields) {
      if (!field.required) continue;
      if (field.type === 'image') {
        if (!images || !Array.isArray(images) || images.length === 0) {
          return NextResponse.json({ error: `${field.label || 'Product image'} is required` }, { status: 400 });
        }
      } else {
        const entry = normalizedFields.find((f) => f.key === field.key);
        const value = entry ? String(entry.value || '').trim() : '';
        if (!value) {
          return NextResponse.json({ error: `"${field.label || 'Field'}" is required` }, { status: 400 });
        }
      }
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

    // Build description using configured fields
    const descParts = [`Sold ${quantity} USD of ${product.name}`];
    const nonImageFields = configFields.filter((f) => f.type !== 'image');
    if (nonImageFields.length > 0) {
      const parts = [];
      for (const field of nonImageFields) {
        const entry = normalizedFields.find((f) => f.key === field.key);
        const value = entry && entry.type === 'number' ? String(Number(entry.value) || 0) : String(entry?.value || '');
        if (value) parts.push(`${field.label || 'Field'}: ${value}`);
      }
      if (parts.length > 0) descParts.push(`(${parts.join(', ')})`);
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
      description: descParts.join(' '),
      metadata: {
        quantity,
        productName: product.name,
        productId: product.id,
        images,
        cardCount,
        sellFields: normalizedFields,
        sellFormConfig: configFields,
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
