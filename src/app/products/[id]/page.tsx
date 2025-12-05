'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Select } from '@/components/ui/Select';
import { ArrowLeft, Save, X, Package, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  category_name: string;
}

interface Subcategory {
  _id: string;
  subcategory_name: string;
  category_id: string;
}

interface Product {
  _id: string;
  product_id: string;
  product_name: string;
  product_title: string;
  product_description: string;
  image_urls: string[];
  category_id: string;
  subcategory_id: string;
  status: string;
}

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingSubcategories, setIsFetchingSubcategories] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    product_name: '',
    product_title: '',
    product_description: '',
    category_id: '',
    subcategory_id: '',
    images: [] as string[],
    status: 'active',
  });

  // Fetch product and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch('/api/categories'),
        ]);

        const productData = await productRes.json();
        const categoriesData = await categoriesRes.json();

        if (productData.success && productData.data) {
          const p = productData.data;
          setProduct(p);
          setFormData({
            product_name: p.product_name || '',
            product_title: p.product_title || '',
            product_description: p.product_description || '',
            category_id: p.category_id || '',
            subcategory_id: p.subcategory_id || '',
            images: p.image_urls || [],
            status: p.status || 'active',
          });

          // Fetch subcategories for the product's category
          if (p.category_id) {
            const subRes = await fetch(`/api/subcategories/${p.category_id}`);
            const subData = await subRes.json();
            if (subData.success) {
              setSubcategories(subData.data);
            }
          }
        } else {
          toast.error('Product not found');
          router.push('/products');
        }

        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId, router]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!formData.category_id) {
        setSubcategories([]);
        return;
      }

      setIsFetchingSubcategories(true);
      try {
        const res = await fetch(`/api/subcategories/${formData.category_id}`);
        const data = await res.json();
        if (data.success) {
          setSubcategories(data.data);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setIsFetchingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, [formData.category_id]);

  const handleChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'category_id') {
      setFormData((prev) => ({ ...prev, subcategory_id: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.product_name || !formData.category_id || !formData.subcategory_id || !formData.product_description) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (formData.images.length < 1) {
      toast.error('Please add at least one image.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_name: formData.product_name,
          product_title: formData.product_title || formData.product_name,
          product_description: formData.product_description,
          category_id: formData.category_id,
          subcategory_id: formData.subcategory_id,
          image_urls: formData.images,
          status: formData.status,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`${formData.product_name} has been updated successfully!`);
        router.push('/products');
      } else {
        toast.error(result.error || 'Failed to update product');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong while saving the product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    router.push('/products');
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat._id,
    label: cat.category_name,
  }));

  const subcategoryOptions = subcategories.map((sub) => ({
    value: sub._id,
    label: sub.subcategory_name,
  }));

  if (isLoading) {
    return (
      <AdminLayout title="Edit Product">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
          <p className="text-slate-500">Loading product...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout title="Product Not Found">
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-6">Product not found</p>
          <button
            onClick={() => router.push('/products')}
            className="h-11 px-6 bg-white border-2 border-teal-500 text-teal-600 rounded-xl font-semibold hover:bg-teal-50 hover:border-teal-600 transition-all"
          >
            Back to Products
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Product">
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        {/* Header Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => router.push('/products')}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-800 truncate">{product.product_name}</h2>
              </div>
            </div>
            
            {/* Desktop Buttons */}
            <div className="hidden sm:flex gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={handleDiscard}
                className="h-10 px-4 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Discard
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-4 bg-white border-2 border-teal-500 text-teal-600 rounded-xl font-semibold hover:bg-teal-50 hover:border-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Images First */}
        <div className="lg:hidden bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">Product Images</h3>
          <ImageUploader
            images={formData.images}
            onChange={(images) => handleChange('images', images)}
            maxImages={10}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          {/* Left Column - Form Fields */}
          <div className="lg:col-span-2 space-y-4 md:space-y-5">
            {/* Product Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-5">Product Details</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    placeholder="Enter product name"
                    value={formData.product_name}
                    onChange={(e) => handleChange('product_name', e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Product Title
                  </label>
                  <input
                    placeholder="Enter product title"
                    value={formData.product_title}
                    onChange={(e) => handleChange('product_title', e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border-2 border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(v) => handleChange('category_id', v)}
                      options={categoryOptions}
                      placeholder="Select category"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Subcategory <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Select
                        value={formData.subcategory_id}
                        onValueChange={(v) => handleChange('subcategory_id', v)}
                        options={subcategoryOptions}
                        placeholder={isFetchingSubcategories ? "Loading..." : "Select subcategory"}
                        disabled={!formData.category_id || isFetchingSubcategories}
                      />
                      {isFetchingSubcategories && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    placeholder="Enter product description"
                    value={formData.product_description}
                    onChange={(e) => handleChange('product_description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 resize-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Images (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-5">Product Images</h3>
              <ImageUploader
                images={formData.images}
                onChange={(images) => handleChange('images', images)}
                maxImages={10}
              />
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Buttons */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex gap-3 z-40">
          <button
            type="button"
            onClick={handleDiscard}
            className="flex-1 h-11 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-11 bg-white border-2 border-teal-500 text-teal-600 rounded-xl font-semibold hover:bg-teal-50 hover:border-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Spacer for mobile bottom buttons */}
        <div className="sm:hidden h-20"></div>
      </form>
    </AdminLayout>
  );
}
