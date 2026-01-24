import { NextResponse } from 'next/server';
import { SiteSettings } from '@/lib/db/models';

export async function GET(request) {
  try {
    const settings = await SiteSettings.findOne({
      where: { isActive: true },
      order: [['updatedAt', 'DESC']]
    });

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        settings: {
          logoUrl: '/images/apicts-logo.jpg',
          logoWidth: 42,
          logoHeight: 42,
          socialLinks: {
            youtube: 'https://www.youtube.com/@apictsforex',
            twitter: '',
            linkedin: '',
            instagram: '',
            facebook: '',
            telegram: ''
          },
          contactInfo: {
            email: 'support@apicts.com',
            phone: '+2348139399978',
            address: 'Km 18, Topaz Plaza, New Road, Lekki Ajah, Lagos'
          }
        }
      }, { status: 200 });
    }

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site settings', details: error.message },
      { status: 500 }
    );
  }
}
