import { NextResponse } from 'next/server';
import { User } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';
import emailService from '@/lib/email/service';

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      username,
      email,
      password,
      role = 'admin',
      isActive = true
    } = body;

    if (!username || username.trim().length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters long' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const allowedRoles = ['super_admin', 'admin', 'manager', 'support'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }

    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase(),
      password,
      role,
      isActive: Boolean(isActive)
    });

    try {
      await emailService.sendAdminInviteEmail(
        user.email,
        user.username,
        password,
        auth.user.username || 'APICTS Admin',
        role
      );
    } catch (emailError) {
      console.error('Failed to send admin invite email:', emailError.message);
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

