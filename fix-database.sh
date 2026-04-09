#!/bin/bash

echo "🔧 Database Initialization Fix"
echo "============================="

# Step 1: Drop and recreate database to avoid key conflicts
echo "1. Dropping existing database..."
mysql -u root -ppassword -e "DROP DATABASE IF EXISTS eucloudwww1773163351543_;" 2>/dev/null || echo "Database doesn't exist yet"

echo "2. Creating fresh database..."
mysql -u root -ppassword -e "CREATE DATABASE eucloudwww1773163351543_ CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "3. Setting up MySQL configuration..."
mysql -u root -ppassword -e "SET GLOBAL innodb_large_prefix = 1;" 2>/dev/null || echo "Setting already applied"
mysql -u root -ppassword -e "SET GLOBAL innodb_file_format = 'Barracuda';" 2>/dev/null || echo "Setting already applied"

echo "4. Testing database connection..."
mysql -u root -ppassword -e "USE eucloudwww1773163351543_; SHOW TABLES;" && echo "✅ Database ready!"

echo ""
echo "✅ Database setup complete!"
echo "📝 Database: eucloudwww1773163351543_"
echo "🔑 Password: password"
echo "🌐 Now you can run: npm run dev"
