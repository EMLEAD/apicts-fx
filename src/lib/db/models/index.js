const { sequelize } = require('../sequelize');
const UserModel = require('./User');
const ContactModel = require('./Contact');
const TransactionModel = require('./Transaction');
const ExchangeRateModel = require('./ExchangeRate');
const BlogPostModel = require('./BlogPost');
const VlogPostModel = require('./VlogPost');
const BlogCommentModel = require('./BlogComment');
const BlogLikeModel = require('./BlogLike');
const PlanModel = require('./Plan');
const UserPlanModel = require('./UserPlan');
const CouponModel = require('./Coupon');
const CouponRedemptionModel = require('./CouponRedemption');
const ReferralModel = require('./Referral');
const AffiliateApplicationModel = require('./AffiliateApplication');

// Initialize models
const User = UserModel(sequelize);
const Contact = ContactModel(sequelize);
const Transaction = TransactionModel(sequelize);
const ExchangeRate = ExchangeRateModel(sequelize);
const BlogPost = BlogPostModel(sequelize);
const VlogPost = VlogPostModel(sequelize);
const BlogComment = BlogCommentModel(sequelize);
const BlogLike = BlogLikeModel(sequelize);
const Plan = PlanModel(sequelize);
const UserPlan = UserPlanModel(sequelize);
const Coupon = CouponModel(sequelize);
const CouponRedemption = CouponRedemptionModel(sequelize);
const Referral = ReferralModel(sequelize);
const AffiliateApplication = AffiliateApplicationModel(sequelize);

// Define associations
User.hasMany(Contact, { foreignKey: 'userId', as: 'contacts' });
Contact.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(BlogPost, { foreignKey: 'authorId', as: 'blogPosts' });
BlogPost.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

User.hasMany(VlogPost, { foreignKey: 'authorId', as: 'vlogPosts' });
VlogPost.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

User.hasMany(ExchangeRate, { foreignKey: 'updatedBy', as: 'rateUpdates' });
ExchangeRate.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });

// Blog Comments associations
User.hasMany(BlogComment, { foreignKey: 'userId', as: 'blogComments' });
BlogComment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
BlogPost.hasMany(BlogComment, { foreignKey: 'postId', as: 'comments' });
BlogComment.belongsTo(BlogPost, { foreignKey: 'postId', as: 'post' });
BlogComment.belongsTo(BlogComment, { foreignKey: 'parentId', as: 'parent' });
BlogComment.hasMany(BlogComment, { foreignKey: 'parentId', as: 'replies' });

// Blog Likes associations
User.hasMany(BlogLike, { foreignKey: 'userId', as: 'blogLikes' });
BlogLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });
BlogPost.hasMany(BlogLike, { foreignKey: 'postId', as: 'likes' });
BlogLike.belongsTo(BlogPost, { foreignKey: 'postId', as: 'post' });

// Plans associations
Plan.hasMany(UserPlan, { foreignKey: 'planId', as: 'subscriptions', onDelete: 'CASCADE' });
UserPlan.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });
User.hasMany(UserPlan, { foreignKey: 'userId', as: 'planSubscriptions', onDelete: 'CASCADE' });
UserPlan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Coupons associations
Coupon.hasMany(CouponRedemption, { foreignKey: 'couponId', as: 'redemptions', onDelete: 'CASCADE' });
CouponRedemption.belongsTo(Coupon, { foreignKey: 'couponId', as: 'coupon' });
User.hasMany(CouponRedemption, { foreignKey: 'userId', as: 'couponRedemptions', onDelete: 'CASCADE' });
CouponRedemption.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Transaction.hasMany(CouponRedemption, { foreignKey: 'transactionId', as: 'couponRedemptions', onDelete: 'SET NULL' });
CouponRedemption.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

// Referrals associations
User.hasMany(Referral, { foreignKey: 'referrerId', as: 'referralsMade', onDelete: 'SET NULL' });
User.hasMany(Referral, { foreignKey: 'referredUserId', as: 'referralsReceived', onDelete: 'SET NULL' });
Referral.belongsTo(User, { foreignKey: 'referrerId', as: 'referrer' });
Referral.belongsTo(User, { foreignKey: 'referredUserId', as: 'referredUser' });
Plan.hasMany(Referral, { foreignKey: 'planId', as: 'planReferrals', onDelete: 'SET NULL' });
Referral.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

// Affiliate applications associations
User.hasMany(AffiliateApplication, { foreignKey: 'userId', as: 'affiliateApplications', onDelete: 'SET NULL' });
AffiliateApplication.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Sync database
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('\x1b[32m%s\x1b[0m', '   ✅ Database tables synchronized');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `   ❌ Sync error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Contact,
  Transaction,
  ExchangeRate,
  BlogPost,
  VlogPost,
  BlogComment,
  BlogLike,
  Plan,
  UserPlan,
  Coupon,
  CouponRedemption,
  Referral,
  AffiliateApplication,
  syncDatabase
};

