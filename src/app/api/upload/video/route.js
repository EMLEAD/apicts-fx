import { NextResponse } from 'next/server';
const { uploadToCloudinary } = require('@/lib/cloudinary/upload');

const ALLOWED_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo'
];

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('video');

    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Upload MP4, WebM, OGG, or MOV.' },
        { status: 400 }
      );
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 100MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'apicts/testimonials';

    const result = await uploadToCloudinary(buffer, {
      folder,
      resource_type: 'video',
      mimeType: file.type,
      tags: ['testimonial']
    });

    return NextResponse.json(
      {
        message: 'Video uploaded successfully',
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        duration: result.duration,
        thumbnailUrl: result.secure_url.replace('/upload/', '/upload/so_0/').replace(/\.(mp4|webm|mov)$/i, '.jpg')
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: 'Video upload failed', details: error.message },
      { status: 400 }
    );
  }
}
