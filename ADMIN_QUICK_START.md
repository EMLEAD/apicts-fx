# Quick Start: Admin Login & Dashboard

## ✅ What's Been Created

1. **Admin Login Page** at `/admin-login` - Simple email/password login with role-based access
2. **Admin Dashboard** at `/admin` - Full admin panel with all management features
3. **Create Admin API** at `/api/admin/create-admin` - For creating admin accounts
4. **Create Admin UI** at `/create-admin` - Web interface to create admin accounts

## 🚀 Quick Start (3 Steps)

### Step 1: Create an Admin Account

**Option A: Use the Web Interface**
1. Visit: `http://localhost:3000/create-admin`
2. Fill in the form:
   - Username: `admin` (or your choice)
   - Email: `admin@apicts.com`
   - Password: `your_secure_password`
3. Click "Create Admin Account"

**Option B: Use the API**
```bash
curl -X POST http://localhost:3000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@apicts.com",
    "password": "secure_password"
  }'
```

**Option C: Update Existing User**
```sql
UPDATE users SET role='admin' WHERE email='your_email@example.com';
```

### Step 2: Login as Admin

1. Visit: `http://localhost:3000/admin-login`
2. Enter your email and password
3. Click "Sign in to Admin Dashboard"

### Step 3: Access Admin Dashboard

You'll be automatically redirected to `/admin` with access to:

- **Dashboard** - Overview and statistics
- **Users** - Manage all users
- **Transactions** - Monitor transactions
- **Rates** - Manage exchange rates
- **Blog** - Manage blog content
- **Vlog** - Manage video content
- **Analytics** - View analytics
- **Security** - Security controls

## 🔒 Authentication Flow

```
User visits /admin
    ↓
Check localStorage for user
    ↓
If no user → Redirect to /admin-login
    ↓
Login with email/password
    ↓
Verify user.role === 'admin'
    ↓
Store user & token in localStorage
    ↓
Redirect to /admin dashboard
```

## 📋 Requirements

### Environment Variables
Create `.env.local` with:
```env
JWT_SECRET=apicts_super_secret_jwt_key_2024_secure_random_string_change_in_production
DB_HOST=localhost
DB_NAME=eucloudwww1773163351543_
DB_USER=root
DB_PASSWORD=your_password
```

### Database Setup
```bash
npm run db:init
```

## 🎯 Features

### Admin Login Page (`/admin-login`)
- ✅ Email and password authentication
- ✅ Role verification (admin only)
- ✅ Password visibility toggle
- ✅ Error handling
- ✅ Auto-redirect to `/admin` after login
- ✅ Session management

### Admin Dashboard (`/admin`)
- ✅ User Management
- ✅ Transaction Monitoring
- ✅ Rate Management
- ✅ Content Management (Blog & Vlog)
- ✅ Analytics Dashboard
- ✅ Security Controls

## 🔍 Testing

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Create admin account:**
   - Visit: `http://localhost:3000/create-admin`

3. **Login:**
   - Visit: `http://localhost:3000/admin-login`
   - Use your admin credentials

4. **Access dashboard:**
   - You'll be redirected to `/admin`

## 🛠️ Troubleshooting

### "Access denied. Admin privileges required."
**Solution:** Your account doesn't have admin role. Update it:
```sql
UPDATE users SET role='admin' WHERE email='your_email@example.com';
```

### "JWT secret error"
**Solution:** Make sure `.env.local` has `JWT_SECRET`

### "Database connection failed"
**Solution:** 
1. Check MySQL is running
2. Update `.env.local` with correct credentials
3. Run `npm run db:init`

## 📝 Routes

| Route | Purpose |
|-------|---------|
| `/admin-login` | Admin login page |
| `/admin` | Admin dashboard |
| `/admin/users` | User management |
| `/admin/transactions` | Transaction monitoring |
| `/admin/rates` | Exchange rate management |
| `/admin/blog` | Blog content management |
| `/admin/vlog` | Vlog content management |
| `/admin/analytics` | Analytics dashboard |
| `/admin/security` | Security controls |
| `/create-admin` | Create admin account UI |
| `/api/admin/create-admin` | Create admin API |

## 🎉 Ready to Use!

Your admin login and dashboard system is now ready. Follow the quick start steps above to create your admin account and start managing your platform!

## 📚 More Information

- See `ADMIN_LOGIN_GUIDE.md` for detailed login documentation
- See `CREATE_ADMIN_GUIDE.md` for creating admin accounts
- See `ADMIN_DASHBOARD_GUIDE.md` for dashboard features

