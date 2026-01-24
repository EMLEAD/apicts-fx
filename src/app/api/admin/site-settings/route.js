import { NextResponse } from 'next/server';
import { SiteSettings } from '@/lib/db/models';
import { authenticateAdmin } from '@/lib/middleware/adminAuth';
import { Op } from 'sequelize';

export async function GET(request) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const settings = await SiteSettings.findOne({
      where: { isActive: true },
      order: [['updatedAt', 'DESC']]
    });

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site settings', details: error.message },
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
      logoUrl,
      logoWidth,
      logoHeight,
      socialLinks,
      contactInfo,
      isActive = true
    } = body;

    // Deactivate all existing settings
    if (isActive) {
      await SiteSettings.update(
        { isActive: false },
        { where: { isActive: true } }
      );
    }

    // Create new settings
    const settings = await SiteSettings.create({
      logoUrl: logoUrl || '/images/apicts-logo.jpg',
      logoWidth: logoWidth || 42,
      logoHeight: logoHeight || 42,
      socialLinks: socialLinks || {
        youtube: '',
        twitter: '',
        linkedin: '',
        instagram: '',
        facebook: '',
        telegram: ''
      },
      contactInfo: contactInfo || {
        email: 'support@apicts.com',
        phone: '+2348139399978',
        address: 'Km 18, Topaz Plaza, New Road, Lekki Ajah, Lagos'
      },
      isActive
    });

    return NextResponse.json({ settings }, { status: 201 });
  } catch (error) {
    console.error('Error creating site settings:', error);
    return NextResponse.json(
      { error: 'Failed to create site settings', details: error.message },
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
      logoUrl,
      logoWidth,
      logoHeight,
      socialLinks,
      contactInfo,
      isActive
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Settings ID is required' }, { status: 400 });
    }

    const settings = await SiteSettings.findByPk(id);
    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    // If activating this settings, deactivate all others
    if (isActive === true) {
      await SiteSettings.update(
        { isActive: false },
        { where: { isActive: true, id: { [Op.ne]: id } } }
      );
    }

    // Update settings
    await settings.update({
      logoUrl: logoUrl !== undefined ? logoUrl : settings.logoUrl,
      logoWidth: logoWidth !== undefined ? logoWidth : settings.logoWidth,
      logoHeight: logoHeight !== undefined ? logoHeight : settings.logoHeight,
      socialLinks: socialLinks !== undefined ? socialLinks : settings.socialLinks,
      contactInfo: contactInfo !== undefined ? contactInfo : settings.contactInfo,
      isActive: isActive !== undefined ? isActive : settings.isActive
    });

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { error: 'Failed to update site settings', details: error.message },
      { status: 500 }
    );
  }
}
