import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { productAPI } from '../../services/api';
import { Product, getImageUrl, isProductNew, isProductBestSeller } from '../../utils/productUtils';
import { getCategories } from '../../data/categories';

interface ProductGridProps {
  onProductClick: (productId: number) => void;
  searchQuery?: string;
}

export default function ProductGrid({ onProductClick, searchQuery }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [sortBy, setSortBy] = useState('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Fetch products dynamically when category changes
  useEffect(() => {
    if (selectedCategory === 'All Products') {
      loadProducts();
    } else if (selectedCategory !== 'Uncategorized') {
      loadProductsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productAPI.getProducts();

      if (response.data.status && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
      } else {
        setProducts([]);
      }
    } catch (error: unknown) {
      console.error('❌ Error loading products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProductsByCategory = async (categoryName: string) => {
    setIsLoading(true);
    try {
      const response = await productAPI.getProductByCategory(categoryName);
      console.log('Category products loaded:', response.data);

      if (response.data.status === 'ok' && response.data.data) {
        const categoryData = response.data.data;
        if (categoryData && categoryData.Products && Array.isArray(categoryData.Products)) {
          setProducts(categoryData.Products);
        } else {
          console.warn('⚠️ No products found for category:', categoryName);
          setProducts([]);
        }
      } else {
        console.warn('⚠️ Invalid response format for category:', categoryName);
        setProducts([]);
      }
    } catch (error: unknown) {
      console.error(`❌ Error loading products for category ${categoryName}:`, error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = () => {
    // Load categories from centralized data file
    const categoryData = getCategories();
    const categoryNames = categoryData.map(cat => cat.name);

    // Check if there are any uncategorized products
    const hasUncategorized = products.some(p => !p.Catagory || !p.Catagory.name);

    const allCategories = ['All Products', ...categoryNames];
    if (hasUncategorized) {
      allCategories.push('Uncategorized');
    }

    setCategories(allCategories);
  };

  const filteredProducts = products.filter((product) => {
    // For Uncategorized, filter products without category
    if (selectedCategory === 'Uncategorized') {
      const hasNoCategory = !product.Catagory || !product.Catagory.name;
      if (!hasNoCategory) return false;
    }
    // Note: Category filtering is now done by backend API, except for Uncategorized

    // Search filtering
    const productCategory = product.Catagory?.name || 'Uncategorized';
    const matchesSearch = !searchQuery ||
      (product.name || product.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      productCategory.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return (a.selling_price || a.price) - (b.selling_price || b.price);
    }
    if (sortBy === 'price-high') {
      return (b.selling_price || b.price) - (a.selling_price || a.price);
    }
    if (sortBy === 'name') {
      return (a.name || a.title || '').localeCompare(b.name || b.title || '');
    }
    // Featured: Show new products first, then bestsellers, then others
    if (sortBy === 'featured') {
      const aIsNew = isProductNew(a);
      const bIsNew = isProductNew(b);
      const aIsBestSeller = isProductBestSeller(a);
      const bIsBestSeller = isProductBestSeller(b);

      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;
      if (aIsBestSeller && !bIsBestSeller) return -1;
      if (!aIsBestSeller && bIsBestSeller) return 1;
      return 0;
    }
    return 0;
  });

  if (isLoading) {
    return (
      <div className="bg-gray-50 py-6 xs:py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
            <SlidersHorizontal size={16} className="mr-2" />
            Curated Selection
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Our Featured Collection
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Explore our carefully curated selection of premium Islamic art and decor
          </p>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-amber-700 text-amber-700 px-4 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors shadow-md"
          >
            <SlidersHorizontal size={20} />
            {showMobileFilters ? 'Hide Filters' : 'Show Filters & Categories'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Vertical Category Tabs - Left Side on Desktop, Collapsible on Mobile */}
          <div className={`lg:w-56 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'
            }`}>
            {/* Mobile: Styled Card */}
            <div className="lg:hidden bg-white rounded-xl shadow-lg p-4 mb-4 border border-amber-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter size={20} className="text-amber-600" />
                  Categories
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowMobileFilters(false);
                    }}
                    className={`px-3 py-2.5 text-sm font-medium transition-all rounded-lg ${selectedCategory === category
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg transform scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-amber-50 hover:text-amber-700 border border-gray-200'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: Vertical Sidebar */}
            <div className="hidden lg:flex lg:flex-col gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-3 text-sm font-medium transition-all rounded-lg text-left group ${selectedCategory === category
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-700 border border-gray-200 hover:border-amber-300'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{category}</span>
                    {selectedCategory === category && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Sort and Count Bar */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-amber-600 rounded-full"></div>
                  <p className="text-sm font-semibold text-gray-700">
                    Showing <span className="text-amber-700 text-lg">{sortedProducts.length}</span> products
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <SlidersHorizontal size={16} className="text-amber-600" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 cursor-pointer outline-none"
                  >
                    <option value="featured">✨ Featured</option>
                    <option value="price-low">💰 Price: Low to High</option>
                    <option value="price-high">💎 Price: High to Low</option>
                    <option value="name">🔤 Name: A to Z</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {sortedProducts.map((product) => {
                const imageUrl = getImageUrl(product.product_image);
                const isNew = isProductNew(product);
                const isBestSeller = isProductBestSeller(product);
                const badge = isNew ? 'new' : isBestSeller ? 'bestseller' : null;
                const displayPrice = product.selling_price || product.price;
                const oldPrice = product.price > product.selling_price ? product.price : undefined;

                return (
                  <ProductCard
                    key={product.product_id}
                    id={product.product_id}
                    name={product.name || product.title || 'Product'}
                    price={displayPrice}
                    image={imageUrl}
                    category={product.Catagory?.name || ''}
                    inStock={product.quantity > 0}
                    onClick={() => onProductClick(product.product_id)}
                    badge={badge}
                    oldPrice={oldPrice}
                  />
                );
              })}
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <div className="text-gray-400 mb-4">
                  <Filter size={48} className="mx-auto" />
                </div>
                <p className="text-lg text-gray-500 font-medium">No products found</p>
                <p className="text-sm text-gray-400 mt-2">Try selecting a different category</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
