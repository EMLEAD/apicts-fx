import { NextResponse } from 'next/server';
import { VlogPost, User } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const posts = await VlogPost.findAll({
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching vlog posts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin', 'manager'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { accessType, planIds, ...otherFields } = body;

    // Validate accessType
    const validAccessTypes = ['all', 'subscribers_only', 'specific_plans'];
    const finalAccessType = validAccessTypes.includes(accessType) ? accessType : 'all';

    // Handle planIds based on accessType
    let finalPlanIds = [];
    if (finalAccessType === 'specific_plans' && Array.isArray(planIds)) {
      finalPlanIds = planIds;
    }

    // Set requiresSubscription based on accessType for backward compatibility
    const requiresSubscription = finalAccessType !== 'all';

    const post = await VlogPost.create({
      ...otherFields,
      authorId: auth.user.id,
      accessType: finalAccessType,
      planIds: finalPlanIds,
      requiresSubscription
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating vlog post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

