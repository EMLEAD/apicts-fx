import { NextResponse } from 'next/server';
import { Coupon, CouponRedemption } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';

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

export async function GET(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const coupon = await Coupon.findByPk(params.id, {
      include: [
        {
          model: CouponRedemption,
          as: 'redemptions'
        }
      ]
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ coupon }, { status: 200 });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const coupon = await Coupon.findByPk(params.id);
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates = {};

    if (body.code !== undefined) {
      if (!body.code) {
        return NextResponse.json({ error: 'Coupon code cannot be empty' }, { status: 400 });
      }
      updates.code = normalizeCode(body.code);
    }

    if (body.type !== undefined) {
      if (!COUPON_TYPES.includes(body.type)) {
        return NextResponse.json({ error: 'Invalid coupon type provided' }, { status: 400 });
      }
      updates.type = body.type;
    }

    if (body.value !== undefined) {
      const parsedValue = parseDecimal(body.value, 0);
      if (parsedValue === null || parsedValue < 0) {
        return NextResponse.json({ error: 'Coupon value must be a valid non-negative number' }, { status: 400 });
      }
      updates.value = parsedValue;
    }

    if (body.maxRedemptions !== undefined) {
      updates.maxRedemptions = body.maxRedemptions !== null ? Number(body.maxRedemptions) : null;
    }

    if (body.minPurchaseAmount !== undefined) {
      const parsedMinPurchase = parseDecimal(body.minPurchaseAmount, null);
      if (body.minPurchaseAmount !== null && parsedMinPurchase === null) {
        return NextResponse.json({ error: 'Minimum purchase amount must be a valid number' }, { status: 400 });
      }
      updates.minPurchaseAmount = parsedMinPurchase;
    }

    if (body.currency !== undefined) {
      updates.currency = body.currency;
    }

    if (body.status !== undefined) {
      if (!COUPON_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid coupon status provided' }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (body.startsAt !== undefined) {
      updates.startsAt = body.startsAt ? new Date(body.startsAt) : null;
    }

    if (body.endsAt !== undefined) {
      updates.endsAt = body.endsAt ? new Date(body.endsAt) : null;
    }

    if (body.isStackable !== undefined) {
      updates.isStackable = Boolean(body.isStackable);
    }

    if (body.metadata !== undefined) {
      updates.metadata = body.metadata;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
    }

    await coupon.update(updates);

    const refreshedCoupon = await Coupon.findByPk(params.id, {
      include: [
        {
          model: CouponRedemption,
          as: 'redemptions'
        }
      ]
    });

    return NextResponse.json({ coupon: refreshedCoupon }, { status: 200 });
  } catch (error) {
    console.error('Error updating coupon:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const coupon = await Coupon.findByPk(params.id);
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    await coupon.destroy();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
