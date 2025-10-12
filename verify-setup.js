// Verify database setup and configuration
const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(60));
console.log('🔍 VERIFYING DATABASE SETUP');
console.log('='.repeat(60) + '\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists');
  
  // Read and check required variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_DIALECT'];
  
  console.log('\n📋 Checking environment variables:');
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`   ✅ ${varName} is set`);
    } else {
      console.log(`   ❌ ${varName} is MISSING`);
    }
  });
} else {
  console.log('❌ .env.local file NOT FOUND');
  console.log('\n📝 Please create .env.local file with:');
  console.log(`
DB_HOST=localhost
DB_PORT=3306
DB_NAME=apicts_db
DB_USER=root
DB_PASSWORD=your_password
DB_DIALECT=mysql

JWT_SECRET=your_secret_key
NODE_ENV=development
  `);
}

// Check if mysql2 is installed
console.log('\n📦 Checking dependencies:');
try {
  require('mysql2');
  console.log('   ✅ mysql2 is installed');
} catch (err) {
  console.log('   ❌ mysql2 is NOT installed');
}

try {
  require('sequelize');
  console.log('   ✅ sequelize is installed');
} catch (err) {
  console.log('   ❌ sequelize is NOT installed');
}

// Test MySQL connection
console.log('\n🔌 Testing MySQL connection:');
require('dotenv').config({ path: '.env.local' });

const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    console.log('   ✅ MySQL connection successful');
    
    // Check if database exists
    const [databases] = await connection.query('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === (process.env.DB_NAME || 'apicts_db'));
    
    if (dbExists) {
      console.log(`   ✅ Database '${process.env.DB_NAME || 'apicts_db'}' exists`);
    } else {
      console.log(`   ❌ Database '${process.env.DB_NAME || 'apicts_db'}' does NOT exist`);
      console.log('\n   📝 Create it with:');
      console.log(`   mysql -u root -p`);
      console.log(`   CREATE DATABASE ${process.env.DB_NAME || 'apicts_db'};`);
    }
    
    await connection.end();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SETUP VERIFICATION COMPLETE');
    console.log('='.repeat(60) + '\n');
    
  } catch (err) {
    console.log(`   ❌ MySQL connection failed: ${err.message}`);
    console.log('\n' + '='.repeat(60));
    console.log('❌ SETUP HAS ISSUES - Please fix them');
    console.log('='.repeat(60));
    console.log('\n📝 Troubleshooting:');
    console.log('   1. Make sure MySQL is running');
    console.log('   2. Check your .env.local credentials');
    console.log('   3. Verify MySQL port (default: 3306)');
    console.log('   4. Make sure database exists\n');
  }
})();

