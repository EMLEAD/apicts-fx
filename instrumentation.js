// Next.js instrumentation hook for server startup
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side initialization
    const path = await import('path');
    const dotenv = await import('dotenv');
    const { fileURLToPath } = await import('url');
    
    // Load environment variables
    dotenv.config({ path: '.env.local' });
    
    // Initialize database
    try {
      const { initializeDatabase } = await import('./src/lib/db/init.js');
      await initializeDatabase();
    } catch (error) {
      console.error('Failed to initialize database:', error.message);
    }
  }
}

