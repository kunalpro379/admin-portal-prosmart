# ProSmart Admin - Product Management System

A modern, full-stack Next.js application for managing products with MongoDB and Cloudinary integration. Built for easy deployment on Vercel.

## Features

- ✅ **Modern UI**: Clean, responsive design with Tailwind CSS
- ✅ **MongoDB Integration**: Direct database connection with auto-generated product IDs
- ✅ **Cloudinary Upload**: Automatic image optimization and CDN delivery
- ✅ **File Upload**: Drag & drop multiple image upload with validation
- ✅ **Real-time Feedback**: Toast notifications for user actions
- ✅ **TypeScript**: Full type safety throughout the application
- ✅ **Vercel Ready**: Optimized for seamless deployment

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with native driver
- **File Storage**: Cloudinary
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (Atlas recommended)
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd prosmart-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://prosmart:prosmart@cluster0.jokss9k.mongodb.net/?appName=Cluster0
   MONGODB_DB=prosmart_db

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=dstmt1w5p
   CLOUDINARY_API_KEY=747859347794899
   CLOUDINARY_API_SECRET=O04mjGTySv_xuuXHWQ6hR6uuHcM
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following MongoDB collections:

### Products Collection
```javascript
{
  _id: "prod_0001",
  product_id: "prod_0001",
  product_name: "Product Name",
  product_title: "Product Title",
  product_description: "Detailed description...",
  image_urls: ["https://cloudinary.com/..."],
  image_count: 3,
  subcategory_id: "subcat_001",
  category_id: "cat_001",
  status: "active",
  created_at: ISODate,
  updated_at: ISODate
}
```

### Categories Collection
```javascript
{
  _id: "cat_001",
  category_name: "Category Name",
  product_ids: ["prod_0001", "prod_0002"],
  subcategory_ids: ["subcat_001", "subcat_002"],
  product_count: 10,
  subcategory_count: 3,
  created_at: ISODate,
  updated_at: ISODate
}
```

### Subcategories Collection
```javascript
{
  _id: "subcat_001",
  subcategory_name: "Subcategory Name",
  category_id: "cat_001",
  product_ids: ["prod_0001", "prod_0002"],
  product_count: 5,
  created_at: ISODate,
  updated_at: ISODate
}
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get product by ID
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Categories
- `GET /api/categories` - Get all categories

### Subcategories
- `GET /api/subcategories/[categoryId]` - Get subcategories by category

## Image Upload Process

1. **Client Side**: User selects/drags images
2. **Validation**: File type, size, and count validation
3. **Form Submission**: Images sent via FormData
4. **Server Processing**: 
   - Generate unique product ID
   - Upload images to Cloudinary with organized folder structure
   - Save product data to MongoDB
   - Update category/subcategory arrays

### Cloudinary Folder Structure
```
Category_Name/
  └── Subcategory_Name/
      └── prod_0001/
          ├── prod_0001_img1.jpg
          ├── prod_0001_img2.jpg
          └── prod_0001_img3.jpg
```

## Deployment on Vercel

### Automatic Deployment

1. **Connect to Vercel**
   - Push your code to GitHub/GitLab
   - Import project in Vercel dashboard
   - Vercel will auto-detect Next.js

2. **Environment Variables**
   
   Add these in Vercel dashboard → Settings → Environment Variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB=prosmart_db
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Project Structure

```
prosmart-admin/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   └── subcategories/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── ImageUpload.tsx
│   │   ├── ProductForm.tsx
│   │   └── ProductList.tsx
│   ├── lib/
│   │   ├── mongodb.ts
│   │   ├── cloudinary.ts
│   │   └── product-service.ts
│   ├── types/
│   │   └── product.ts
│   └── config/
│       └── env.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

## Key Features Explained

### Auto-Generated Product IDs
- Format: `prod_0001`, `prod_0002`, etc.
- Automatically finds next available ID
- Consistent with existing database convention

### Image Upload & Management
- Multiple image upload with drag & drop
- Client-side validation (file type, size, count)
- Automatic Cloudinary optimization
- Organized folder structure by category/subcategory

### Database Integration
- Direct MongoDB connection (no ORM overhead)
- Atomic operations for data consistency
- Automatic category/subcategory array updates
- Proper indexing for performance

### Modern UI/UX
- Responsive design for all devices
- Loading states and error handling
- Toast notifications for feedback
- Clean, professional interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.
