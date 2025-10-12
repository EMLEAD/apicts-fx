import { NextResponse } from 'next/server';
const { sequelize } = require('@/lib/db/sequelize');

export async function GET() {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    return NextResponse.json(
      {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}

