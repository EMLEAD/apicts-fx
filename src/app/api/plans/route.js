import { NextResponse } from 'next/server';
import { Plan } from '@/lib/db/models';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where = {};
    
    if (!includeInactive) {
      where.status = status;
    }

    const plans = await Plan.findAll({
      where,
      order: [['displayOrder', 'ASC'], ['createdAt', 'ASC']]
    });

    return NextResponse.json(
      {
        success: true,
        plans: plans.map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price: Number(plan.price) || 0,
          currency: plan.currency || 'NGN',
          features: plan.features || [],
          status: plan.status,
          displayOrder: plan.displayOrder,
          metadata: plan.metadata || {},
          referralCommissionRate: Number(plan.referralCommissionRate) || 0,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt
        }))
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

