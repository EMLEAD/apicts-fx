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
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToCloudinary(buffer, {
      resource_type: 'auto',
      public_id: `proof_of_payment_${auth.user.id}_${Date.now()}`,
      tags: ['proof-of-payment', `user_${auth.user.id}`]
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id
    }, { status: 200 });
  } catch (error) {
    console.error('Proof of payment upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}
