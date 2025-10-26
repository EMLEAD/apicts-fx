# Admin Login Guide

This guide explains how to access the admin dashboard using the admin login page.

## Admin Login Page

The admin login page is accessible at:
```
http://localhost:3000/admin-login
```

## Login Process

### Step 1: Navigate to Admin Login
Visit `/admin-login` in your browser

### Step 2: Enter Credentials
- **Email**: Your admin email address
- **Password**: Your admin password

### Step 3: Role Verification
The system will automatically check if your account has the `admin` role. Only users with `role: 'admin'` can access the admin dashboard.

### Step 4: Access Admin Dashboard
After successful login, you'll be redirected to `/admin` - the admin dashboard.

## Features

### Admin Login Page Features
- ✅ Email and password authentication
- ✅ Role-based access control
- ✅ Password visibility toggle
- ✅ Automatic redirect to `/admin` after login
- ✅ Session management with localStorage
- ✅ Error handling and user feedback

### Access Control
- Only users with `role: 'admin'` can access the admin dashboard
- Regular users will be redirected to the admin login page
- Non-authenticated users are also redirected to the admin login page

## Creating an Admin Account

### Method 1: Web Interface (Easiest)
```
http://localhost:3000/create-admin
```
Fill in the form and create your admin account.

### Method 2: Using Node.js Script
```bash
node create-admin.js
```
Follow the prompts to create an admin account.

### Method 3: Using API
```bash
curl -X POST http://localhost:3000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@apicts.com",
    "password": "your_password"
  }'
```

### Method 4: Update Existing User
If you already have a user account, you can make it an admin:

**Using SQL:**
```sql
UPDATE users SET role='admin' WHERE email='your_email@example.com';
```

**Using the admin panel** (if you have another admin account):
1. Login as admin
2. Go to `/admin/users`
3. Find the user
4. Change their role to 'admin'

## Session Management

### Login Session
- User data is stored in `localStorage`
- JWT token is stored in `localStorage`
- Session persists across page refreshes
- Logout clears all stored data

### Session Expiry
- Default JWT expiry: 7 days
- Configurable via `JWT_EXPIRES_IN` environment variable

## Security Features

### Password Requirements
- Minimum 6 characters
- Stored using bcrypt hashing

### Access Control
- Role-based authentication
- Admin-only routes protection
- Automatic redirect for unauthorized access

### Security Best Practices
1. Use a strong, unique password
2. Don't share admin credentials
3. Log out when finished
4. Keep your JWT_SECRET secure
5. Change default JWT_SECRET in production

## Admin Dashboard Access

Once logged in as admin, you can access:

### Main Dashboard
- `/admin` - Overview and statistics

### User Management
- `/admin/users` - Manage user accounts

### Transaction Management
- `/admin/transactions` - Monitor transactions

### Rate Management
- `/admin/rates` - Manage exchange rates

### Content Management
- `/admin/blog` - Manage blog posts
- `/admin/vlog` - Manage video posts

### Analytics
- `/admin/analytics` - View analytics and reports

### Security
- `/admin/security` - Security monitoring and user verification

## Troubleshooting

### "Access denied. Admin privileges required."
- Your account doesn't have admin role
- Update your account role to 'admin' using one of the methods above

### "Login failed"
- Check your email and password
- Ensure your account is active
- Contact support if issues persist

### "Invalid email or password"
- Double-check your credentials
- Make sure you're using the correct email
- Check if your account exists

### "Account is inactive"
- Contact administrator to activate your account
- Check database: `UPDATE users SET isActive=1 WHERE email='your_email';`

### Session Issues
- Clear browser localStorage
- Clear browser cache
- Try logging in again
- Check browser console for errors

## Testing Admin Access

1. **Create admin account:**
   ```bash
   # Visit create admin page
   http://localhost:3000/create-admin
   ```

2. **Login:**
   ```bash
   # Visit admin login
   http://localhost:3000/admin-login
   ```

3. **Access dashboard:**
   ```bash
   # After login, you'll be redirected to
   http://localhost:3000/admin
   ```

## API Endpoints

### Admin Login
- **Endpoint:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "admin@apicts.com",
    "password": "password"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": { ... },
      "token": "...",
      "expiresIn": "7d"
    }
  }
  ```

### Create Admin
- **Endpoint:** `POST /api/admin/create-admin`
- **Body:**
  ```json
  {
    "username": "admin",
    "email": "admin@apicts.com",
    "password": "secure_password"
  }
  ```

## Environment Variables

Make sure your `.env.local` has:
```env
JWT_SECRET=apicts_super_secret_jwt_key_2024_secure_random_string_change_in_production
DB_HOST=localhost
DB_NAME=apicts_db
DB_USER=root
DB_PASSWORD=your_password
```

## Logout

To logout from the admin dashboard:
1. Click the logout button in the sidebar
2. Or clear localStorage:
   ```javascript
   localStorage.clear();
   ```
3. Or manually remove:
   ```javascript
   localStorage.removeItem('user');
   localStorage.removeItem('token');
   ```

## Support

For issues or questions:
1. Check browser console for errors
2. Verify database connection
3. Check environment variables
4. Run `npm run db:init` to reinitialize database
5. Review server logs

