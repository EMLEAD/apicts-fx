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
      pingError = { message: err.message };
    }
    
    // Attempt a tiny test upload (POST request) to isolate WAF POST blocking
    let uploadResult = null;
    let uploadError = null;
    
    try {
      // Upload a tiny 1x1 pixel base64 image
      const tinyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      uploadResult = await cloudinary.uploader.upload(tinyImage, {
        folder: 'test_apicts',
        resource_type: 'image'
      });
      // Immediately delete the test image
      if (uploadResult && uploadResult.public_id) {
        await cloudinary.uploader.destroy(uploadResult.public_id);
      }
    } catch (err) {
      uploadError = { message: err.message };
    }
    
    return NextResponse.json({
      status: 'diagnostic',
      env_vars: {
        CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
        API_KEY: !!process.env.CLOUDINARY_API_KEY,
        API_SECRET: !!process.env.CLOUDINARY_API_SECRET
      },
      sdk_config: {
        cloud_name: config.cloud_name,
        api_key: config.api_key,
        secure: config.secure
      },
      ping_result: pingResult,
      ping_error: pingError,
      upload_result: uploadResult ? 'success' : null,
      upload_error: uploadError
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
