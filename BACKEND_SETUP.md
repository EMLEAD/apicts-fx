# Backend Setup Guide

## 🚀 Backend with Sequelize + MySQL

This project includes a complete backend setup with Sequelize ORM and MySQL database.

---

## 📋 Prerequisites

1. **MySQL** installed and running on your machine
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Default port: 3306
   - Or use XAMPP/WAMP which includes MySQL

2. **Node.js** and **npm** installed

---

## 🔧 Setup Instructions

### 1. Create Database

Open MySQL terminal (mysql command line or phpMyAdmin) and create a database:

```sql
CREATE DATABASE eucloudwww1773163351543_;
```

Or using MySQL command line:
```bash
mysql -u root -p
# Enter password
CREATE DATABASE eucloudwww1773163351543_;
EXIT;
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Edit `.env.local` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=eucloudwww1773163351543_
DB_USER=root
DB_PASSWORD=your_actual_password
DB_DIALECT=mysql

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

### 3. Start Development Server

```bash
npm run dev
```

**The database will automatically initialize on first API request!** 🎉

You'll see console messages like:
```
🔄 Initializing database connection...
✅ Database connection established successfully.
🔄 Synchronizing database tables...
✅ Database initialized and ready!
📊 Available models: User, Contact
```

**Alternative: Manual Initialization**

You can also manually initialize the database:

```bash
# Option 1: Run initialization script
npm run db:init

# Option 2: Visit the endpoint
# Start server: npm run dev
# Then visit: http://localhost:3000/api/init-db

# Option 3: Check database health
# Visit: http://localhost:3000/api/health
```

---

## 📁 Project Structure

```
src/
├── lib/
│   ├── db/
│   │   ├── config.js          # Database configuration
│   │   ├── sequelize.js       # Sequelize instance
│   │   ├── init.js            # Auto-initialization script
│   │   └── models/
│   │       ├── index.js       # Models export
│   │       ├── User.js        # User model
│   │       └── Contact.js     # Contact model
│   ├── utils/
│   │   └── jwt.js             # JWT utilities
│   └── middleware/
│       └── auth.js            # Authentication middleware
│
├── middleware.js              # Next.js middleware (auto DB init)
│
└── app/
    └── api/
        ├── auth/
        │   ├── register/route.js    # User registration
        │   └── login/route.js       # User login
        ├── contact/route.js         # Contact messages
        ├── users/route.js           # Users management
        ├── health/route.js          # Health check endpoint
        └── init-db/route.js         # Manual DB initialization
```

---

## 🔌 API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```
- **Response:**
```json
{
  "message": "User registered successfully",
  "user": { ... },
  "token": "jwt_token_here"
}
```

#### Login User
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "jwt_token_here"
}
```

### Contact Messages

#### Submit Contact Form
- **POST** `/api/contact`
- **Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "General Inquiry",
  "message": "Hello, I have a question..."
}
```

#### Get All Contacts (Admin)
- **GET** `/api/contact`
- **Query params:**
  - `status`: Filter by status (new, in_progress, resolved, closed)
  - `limit`: Number of records (default: 50)
  - `offset`: Pagination offset (default: 0)

### Users

#### Get All Users (Admin)
- **GET** `/api/users`
- **Query params:**
  - `limit`: Number of records (default: 50)
  - `offset`: Pagination offset (default: 0)

### Health Check

#### Check Server and Database Health
- **GET** `/api/health`
- **Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## 📊 Database Models

### User Model
```javascript
{
  id: UUID (Primary Key),
  firstName: String,
  lastName: String,
  email: String (Unique),
  password: String (Hashed),
  phone: String,
  role: Enum ('user', 'admin', 'moderator'),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Contact Model
```javascript
{
  id: UUID (Primary Key),
  name: String,
  email: String,
  phone: String,
  subject: String,
  message: Text,
  status: Enum ('new', 'in_progress', 'resolved', 'closed'),
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Security Features

- ✅ **Password Hashing**: bcryptjs with salt
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Input Validation**: Sequelize validators
- ✅ **SQL Injection Protection**: Parameterized queries
- ✅ **Environment Variables**: Sensitive data protection

---

## 🧪 Testing the Backend

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Contact Form:**
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","subject":"Test","message":"Hello!"}'
```

### Using Postman or Thunder Client

Import these endpoints and test directly from your IDE/Postman.

---

## 🔄 Database Migration

To reset the database (⚠️ WARNING: This deletes all data!):

```javascript
// In src/app/api/init-db/route.js
await syncDatabase({ force: true }); // Drop and recreate tables
```

For safe updates:
```javascript
await syncDatabase({ alter: true }); // Update without losing data
```

---

## 📝 Next Steps

1. ✅ Database is set up
2. ✅ API routes are ready
3. 🔄 Connect your frontend forms to API endpoints
4. 🔄 Add authentication to protected routes
5. 🔄 Create admin dashboard for managing contacts/users

---

## 🐛 Troubleshooting

### Can't connect to database
- Check MySQL is running:
  - Windows: Check Services for "MySQL" or start XAMPP/WAMP
  - Mac: `brew services list` or check System Preferences
  - Linux: `sudo service mysql status`
- Verify credentials in `.env.local`
- Check MySQL port (default: 3306)
- Make sure MySQL user has proper permissions

### Tables not created
- Visit `/api/init-db` endpoint
- Check console logs for errors
- Verify database exists: 
  ```bash
  mysql -u root -p
  SHOW DATABASES;
  ```

### JWT errors
- Make sure `JWT_SECRET` is set in `.env.local`
- Token expires in 7 days by default

---

## 📚 Learn More

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [JWT Authentication](https://jwt.io/)

## 💡 MySQL Tips

### Using XAMPP/WAMP
If you're using XAMPP or WAMP:
- Start Apache and MySQL from control panel
- Access phpMyAdmin: http://localhost/phpmyadmin
- Create database there using GUI
- Default user: `root`, password: (empty or as you set)

### Common MySQL Commands
```bash
# Login to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Select database
USE eucloudwww1773163351543_;

# Show tables
SHOW TABLES;

# Show table structure
DESCRIBE users;
```

---

Happy Coding! 🚀

