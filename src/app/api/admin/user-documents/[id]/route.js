import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { UserDocument, User } from '@/lib/db/models';

export async function GET(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const document = await UserDocument.findByPk(id, {
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
      ]
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.userId !== auth.user.id && !['super_admin', 'admin', 'manager'].includes(auth.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ document }, { status: 200 });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch document' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated || !['super_admin', 'admin', 'manager'].includes(auth.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { verificationStatus, rejectionReason, verificationMethod, apiResponse } = body;

    const document = await UserDocument.findByPk(id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const updateData = {};
    
    if (verificationStatus) {
      updateData.verificationStatus = verificationStatus;
      
      if (verificationStatus === 'verified') {
        updateData.verifiedAt = new Date();
        updateData.verifiedBy = auth.user.id;
      }
      
      if (verificationStatus === 'rejected' && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
    }

    if (verificationMethod) {
      updateData.verificationMethod = verificationMethod;
    }

    if (apiResponse) {
      updateData.apiResponse = apiResponse;
    }

    await document.update(updateData);

    const updatedDocument = await UserDocument.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'profilePicture']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    return NextResponse.json({ 
      message: 'Document updated successfully',
      document: updatedDocument 
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: error.message || 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated || !['super_admin', 'admin'].includes(auth.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const document = await UserDocument.findByPk(id);
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await document.destroy();

    return NextResponse.json({ 
      message: 'Document deleted successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete document' }, { status: 500 });
  }
}
