import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'demo';
    const testUrl = `https://api.cloudinary.com/v1_1/${cloudName}/ping`;
    
    const response = await fetch(testUrl, {
      method: 'GET'
    });
    
    const text = await response.text();
    
    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      bodyPreview: text.substring(0, 1000)
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
