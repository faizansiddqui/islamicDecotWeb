import { useState, useEffect } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { productAPI } from '../services/api';
import { Product, getImageUrl, isProductBestSeller } from '../utils/productUtils';

interface BestSellersProps {
  onProductClick: (productId: number) => void;
}

export default function BestSellers({ onProductClick }: BestSellersProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productAPI.getProducts();

      if (response.data.status && Array.isArray(response.data.products)) {
        // Filter products created in last 3 days (bestsellers)
        const bestSellers = response.data.products.filter((product: Product) =>
          isProductBestSeller(product)
        );
        setProducts(bestSellers);
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

  // Load categories from centralized data file (not used for display)
  const filteredProducts = products.slice(0, 8);

  const calculateDiscount = (price: number, oldPrice: number) => {
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  if (isLoading) {
    return (
      <div className="bg-white py-6 xs:py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-section="bestsellers" className="bg-gradient-to-b from-white to-gray-50 py-6 xs:py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 xs:mb-8 sm:mb-10 lg:mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="text-amber-700" size={24} />
            <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
              Best Selling Products
            </h2>
            <Sparkles className="text-amber-700" size={24} />
          </div>
          <p className="text-xs xs:text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Discover our most popular Islamic decor items, handpicked for you
          </p>
        </div>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No bestseller products found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 lg:gap-6">
              {filteredProducts.map((product) => {
                const imageUrl = getImageUrl(product.product_image);
                const displayPrice = product.selling_price || product.price;
                const oldPrice = product.price > product.selling_price ? product.price : undefined;

                return (
                  <div
                    key={product.product_id}
                    onClick={() => onProductClick(product.product_id)}
                    className="group cursor-pointer bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <div className="absolute top-1.5 xs:top-2 sm:top-3 left-1.5 xs:left-2 sm:left-3 z-10">
                        <span className="px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 rounded-full text-[8px] xs:text-[9px] sm:text-xs font-bold uppercase bg-red-600 text-white">
                          Bestseller
                        </span>
                      </div>
                      <img
                        src={imageUrl}
                        alt={product.name || product.title || 'Product'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image';
                        }}
                      />
                      {product.quantity === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-2 xs:p-3 sm:p-4 lg:p-5">
                      <div className="flex items-center gap-0.5 xs:gap-1 mb-1 xs:mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-current" />
                        ))}
                        <span className="text-[9px] xs:text-[10px] sm:text-xs lg:text-sm text-gray-600 ml-0.5 xs:ml-1">
                          (Reviews)
                        </span>
                      </div>

                      <h3 className="text-[10px] xs:text-xs sm:text-sm lg:text-base text-gray-900 font-medium mb-1.5 xs:mb-2 sm:mb-3 line-clamp-2 min-h-[2rem] xs:min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-amber-700 transition-colors">
                        {product.name || product.title || 'Product'}
                      </h3>

                      <div className="flex flex-wrap items-center gap-1 xs:gap-1.5 sm:gap-2 lg:gap-3">
                        <span className="text-sm xs:text-base sm:text-lg lg:text-2xl font-bold text-amber-700">
                          ${displayPrice}
                        </span>
                        {oldPrice && (
                          <>
                            <span className="text-xs xs:text-sm sm:text-base lg:text-lg text-gray-400 line-through">
                              ${oldPrice}
                            </span>
                            <span className="bg-green-100 text-green-700 px-1 xs:px-1.5 sm:px-2 py-0.5 xs:py-1 rounded-full text-[8px] xs:text-[9px] sm:text-xs font-semibold">
                              Save {calculateDiscount(displayPrice, oldPrice)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-6 xs:mt-8 sm:mt-10 lg:mt-12">
              <button
                onClick={() => window.location.hash = '#/categories'}
                className="w-full xs:w-auto bg-amber-700 hover:bg-amber-800 text-white px-4 xs:px-6 sm:px-8 lg:px-12 py-2 xs:py-3 sm:py-3.5 lg:py-4 text-xs xs:text-sm sm:text-base lg:text-lg font-semibold transition-all transform hover:scale-105 uppercase tracking-wide rounded-lg shadow-lg"
              >
                View All Products
              </button>
            </div>

            <div className="text-center mt-4 xs:mt-6 sm:mt-8 text-[9px] xs:text-xs sm:text-sm lg:text-base text-gray-600">
              Free Shipping over $5 • 30-Day Returns
            </div>
          </>
        )}
      </div>
    </div>
  );
}
