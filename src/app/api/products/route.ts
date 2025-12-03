import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/product-service';
import { CloudinaryService } from '@/lib/cloudinary';

export async function GET() {
  try {
    const products = await ProductService.getAllProducts();
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const productName = formData.get('product_name') as string;
    const productTitle = formData.get('product_title') as string;
    const productDescription = formData.get('product_description') as string;
    const categoryId = formData.get('category_id') as string;
    const subcategoryId = formData.get('subcategory_id') as string;
    const categoryName = formData.get('category_name') as string;
    const subcategoryName = formData.get('subcategory_name') as string;

    // Validate required fields
    if (!productName || !productTitle || !productDescription || !categoryId || !subcategoryId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract image files
    const imageFiles: File[] = [];
    const entries = Array.from(formData.entries());
    
    for (const [key, value] of entries) {
      if (key.startsWith('images') && value instanceof File) {
        imageFiles.push(value);
      }
    }

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Generate product ID
    const productId = await ProductService.getNextProductId();

    // Convert files to buffers
    const imageBuffers: Buffer[] = [];
    for (const file of imageFiles) {
      const arrayBuffer = await file.arrayBuffer();
      imageBuffers.push(Buffer.from(arrayBuffer));
    }

    // Upload images to Cloudinary
    const imageUrls = await CloudinaryService.uploadMultipleImages(
      imageBuffers,
      productId,
      categoryName,
      subcategoryName
    );

    // Create product in database
    const productData = {
      product_name: productName,
      product_title: productTitle,
      product_description: productDescription,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      images: imageFiles // This won't be used in the service, but needed for type compatibility
    };

    const product = await ProductService.createProduct(productData, imageUrls);

    return NextResponse.json({ 
      success: true, 
      data: product,
      message: 'Product created successfully'
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
