import { NextResponse } from 'next/server';
import { Plan, UserPlan, User } from '@/lib/db/models';
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

export async function GET(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const plan = await Plan.findByPk(params.id, {
      include: [
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
      ]
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ plan }, { status: 200 });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const plan = await Plan.findByPk(params.id);
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates = {};

    if (body.name) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return NextResponse.json({ error: 'Plan name must be a non-empty string' }, { status: 400 });
      }
      updates.name = body.name.trim();
    }

    if (body.description !== undefined) {
      updates.description = body.description;
    }

    if (body.price !== undefined) {
      const parsedPrice = parseDecimal(body.price, 0);
      if (parsedPrice === null || parsedPrice < 0) {
        return NextResponse.json({ error: 'Price must be a valid positive number' }, { status: 400 });
      }
      updates.price = parsedPrice;
    }

    if (body.currency !== undefined) {
      updates.currency = body.currency;
    }

    if (body.features !== undefined) {
      updates.features = normalizeFeatures(body.features);
    }

    if (body.status !== undefined) {
      if (!PLAN_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid plan status provided' }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (body.displayOrder !== undefined) {
      updates.displayOrder = Number.isInteger(body.displayOrder)
        ? body.displayOrder
        : parseInt(body.displayOrder, 10) || 0;
    }

    if (body.referralCommissionRate !== undefined) {
      const parsedCommission = parseDecimal(body.referralCommissionRate, 0);
      if (parsedCommission === null || parsedCommission < 0) {
        return NextResponse.json({ error: 'Referral commission must be a valid non-negative number' }, { status: 400 });
      }
      updates.referralCommissionRate = parsedCommission;
    }

    if (body.metadata !== undefined) {
      updates.metadata = body.metadata;
    }

    await plan.update(updates);

    const refreshedPlan = await Plan.findByPk(params.id, {
      include: [
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
      ]
    });

    return NextResponse.json({ plan: refreshedPlan }, { status: 200 });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const plan = await Plan.findByPk(params.id);
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    await plan.destroy();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
