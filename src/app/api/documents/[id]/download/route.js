import { NextResponse } from 'next/server';
import { Document } from '@/lib/db/models';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    
    const document = await Document.findByPk(id);
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Increment download count
    await document.increment('downloads');

    return NextResponse.json({ 
      success: true,
      message: 'Download tracked successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('Error tracking download:', error);
    return NextResponse.json(
      { error: 'Failed to track download' },
      { status: 500 }
    );
  }
}
