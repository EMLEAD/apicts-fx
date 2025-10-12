# 🔧 Fix Your Database Setup

## Issues Found:

❌ Your `.env.local` is missing: `DB_PORT` and `DB_DIALECT`
❌ Connection to Clever Cloud remote MySQL is failing

---

## ✅ Quick Fix for Local MySQL:

### 1. Update your `.env.local` file:

Open `.env.local` and make sure it has ALL these variables:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=apicts_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_DIALECT=mysql

JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

### 2. If using XAMPP/WAMP:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=apicts_db
DB_USER=root
DB_PASSWORD=
DB_DIALECT=mysql
```
**Note:** XAMPP often has no password, so `DB_PASSWORD=` (empty)

### 3. Create the database:

Open MySQL/phpMyAdmin and run:
```sql
CREATE DATABASE apicts_db;
```

Or via command line:
```bash
mysql -u root -p
CREATE DATABASE apicts_db;
EXIT;
```

### 4. Test your setup:

```bash
npm run verify
```

You should see all green checkmarks ✅

### 5. Start the dev server:

```bash
npm run dev
```

---

## 🌐 Using Remote Clever Cloud MySQL?

If you want to use the remote Clever Cloud database, update `.env.local` with:

```env
DB_HOST=bvjek8j6gvsebhnngeuo-mysql.services.clever-cloud.com
DB_PORT=3306
DB_NAME=your_clever_cloud_db_name
DB_USER=your_clever_cloud_user
DB_PASSWORD=your_clever_cloud_password
DB_DIALECT=mysql
```

**Make sure:**
- Your Clever Cloud database is active
- You have the correct credentials
- Your IP is whitelisted (if required)

---

## 🧪 Verify Your Setup:

Run this command to check everything:
```bash
npm run verify
```

This will check:
- ✅ .env.local file exists
- ✅ All required variables are set  
- ✅ mysql2 package is installed
- ✅ MySQL connection works
- ✅ Database exists

---

## 🐛 Still Having Issues?

1. **Check MySQL is running:**
   - XAMPP: Open control panel, start MySQL
   - Windows Services: Look for "MySQL" service
   - Command: `mysql --version`

2. **Verify credentials:**
   - Try logging in: `mysql -u root -p`
   - If it works, your credentials are correct

3. **Check the port:**
   - MySQL default: 3306
   - Check in MySQL config or XAMPP settings

---

Need more help? Check `QUICK_START.md` or `DATABASE_CONNECTION_GUIDE.md`

