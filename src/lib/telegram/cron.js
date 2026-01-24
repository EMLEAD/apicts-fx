const { UserPlan, Plan, User } = require('../db/models');
const telegramService = require('./service');
const { Op } = require('sequelize');

/**
 * Check and remove users from Telegram groups when subscription expires
 * This should be run periodically (e.g., every hour)
 */
async function removeExpiredUsersFromGroups() {
  try {
    const now = new Date();
    
    // Find expired subscriptions that are still marked as active
    const expiredSubscriptions = await UserPlan.findAll({
      where: {
        status: 'active',
        expiresAt: {
          [Op.lt]: now
        }
      },
      include: [
        {
          model: Plan,
          as: 'plan',
          where: {
            telegramGroupId: { [Op.ne]: null }
          },
          required: true
        },
        {
          model: User,
          as: 'user',
          where: {
            telegramUserId: { [Op.ne]: null }
          },
          required: true
        }
      ]
    });

    const results = {
      processed: 0,
      success: 0,
      errors: 0,
      details: []
    };

    for (const subscription of expiredSubscriptions) {
      try {
        // Remove user from Telegram group
        await telegramService.removeUserFromGroup(
          subscription.plan.telegramGroupId,
          parseInt(subscription.user.telegramUserId)
        );

        // Update subscription status
        await subscription.update({ status: 'expired' });

        results.success++;
        results.processed++;
        results.details.push({
          subscriptionId: subscription.id,
          userId: subscription.user.id,
          planName: subscription.plan.name,
          status: 'removed'
        });

        console.log(`✅ Removed user ${subscription.user.username} from ${subscription.plan.name} group`);
      } catch (error) {
        results.errors++;
        results.processed++;
        results.details.push({
          subscriptionId: subscription.id,
          userId: subscription.user.id,
          planName: subscription.plan.name,
          status: 'error',
          error: error.message
        });
        console.error(`❌ Error processing subscription ${subscription.id}:`, error);
      }
    }

    return results;
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
    throw error;
  }
}

module.exports = { removeExpiredUsersFromGroups };

