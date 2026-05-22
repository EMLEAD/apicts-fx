import { NextResponse } from 'next/server';
const cloudinary = require('@/lib/cloudinary/config');

export async function GET() {
  try {
    const config = cloudinary.config();
    
    // Attempt to ping using the SDK directly to see what error the SDK throws
    let pingResult = null;
    let pingError = null;
    
    try {
      pingResult = await cloudinary.api.ping();
    } catch (err) {
      pingError = {
        message: err.message,
        name: err.name,
        http_code: err.http_code,
        stack: err.stack
      };
    }
    
    return NextResponse.json({
      status: 'diagnostic',
      env_vars: {
        CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
        API_KEY: !!process.env.CLOUDINARY_API_KEY,
        API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
        CLOUDINARY_URL: process.env.CLOUDINARY_URL || null
      },
      sdk_config: {
        cloud_name: config.cloud_name,
        api_key: config.api_key,
        secure: config.secure
      },
      ping_result: pingResult,
      ping_error: pingError
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
