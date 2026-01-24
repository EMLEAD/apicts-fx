# 📱 Telegram Groups for Subscription Plans - Setup Guide

## Overview

This feature allows each subscription plan to have its own dedicated Telegram group. Users are automatically added when they subscribe and removed when their subscription expires.

## ✅ Implementation Complete

All components have been implemented:

1. ✅ Database models updated (Plan & User)
2. ✅ Telegram service layer created
3. ✅ Admin API endpoints for creating groups
4. ✅ User API endpoint for linking Telegram accounts
5. ✅ Integration with subscription flow
6. ✅ Cron job for removing expired users
7. ✅ Admin UI updated with Telegram group management
8. ✅ Environment variables documented

---

## 🔧 Setup Instructions

### Step 1: Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the prompts to name your bot
4. Copy the bot token you receive
5. **Important**: Make sure to start the bot by sending `/start` to it

### Step 2: Configure Environment Variables

Add to your `.env.local` file:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
CRON_SECRET=your_random_secret_key_here
```

**Example:**
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
CRON_SECRET=my_super_secret_cron_key_2024
```

### Step 3: Update Database

The database models have been updated. Run:

```bash
npm run db:check
```

This will sync the new fields:
- `plans` table: `telegramGroupId`, `telegramGroupInviteLink`, `telegramGroupName`, `hasTelegramGroup`
- `users` table: `telegramUserId`, `telegramUsername`

### Step 4: Restart Server

```bash
npm run dev
```

---

## 📋 How It Works

### For Admins

1. **Create Telegram Group for Plan:**
   - Go to `/admin/plans` or `/dashboard/admin/plans`
   - Find the plan you want to create a group for
   - Click "Create Telegram Group" button
   - The system will:
     - Create a new Telegram group
     - Make the bot an admin
     - Generate an invite link
     - Save the group info to the database

2. **View Group:**
   - Once created, you'll see a green badge "Telegram Group Created"
   - Click "View Group" to open the Telegram group

### For Users

1. **Link Telegram Account:**
   - Users need to link their Telegram account first
   - This can be done via API: `POST /api/telegram/link-account`
   - Requires: `telegramUserId` and optionally `telegramUsername`

2. **Automatic Group Addition:**
   - When a user subscribes to a plan with a Telegram group
   - They are automatically added to the group
   - A welcome message is sent to them

3. **Automatic Removal:**
   - When subscription expires, user is automatically removed
   - This happens via the cron job

---

## 🔄 Automation

### Cron Job Setup

The system includes a cron endpoint that removes expired users:

**Endpoint:** `GET /api/cron/telegram-cleanup`

**Authentication:** Uses `CRON_SECRET` from environment variables

**Setup External Cron:**

Use a service like [cron-job.org](https://cron-job.org) or your server's cron:

```bash
# Runs every hour
0 * * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/telegram-cleanup
```

**Or use GitHub Actions, EasyCron, etc.**

---

## 📡 API Endpoints

### Admin Endpoints

#### Create Telegram Group for Plan
```
POST /api/admin/plans/{planId}/telegram/create
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Telegram group created successfully",
  "group": {
    "groupId": "-1001234567890",
    "groupName": "Premium Plan - APICTS Premium",
    "inviteLink": "https://t.me/+abc123..."
  }
}
```

#### Get Telegram Group Info
```
GET /api/admin/plans/{planId}/telegram
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "hasGroup": true,
  "group": {
    "groupId": "-1001234567890",
    "groupName": "Premium Plan - APICTS Premium",
    "inviteLink": "https://t.me/+abc123..."
  }
}
```

### User Endpoints

#### Link Telegram Account
```
POST /api/telegram/link-account
Authorization: Bearer {user_token}
Content-Type: application/json

{
  "telegramUserId": 123456789,
  "telegramUsername": "username" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Telegram account linked successfully"
}
```

---

## 🔍 Integration Points

### Subscription Flow

The Telegram integration is automatically triggered in:

1. **Direct Subscription** (`/api/plans/subscribe`)
   - After subscription is created
   - Checks if plan has Telegram group
   - Checks if user has Telegram linked
   - Adds user to group

2. **Payment Verification** (`/api/plans/subscribe/verify`)
   - After payment is verified
   - Same logic as above

### Error Handling

- If Telegram fails, subscription still succeeds
- Errors are logged but don't block the subscription process
- Users can be manually added later if needed

---

## 🛠️ Troubleshooting

### Bot Can't Create Groups

**Issue:** Error "not enough rights" or "bot is not admin"

**Solution:**
- Make sure bot has been started (send `/start` to bot)
- Bot needs to be admin of groups it manages
- Check bot permissions in group settings

### User Not Added to Group

**Possible Causes:**
1. User hasn't linked Telegram account
2. User hasn't started the bot
3. Bot doesn't have admin rights
4. User's privacy settings block bot

**Solution:**
- Ensure user has linked Telegram account
- User must start the bot first
- Check bot admin status in group

### Cron Job Not Working

**Check:**
1. `CRON_SECRET` is set correctly
2. Cron service is calling the endpoint
3. Check server logs for errors
4. Verify endpoint is accessible

---

## 📝 Important Notes

1. **User Must Start Bot First:**
   - Users need to message the bot before it can message them
   - This is a Telegram privacy requirement

2. **Bot Must Be Admin:**
   - The bot needs admin rights to add/remove members
   - This is set automatically when creating groups

3. **Group Names:**
   - Groups are named: `{Plan Name} - APICTS Premium`
   - This can be customized in the service

4. **Invite Links:**
   - Permanent invite links are created
   - Links are stored in the database
   - Can be shared with users

5. **Expired Subscriptions:**
   - Users are removed when subscription expires
   - Removal happens via cron job (hourly)
   - Users can rejoin if they resubscribe

---

## 🚀 Next Steps (Optional Enhancements)

1. **User Dashboard UI:**
   - Add UI for users to link Telegram account
   - Show Telegram group status
   - Display invite links

2. **Bot Commands:**
   - Add `/start` command handler
   - Auto-link account via unique code
   - Welcome messages

3. **Notifications:**
   - Notify users when added to group
   - Remind users to link Telegram before subscribing

4. **Analytics:**
   - Track group membership
   - Monitor add/remove operations
   - Group activity metrics

---

## ✅ Testing Checklist

- [ ] Bot token added to `.env.local`
- [ ] Database updated with new fields
- [ ] Server restarted
- [ ] Create Telegram group for a plan (admin)
- [ ] Link user Telegram account
- [ ] Subscribe user to plan with Telegram group
- [ ] Verify user added to group
- [ ] Test cron job endpoint
- [ ] Verify expired user removal

---

## 📚 Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- [Telegram BotFather](https://t.me/BotFather)

---

**Your Telegram integration is ready! 🎉**

