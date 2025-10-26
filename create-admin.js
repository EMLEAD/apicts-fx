const { initializeDatabase } = require('./src/lib/db/init');
const { User } = require('./src/lib/db/models');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdminUser() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('\x1b[36m%s\x1b[0m', '🔄 CREATING ADMIN USER...');
    console.log('='.repeat(60) + '\n');

    // Initialize database
    await initializeDatabase();

    // Get user input
    const username = await question('Enter username: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password: ');

    if (!username || !email || !password) {
      console.log('\x1b[31m%s\x1b[0m', '❌ All fields are required!');
      rl.close();
      process.exit(1);
    }

    // Check if user already exists
    const { Op } = require('sequelize');
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      console.log('\x1b[31m%s\x1b[0m', '❌ User already exists with this email or username!');
      console.log('\x1b[33m%s\x1b[0m', 'If you want to make this user an admin, run: UPDATE users SET role=\'admin\' WHERE email=\'' + email + '\';');
      rl.close();
      process.exit(1);
    }

    // Create admin user
    const adminUser = await User.create({
      username,
      email,
      password,
      role: 'admin',
      isActive: true
    });

    console.log('\n' + '='.repeat(60));
    console.log('\x1b[32m%s\x1b[0m', '✅ ADMIN USER CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\x1b[36m%s\x1b[0m', '   👤 Username: ' + adminUser.username);
    console.log('\x1b[36m%s\x1b[0m', '   📧 Email: ' + adminUser.email);
    console.log('\x1b[36m%s\x1b[0m', '   🔑 Role: ADMIN');
    console.log('\x1b[36m%s\x1b[0m', '   ✅ Active: ' + adminUser.isActive);
    console.log('\x1b[32m%s\x1b[0m', '   🌐 Login at: /login');
    console.log('\x1b[32m%s\x1b[0m', '   🎯 Admin Dashboard: /admin');
    console.log('='.repeat(60) + '\n');

    rl.close();
    process.exit(0);

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('\x1b[31m%s\x1b[0m', '❌ ERROR CREATING ADMIN USER');
    console.log('='.repeat(60));
    console.error('\x1b[31m%s\x1b[0m', '   ' + error.message);
    console.log('='.repeat(60) + '\n');
    rl.close();
    process.exit(1);
  }
}

createAdminUser();

