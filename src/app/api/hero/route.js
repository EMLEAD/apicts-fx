import { NextResponse } from 'next/server';
import { HeroContent } from '@/lib/db/models';

export async function GET() {
  try {
    // Get the active hero content (only one should be active at a time)
    const hero = await HeroContent.findOne({
      where: { isActive: true },
      order: [['updatedAt', 'DESC']]
    });

    // If no active hero, return default values
    if (!hero) {
      return NextResponse.json({
        success: true,
        hero: {
          badge: '🇳🇬 CAC Registered • Leading Exchange Provider',
          title: 'Global Currency Exchange',
          titleHighlight: 'Made Simple',
          description: 'Trade fiat currencies, e-currencies, and cryptocurrencies with confidence. Secure, fast, and reliable exchange services powered by advanced technology.',
          ctaPrimaryText: 'Get Started Now',
          ctaPrimaryLink: '/register',
          ctaSecondaryText: 'View Live Rates',
          ctaSecondaryLink: '/rates',
          rating: '4.9/5 Rating',
          customerCount: '10,000+',
          customerLabel: 'Happy Customers',
          carouselImages: [
            '/images/software-pc-screen-used-analyzing-cryptocurrency-investment-purchases.jpg',
            '/images/chart.jpg',
            '/images/deriv.jpg'
          ]
        }
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      hero: {
        badge: hero.badge,
        title: hero.title,
        titleHighlight: hero.titleHighlight,
        description: hero.description,
        ctaPrimaryText: hero.ctaPrimaryText,
        ctaPrimaryLink: hero.ctaPrimaryLink,
        ctaSecondaryText: hero.ctaSecondaryText,
        ctaSecondaryLink: hero.ctaSecondaryLink,
        rating: hero.rating,
        customerCount: hero.customerCount,
        customerLabel: hero.customerLabel,
        carouselImages: hero.carouselImages || []
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching hero content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero content', details: error.message },
      { status: 500 }
    );
  }
}

