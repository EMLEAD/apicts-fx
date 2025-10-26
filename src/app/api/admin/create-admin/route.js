import { NextResponse } from 'next/server';
import { User, sequelize } from '@/lib/db/models';
import { Op } from 'sequelize';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Username, email, and password are required'
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

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User already exists with this email or username',
        isAdmin: existingUser.role === 'admin'
      }, { status: 409 });
    }

    // Create admin user
    const adminUser = await User.create({
      username,
      email,
      password,
      role: 'admin',
      isActive: true
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive,
        createdAt: adminUser.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating admin user:', error);
    
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
        message: 'User with this email or username already exists'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message
    }, { status: 500 });
  }
}

