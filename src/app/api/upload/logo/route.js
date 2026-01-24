import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';
const { uploadToCloudinary } = require('@/lib/cloudinary/upload');

export async function POST(request) {
  try {
    // Authenticate admin
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP, SVG) are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (2MB for logos)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 2MB for logos.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary in logos folder
    const result = await uploadToCloudinary(buffer, {
      folder: 'apicts/logos',
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return NextResponse.json(
      {
        message: 'Logo uploaded successfully',
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: 'Logo upload failed', details: error.message },
      { status: 500 }
    );
  }
}
