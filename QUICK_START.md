# 🚀 Quick Start Guide

## Yes! The database automatically connects when you run `npm run dev`

Here's what happens:

### When you run `npm run dev`:

1. **Next.js dev server starts** 🚀
2. **First API request** triggers database initialization
3. **Automatic connection test** ✅
4. **Tables automatically created** (users, contacts)
5. **Ready to use!** 🎉

### What you'll see in the console:

**✅ If MySQL is connected successfully:**
```
============================================================
🔄 INITIALIZING DATABASE CONNECTION...
============================================================
   ✅ Testing connection... SUCCESS
🔄 Synchronizing database tables...
   ✅ Database tables synchronized

============================================================
✅ DATABASE CONNECTED SUCCESSFULLY!
============================================================
   ✅ MySQL connection established
   ✅ Tables synchronized
   📊 Available models: User, Contact
   🌐 API endpoints ready at /api/*
============================================================
```

**❌ If MySQL connection fails:**
```
============================================================
❌ DATABASE CONNECTION FAILED
============================================================
   ❌ Could not connect to MySQL database
   📝 Troubleshooting:
      1. Check if MySQL is running
      2. Verify .env.local credentials
      3. Make sure database "apicts_db" exists
      4. Check MySQL port (default: 3306)
   📖 See QUICK_START.md for setup instructions
============================================================
```

---

## ⚙️ Before First Run

### 1. Install MySQL
Make sure MySQL is installed and running.
- Download from: https://dev.mysql.com/downloads/mysql/
- Or use XAMPP/WAMP (includes MySQL)

### 2. Create Database
```bash
# Using MySQL command line
mysql -u root -p
CREATE DATABASE apicts_db;
EXIT;
```

Or use phpMyAdmin if you have XAMPP/WAMP:
- Open: http://localhost/phpmyadmin
- Click "New" to create database named `apicts_db`

### 3. Configure Environment
Create `.env.local` file (copy from `.env.example`):
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=apicts_db
DB_USER=root
DB_PASSWORD=your_actual_password
DB_DIALECT=mysql

JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

### 4. Run Development Server
```bash
npm run dev
```

That's it! Database will auto-connect and initialize. 🎊

---

## 📍 Useful Endpoints

Once the server is running:

- **Homepage**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Contact Page**: http://localhost:3000/contact

---

## 🔧 Available Commands

```bash
# Start development server (auto-connects to DB)
npm run dev

# Initialize database manually
npm run db:init

# Check database connection
npm run db:check

# Build for production
npm run build

# Start production server
npm start
```

---

## ✅ Verify Everything Works

### Test the database connection:

1. **Start server**: `npm run dev`

2. **Visit health endpoint**: http://localhost:3000/api/health

   You should see:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "timestamp": "..."
   }
   ```

3. **Test contact form**: http://localhost:3000/contact
   - Fill out the form and submit
   - Data will be saved to PostgreSQL!

---

## 🎯 Next Steps

1. ✅ Database is connected automatically
2. 🔐 APIs are ready (`/api/auth/register`, `/api/auth/login`, `/api/contact`)
3. 📝 Connect your contact form to `/api/contact`
4. 🔒 Add authentication to your pages
5. 📊 Build admin dashboard to view contacts/users

---

## 💡 Tips

- **First API call** initializes the database (takes 2-3 seconds)
- **Subsequent calls** are instant (connection is cached)
- **Tables update automatically** when you change models
- **Development mode** shows helpful console logs

---

## 🐛 Troubleshooting

### Database connection failed?
1. Check MySQL is running
   - Windows: Check Services for "MySQL" or start XAMPP/WAMP
   - XAMPP: Make sure MySQL is started in control panel
2. Verify `.env.local` credentials
3. Make sure database `apicts_db` exists
4. Check MySQL port (default: 3306)
5. If using XAMPP with empty password, set `DB_PASSWORD=` (empty)

### Tables not created?
Visit http://localhost:3000/api/init-db to manually initialize

### Using XAMPP/WAMP?
- Default user: `root`
- Default password: (empty) or as you set
- phpMyAdmin: http://localhost/phpmyadmin

### Need more help?
Check `BACKEND_SETUP.md` for detailed documentation

---

Happy Coding! 🚀

