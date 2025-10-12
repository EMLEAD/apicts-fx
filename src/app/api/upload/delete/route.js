import { NextResponse } from 'next/server';
const { deleteFromCloudinary } = require('@/lib/cloudinary/upload');
const { authenticate } = require('@/lib/middleware/auth');

export async function DELETE(request) {
  try {
    // Authenticate user
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    const resourceType = searchParams.get('resourceType') || 'image';

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID is required' },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId, { resource_type: resourceType });

    if (result.result === 'ok' || result.result === 'not found') {
      return NextResponse.json(
        {
          message: 'File deleted successfully',
          publicId: publicId,
          result: result.result
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('File delete error:', error);
    return NextResponse.json(
      { error: 'File delete failed', details: error.message },
      { status: 500 }
    );
  }
}

