import { NextResponse } from 'next/server';
import emailService from '@/lib/email/service';
import { auth } from '@/lib/middleware/auth';

// Send transaction notification email
export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail, userName, transactionData } = body;

    // Validate required fields
    if (!userEmail || !userName || !transactionData) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: userEmail, userName, and transactionData are required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format'
      }, { status: 400 });
    }

    // Validate transaction data
    const requiredTransactionFields = ['transactionId', 'type', 'amount', 'fromCurrency', 'toCurrency', 'exchangeRate', 'fee', 'status'];
    const missingFields = requiredTransactionFields.filter(field => !transactionData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Missing transaction fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Send transaction notification email
    const result = await emailService.sendTransactionNotification(userEmail, userName, transactionData);

    return NextResponse.json({
      success: true,
      message: 'Transaction notification sent successfully',
      data: result
    });

  } catch (error) {
    console.error('Transaction notification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send transaction notification',
      error: error.message
    }, { status: 500 });
  }
}

