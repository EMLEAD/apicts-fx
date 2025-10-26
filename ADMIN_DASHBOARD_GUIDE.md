# Admin Dashboard Guide

## Overview
The APICTS admin dashboard provides comprehensive management capabilities for your platform, including user management, transaction monitoring, rate management, content management, analytics, and security controls.

## Features

### 1. User Management (`/admin/users`)
- View all registered users
- Filter by active/inactive status
- Search users by name or email
- Update user roles (user, admin, moderator)
- Activate/deactivate user accounts
- Delete users
- View user details and activity

### 2. Transaction Monitoring (`/admin/transactions`)
- View all transactions in real-time
- Filter by status (pending, completed, failed)
- Search transactions
- Update transaction status
- View transaction details
- Monitor transaction statistics
- Track revenue and transaction volumes

### 3. Exchange Rate Management (`/admin/rates`)
- Add new exchange rates
- Edit existing rates
- Activate/deactivate rates
- View rate history
- Dynamic rate updates

### 4. Blog Content Management (`/admin/blog`)
- Create new blog posts
- Edit existing posts
- Delete posts
- Manage post status (draft, published, archived)
- Search blog posts
- View post statistics

### 5. Vlog Content Management (`/admin/vlog`)
- Create new video posts
- Edit video metadata
- Upload and manage video URLs
- Manage post status
- Categorize videos
- Track video views

### 6. Analytics Dashboard (`/admin/analytics`)
- View total users and active users
- Monitor revenue (total and monthly)
- Track transaction volumes
- View content statistics (blog & vlog views)
- User growth charts
- Top pages analysis
- Performance metrics

### 7. Security Controls (`/admin/security`)
- Monitor verified vs unverified users
- View suspicious activity
- Verify user accounts
- Track login attempts
- Monitor failed logins
- Security activity logs

## Database Models

### Transaction
- Type: deposit, withdrawal, exchange, transfer
- Status: pending, completed, failed, cancelled
- Amount and currency tracking
- Fees and metadata

### ExchangeRate
- From/To currency pairs
- Active/inactive status
- Update tracking
- Rate history

### BlogPost
- Title, slug, excerpt, content
- Featured image
- Author tracking
- Status (draft, published, archived)
- Views and tags
- SEO metadata

### VlogPost
- Title, slug, description
- Video URL and thumbnail
- Duration
- Author tracking
- Status, views, likes
- Tags and category

## API Routes

### Users
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/[id]` - Get user details
- `PATCH /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user
- `POST /api/admin/users/[id]/verify` - Verify user

### Transactions
- `GET /api/admin/transactions` - List all transactions
- `PATCH /api/admin/transactions/[id]` - Update transaction status

### Exchange Rates
- `GET /api/admin/rates` - List all rates
- `POST /api/admin/rates` - Create new rate
- `PATCH /api/admin/rates/[id]` - Update rate
- `DELETE /api/admin/rates/[id]` - Delete rate

### Blog
- `GET /api/admin/blog` - List all blog posts
- `POST /api/admin/blog` - Create new post
- `PATCH /api/admin/blog/[id]` - Update post
- `DELETE /api/admin/blog/[id]` - Delete post

### Vlog
- `GET /api/admin/vlog` - List all vlog posts
- `POST /api/admin/vlog` - Create new video
- `PATCH /api/admin/vlog/[id]` - Update video
- `DELETE /api/admin/vlog/[id]` - Delete video

### Statistics
- `GET /api/admin/stats/users` - User statistics
- `GET /api/admin/stats/transactions` - Transaction statistics
- `GET /api/admin/stats/blog` - Blog statistics
- `GET /api/admin/stats/vlog` - Vlog statistics

### Analytics & Security
- `GET /api/admin/analytics` - Comprehensive analytics
- `GET /api/admin/security` - Security data

## Authentication
All admin routes require JWT authentication with admin role. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Setup Instructions

1. **Environment Variables**
   Ensure your `.env.local` file has:
   ```env
   JWT_SECRET=your_secure_secret_key
   DB_HOST=localhost
   DB_NAME=apicts_db
   ```

2. **Database Initialization**
   Run the database initialization:
   ```bash
   npm run db:init
   ```

3. **Access the Admin Dashboard**
   Navigate to `/admin` and ensure you're logged in as an admin user.

4. **Creating an Admin User**
   You can create an admin user through the registration process, then update the role in the database:
   ```sql
   UPDATE users SET role='admin' WHERE email='admin@example.com';
   ```

## Features Overview

### User Management
- Comprehensive user list with search and filter
- Role management
- Status control (active/inactive)
- User verification
- Activity tracking

### Transaction Management
- Real-time transaction monitoring
- Status updates
- Revenue tracking
- Filtering and search
- Detailed transaction views

### Rate Management
- Dynamic exchange rate updates
- Currency pair management
- Rate activation/deactivation
- Update history tracking

### Content Management
- Blog and Vlog platforms
- Draft/Published/Archived workflow
- Content search
- View statistics
- Media management

### Analytics
- User growth tracking
- Revenue analytics
- Transaction volumes
- Content performance
- Visual charts and graphs

### Security
- User verification system
- Suspicious activity monitoring
- Login tracking
- Security alerts
- Activity logs

## Notes

- All admin operations require authentication
- JWT secret must be properly configured
- Database models are automatically synced
- Real-time data updates
- Responsive design for all devices

