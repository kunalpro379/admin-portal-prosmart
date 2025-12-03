import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/product-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = params;
    const subcategories = await ProductService.getSubcategoriesByCategory(categoryId);
    return NextResponse.json({ success: true, data: subcategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subcategories' },
      { status: 500 }
    );
  }
}
