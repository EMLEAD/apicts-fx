import { NextResponse } from 'next/server';
import { Testimonial } from '@/lib/db/models';

export async function GET() {
  try {
    const testimonials = await Testimonial.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']],
      attributes: [
        'id',
        'authorName',
        'authorRole',
        'description',
        'mediaType',
        'mediaUrl',
        'thumbnailUrl',
        'rating',
        'displayOrder'
      ]
    });

    return NextResponse.json({ success: true, testimonials }, { status: 200 });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
