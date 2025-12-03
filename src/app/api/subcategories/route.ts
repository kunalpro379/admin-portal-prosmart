import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/product-service';

export async function GET() {
  try {
    const subcategories = await ProductService.getAllSubcategories();
    return NextResponse.json({ success: true, data: subcategories });
  } catch (error) {
    console.error('Error fetching all subcategories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subcategories' },
      { status: 500 }
    );
  }
}

