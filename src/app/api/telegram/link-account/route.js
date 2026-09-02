import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { User } from '@/lib/db/models';
import { Op } from 'sequelize';

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { telegramUserId, telegramUsername } = body;

    if (!telegramUserId) {
      return NextResponse.json(
        { error: 'Telegram user ID is required' },
        { status: 400 }
      );
    }

    // Check if Telegram ID is already linked to another account
    const existingUser = await User.findOne({
      where: {
        telegramUserId: telegramUserId.toString(),
        id: { [Op.ne]: auth.user.id }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'This Telegram account is already linked to another account' },
        { status: 400 }
      );
    }

    const alreadyLinked = Boolean(auth.user.telegramUserId);

    await auth.user.update({
      telegramUserId: telegramUserId.toString(),
      telegramUsername: telegramUsername || null
    });

    return NextResponse.json({
      success: true,
      alreadyLinked,
      updated: alreadyLinked,
      user: auth.user,
      message: alreadyLinked ? 'Telegram account updated successfully' : 'Telegram account linked successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error linking Telegram account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to link Telegram account' },
      { status: 500 }
    );
  }
}

