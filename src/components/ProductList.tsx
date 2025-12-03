'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Product } from '@/types/product';
import { Trash2, Edit, Eye } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface ProductListProps {
  refreshTrigger?: number;
}

export const ProductList: React.FC<ProductListProps> = ({ refreshTrigger }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(productId);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Product deleted successfully');
        setProducts(products.filter(p => p._id !== productId));
      } else {
        toast.error(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="loading-spinner mr-2" />
          Loading products...
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No products found. Create your first product!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products ({products.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Product Images */}
                <div className="flex-shrink-0">
                  {product.image_urls.length > 0 ? (
                    <div className="flex space-x-2">
                      {product.image_urls.slice(0, 3).map((url, index) => (
                        <div key={index} className="relative w-16 h-16 rounded-md overflow-hidden">
                          <Image
                            src={url}
                            alt={`${product.product_name} ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {product.image_urls.length > 3 && (
                        <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                          +{product.image_urls.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0 flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {product.product_name}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {product.product_title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {product.product_description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          // TODO: Implement view/edit functionality
                          toast.info('View/Edit functionality coming soon!');
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={deleteLoading === product._id}
                        onClick={() => handleDelete(product._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>ID: {product.product_id}</span>
                    <span>Images: {product.image_count}</span>
                    <span>Status: {product.status}</span>
                    <span>Created: {formatDate(product.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
