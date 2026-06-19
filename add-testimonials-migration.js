require('dotenv').config({ path: '.env.local' });
const { sequelize } = require('./src/lib/db/sequelize');
const TestimonialModel = require('./src/lib/db/models/Testimonial');

async function migrate() {
  try {
    const Testimonial = TestimonialModel(sequelize);
    await Testimonial.sync({ alter: true });
    console.log('✅ testimonials table ready');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
