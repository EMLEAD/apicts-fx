import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';
import { Transaction, User, UserPlan } from '@/lib/db/models';

export async function PATCH(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, rejectionReason } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action must be "approve" or "reject"' }, { status: 400 });
    }

    const transaction = await Transaction.findByPk(id, {
      include: [{ association: 'user', attributes: ['id', 'walletBalance'] }]
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status !== 'pending') {
      return NextResponse.json({ error: 'Transaction is not pending' }, { status: 400 });
    }

    const meta = transaction.metadata || {};

    if (action === 'reject') {
      await transaction.update({
        status: 'cancelled',
        metadata: { ...meta, rejectionReason: rejectionReason || 'Rejected by admin' }
      });

      return NextResponse.json({
        success: true,
        message: 'Transaction rejected',
        transaction
      });
    }

    // Approve logic
    if (meta.purpose === 'wallet_funding' || meta.purpose === 'plan_payment' || meta.purpose === 'product_purchase') {
      // Credit wallet for all purposes
      const dbUser = await User.findByPk(transaction.userId);
      if (!dbUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      await Transaction.sequelize.transaction(async (t) => {
        dbUser.walletBalance = Number(dbUser.walletBalance || 0) + Number(transaction.amount);
        await dbUser.save({ transaction: t });

        await transaction.update({
          status: 'completed',
          processedAt: new Date(),
          metadata: { ...meta, approvedBy: auth.user.id }
        }, { transaction: t });

        // For plan payment, also activate the plan
        if (meta.purpose === 'plan_payment' && meta.planId) {
          const existingPlan = await UserPlan.findOne({
            where: { userId: transaction.userId, planId: meta.planId, status: 'active' },
            transaction: t
          });

          if (!existingPlan) {
            const startedAt = new Date();
            const endsAt = new Date(startedAt);
            endsAt.setMonth(endsAt.getMonth() + 1);

            await UserPlan.create({
              userId: transaction.userId,
              planId: meta.planId,
              status: 'active',
              startedAt,
              endsAt
            }, { transaction: t });
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Transaction approved and wallet credited',
        transaction: { ...transaction.toJSON(), status: 'completed' }
      });
    }

    // Fallback: just mark as completed
    await transaction.update({
      status: 'completed',
      processedAt: new Date(),
      metadata: { ...meta, approvedBy: auth.user.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction approved',
      transaction
    });

  } catch (error) {
    console.error('Process direct transfer error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process transfer' },
      { status: 500 }
    );
  }
}
