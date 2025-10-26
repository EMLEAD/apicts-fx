# Create Admin Account Guide

This guide explains the different methods to create an admin account for the APICTS platform.

## Methods to Create Admin Account

### Method 1: Using the Web Interface (Recommended)

1. **Navigate to the create admin page:**
   ```
   http://localhost:3000/create-admin
   ```

2. **Fill in the form:**
   - Username: Choose a unique username (minimum 3 characters)
   - Email: Enter a valid email address
   - Password: Enter a strong password (minimum 6 characters)

3. **Click "Create Admin Account"**

4. **Login:**
   - Go to `/login`
   - Use your newly created credentials
   - Navigate to `/admin` for the admin dashboard

### Method 2: Using the Node.js Script

1. **Run the create-admin script:**
   ```bash
   node create-admin.js
   ```

2. **Follow the prompts:**
   - Enter username
   - Enter email
   - Enter password

3. **The script will create the admin user and display credentials**

### Method 3: Using the API Endpoint

**Endpoint:**
```
POST /api/admin/create-admin
```

**Request Body:**
```json
{
  "username": "admin",
  "email": "admin@apicts.com",
  "password": "secure_password"
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:3000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@apicts.com",
    "password": "secure_password"
  }'
```

### Method 4: Using MySQL Directly (Advanced)

If you have direct MySQL access, you can manually insert an admin user:

```sql
USE apicts_db;

-- Hash the password first using bcrypt
INSERT INTO users (id, username, email, password, role, isActive, createdAt, updatedAt)
VALUES (
  UUID(),
  'admin',
  'admin@apicts.com',
  '$2a$10$hashed_password_here',  -- Use bcrypt to hash your password
  'admin',
  1,
  NOW(),
  NOW()
);
```

**To hash a password in Node.js:**
```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash('your_password', 10);
console.log(hashedPassword);
```

## Important Notes

### Database Requirements

Before creating an admin account, ensure:
1. MySQL database is running
2. Database connection is configured in `.env.local`
3. Database tables are initialized

**Initialize database tables:**
```bash
npm run db:init
```

### Environment Variables

Ensure your `.env.local` file has:
```env
JWT_SECRET=apicts_super_secret_jwt_key_2024_secure_random_string_change_in_production
DB_HOST=localhost
DB_NAME=apicts_db
DB_USER=root
DB_PASSWORD=your_password
```

### Security Considerations

1. **Strong Password:** Use a strong, unique password
2. **Secure JWT_SECRET:** Change the default JWT_SECRET in production
3. **Email Verification:** After creating the account, verify your email
4. **Firewall:** Restrict access to admin routes in production

### Troubleshooting

#### "User already exists"
If you get this error, the user exists but may not be an admin.

**Solution:** Update the existing user's role:
```sql
UPDATE users SET role='admin', isActive=1 WHERE email='your_email@example.com';
```

#### "Database connection failed"
Ensure MySQL is running and credentials are correct.

**Check MySQL status:**
- Windows: Check Services
- Linux/Mac: `sudo systemctl status mysql`

#### "JWT secret error"
Add JWT_SECRET to your `.env.local` file.

### Verifying Admin Account

1. **Login at `/login`**
2. **Check user role in browser console:**
   ```javascript
   const user = JSON.parse(localStorage.getItem('user'));
   console.log(user.role); // Should be 'admin'
   ```

3. **Access admin dashboard:** Navigate to `/admin`
4. **Check database:**
   ```sql
   SELECT * FROM users WHERE role='admin';
   ```

## Features After Login

Once logged in as admin, you can:
- Access `/admin` - Main admin dashboard
- Manage users at `/admin/users`
- Monitor transactions at `/admin/transactions`
- Manage exchange rates at `/admin/rates`
- Manage blog content at `/admin/blog`
- Manage vlog content at `/admin/vlog`
- View analytics at `/admin/analytics`
- Monitor security at `/admin/security`

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check server logs
3. Verify database connection
4. Ensure all environment variables are set
5. Run `npm run db:init` to reinitialize database

