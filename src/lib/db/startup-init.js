// This file runs database initialization at server startup
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env.local') });

// Dynamic import to handle both CommonJS and ESM
const initDB = async () => {
  try {
    const { initializeDatabase } = await import('./init.js');
    await initializeDatabase();
  } catch (error) {
    console.error('Startup initialization failed:', error.message);
  }
};

// Run initialization
initDB();

export { initDB };

