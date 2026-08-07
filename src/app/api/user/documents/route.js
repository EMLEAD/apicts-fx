import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { UserDocument, User } from '@/lib/db/models';
import { verifyWithPrembly } from '@/lib/prembly/verification';

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

    if (!documentNumber) {
      return NextResponse.json({
        error: 'Document number is required for verification'
      }, { status: 400 });
    }

    const validDocumentTypes = ['nin', 'drivers_license', 'voters_card', 'international_passport'];
    if (!validDocumentTypes.includes(documentType)) {
      return NextResponse.json({
        error: 'Invalid document type. Must be one of: nin, drivers_license, voters_card, international_passport'
      }, { status: 400 });
    }

    if (documentType === 'nin' && !/^\d{11}$/.test(documentNumber)) {
      return NextResponse.json({
        error: 'Invalid NIN. A NIN must be exactly 11 digits (e.g. 56182742701).'
      }, { status: 400 });
    }

    const document = await UserDocument.create({
      userId: auth.user.id,
      documentType,
      documentNumber,
      fullName: fullName || null,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      documentImageFront: documentImageFront || null,
      documentImageBack: documentImageBack || null,
      expiryDate: expiryDate || null,
      verificationStatus: 'pending',
      verificationMethod: 'manual',
      metadata: metadata || {}
    });

    const isApiVerifiable = ['nin', 'drivers_license', 'voters_card'].includes(documentType);

    if (isApiVerifiable) {
      try {
        const verification = await verifyWithPrembly(documentType, documentNumber, fullName);

        if (verification.verified && verification.extractedData) {
          const updates = {
            verificationStatus: 'verified',
            verificationMethod: 'api',
            verifiedAt: new Date(),
            fullName: verification.extractedData.fullName || fullName,
            dateOfBirth: verification.extractedData.dateOfBirth || dateOfBirth,
            gender: verification.extractedData.gender || gender,
            apiResponse: verification.apiResponse,
          };

          if (verification.extractedData.expiryDate) {
            updates.expiryDate = verification.extractedData.expiryDate;
          }

          await document.update(updates);
        } else {
          await document.update({
            verificationStatus: 'rejected',
            verificationMethod: 'api',
            rejectionReason: verification.reason || 'Document verification failed',
            apiResponse: verification.apiResponse,
          });
        }
      } catch (error) {
        console.error('Prembly auto-verification error:', error);
        await document.update({
          metadata: {
            ...(document.metadata || {}),
            premblyError: error.message,
            premblyErrorTime: new Date().toISOString(),
          },
        });
      }
    }

    const updatedDocument = await UserDocument.findByPk(document.id, {
      include: [
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ]
    });

    const isVerified = updatedDocument.verificationStatus === 'verified';

    return NextResponse.json({
      message: isVerified
        ? 'Document verified successfully'
        : 'Document submitted successfully. It will be reviewed by our team.',
      document: updatedDocument
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user document:', error);
    return NextResponse.json({ error: error.message || 'Failed to create document' }, { status: 500 });
  }
}
