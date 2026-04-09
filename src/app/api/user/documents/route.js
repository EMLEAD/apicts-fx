import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { UserDocument, User } from '@/lib/db/models';

export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documents = await UserDocument.findAll({
      where: { userId: auth.user.id },
      include: [
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user documents:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

      const body = await request.json();
    const {
      documentType,
      documentNumber,
      fullName,
      dateOfBirth,
      gender,
      documentImageFront,
      documentImageBack,
      expiryDate,
      metadata
    } = body;

    if (!documentType) {
      return NextResponse.json({ 
        error: 'Document type is required' 
      }, { status: 400 });
    }

    if (!documentImageFront) {
      return NextResponse.json({ 
        error: 'Document image is required' 
      }, { status: 400 });
    }

    const validDocumentTypes = ['nin', 'drivers_license', 'voters_card', 'international_passport'];
    if (!validDocumentTypes.includes(documentType)) {
      return NextResponse.json({ 
        error: 'Invalid document type. Must be one of: nin, drivers_license, voters_card, international_passport' 
      }, { status: 400 });
    }

    const document = await UserDocument.create({
      userId: auth.user.id,
      documentType,
      documentNumber,
      fullName,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      documentImageFront: documentImageFront || null,
      documentImageBack: documentImageBack || null,
      expiryDate: expiryDate || null,
      verificationStatus: 'pending',
      verificationMethod: 'manual',
      metadata: metadata || {}
    });

    return NextResponse.json({ 
      message: 'Document submitted successfully. It will be reviewed by our team.',
      document 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user document:', error);
    return NextResponse.json({ error: error.message || 'Failed to create document' }, { status: 500 });
  }
}
