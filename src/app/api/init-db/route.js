import { NextResponse } from 'next/server';
const { initializeDatabase } = require('@/lib/db/init');

export async function GET(request) {
  try {
    const success = await initializeDatabase();
    
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Database initialization failed',
          message: 'Please check console logs and verify your .env.local configuration'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Database initialized successfully',
        status: 'connected',
        tables: ['users', 'contacts', 'plans', 'user_plans', 'coupons', 'coupon_redemptions', 'referrals', 'affiliate_applications', 'transactions', 'exchange_rates']
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Database initialization failed', details: error.message },
      { status: 500 }
    );
  }
}

