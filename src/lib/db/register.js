// Database initialization hook for Next.js
if (typeof window === 'undefined') {
  // Server-side only
  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '../../../.env.local') });
  
  // Initialize database immediately
  const { initializeDatabase } = require('./init');
  initializeDatabase().catch(err => {
    console.error('Database initialization failed:', err.message);
  });
}

