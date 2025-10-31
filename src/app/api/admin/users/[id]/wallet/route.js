import { NextResponse } from 'next/server';
import { User } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';

// Update wallet balance
export async function PATCH(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin', 'manager'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { amount, action } = body; // action: 'add', 'subtract', 'set'

    const user = await User.findByPk(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'super_admin' && auth.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'You cannot modify a super admin wallet' }, { status: 403 });
    }

    let newBalance = parseFloat(user.walletBalance || 0);
    
    switch (action) {
      case 'add':
        newBalance = newBalance + parseFloat(amount);
        break;
      case 'subtract':
        newBalance = Math.max(0, newBalance - parseFloat(amount));
        break;
      case 'set':
        newBalance = parseFloat(amount);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await user.update({ walletBalance: newBalance });

    return NextResponse.json({ 
      success: true,
      user: {
        ...user.toJSON(),
        walletBalance: newBalance
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating wallet:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get wallet balance
export async function GET(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin', 'manager'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const user = await User.findByPk(params.id, {
      attributes: ['id', 'username', 'email', 'walletBalance', 'currency']
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'super_admin' && auth.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'You cannot view this wallet' }, { status: 403 });
    }

    return NextResponse.json({ 
      wallet: {
        balance: parseFloat(user.walletBalance || 0),
        currency: user.currency || 'NGN'
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

