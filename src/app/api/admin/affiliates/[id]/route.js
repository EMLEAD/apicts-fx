import { NextResponse } from 'next/server';
import { AffiliateApplication, User } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';

export async function GET(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const application = await AffiliateApplication.findByPk(params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'role']
        }
      ]
    });

    if (!application) {
      return NextResponse.json({ error: 'Affiliate application not found' }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching affiliate application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin', 'manager'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const application = await AffiliateApplication.findByPk(params.id);
    if (!application) {
      return NextResponse.json({ error: 'Affiliate application not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates = {};

    if (body.fullName !== undefined) updates.fullName = body.fullName;
    if (body.email !== undefined) updates.email = body.email;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.companyName !== undefined) updates.companyName = body.companyName;
    if (body.website !== undefined) updates.website = body.website;
    if (body.audienceDescription !== undefined) updates.audienceDescription = body.audienceDescription;
    if (body.audienceSize !== undefined) updates.audienceSize = body.audienceSize;
    if (body.trafficSources !== undefined) updates.trafficSources = body.trafficSources;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.metadata !== undefined) updates.metadata = body.metadata;

    if (body.status !== undefined) {
      const allowedStatus = ['pending', 'approved', 'rejected'];
      if (!allowedStatus.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
      updates.status = body.status;
      updates.reviewedBy = auth.user.id;
      updates.reviewedAt = body.status === 'pending' ? null : new Date();
    }

    await application.update(updates);

    const refreshed = await AffiliateApplication.findByPk(params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email', 'role'] }]
    });

    return NextResponse.json({ application: refreshed });
  } catch (error) {
    console.error('Error updating affiliate application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const application = await AffiliateApplication.findByPk(params.id);
    if (!application) {
      return NextResponse.json({ error: 'Affiliate application not found' }, { status: 404 });
    }

    await application.destroy();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting affiliate application:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



