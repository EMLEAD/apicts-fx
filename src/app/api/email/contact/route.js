import { NextResponse } from 'next/server';
import emailService from '@/lib/email/service';
import { verifyConnection } from '@/lib/email/config';

// Test email connection
export async function GET() {
  try {
    const isConnected = await verifyConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Email service is connected and ready',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Email service connection failed',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Email service error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Send contact form email
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: name, email, and message are required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format'
      }, { status: 400 });
    }

    // Send contact email
    const result = await emailService.sendContactEmail({
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message
    });

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      data: result
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send contact form',
      error: error.message
    }, { status: 500 });
  }
}

