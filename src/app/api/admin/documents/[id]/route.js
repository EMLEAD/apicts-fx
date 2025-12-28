import { NextResponse } from 'next/server';
import { Document } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';

export async function GET(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const document = await Document.findByPk(id);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ document }, { status: 200 });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin', 'manager'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const document = await Document.findByPk(id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const body = await request.json();
    const { accessType, planIds, ...otherFields } = body;

    // Validate accessType
    const validAccessTypes = ['all', 'subscribers_only', 'specific_plans'];
    const finalAccessType = validAccessTypes.includes(accessType) ? accessType : document.accessType || 'all';

    // Handle planIds based on accessType
    let finalPlanIds = document.planIds || [];
    if (finalAccessType === 'specific_plans' && Array.isArray(planIds)) {
      finalPlanIds = planIds;
    } else if (finalAccessType !== 'specific_plans') {
      finalPlanIds = [];
    }

    // Set requiresSubscription based on accessType for backward compatibility
    const requiresSubscription = finalAccessType !== 'all';

    await document.update({
      ...otherFields,
      accessType: finalAccessType,
      planIds: finalPlanIds,
      requiresSubscription
    });

    return NextResponse.json({ document }, { status: 200 });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const document = await Document.findByPk(id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await document.destroy();

    return NextResponse.json({ message: 'Document deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
