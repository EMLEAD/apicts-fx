import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { UserDocument, User } from '@/lib/db/models';
import { Op } from 'sequelize';

export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated || !['super_admin', 'admin', 'manager'].includes(auth.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const documentType = searchParams.get('documentType');

    const where = {};
    if (userId) where.userId = userId;
    if (status) where.verificationStatus = status;
    if (documentType) where.documentType = documentType;

    const documents = await UserDocument.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'profilePicture']
        },
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

    if (!documentType || !documentNumber || !fullName) {
      return NextResponse.json({ 
        error: 'Document type, number, and full name are required' 
      }, { status: 400 });
    }

    const existingDoc = await UserDocument.findOne({
      where: {
        documentType,
        documentNumber
      }
    });

    if (existingDoc) {
      return NextResponse.json({ 
        error: 'A document with this type and number already exists' 
      }, { status: 409 });
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
      metadata: metadata || {}
    });

    return NextResponse.json({ 
      message: 'Document submitted successfully',
      document 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user document:', error);
    return NextResponse.json({ error: error.message || 'Failed to create document' }, { status: 500 });
  }
}
