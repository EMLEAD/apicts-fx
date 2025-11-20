import { NextResponse } from 'next/server';
import { HeroContent } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';
import { Op } from 'sequelize';

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const hero = await HeroContent.findOne({
      where: { isActive: true },
      order: [['updatedAt', 'DESC']]
    });

    return NextResponse.json({ hero }, { status: 200 });
  } catch (error) {
    console.error('Error fetching hero content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero content', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      badge,
      title,
      titleHighlight,
      description,
      ctaPrimaryText,
      ctaPrimaryLink,
      ctaSecondaryText,
      ctaSecondaryLink,
      rating,
      customerCount,
      customerLabel,
      carouselImages,
      isActive = true
    } = body;

    // Validate required fields
    if (!title || !titleHighlight) {
      return NextResponse.json(
        { error: 'Title and title highlight are required' },
        { status: 400 }
      );
    }

    // Deactivate all existing hero content
    if (isActive) {
      await HeroContent.update(
        { isActive: false },
        { where: { isActive: true } }
      );
    }

    // Create new hero content
    const hero = await HeroContent.create({
      badge: badge || null,
      title,
      titleHighlight,
      description: description || null,
      ctaPrimaryText: ctaPrimaryText || 'Get Started Now',
      ctaPrimaryLink: ctaPrimaryLink || '/register',
      ctaSecondaryText: ctaSecondaryText || 'View Live Rates',
      ctaSecondaryLink: ctaSecondaryLink || '/rates',
      rating: rating || null,
      customerCount: customerCount || null,
      customerLabel: customerLabel || null,
      carouselImages: Array.isArray(carouselImages) ? carouselImages : [],
      isActive
    });

    return NextResponse.json({ hero }, { status: 201 });
  } catch (error) {
    console.error('Error creating hero content:', error);
    return NextResponse.json(
      { error: 'Failed to create hero content', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const auth = await authenticateAdmin(request, { allowRoles: ['super_admin', 'admin'] });
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      badge,
      title,
      titleHighlight,
      description,
      ctaPrimaryText,
      ctaPrimaryLink,
      ctaSecondaryText,
      ctaSecondaryLink,
      rating,
      customerCount,
      customerLabel,
      carouselImages,
      isActive
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Hero content ID is required' }, { status: 400 });
    }

    const hero = await HeroContent.findByPk(id);
    if (!hero) {
      return NextResponse.json({ error: 'Hero content not found' }, { status: 404 });
    }

    // If activating this hero, deactivate all others
    if (isActive === true) {
      await HeroContent.update(
        { isActive: false },
        { where: { isActive: true, id: { [Op.ne]: id } } }
      );
    }

    // Update hero content
    await hero.update({
      badge: badge !== undefined ? badge : hero.badge,
      title: title || hero.title,
      titleHighlight: titleHighlight || hero.titleHighlight,
      description: description !== undefined ? description : hero.description,
      ctaPrimaryText: ctaPrimaryText || hero.ctaPrimaryText,
      ctaPrimaryLink: ctaPrimaryLink || hero.ctaPrimaryLink,
      ctaSecondaryText: ctaSecondaryText || hero.ctaSecondaryText,
      ctaSecondaryLink: ctaSecondaryLink || hero.ctaSecondaryLink,
      rating: rating !== undefined ? rating : hero.rating,
      customerCount: customerCount !== undefined ? customerCount : hero.customerCount,
      customerLabel: customerLabel !== undefined ? customerLabel : hero.customerLabel,
      carouselImages: Array.isArray(carouselImages) ? carouselImages : hero.carouselImages,
      isActive: isActive !== undefined ? isActive : hero.isActive
    });

    return NextResponse.json({ hero }, { status: 200 });
  } catch (error) {
    console.error('Error updating hero content:', error);
    return NextResponse.json(
      { error: 'Failed to update hero content', details: error.message },
      { status: 500 }
    );
  }
}

