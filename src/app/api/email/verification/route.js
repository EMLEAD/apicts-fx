import { NextResponse } from 'next/server';
import emailService from '@/lib/email/service';
import { auth } from '@/lib/middleware/auth';

// Send verification email
export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail, userName, verificationToken } = body;

    // Validate required fields
    if (!userEmail || !userName || !verificationToken) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: userEmail, userName, and verificationToken are required'
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

    // Send verification email
    const result = await emailService.sendVerificationEmail(userEmail, userName, verificationToken);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      data: result
    });

  } catch (error) {
    console.error('Verification email error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send verification email',
      error: error.message
    }, { status: 500 });
  }
}

