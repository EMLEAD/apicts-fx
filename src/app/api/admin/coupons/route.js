import { NextResponse } from 'next/server';
import { Coupon, CouponRedemption } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';
import { Op } from 'sequelize';

const COUPON_STATUSES = ['draft', 'active', 'inactive', 'expired'];
const COUPON_TYPES = ['percentage', 'fixed', 'free_trial'];

function parseDecimal(value, fallback = 0) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return null;
  }

  return numeric;
}

function normalizeCode(code) {
  return code ? code.trim().toUpperCase() : code;
}

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const includeRedemptions = searchParams.get('includeRedemptions') === 'true';

    const where = {};

    if (status && COUPON_STATUSES.includes(status)) {
      where.status = status;
    }

    if (type && COUPON_TYPES.includes(type)) {
      where.type = type;
    }

    if (search) {
      where[Op.or] = [
        { code: { [Op.like]: `%${search.toUpperCase()}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const query = {
      where,
      order: [
        ['status', 'ASC'],
        ['createdAt', 'DESC']
      ]
    };

    if (includeRedemptions) {
      query.include = [
        {
          model: CouponRedemption,
          as: 'redemptions'
        }
      ];
    }

    const coupons = await Coupon.findAll(query);

    return NextResponse.json({ coupons }, { status: 200 });
  } catch (error) {
    console.error('Error fetching coupons:', error);
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
      code,
      type = 'percentage',
      value = 0,
      maxRedemptions = null,
      minPurchaseAmount = null,
      currency = 'NGN',
      status = 'draft',
      startsAt = null,
      endsAt = null,
      isStackable = false,
      metadata = null
    } = body;

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    if (!COUPON_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid coupon type provided' }, { status: 400 });
    }

    if (!COUPON_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid coupon status provided' }, { status: 400 });
    }

    const parsedValue = parseDecimal(value, 0);
    if (parsedValue === null || parsedValue < 0) {
      return NextResponse.json({ error: 'Coupon value must be a valid non-negative number' }, { status: 400 });
    }

    const parsedMinPurchase = parseDecimal(minPurchaseAmount, null);
    if (minPurchaseAmount !== null && parsedMinPurchase === null) {
      return NextResponse.json({ error: 'Minimum purchase amount must be a valid number' }, { status: 400 });
    }

    const coupon = await Coupon.create({
      code: normalizeCode(code),
      type,
      value: parsedValue,
      maxRedemptions: maxRedemptions !== null ? Number(maxRedemptions) : null,
      minPurchaseAmount: parsedMinPurchase,
      currency,
      status,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      isStackable: Boolean(isStackable),
      metadata,
      createdBy: auth.user.id
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
