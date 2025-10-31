import { NextResponse } from 'next/server';
import { User } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';

export async function GET(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const user = await User.findByPk(params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const user = await User.findByPk(params.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'super_admin' && auth.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'You cannot modify a super admin account' }, { status: 403 });
    }

    const updates = {};

    if (Object.prototype.hasOwnProperty.call(body, 'isActive')) {
      updates.isActive = Boolean(body.isActive);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'role')) {
      const allowedRoles = ['super_admin', 'admin', 'manager', 'support', 'user'];
      if (!allowedRoles.includes(body.role)) {
        return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
      }

      if (auth.user.role !== 'super_admin') {
        return NextResponse.json({ error: 'Only super admins can change roles' }, { status: 403 });
      }

      if (user.id === auth.user.id && body.role !== user.role) {
        return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 });
      }

      updates.role = body.role;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
    }

    await user.update(updates);
    
    return NextResponse.json({ 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const user = await User.findByPk(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'super_admin') {
      return NextResponse.json({ error: 'Super admin accounts cannot be deleted' }, { status: 400 });
    }

    await user.destroy();

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

