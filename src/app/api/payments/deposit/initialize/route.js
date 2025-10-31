import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { Transaction } from '@/lib/db/models';
import { initializeTransaction } from '@/lib/paystack/client';

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, currency = 'NGN', description = 'Wallet deposit', metadata = {} } = body;

    const numericAmount = Number(amount);
    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 });
    }

    if (!auth.user.email) {
      return NextResponse.json({ error: 'User email is required to initialize deposit' }, { status: 400 });
    }

    const paystackResponse = await initializeTransaction({
      email: auth.user.email,
      amount: numericAmount,
      metadata: {
        userId: auth.user.id,
        description,
        ...metadata
      }
    });

    const { reference, authorization_url: authorizationUrl, access_code: accessCode } = paystackResponse.data;

    await Transaction.create({
      userId: auth.user.id,
      type: 'deposit',
      status: 'pending',
      amount: numericAmount,
      currency,
      description,
      metadata: {
        ...metadata,
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
        accessCode
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Deposit initialization error:', error);
    return NextResponse.json({ error: error.message || 'Deposit initialization failed' }, { status: 500 });
  }
}
