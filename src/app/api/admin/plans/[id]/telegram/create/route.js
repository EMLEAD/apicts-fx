import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';
import { Plan } from '@/lib/db/models';
import telegramService from '@/lib/telegram/service';

export async function POST(request, { params }) {
  try {
    const auth = await authenticateAdmin(request, { 
      allowRoles: ['super_admin', 'admin'] 
    });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const plan = await Plan.findByPk(id);
    
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check if group already exists
    if (plan.telegramGroupId) {
      return NextResponse.json(
        { 
          error: 'Plan already has a Telegram group',
          group: {
            groupId: plan.telegramGroupId,
            groupName: plan.telegramGroupName,
            inviteLink: plan.telegramGroupInviteLink
          }
        },
        { status: 400 }
      );
    }

    // Get group details from request body
    let body = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (error) {
      // Empty body or invalid JSON
    }
    
    const { groupId, groupName, inviteLink } = body;

    if (!groupId || !inviteLink) {
      return NextResponse.json(
        { 
          error: 'groupId and inviteLink are required',
          message: 'Please create a Telegram group manually, add the bot as admin, then provide the group details.',
          requiredFields: {
            groupId: 'The Telegram group ID (e.g., -1001234567890)',
            inviteLink: 'The permanent invite link to the group',
            groupName: 'Optional: Name of the group'
          }
        },
        { status: 400 }
      );
    }

    // Validate bot has access to the group
    try {
      await telegramService.validateGroupAccess(groupId);
    } catch (validationError) {
      return NextResponse.json(
        { error: validationError.message },
        { status: 400 }
      );
    }
    
    // Save to database
    await plan.update({
      telegramGroupId: groupId,
      telegramGroupName: groupName || `${plan.name} Group`,
      telegramGroupInviteLink: inviteLink,
      hasTelegramGroup: true
    });

    return NextResponse.json({
      success: true,
      message: 'Telegram group linked successfully',
      group: {
        groupId,
        groupName: groupName || `${plan.name} Group`,
        inviteLink
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error creating Telegram group:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Telegram group' },
      { status: 500 }
    );
  }
}

