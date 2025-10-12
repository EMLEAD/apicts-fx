import { NextResponse } from 'next/server';

// Import database initialization
import './lib/db/register';

// Initialize database on first API request (backup if startup init didn't run)
let isInitializing = false;
let isInitialized = false;

export async function middleware(request) {
  // Only initialize once (fallback if startup init didn't work)
  if (!isInitialized && !isInitializing) {
    isInitializing = true;
    
    // Initialize database in the background
    if (typeof window === 'undefined') {
      // Server-side only
      try {
        const { initializeDatabase } = require('./lib/db/init');
        const success = await initializeDatabase();
        isInitialized = success;
      } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Middleware: Failed to initialize database:', error.message);
      }
    }
    
    isInitializing = false;
  }

  return NextResponse.next();
}

// Only run middleware for API routes
export const config = {
  matcher: '/api/:path*',
};

