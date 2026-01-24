import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await auth.user.update({
      telegramUserId: null,
      telegramUsername: null
    });

    return NextResponse.json({
      success: true,
      message: 'Telegram account unlinked successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error unlinking Telegram account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unlink Telegram account' },
      { status: 500 }
    );
  }
}
