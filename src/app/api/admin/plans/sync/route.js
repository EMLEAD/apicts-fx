import { NextResponse } from 'next/server';
import { Plan, UserPlan } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';

export async function POST(request) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await Plan.sync({ alter: true });
    await UserPlan.sync({ alter: true });

    return NextResponse.json({ success: true, message: 'Plan tables synchronized' }, { status: 200 });
  } catch (error) {
    console.error('Error synchronizing plan tables:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
