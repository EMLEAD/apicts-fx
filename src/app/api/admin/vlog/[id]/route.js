import { NextResponse } from 'next/server';
import { VlogPost } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';

export async function GET(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const post = await VlogPost.findByPk(params.id);

    if (!post) {
      return NextResponse.json({ error: 'Vlog post not found' }, { status: 404 });
    }

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    console.error('Error fetching vlog post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin', 'manager'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const post = await VlogPost.findByPk(params.id);
    if (!post) {
      return NextResponse.json({ error: 'Vlog post not found' }, { status: 404 });
    }

    const body = await request.json();
    const { accessType, planIds, ...otherFields } = body;

    // Validate accessType
    const validAccessTypes = ['all', 'subscribers_only', 'specific_plans'];
    const finalAccessType = validAccessTypes.includes(accessType) ? accessType : post.accessType || 'all';

    // Handle planIds based on accessType
    let finalPlanIds = post.planIds || [];
    if (finalAccessType === 'specific_plans' && Array.isArray(planIds)) {
      finalPlanIds = planIds;
    } else if (finalAccessType !== 'specific_plans') {
      finalPlanIds = [];
    }

    // Set requiresSubscription based on accessType for backward compatibility
    const requiresSubscription = finalAccessType !== 'all';

    await post.update({
      ...otherFields,
      accessType: finalAccessType,
      planIds: finalPlanIds,
      requiresSubscription
    });

    return NextResponse.json({ post }, { status: 200 });
  } catch (error) {
    console.error('Error updating vlog post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const post = await VlogPost.findByPk(params.id);
    if (!post) {
      return NextResponse.json({ error: 'Vlog post not found' }, { status: 404 });
    }

    await post.destroy();

    return NextResponse.json({ message: 'Vlog post deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting vlog post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

