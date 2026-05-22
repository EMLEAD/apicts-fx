import { NextResponse } from 'next/server';
import { AffiliateLink } from '@/lib/db/models';

export async function GET() {
  try {
    const affiliates = await AffiliateLink.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    return NextResponse.json({ success: true, affiliates }, { status: 200 });
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch affiliates' }, { status: 500 });
  }
}
