import { NextResponse } from 'next/server';
import { Testimonial } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const testimonials = await Testimonial.findAll({
      order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    return NextResponse.json({ success: true, testimonials }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin testimonials:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { authorName, authorRole, description, mediaType, mediaUrl, cloudinaryPublicId, thumbnailUrl, rating, isActive, displayOrder } = body;

    if (!authorName?.trim() || !description?.trim() || !mediaUrl?.trim()) {
      return NextResponse.json({ error: 'Author name, description, and media URL are required' }, { status: 400 });
    }

    if (!['youtube', 'url', 'upload'].includes(mediaType)) {
      return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
    }

    const testimonial = await Testimonial.create({
      authorName: authorName.trim(),
      authorRole: authorRole?.trim() || null,
      description: description.trim(),
      mediaType,
      mediaUrl: mediaUrl.trim(),
      cloudinaryPublicId: cloudinaryPublicId || null,
      thumbnailUrl: thumbnailUrl || null,
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      isActive: isActive !== false,
      displayOrder: Number(displayOrder) || 0
    });

    return NextResponse.json({ success: true, testimonial }, { status: 201 });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
