import { NextResponse } from 'next/server';
import { Product } from '@/lib/db/models';

export async function GET() {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}
