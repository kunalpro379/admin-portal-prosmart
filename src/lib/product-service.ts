import { getDatabase } from './mongodb';
import { Product, Category, Subcategory, ProductFormData } from '@/types/product';

export class ProductService {
  static async getNextProductId(): Promise<string> {
    const db = await getDatabase();
    const products = db.collection('products');
    
    // Find the highest existing product ID
    const pipeline = [
      { $match: { "_id": { $regex: "^prod_" } } },
      { $project: { "numeric_part": { $toInt: { $substr: ["$_id", 5, -1] } } } },
      { $sort: { "numeric_part": -1 } },
      { $limit: 1 }
    ];
    
    const result = await products.aggregate(pipeline).toArray();
    
    let nextNum = 1;
    if (result.length > 0) {
      nextNum = result[0].numeric_part + 1;
    }
    
    return `prod_${nextNum.toString().padStart(4, '0')}`;
  }

  static async getAllCategories(): Promise<Category[]> {
    const db = await getDatabase();
    const categories = await db.collection('categories').find({}).toArray();
    return categories as Category[];
  }

  static async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    const db = await getDatabase();
    const subcategories = await db.collection('subcategories')
      .find({ category_id: categoryId })
      .toArray();
    return subcategories as Subcategory[];
  }

  static async getAllProducts(): Promise<Product[]> {
    const db = await getDatabase();
    const products = await db.collection('products')
      .find({})
      .sort({ created_at: -1 })
      .toArray();
    return products as Product[];
  }

  static async createProduct(productData: ProductFormData, imageUrls: string[]): Promise<Product> {
    const db = await getDatabase();
    const productId = await this.getNextProductId();
    
    const product: Omit<Product, '_id'> = {
      product_id: productId,
      product_name: productData.product_name,
      product_title: productData.product_title,
      product_description: productData.product_description,
      image_urls: imageUrls,
      image_count: imageUrls.length,
      subcategory_id: productData.subcategory_id,
      category_id: productData.category_id,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Insert the product
    await db.collection('products').insertOne({ _id: productId, ...product });

    // Update category product_ids array
    await db.collection('categories').updateOne(
      { _id: productData.category_id },
      {
        $push: { product_ids: productId },
        $inc: { product_count: 1 },
        $set: { updated_at: new Date() }
      }
    );

    // Update subcategory product_ids array
    await db.collection('subcategories').updateOne(
      { _id: productData.subcategory_id },
      {
        $push: { product_ids: productId },
        $inc: { product_count: 1 },
        $set: { updated_at: new Date() }
      }
    );

    return { _id: productId, ...product } as Product;
  }

  static async getProductById(productId: string): Promise<Product | null> {
    const db = await getDatabase();
    const product = await db.collection('products').findOne({ _id: productId });
    return product as Product | null;
  }

  static async updateProduct(productId: string, updateData: Partial<Product>): Promise<void> {
    const db = await getDatabase();
    await db.collection('products').updateOne(
      { _id: productId },
      { 
        $set: { 
          ...updateData, 
          updated_at: new Date() 
        } 
      }
    );
  }

  static async deleteProduct(productId: string): Promise<void> {
    const db = await getDatabase();
    
    // Get product details first
    const product = await this.getProductById(productId);
    if (!product) return;

    // Remove from product collection
    await db.collection('products').deleteOne({ _id: productId });

    // Remove from category product_ids array
    await db.collection('categories').updateOne(
      { _id: product.category_id },
      {
        $pull: { product_ids: productId },
        $inc: { product_count: -1 },
        $set: { updated_at: new Date() }
      }
    );

    // Remove from subcategory product_ids array
    await db.collection('subcategories').updateOne(
      { _id: product.subcategory_id },
      {
        $pull: { product_ids: productId },
        $inc: { product_count: -1 },
        $set: { updated_at: new Date() }
      }
    );
  }
}
