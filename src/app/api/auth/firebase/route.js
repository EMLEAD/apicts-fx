import { NextResponse } from 'next/server';
import { User } from '@/lib/db/models';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const body = await request.json();
    const { firebaseToken, userData } = body;

    // Verify Firebase token (you might want to verify this on the server side)
    // For now, we'll trust the client-side verification
    
    if (!userData || !userData.uid || !userData.email) {
      return NextResponse.json({
        success: false,
        message: 'Invalid user data from Firebase'
      }, { status: 400 });
    }

    // Check if user exists in our database
    let user = await User.findOne({ where: { email: userData.email } });

    if (!user) {
      // Create new user from Firebase data
      user = await User.create({
        username: userData.displayName || userData.email.split('@')[0],
        email: userData.email,
        password: 'firebase_auth', // Dummy password for Firebase users
        role: 'user',
        isActive: true,
        // You might want to add Firebase-specific fields
        firebaseUid: userData.uid,
        profilePicture: userData.photoURL || null
      });
    } else {
      // Update existing user with Firebase UID if not set
      if (!user.firebaseUid) {
        await user.update({
          firebaseUid: userData.uid,
          profilePicture: userData.photoURL || user.profilePicture
        });
      }
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate JWT token for our API
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email, 
        role: user.role,
        firebaseUid: userData.uid
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Firebase authentication successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          profilePicture: user.profilePicture,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        firebaseToken
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Firebase Auth Error:', error);
    
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
      message: 'Firebase authentication failed',
      error: error.message
    }, { status: 500 });
  }
}
