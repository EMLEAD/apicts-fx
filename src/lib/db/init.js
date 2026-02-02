const { testConnection, sequelize } = require('./sequelize');
const { syncDatabase, Plan, UserPlan, Coupon, CouponRedemption, Referral, AffiliateApplication, User, HeroContent, UserDocument } = require('./models');

let isInitialized = false;

const ensureAdditionalTables = async () => {
  try {
    if (User) {
      await User.sync({ alter: true });
    }
    if (Plan) {
      await Plan.sync({ alter: true });
    }
    if (UserPlan) {
      await UserPlan.sync({ alter: true });
    }
    if (Coupon) {
      await Coupon.sync({ alter: true });
    }
    if (CouponRedemption) {
      await CouponRedemption.sync({ alter: true });
    }
    if (Referral) {
      await Referral.sync({ alter: true });
    }
    if (AffiliateApplication) {
      await AffiliateApplication.sync({ alter: true });
    }
    if (HeroContent) {
      await HeroContent.sync({ alter: true });
    }
    if (UserDocument) {
      await UserDocument.sync({ alter: true });
    }
  } catch (syncError) {
    console.log('\x1b[33m%s\x1b[0m', '⚠️  Failed to ensure new tables with alter:true, attempting alter:false...');
    if (Plan) {
      await Plan.sync({ alter: false });
    }
    if (UserPlan) {
      await UserPlan.sync({ alter: false });
    }
    if (User) {
      await User.sync({ alter: false });
    }
    if (Coupon) {
      await Coupon.sync({ alter: false });
    }
    if (CouponRedemption) {
      await CouponRedemption.sync({ alter: false });
    }
    if (Referral) {
      await Referral.sync({ alter: false });
    }
    if (AffiliateApplication) {
      await AffiliateApplication.sync({ alter: false });
    }
    if (HeroContent) {
      await HeroContent.sync({ alter: false });
    }
    if (UserDocument) {
      await UserDocument.sync({ alter: false });
    }
  }
};

const initializeDatabase = async () => {
  if (isInitialized) {
    console.log('\x1b[33m%s\x1b[0m', '⚠️  Database already initialized – ensuring new tables exist');
    await ensureAdditionalTables();
    return true;
  }

  console.log('\n' + '='.repeat(60));
  console.log('\x1b[36m%s\x1b[0m', '🔄 INITIALIZING DATABASE CONNECTION...');
  console.log('='.repeat(60));

  try {
    // Test connection
    const connected = await testConnection();
    
    if (!connected) {
      console.log('\n' + '='.repeat(60));
      console.log('\x1b[31m%s\x1b[0m', '❌ DATABASE CONNECTION FAILED');
      console.log('='.repeat(60));
      console.error('\x1b[31m%s\x1b[0m', '   ❌ Could not connect to MySQL database');
      console.error('\x1b[33m%s\x1b[0m', '   📝 Troubleshooting:');
      console.error('      1. Check if MySQL is running');
      console.error('      2. Verify .env.local credentials');
      console.error('      3. Make sure database "apicts_db" exists');
      console.error('      4. Check MySQL port (default: 3306)');
      console.error('\x1b[33m%s\x1b[0m', '   📖 See QUICK_START.md for setup instructions');
      console.log('='.repeat(60) + '\n');
      return false;
    }

    // Sync database tables
    console.log('\x1b[36m%s\x1b[0m', '🔄 Synchronizing database tables...');
    await syncDatabase({ force: false, alter: false });

    // Ensure newly added models are created if they do not exist yet
    await ensureAdditionalTables();
    
    isInitialized = true;
    
    console.log('\n' + '='.repeat(60));
    console.log('\x1b[32m%s\x1b[0m', '✅ DATABASE CONNECTED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\x1b[32m%s\x1b[0m', '   ✅ MySQL connection established');
    console.log('\x1b[32m%s\x1b[0m', '   ✅ Tables synchronized');
    console.log('\x1b[36m%s\x1b[0m', '   📊 Available models: User, Contact, Plan, UserPlan, Coupon, CouponRedemption, Referral, Transaction, ExchangeRate, BlogPost, VlogPost, HeroContent');
    console.log('\x1b[36m%s\x1b[0m', '   🌐 API endpoints ready at /api/*');
    console.log('='.repeat(60) + '\n');
    
    return true;
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('\x1b[31m%s\x1b[0m', '❌ DATABASE INITIALIZATION ERROR');
    console.log('='.repeat(60));
    console.error('\x1b[31m%s\x1b[0m', `   ❌ Error: ${error.message}`);
    console.error('\x1b[33m%s\x1b[0m', '   📖 Check BACKEND_SETUP.md for setup instructions');
    console.log('='.repeat(60) + '\n');
    return false;
  }
};

// Initialize on module load (can be disabled with SKIP_AUTO_DB_INIT=true)
if (process.env.SKIP_AUTO_DB_INIT !== 'true') {
  if (!global.__DB_AUTO_INIT_STARTED__) {
    global.__DB_AUTO_INIT_STARTED__ = true;
    initializeDatabase().catch((error) => {
      console.error('Database auto-initialization failed:', error.message);
    });
  }
}

module.exports = { initializeDatabase };

