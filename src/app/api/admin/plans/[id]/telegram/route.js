import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';
import { Plan } from '@/lib/db/models';

export async function GET(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = params;
    const plan = await Plan.findByPk(id);
    
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({
      hasGroup: !!plan.telegramGroupId,
      group: plan.telegramGroupId ? {
        groupId: plan.telegramGroupId,
        groupName: plan.telegramGroupName,
        inviteLink: plan.telegramGroupInviteLink
      } : null
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

