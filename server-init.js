// This file initializes the database when the server starts
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

// Import the initialization function
const { initializeDatabase } = require('./src/lib/db/init');

// Run initialization
console.log('🚀 Starting server initialization...\n');
initializeDatabase();

