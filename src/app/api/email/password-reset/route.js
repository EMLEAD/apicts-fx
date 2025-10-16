import { NextResponse } from 'next/server';
import emailService from '@/lib/email/service';
import { auth } from '@/lib/auth/middleware';

// Send password reset email
export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail, userName, resetToken } = body;

    // Validate required fields
    if (!userEmail || !userName || !resetToken) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: userEmail, userName, and resetToken are required'
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

    // Send password reset email
    const result = await emailService.sendPasswordResetEmail(userEmail, userName, resetToken);

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully',
      data: result
    });

  } catch (error) {
    console.error('Password reset email error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send password reset email',
      error: error.message
    }, { status: 500 });
  }
}

