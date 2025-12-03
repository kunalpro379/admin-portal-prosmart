'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { ImageUpload } from './ImageUpload';
import { Category, Subcategory } from '@/types/product';
import toast from 'react-hot-toast';

interface ProductFormProps {
  onSuccess?: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    product_name: '',
    product_title: '',
    product_description: '',
    category_id: '',
    subcategory_id: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category_id) {
      fetchSubcategories(formData.category_id);
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory_id: '' }));
    }
  }, [formData.category_id]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/subcategories/${categoryId}`);
      const data = await response.json();
      
      if (data.success) {
        setSubcategories(data.data);
      } else {
        toast.error('Failed to fetch subcategories');
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to fetch subcategories');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product name is required';
    }

    if (!formData.product_title.trim()) {
      newErrors.product_title = 'Product title is required';
    }

    if (!formData.product_description.trim()) {
      newErrors.product_description = 'Product description is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.subcategory_id) {
      newErrors.subcategory_id = 'Subcategory is required';
    }

    if (selectedImages.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const submitFormData = new FormData();
      
      // Add form fields
      submitFormData.append('product_name', formData.product_name);
      submitFormData.append('product_title', formData.product_title);
      submitFormData.append('product_description', formData.product_description);
      submitFormData.append('category_id', formData.category_id);
      submitFormData.append('subcategory_id', formData.subcategory_id);
      
      // Add category and subcategory names for Cloudinary folder structure
      const selectedCategory = categories.find(cat => cat._id === formData.category_id);
      const selectedSubcategory = subcategories.find(sub => sub._id === formData.subcategory_id);
      
      if (selectedCategory) {
        submitFormData.append('category_name', selectedCategory.category_name);
      }
      if (selectedSubcategory) {
        submitFormData.append('subcategory_name', selectedSubcategory.subcategory_name);
      }

      // Add images
      selectedImages.forEach((image, index) => {
        submitFormData.append(`images_${index}`, image);
      });

      const response = await fetch('/api/products', {
        method: 'POST',
        body: submitFormData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Product created successfully!');
        
        // Reset form
        setFormData({
          product_name: '',
          product_title: '',
          product_description: '',
          category_id: '',
          subcategory_id: ''
        });
        setSelectedImages([]);
        setErrors({});
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(data.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map(cat => ({
    value: cat._id,
    label: cat.category_name
  }));

  const subcategoryOptions = subcategories.map(sub => ({
    value: sub._id,
    label: sub.subcategory_name
  }));

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Product Name"
              value={formData.product_name}
              onChange={(e) => handleInputChange('product_name', e.target.value)}
              error={errors.product_name}
              placeholder="Enter product name"
              required
            />

            <Input
              label="Product Title"
              value={formData.product_title}
              onChange={(e) => handleInputChange('product_title', e.target.value)}
              error={errors.product_title}
              placeholder="Enter product title"
              required
            />
          </div>

          {/* Description */}
          <Textarea
            label="Product Description"
            value={formData.product_description}
            onChange={(e) => handleInputChange('product_description', e.target.value)}
            error={errors.product_description}
            placeholder="Enter detailed product description"
            rows={4}
            required
          />

          {/* Category and Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Category"
              value={formData.category_id}
              onChange={(e) => handleInputChange('category_id', e.target.value)}
              error={errors.category_id}
              options={categoryOptions}
              placeholder="Select a category"
              required
            />

            <Select
              label="Subcategory"
              value={formData.subcategory_id}
              onChange={(e) => handleInputChange('subcategory_id', e.target.value)}
              error={errors.subcategory_id}
              options={subcategoryOptions}
              placeholder="Select a subcategory"
              disabled={!formData.category_id}
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <ImageUpload
              onImagesChange={setSelectedImages}
              maxImages={15}
              maxSizePerImage={10}
            />
            {errors.images && (
              <p className="mt-2 text-sm text-red-600">{errors.images}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setFormData({
                  product_name: '',
                  product_title: '',
                  product_description: '',
                  category_id: '',
                  subcategory_id: ''
                });
                setSelectedImages([]);
                setErrors({});
              }}
              disabled={loading}
            >
              Reset
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Create Product
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
