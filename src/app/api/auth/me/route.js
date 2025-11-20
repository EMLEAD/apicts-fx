import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';

const normalizeUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    walletBalance: Number(user.walletBalance ?? 0),
    currency: user.currency || 'NGN',
    referralCode: user.referralCode,
    referredBy: user.referredBy,
    lastLogin: user.lastLogin,
    profilePicture: user.profilePicture,
    firebaseUid: user.firebaseUid,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

export async function GET(request) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = normalizeUser(auth.user?.toJSON ? auth.user.toJSON() : auth.user);

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error('Auth profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}





