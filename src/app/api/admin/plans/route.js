import { NextResponse } from 'next/server';
import { Plan, UserPlan } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';

const PLAN_STATUSES = ['draft', 'active', 'inactive'];

function normalizeFeatures(features) {
  if (!features) {
    return [];
  }

  if (Array.isArray(features)) {
    return features
      .map((feature) => (typeof feature === 'string' ? feature.trim() : ''))
      .filter(Boolean);
  }

  if (typeof features === 'string') {
    return features
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function parseDecimal(value, fallback = 0) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const decimal = Number(value);
  if (Number.isNaN(decimal)) {
    return null;
  }

  return decimal;
}

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const includeSubscriptions = searchParams.get('includeSubscriptions') === 'true';

    const query = {
      order: [
        ['displayOrder', 'ASC'],
        ['createdAt', 'DESC']
      ]
    };

    if (status && PLAN_STATUSES.includes(status)) {
      query.where = { status };
    }

    if (includeSubscriptions) {
      query.include = [
        {
          model: UserPlan,
          as: 'subscriptions',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email']
            }
          ]
        }
      ];
    }

    const plans = await Plan.findAll(query);

    return NextResponse.json({ plans }, { status: 200 });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      currency = 'NGN',
      features,
      status = 'draft',
      displayOrder = 0,
      metadata,
      referralCommissionRate = 0
    } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Plan name is required' }, { status: 400 });
    }

    const parsedPrice = parseDecimal(price, 0);
    if (parsedPrice === null || parsedPrice < 0) {
      return NextResponse.json({ error: 'Price must be a valid positive number' }, { status: 400 });
    }

    if (!PLAN_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid plan status provided' }, { status: 400 });
    }

    const normalizedFeatures = normalizeFeatures(features);

    const parsedCommission = parseDecimal(referralCommissionRate, 0);
    if (parsedCommission === null || parsedCommission < 0) {
      return NextResponse.json({ error: 'Referral commission must be a valid non-negative number' }, { status: 400 });
    }

    const plan = await Plan.create({
      name: name.trim(),
      description,
      price: parsedPrice,
      currency,
      features: normalizedFeatures,
      status,
      displayOrder: Number.isInteger(displayOrder) ? displayOrder : parseInt(displayOrder, 10) || 0,
      metadata: metadata || null,
      referralCommissionRate: parsedCommission
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
