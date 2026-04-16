import { NextResponse } from 'next/server';
import { User } from '@/lib/db/models';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      }, { status: 403 });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Incorrect password'
      }, { status: 401 });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate referral code if user doesn't have one
    if (!user.referralCode) {
      const { randomBytes } = require('crypto');
      let codeGenerated = false;
      let attempts = 0;
      
      while (!codeGenerated && attempts < 5) {
        const code = randomBytes(4).toString('hex').toUpperCase();
        const existing = await User.findOne({ where: { referralCode: code } });
        if (!existing) {
          await user.update({ referralCode: code });
          user.referralCode = code;
          codeGenerated = true;
        }
        attempts++;
      }
      
      if (!codeGenerated) {
        const fallbackCode = `${user.username}-${Date.now()}`.toUpperCase().slice(0, 16);
        await user.update({ referralCode: fallbackCode });
        user.referralCode = fallbackCode;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'apicts_super_secret_jwt_key_2024_secure_random_string_change_in_production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          walletBalance: user.walletBalance,
          currency: user.currency,
          referralCode: user.referralCode,
          referredBy: user.referredBy,
          createdAt: user.createdAt
        },
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Login failed',
      error: error.message
    }, { status: 500 });
  }
}

