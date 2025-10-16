import { NextResponse } from 'next/server';
import { User } from '@/lib/db/models';
import jwt from 'jsonwebtoken';
import emailService from '@/lib/email/service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, confirmPassword, phone } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: firstName, lastName, email, password, and confirmPassword are required'
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

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json({
        success: false,
        message: 'Passwords do not match'
      }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User with this email already exists'
      }, { status: 409 });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone: phone || null,
      role: 'user',
      isActive: true
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(
        user.email, 
        `${user.firstName} ${user.lastName}`
      );
      console.log(`✅ Welcome email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError.message);
      // Don't fail registration if email fails
    }

    // Return success response with token
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      }, { status: 400 });
    }

    // Handle Sequelize unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({
        success: false,
        message: 'User with this email already exists'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to create account',
      error: error.message
    }, { status: 500 });
  }
}