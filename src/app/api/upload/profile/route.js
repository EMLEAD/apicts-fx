import { NextResponse } from 'next/server';
const { uploadToCloudinary } = require('@/lib/cloudinary/upload');
const { User } = require('@/lib/db/models');
const { authenticate } = require('@/lib/middleware/auth');

export async function POST(request) {
  try {
    // Authenticate user
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('profilePicture');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images (JPEG, PNG, WebP) are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 2MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with transformations
    const result = await uploadToCloudinary(buffer, {
      folder: 'apicts/profiles',
      resource_type: 'image',
      public_id: `user_${auth.user.id}_${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      overwrite: true
    });

    // Update user profile picture in database
    await User.update(
      { profilePicture: result.secure_url },
      { where: { id: auth.user.id } }
    );

    return NextResponse.json(
      {
        message: 'Profile picture uploaded successfully',
        url: result.secure_url,
        publicId: result.public_id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json(
      { error: 'Profile picture upload failed', details: error.message },
      { status: 500 }
    );
  }
}

