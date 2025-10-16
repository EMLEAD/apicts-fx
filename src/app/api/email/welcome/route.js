import { NextResponse } from 'next/server';
import emailService from '@/lib/email/service';
import { auth } from '@/lib/auth/middleware';

// Send welcome email
export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail, userName } = body;

    // Validate required fields
    if (!userEmail || !userName) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: userEmail and userName are required'
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

    // Send welcome email
    const result = await emailService.sendWelcomeEmail(userEmail, userName);

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      data: result
    });

  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send welcome email',
      error: error.message
    }, { status: 500 });
  }
}

