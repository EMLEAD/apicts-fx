const TelegramBot = require('node-telegram-bot-api');

class TelegramService {
  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.warn('⚠️ Telegram Bot Token not configured');
      this.bot = null;
      this.tokenConfigured = false;
      return;
    }
    
    console.log('✅ Telegram Bot Token found, initializing bot...');
    this.bot = new TelegramBot(token, { polling: false });
    this.tokenConfigured = true;
  }

  /**
   * Validate bot has access to a Telegram group
   * @param {string} groupId - Telegram group ID
   * @returns {Promise<boolean>} True if bot has admin access
   */
  async validateGroupAccess(groupId) {
    if (!this.bot) {
      throw new Error('Telegram bot not configured. Please set TELEGRAM_BOT_TOKEN in your environment variables.');
    }

    try {
      // First, validate the bot token by getting bot info
      let botInfo;
      try {
        botInfo = await this.bot.getMe();
        console.log(`✅ Bot validated: @${botInfo.username} (ID: ${botInfo.id})`);
      } catch (botError) {
        console.error('❌ Failed to validate bot token:', botError.message);
        if (botError.response?.statusCode === 404 || botError.response?.statusCode === 401) {
          throw new Error('Invalid bot token. Please check your TELEGRAM_BOT_TOKEN in .env.local. Get a valid token from @BotFather on Telegram.');
        }
        throw new Error(`Bot token validation failed: ${botError.message}`);
      }

      // Now check if bot is in the group and has admin access
      let chatMember;
      try {
        chatMember = await this.bot.getChatMember(groupId, botInfo.id);
        console.log(`✅ Bot status in group ${groupId}: ${chatMember.status}`);
      } catch (groupError) {
        console.error('❌ Failed to get bot status in group:', groupError.message);
        if (groupError.response?.statusCode === 400) {
          throw new Error(`Invalid group ID: ${groupId}. Please check the group ID is correct (should start with - for groups).`);
        }
        if (groupError.response?.statusCode === 403) {
          throw new Error('Bot is not a member of this group. Please add the bot to the group first.');
        }
        throw new Error(`Failed to check group access: ${groupError.message}`);
      }
      
      // Bot must be an administrator or creator
      const isAdmin = chatMember.status === 'administrator' || chatMember.status === 'creator';
      
      if (!isAdmin) {
        const message = `Bot is a ${chatMember.status} in the group, but needs to be an administrator. Please promote the bot to admin.`;
        console.error('❌', message);
        throw new Error(message);
      }

      // Check if bot has necessary permissions
      if (chatMember.status === 'administrator') {
        const hasRequiredPerms = 
          chatMember.can_invite_users && 
          chatMember.can_restrict_members;
        
        if (!hasRequiredPerms) {
          const missing = [];
          if (!chatMember.can_invite_users) missing.push('Invite Users');
          if (!chatMember.can_restrict_members) missing.push('Restrict Members');
          const message = `Bot lacks required permissions: ${missing.join(', ')}. Please update bot admin permissions in group settings.`;
          console.error('❌', message);
          throw new Error(message);
        }
      }

      console.log('✅ Bot has valid admin access to the group');
      return true;
    } catch (error) {
      console.error('Error validating group access:', error);
      throw error;
    }
  }

  /**
   * Add user to a plan's Telegram group
   * @param {string} groupId - Telegram group ID
   * @param {number} telegramUserId - User's Telegram ID
   * @returns {Promise<Object>} Result object
   */
  async addUserToGroup(groupId, telegramUserId) {
    if (!this.bot) {
      throw new Error('Telegram bot not configured');
    }

    try {
      await this.bot.addChatMember(groupId, telegramUserId);
      return { success: true, message: 'User added to group' };
    } catch (error) {
      // Handle different error cases
      if (error.response?.body?.description?.includes('already a member')) {
        return { success: true, message: 'User already in group' };
      }
      if (error.response?.body?.description?.includes('user not found')) {
        throw new Error('User not found on Telegram. Please start the bot first.');
      }
      if (error.response?.body?.description?.includes('not enough rights')) {
        throw new Error('Bot does not have permission to add members. Check bot admin status.');
      }
      throw error;
    }
  }

  /**
   * Remove user from a plan's Telegram group
   * @param {string} groupId - Telegram group ID
   * @param {number} telegramUserId - User's Telegram ID
   * @returns {Promise<Object>} Result object
   */
  async removeUserFromGroup(groupId, telegramUserId) {
    if (!this.bot) {
      throw new Error('Telegram bot not configured');
    }

    try {
      // Ban user (removes from group)
      await this.bot.banChatMember(groupId, telegramUserId);
      
      // Immediately unban to allow re-joining if they resubscribe
      await this.bot.unbanChatMember(groupId, telegramUserId, { 
        only_if_banned: true 
      });
      
      return { success: true, message: 'User removed from group' };
    } catch (error) {
      console.error('Error removing user from group:', error);
      throw new Error(`Failed to remove user: ${error.message}`);
    }
  }

  /**
   * Send welcome message to user when added to group
   * @param {number} telegramUserId - User's Telegram ID
   * @param {string} planName - Name of the plan
   * @param {string} inviteLink - Group invite link
   */
  async sendWelcomeMessage(telegramUserId, planName, inviteLink) {
    if (!this.bot) {
      return;
    }

    const message = `🎉 Welcome to ${planName}!\n\n` +
      `You've been subscribed to the premium plan and added to our exclusive Telegram group.\n\n` +
      `Join the group: ${inviteLink}\n\n` +
      `If you have any questions, feel free to ask in the group!`;

    try {
      await this.bot.sendMessage(telegramUserId, message);
    } catch (error) {
      // User might not have started the bot - this is okay
      console.log(`Could not send welcome message to ${telegramUserId}: ${error.message}`);
    }
  }

  /**
   * Check if bot is admin of a group
   * @param {string} groupId - Telegram group ID
   * @returns {Promise<boolean>}
   */
  async isBotAdmin(groupId) {
    if (!this.bot) {
      return false;
    }

    try {
      const botInfo = await this.bot.getMe();
      const chatMember = await this.bot.getChatMember(groupId, botInfo.id);
      return chatMember.status === 'administrator' || chatMember.status === 'creator';
    } catch (error) {
      return false;
    }
  }
}

module.exports = new TelegramService();

