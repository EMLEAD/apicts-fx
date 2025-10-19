#!/bin/bash

echo "🔧 MySQL Database Fix Script"
echo "=========================="

# Step 1: Stop MySQL
echo "1. Stopping MySQL..."
brew services stop mysql

# Step 2: Start MySQL in safe mode
echo "2. Starting MySQL in safe mode..."
sudo mysqld_safe --skip-grant-tables --skip-networking &
sleep 5

# Step 3: Reset password
echo "3. Resetting MySQL root password..."
mysql -u root << EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;
EXIT;
EOF

# Step 4: Stop safe mode
echo "4. Stopping safe mode..."
sudo pkill mysqld
sleep 3

# Step 5: Start MySQL normally
echo "5. Starting MySQL normally..."
brew services start mysql
sleep 5

# Step 6: Create database
echo "6. Creating database..."
mysql -u root -ppassword << EOF
CREATE DATABASE IF NOT EXISTS apicts_db;
SHOW DATABASES;
EXIT;
EOF

# Step 7: Update .env.local
echo "7. Updating .env.local file..."
cat > .env.local << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql
DB_NAME=apicts_db
DB_USER=root
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_apicts_2025
JWT_EXPIRES_IN=7d

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Email Settings
EMAIL_FROM_NAME=APICTS Support
EMAIL_REPLY_TO=support@apicts.com
CONTACT_EMAIL=contact@apicts.com
SITE_URL=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App Configuration
NODE_ENV=development
PORT=3000
EOF

echo "✅ MySQL setup complete!"
echo "📝 Password set to: password"
echo "🗄️  Database created: apicts_db"
echo "📄 .env.local file updated"
echo ""
echo "Now you can run your application!"
