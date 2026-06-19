import { NextResponse } from 'next/server';
import { Testimonial } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';
const { deleteFromCloudinary } = require('@/lib/cloudinary/upload');

export async function PUT(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    await testimonial.update(body);

    return NextResponse.json({ success: true, testimonial }, { status: 200 });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const testimonial = await Testimonial.findByPk(id);

    if (!testimonial) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    if (testimonial.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(testimonial.cloudinaryPublicId, { resource_type: 'video' });
      } catch (err) {
        console.error('Cloudinary delete failed:', err.message);
      }
    }

    await testimonial.destroy();

    return NextResponse.json({ success: true, message: 'Deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
