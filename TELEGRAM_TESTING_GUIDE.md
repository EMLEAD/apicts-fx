# 🧪 Telegram Groups - Testing Guide

## Quick Test Steps

### 1. Setup (One-time)

1. **Get Telegram Bot Token:**
   - Open Telegram
   - Search for `@BotFather`
   - Send `/newbot`
   - Follow prompts to create bot
   - Copy the token (format: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

2. **Add to `.env.local`:**
   ```env
   TELEGRAM_BOT_TOKEN=8685708662:AAFFOCywBgFbFoVVIFELRbk1m2gNb7pw9qM
   CRON_SECRET=any_random_secret_key
   ```

3. **Restart Server:**
   ```bash
   npm run dev
   ```

### 2. Test Bot Connection

1. Go to `/admin/plans` or `/dashboard/admin/plans`
2. Click **"Test Connection"** button (top right, blue button)
3. You should see:
   - ✅ **Success**: Bot username, ID, and name
   - ❌ **Error**: Configuration instructions

### 3. Test Creating Telegram Group

1. **Create or Select a Plan:**
   - Go to admin plans page
   - Create a new plan OR use existing plan

2. **Create Telegram Group:**
   - Find the plan card
   - Click **"Create Telegram Group"** button (blue button)
   - Wait a few seconds
   - You should see:
     - ✅ Green badge: "Telegram Group Created"
     - ✅ "View Group" link appears
     - ✅ Group details shown (Group ID, Invite Link)

3. **View the Group:**
   - Click **"View Group"** link
   - Opens Telegram app/web with the group
   - You should see the group with your bot as admin

### 4. Test User Addition (Manual Test)

**Option A: Via API (for testing)**
```bash
# 1. Link user's Telegram account
curl -X POST http://localhost:3000/api/telegram/link-account \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "telegramUserId": 123456789,
    "telegramUsername": "testuser"
  }'

# 2. Subscribe user to plan (this auto-adds to group)
# Use your existing subscription flow
```

**Option B: Direct API Call (for testing)**
```bash
# Test adding user directly (requires user to have started bot)
# This is done automatically during subscription
```

### 5. Verify in Telegram

1. Open Telegram app
2. Go to the group you created
3. Check:
   - ✅ Bot is admin
   - ✅ Group name matches: `{Plan Name} - APICTS Premium`
   - ✅ Invite link works
   - ✅ Users added automatically when they subscribe

---

## Testing Checklist

### Prerequisites
- [ ] Bot token in `.env.local`
- [ ] Server restarted
- [ ] Database synced (`npm run db:check`)

### Connection Test
- [ ] Click "Test Connection" button
- [ ] See bot info (username, ID, name)
- [ ] No errors

### Group Creation
- [ ] Click "Create Telegram Group" on a plan
- [ ] See success message
- [ ] See green "Telegram Group Created" badge
- [ ] See "View Group" link
- [ ] Click link opens Telegram group
- [ ] Group exists in Telegram

### Group Information
- [ ] Group ID displayed
- [ ] Invite link displayed and clickable
- [ ] Group name matches plan name

### Error Handling
- [ ] Test without bot token → See helpful error
- [ ] Test with invalid token → See error message
- [ ] Test creating duplicate group → See "already exists" message

---

## Common Issues & Solutions

### Issue: "Telegram bot not configured"
**Solution:**
1. Check `.env.local` has `TELEGRAM_BOT_TOKEN`
2. Restart server
3. Test connection again

### Issue: "Bot connection failed"
**Solution:**
1. Verify bot token is correct
2. Check bot exists in Telegram
3. Make sure token format is correct (no extra spaces)

### Issue: "Failed to create Telegram group"
**Solution:**
1. Bot must be started (send `/start` to bot)
2. Check bot has permission to create groups
3. Verify token is valid
4. Check server logs for detailed error

### Issue: Group created but can't see it
**Solution:**
1. Check Telegram app (not just web)
2. Bot must be admin of the group
3. Try clicking "View Group" link
4. Check group ID in database

---

## API Endpoints for Testing

### Test Bot Connection
```
GET /api/admin/telegram/test
Authorization: Bearer {admin_token}
```

**Response (Success):**
```json
{
  "configured": true,
  "bot": {
    "id": 123456789,
    "username": "your_bot",
    "firstName": "Your Bot Name",
    "isBot": true
  },
  "message": "Telegram bot is configured and connected successfully!"
}
```

**Response (Not Configured):**
```json
{
  "configured": false,
  "error": "Telegram bot not configured...",
  "details": "..."
}
```

### Create Telegram Group
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

### Get Group Info
```
GET /api/admin/plans/{planId}/telegram
Authorization: Bearer {admin_token}
```

---

## Visual Guide

### Before Creating Group:
```
┌─────────────────────────────┐
│ Premium Plan                │
│ Price: ₦10,000              │
│                             │
│ [Create Telegram Group] ← Click
└─────────────────────────────┘
```

### After Creating Group:
```
┌─────────────────────────────┐
│ Premium Plan                │
│ Price: ₦10,000              │
│                             │
│ ✓ Telegram Group Created   │
│   Premium Plan - APICTS... │
│   [View Group] →            │
│                             │
│ Group ID: -1001234567890    │
│ Invite: t.me/+abc123...     │
└─────────────────────────────┘
```

---

## Next Steps After Testing

1. ✅ Test connection works
2. ✅ Create groups for your plans
3. ✅ Test user subscription flow
4. ✅ Verify users added automatically
5. ✅ Setup cron job for expired users
6. ✅ Add user UI for linking Telegram accounts

---

**Ready to test!** 🚀

Start with the "Test Connection" button in the admin plans page.

