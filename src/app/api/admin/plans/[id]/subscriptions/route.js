import { NextResponse } from 'next/server';
import { Plan, UserPlan, User } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';

export async function GET(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const plan = await Plan.findByPk(params.id, {
      attributes: ['id', 'name', 'status'],
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
      ],
      order: [[{ model: UserPlan, as: 'subscriptions' }, 'createdAt', 'DESC']]
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ plan }, { status: 200 });
  } catch (error) {
    console.error('Error fetching plan subscriptions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
