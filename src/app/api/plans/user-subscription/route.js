import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { UserPlan, Plan } from '@/lib/db/models';

export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const userPlan = await UserPlan.findOne({
      where: {
        userId: auth.user.id,
        status: 'active'
      },
      order: [['startedAt', 'DESC']]
    });

    if (!userPlan) {
      return NextResponse.json({
        success: true,
        subscription: null,
        message: 'No active subscription found'
      }, { status: 200 });
    }

    const plan = await Plan.findByPk(userPlan.planId);

    return NextResponse.json({
      success: true,
      subscription: {
        id: userPlan.id,
        userId: userPlan.userId,
        planId: userPlan.planId,
        status: userPlan.status,
        startedAt: userPlan.startedAt,
        expiresAt: userPlan.expiresAt,
        cancelledAt: userPlan.cancelledAt,
        metadata: userPlan.metadata || {},
        plan: plan ? {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price: Number(plan.price) || 0,
          currency: plan.currency || 'NGN',
          features: plan.features || [],
          status: plan.status
        } : null
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

