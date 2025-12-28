import { NextResponse } from 'next/server';
import { removeExpiredUsersFromGroups } from '@/lib/telegram/cron';

export async function GET(request) {
  try {
    // Optional: Add authentication/secret key check
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;
    
    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await removeExpiredUsersFromGroups();
    
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

