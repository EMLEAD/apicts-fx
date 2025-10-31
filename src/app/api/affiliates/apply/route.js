import { NextResponse } from 'next/server';
import { AffiliateApplication } from '@/lib/db/models';
import { verifyToken } from '@/lib/utils/jwt';

const deriveUserIdFromRequest = (request) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  return decoded?.userId || null;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      companyName,
      website,
      audienceDescription,
      audienceSize,
      trafficSources
    } = body;

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Full name and email are required' }, { status: 400 });
    }

    const userId = deriveUserIdFromRequest(request);

    const application = await AffiliateApplication.create({
      userId,
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      phone,
      companyName,
      website,
      audienceDescription,
      audienceSize,
      trafficSources,
      status: 'pending'
    });

    return NextResponse.json({
      success: true,
      application
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting affiliate application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const userId = deriveUserIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get('email');

    if (!userId && !emailParam) {
      return NextResponse.json({ error: 'Authentication token or email is required' }, { status: 401 });
    }

    const where = {};
    if (userId) {
      where.userId = userId;
    }
    if (emailParam) {
      where.email = emailParam.toLowerCase();
    }

    const applications = await AffiliateApplication.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 25
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching affiliate applications for user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

