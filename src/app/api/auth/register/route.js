import { NextResponse } from 'next/server';
import { User } from '@/lib/db/models';
import jwt from 'jsonwebtoken';
import emailService from '@/lib/email/service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password, confirmPassword, referralCode } = body;

    // Validate required fields
    if (!username || !email || !password || !confirmPassword) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: username, email, password, and confirmPassword are required'
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

    // Validate username length
    if (username.length < 3) {
      return NextResponse.json({
        success: false,
        message: 'Username must be at least 3 characters long'
      }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    // Check if user already exists (by email or username)
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return NextResponse.json({
        success: false,
        message: 'User with this email already exists'
      }, { status: 409 });
    }

    const existingUserByUsername = await User.findOne({ where: { username } });
    if (existingUserByUsername) {
      return NextResponse.json({
        success: false,
        message: 'Username is already taken'
      }, { status: 409 });
    }

    // Create new user
    let referrerId = null;

    if (referralCode) {
      const normalizedCode = referralCode.trim().toUpperCase();
      const referrer = await User.findOne({ where: { referralCode: normalizedCode } });
      if (!referrer) {
        return NextResponse.json({
          success: false,
          message: 'Invalid referral code provided'
        }, { status: 400 });
      }
      referrerId = referrer.id;
    }

    const user = await User.create({
      username,
      email,
      password,
      role: 'user',
      isActive: true,
      referredBy: referrerId
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
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
        user.username
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
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          referralCode: user.referralCode,
          referredBy: user.referredBy,
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
      const field = error.errors[0].path;
      const message = field === 'username' ? 'Username is already taken' : 'User with this email already exists';
      return NextResponse.json({
        success: false,
        message: message
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to create account',
      error: error.message
    }, { status: 500 });
  }
}