import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';
import telegramService from '@/lib/telegram/service';

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    // Check if bot is configured
    if (!telegramService.bot) {
      return NextResponse.json({
        configured: false,
        error: 'Telegram bot not configured. Please add TELEGRAM_BOT_TOKEN to .env.local and restart the server.'
      }, { status: 200 });
    }

    try {
      // Test bot connection by getting bot info
      const botInfo = await telegramService.bot.getMe();
      
      return NextResponse.json({
        configured: true,
        bot: {
          id: botInfo.id,
          username: botInfo.username,
          firstName: botInfo.first_name,
          isBot: botInfo.is_bot
        },
        message: 'Telegram bot is configured and connected successfully!'
      }, { status: 200 });
    } catch (error) {
      return NextResponse.json({
        configured: false,
        error: `Bot connection failed: ${error.message}`,
        details: 'The bot token may be invalid or the bot may not exist.'
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error testing Telegram:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

