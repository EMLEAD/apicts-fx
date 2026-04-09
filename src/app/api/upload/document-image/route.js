import { NextResponse } from 'next/server';
const { uploadToCloudinary } = require('@/lib/cloudinary/upload');
const { authenticate } = require('@/lib/middleware/auth');

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const side = formData.get('side') || 'front';

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToCloudinary(buffer, {
      resource_type: 'auto',
      public_id: `document_${side}_${Date.now()}`,
      tags: ['document', side, `user_${auth.user.id}`]
    });

    return NextResponse.json({
      message: 'Document image uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      side
    }, { status: 200 });
  } catch (error) {
    console.error('Document image upload error:', error);
    return NextResponse.json(
      { error: 'Document image upload failed', details: error.message },
      { status: 500 }
    );
  }
}
