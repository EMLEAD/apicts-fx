import { NextResponse } from 'next/server';
const { uploadToCloudinary } = require('@/lib/cloudinary/upload');

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('document');
    const documentType = formData.get('documentType') || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, DOCX, and images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, {
      folder: `apicts/documents/${documentType}`,
      resource_type: 'auto',
      tags: [documentType, 'document']
    });

    return NextResponse.json(
      {
        message: 'Document uploaded successfully',
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        documentType: documentType
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Document upload failed', details: error.message },
      { status: 500 }
    );
  }
}

