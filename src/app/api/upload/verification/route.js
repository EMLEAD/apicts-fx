import { NextResponse } from 'next/server';
const { uploadMultipleToCloudinary } = require('@/lib/cloudinary/upload');
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
    const idDocument = formData.get('idDocument');
    const proofOfAddress = formData.get('proofOfAddress');
    const selfie = formData.get('selfie');

    if (!idDocument || !selfie) {
      return NextResponse.json(
        { error: 'ID document and selfie are required' },
        { status: 400 }
      );
    }

    const files = [];
    const fileDetails = [];

    // Process ID document
    if (idDocument) {
      const bytes = await idDocument.arrayBuffer();
      files.push({
        buffer: Buffer.from(bytes),
        type: 'idDocument',
        originalName: idDocument.name
      });
    }

    // Process proof of address (optional)
    if (proofOfAddress) {
      const bytes = await proofOfAddress.arrayBuffer();
      files.push({
        buffer: Buffer.from(bytes),
        type: 'proofOfAddress',
        originalName: proofOfAddress.name
      });
    }

    // Process selfie
    if (selfie) {
      const bytes = await selfie.arrayBuffer();
      files.push({
        buffer: Buffer.from(bytes),
        type: 'selfie',
        originalName: selfie.name
      });
    }

    // Upload all files to Cloudinary
    const uploadPromises = files.map(file => 
      uploadToCloudinary(file.buffer, {
        folder: `apicts/verification/${auth.user.id}`,
        resource_type: 'auto',
        public_id: `${file.type}_${Date.now()}`,
        tags: ['verification', file.type, `user_${auth.user.id}`]
      }).then(result => ({
        type: file.type,
        url: result.secure_url,
        publicId: result.public_id,
        originalName: file.originalName
      }))
    );

    const results = await Promise.all(uploadPromises);

    return NextResponse.json(
      {
        message: 'Verification documents uploaded successfully',
        documents: results,
        userId: auth.user.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification upload error:', error);
    return NextResponse.json(
      { error: 'Verification documents upload failed', details: error.message },
      { status: 500 }
    );
  }
}

