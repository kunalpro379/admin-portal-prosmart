'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Select } from '@/components/ui/Select';
import { Search, Plus, Edit, Trash2, Package, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

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

interface Category {
  _id: string;
  category_name: string;
}

interface Subcategory {
  _id: string;
  subcategory_name: string;
  category_id: string;
}

const ITEMS_PER_PAGE = 10;

export default function ProductListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products, categories and all subcategories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        if (productsData.success) {
          setProducts(productsData.data);
        }
        if (categoriesData.success) {
          setCategories(categoriesData.data);
          
          // Fetch all subcategories for display
          const allSubcatsPromises = categoriesData.data.map((cat: Category) =>
            fetch(`/api/subcategories/${cat._id}`).then(res => res.json())
          );
          const allSubcatsResults = await Promise.all(allSubcatsPromises);
          const combinedSubcats = allSubcatsResults
            .filter(res => res.success)
            .flatMap(res => res.data);
          setAllSubcategories(combinedSubcats);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (categoryFilter === 'all') {
        setSubcategories([]);
        return;
      }

      try {
        const res = await fetch(`/api/subcategories/${categoryFilter}`);
        const data = await res.json();
        if (data.success) {
          setSubcategories(data.data);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    };

    fetchSubcategories();
  }, [categoryFilter]);

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setSubcategoryFilter('all');
    setCurrentPage(1);
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, subcategoryFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.product_name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
      const matchesSubcategory = subcategoryFilter === 'all' || product.subcategory_id === subcategoryFilter;
      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [products, search, categoryFilter, subcategoryFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c._id === categoryId);
    return category?.category_name || 'Unknown';
  };

  const getSubcategoryName = (subcategoryId: string) => {
    const subcategory = allSubcategories.find((s) => s._id === subcategoryId);
    return subcategory?.subcategory_name || 'Unknown';
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(products.filter((p) => p._id !== productId));
        toast.success('Product deleted successfully');
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((cat) => ({ value: cat._id, label: cat.category_name })),
  ];

  const subcategoryOptions = [
    { value: 'all', label: 'All Subcategories' },
    ...subcategories.map((sub) => ({ value: sub._id, label: sub.subcategory_name })),
  ];

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Product List">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
          <p className="text-slate-500">Loading products...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Product List">
      <div className="space-y-4 md:space-y-5">
        {/* Stats Card */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-4 md:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium">Total Products</p>
              <p className="text-3xl md:text-4xl font-bold mt-1">{products.length}</p>
              <p className="text-teal-100 text-sm mt-1">
                {filteredProducts.length !== products.length && (
                  <span>{filteredProducts.length} matching filters</span>
                )}
              </p>
            </div>
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Layers className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          {/* Search - Full width on mobile */}
          <div className="relative w-full mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filters and Add Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-1 gap-3">
              <Select
                value={categoryFilter}
                onValueChange={handleCategoryChange}
                options={categoryOptions}
                placeholder="Category"
                className="flex-1 sm:flex-none sm:w-44"
              />

              <Select
                value={subcategoryFilter}
                onValueChange={setSubcategoryFilter}
                options={subcategoryOptions}
                placeholder="Subcategory"
                disabled={categoryFilter === 'all'}
                className="flex-1 sm:flex-none sm:w-44"
              />
            </div>

            <button
              onClick={() => router.push('/products/new')}
              className="h-11 px-5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Products Grid - Mobile Cards / Desktop Table */}
        <div className="block md:hidden space-y-3">
          {paginatedProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No products found</p>
            </div>
          ) : (
            paginatedProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 ring-1 ring-slate-200">
                    {product.image_urls?.[0] ? (
                      <img
                        src={product.image_urls[0]}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">
                      {product.product_name}
                    </h3>
                    <p className="text-sm text-teal-600 font-medium mt-1">
                      {getCategoryName(product.category_id)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {getSubcategoryName(product.subcategory_id)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => router.push(`/products/${product._id}`)}
                      className="p-2.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id, product.product_name)}
                      className="p-2.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Product
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Category
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 ring-1 ring-slate-200">
                          {product.image_urls?.[0] ? (
                            <img
                              src={product.image_urls[0]}
                              alt={product.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-slate-800">{product.product_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-slate-800 font-medium">{getCategoryName(product.category_id)}</p>
                        <p className="text-slate-500 text-sm">{getSubcategoryName(product.subcategory_id)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/products/${product._id}`)}
                          className="p-2.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id, product.product_name)}
                          className="p-2.5 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedProducts.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No products found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-800">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
                <span className="font-semibold text-slate-800">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> of{' '}
                <span className="font-semibold text-slate-800">{filteredProducts.length}</span> products
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-10 px-3 flex items-center gap-1 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-200'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-10 px-3 flex items-center gap-1 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
