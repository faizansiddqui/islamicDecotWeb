import { useState } from 'react';
import ProductCard from './ProductCard';
import { products, categories } from '../productDetails';
import { Filter } from 'lucide-react';

interface ProductGridProps {
  onProductClick: (productId: number) => void;
  searchQuery?: string;
}

export default function ProductGrid({ onProductClick, searchQuery }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All Products' ? true : product.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.theme.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="bg-gray-50 py-6 xs:py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 xs:mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4 px-2">
            Our Featured Collection
          </h2>
          <p className="text-xs xs:text-sm sm:text-base lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Explore our carefully curated selection of premium Islamic art and decor
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 xs:gap-4 sm:gap-5 lg:gap-6 mb-4 xs:mb-6 sm:mb-8">
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-1 xs:gap-1.5 sm:gap-2 pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-2 xs:px-3 sm:px-4 lg:px-6 py-1 xs:py-1.5 sm:py-2 rounded-full font-medium whitespace-nowrap transition-all text-[9px] xs:text-xs sm:text-sm lg:text-base ${
                    selectedCategory === category
                      ? 'bg-amber-700 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 xs:gap-2 sm:gap-3">
            <Filter size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-[9px] xs:text-xs sm:text-sm"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        <div className="mb-3 xs:mb-4 sm:mb-6">
          <p className="text-[9px] xs:text-xs sm:text-sm lg:text-base text-gray-600">
            Showing <span className="font-semibold text-amber-700">{sortedProducts.length}</span> products
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 lg:gap-6">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              category={product.category}
              inStock={product.inStock}
              onClick={() => onProductClick(product.id)}
            />
          ))}
        </div>

        {sortedProducts.length === 0 && (
          <div className="text-center py-10 xs:py-12 sm:py-16 lg:py-20">
            <p className="text-sm xs:text-base sm:text-lg lg:text-xl text-gray-500">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
