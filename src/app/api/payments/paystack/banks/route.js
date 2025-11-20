import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { fetchBanks } from '@/lib/paystack/client';

let cachedBanks = null;
let cachedAt = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';
    const currency = searchParams.get('currency') || 'NGN';
    const type = searchParams.get('type') || 'nuban';
    const perPageParam = searchParams.get('perPage');
    const perPage = perPageParam ? Number(perPageParam) : 200;

    if (!refresh && cachedBanks && Date.now() - cachedAt < CACHE_DURATION_MS) {
      return NextResponse.json({
        success: true,
        banks: cachedBanks,
        cached: true,
        fetchedAt: cachedAt
      });
    }

    const response = await fetchBanks({ currency, type, perPage });
    const banks = response?.data || [];

    cachedBanks = banks;
    cachedAt = Date.now();

    return NextResponse.json({
      success: true,
      banks,
      cached: false,
      fetchedAt: cachedAt
    });
  } catch (error) {
    console.error('Paystack banks fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Unable to fetch bank list' },
      { status: 500 }
    );
  }
}





