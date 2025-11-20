/**
 * Seed script to populate the Hero section with current content
 * Run: node seed-hero-content.js
 */

require('dotenv').config({ path: '.env.local' });
const { sequelize } = require('./src/lib/db/sequelize');
const { HeroContent } = require('./src/lib/db/models');

async function seedHeroContent() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Ensure HeroContent table exists with correct collation
    await HeroContent.sync({ alter: true });
    console.log('HeroContent table synchronized.');

    // Fix collation if needed
    try {
      await sequelize.query(`
        ALTER TABLE hero_content 
        CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      console.log('Table collation updated to utf8mb4_unicode_ci.');
    } catch (error) {
      // Ignore if already correct or table doesn't exist
      if (!error.message.includes('Unknown table') && !error.message.includes('Duplicate')) {
        console.log('Note: Could not update collation (may already be correct).');
      }
    }

    // Check if active hero content already exists
    const existingHero = await HeroContent.findOne({
      where: { isActive: true }
    });

    if (existingHero) {
      console.log('Active hero content already exists. Updating with current content...');
      
      await existingHero.update({
        badge: '🇳🇬 CAC Registered • Leading Exchange Provider',
        title: 'Global Currency Exchange',
        titleHighlight: 'Made Simple',
        description: 'Trade fiat currencies, e-currencies, and cryptocurrencies with confidence. Secure, fast, and reliable exchange services powered by advanced technology.',
        ctaPrimaryText: 'Get Started Now',
        ctaPrimaryLink: '/register',
        ctaSecondaryText: 'View Live Rates',
        ctaSecondaryLink: '/rates',
        rating: '4.9/5 Rating',
        customerCount: '10,000+',
        customerLabel: 'Happy Customers',
        carouselImages: [
          '/images/software-pc-screen-used-analyzing-cryptocurrency-investment-purchases.jpg',
          '/images/chart.jpg',
          '/images/deriv.jpg'
        ],
        isActive: true
      });

      console.log('✅ Hero content updated successfully!');
      console.log('Hero ID:', existingHero.id);
    } else {
      console.log('No active hero content found. Creating new hero content...');
      
      // Deactivate any existing hero content (just in case)
      await HeroContent.update(
        { isActive: false },
        { where: { isActive: true } }
      );

      // Create new hero content
      const hero = await HeroContent.create({
        badge: '🇳🇬 CAC Registered • Leading Exchange Provider',
        title: 'Global Currency Exchange',
        titleHighlight: 'Made Simple',
        description: 'Trade fiat currencies, e-currencies, and cryptocurrencies with confidence. Secure, fast, and reliable exchange services powered by advanced technology.',
        ctaPrimaryText: 'Get Started Now',
        ctaPrimaryLink: '/register',
        ctaSecondaryText: 'View Live Rates',
        ctaSecondaryLink: '/rates',
        rating: '4.9/5 Rating',
        customerCount: '10,000+',
        customerLabel: 'Happy Customers',
        carouselImages: [
          '/images/software-pc-screen-used-analyzing-cryptocurrency-investment-purchases.jpg',
          '/images/chart.jpg',
          '/images/deriv.jpg'
        ],
        isActive: true
      });

      console.log('✅ Hero content created successfully!');
      console.log('Hero ID:', hero.id);
    }

    console.log('\nHero Content Details:');
    console.log('- Badge:', '🇳🇬 CAC Registered • Leading Exchange Provider');
    console.log('- Title:', 'Global Currency Exchange');
    console.log('- Title Highlight:', 'Made Simple');
    console.log('- Carousel Images:', 3, 'images');
    console.log('- Status: Active');

  } catch (error) {
    console.error('❌ Error seeding hero content:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\nDatabase connection closed.');
  }
}

// Run the seed function
seedHeroContent();

