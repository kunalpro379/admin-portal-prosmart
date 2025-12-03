import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/product-service';
import { CloudinaryService } from '@/lib/cloudinary';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const product = await ProductService.getProductById(productId);
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const body = await request.json();

    await ProductService.updateProduct(productId, body);

    return NextResponse.json({ 
      success: true, 
      message: 'Product updated successfully' 
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    
    // Get product details first to delete images from Cloudinary
    const product = await ProductService.getProductById(productId);
    if (product) {
      // Delete images from Cloudinary
      for (const imageUrl of product.image_urls) {
        const publicId = CloudinaryService.extractPublicIdFromUrl(imageUrl);
        if (publicId) {
          await CloudinaryService.deleteImage(publicId);
        }
      }
    }

    await ProductService.deleteProduct(productId);

    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
