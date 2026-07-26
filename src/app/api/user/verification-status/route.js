import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { checkNinVerification } from '@/lib/utils/ninVerification';

export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await checkNinVerification(auth.user.id);

    return NextResponse.json({
      verified: result.verified,
      status: result.reason || (result.verified ? 'verified' : 'unknown'),
      hasSubmitted: result.hasSubmitted,
    });
  } catch (error) {
    console.error('Verification status error:', error);
    return NextResponse.json({ error: 'Failed to check verification status' }, { status: 500 });
  }
}
