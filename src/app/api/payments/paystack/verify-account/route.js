import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { resolveBankAccount } from '@/lib/paystack/client';

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const accountNumber = `${body.accountNumber || ''}`.trim();
    const bankCode = `${body.bankCode || ''}`.trim();

    if (!accountNumber || accountNumber.length < 6) {
      return NextResponse.json({ error: 'A valid account number is required' }, { status: 400 });
    }

    if (!bankCode) {
      return NextResponse.json({ error: 'A bank code is required' }, { status: 400 });
    }

    const response = await resolveBankAccount({ accountNumber, bankCode });
    const accountData = response?.data || {};

    return NextResponse.json({
      success: true,
      accountName: accountData.account_name,
      accountNumber: accountData.account_number,
      bankId: accountData.bank_id,
      payload: accountData
    });
  } catch (error) {
    console.error('Paystack account verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to verify account details' },
      { status: 500 }
    );
  }
}


