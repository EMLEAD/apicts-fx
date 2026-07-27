import { NextResponse } from 'next/server';
import { Notification } from '@/lib/db/models';
import { Op } from 'sequelize';

export async function GET() {
  try {
    const now = new Date();

    const notifications = await Notification.findAll({
      where: {
        isActive: true,
        [Op.and]: [
          {
            [Op.or]: [
              { startsAt: null },
              { startsAt: { [Op.lte]: now } }
            ]
          },
          {
            [Op.or]: [
              { endsAt: null },
              { endsAt: { [Op.gte]: now } }
            ]
          }
        ]
      },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'title', 'message', 'imageUrl', 'type', 'targetUrl', 'createdAt']
    });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
