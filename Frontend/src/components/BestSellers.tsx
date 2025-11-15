import { useState } from 'react';
import { Star } from 'lucide-react';
import { products } from '../productDetails';

interface BestSellersProps {
  onProductClick: (productId: number) => void;
}

export default function BestSellers({ onProductClick }: BestSellersProps) {
  const [activeTab, setActiveTab] = useState('WALL ARTS');

  const tabs = ['WALL ARTS', 'HOME DECOR', 'JEWELRY'];

  const filteredProducts = products
    .filter((product) => {
      if (activeTab === 'WALL ARTS') {
        return product.category === 'Metal Wall Art' || product.category === 'Canvas Prints' || product.category === 'Acrylic Wall Art';
      }
      if (activeTab === 'HOME DECOR') {
        return product.category === 'Home Decor' || product.category === 'Ramadan Decor' || product.category === 'Prayer Mats';
      }
      return false;
    })
    .slice(0, 4);

  const calculateDiscount = (price: number, oldPrice: number) => {
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  return (
    <div className="bg-white py-6 xs:py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-6 xs:mb-8 sm:mb-10 lg:mb-12 px-2">
          Best Selling Islamic Wall Art Designs
        </h2>

        <div className="flex justify-center mb-6 xs:mb-8 sm:mb-10 lg:mb-12 overflow-x-auto">
          <div className="inline-flex border-b-2 border-gray-300 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 py-2 xs:py-2.5 sm:py-3 lg:py-4 font-medium text-xs xs:text-sm sm:text-base lg:text-lg transition-all relative whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 lg:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onProductClick(product.id)}
              className="group cursor-pointer bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                {product.badge && (
                  <div className="absolute top-1.5 xs:top-2 sm:top-3 left-1.5 xs:left-2 sm:left-3 z-10">
                    <span className="bg-black text-white px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 text-[8px] xs:text-[9px] sm:text-xs font-bold uppercase">
                      {product.badge}
                    </span>
                  </div>
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              <div className="p-2 xs:p-3 sm:p-4 lg:p-5">
                <div className="flex items-center gap-0.5 xs:gap-1 mb-1 xs:mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-[9px] xs:text-[10px] sm:text-xs lg:text-sm text-gray-600 ml-0.5 xs:ml-1">
                    {product.reviews} Reviews
                  </span>
                </div>

                <h3 className="text-[10px] xs:text-xs sm:text-sm lg:text-base text-gray-900 font-medium mb-1.5 xs:mb-2 sm:mb-3 line-clamp-2 min-h-[2rem] xs:min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-amber-700 transition-colors">
                  {product.name}
                </h3>

                <div className="flex flex-wrap items-center gap-1 xs:gap-1.5 sm:gap-2 lg:gap-3">
                  <span className="text-sm xs:text-base sm:text-lg lg:text-2xl font-bold text-red-600">
                    ${product.price}
                  </span>
                  {product.oldPrice && (
                    <>
                      <span className="text-xs xs:text-sm sm:text-base lg:text-lg text-gray-400 line-through">
                        ${product.oldPrice}
                      </span>
                      <span className="bg-green-100 text-green-700 px-1 xs:px-1.5 sm:px-2 py-0.5 xs:py-1 rounded-full text-[8px] xs:text-[9px] sm:text-xs font-semibold">
                        Save {calculateDiscount(product.price, product.oldPrice)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6 xs:mt-8 sm:mt-10 lg:mt-12">
          <button className="w-full xs:w-auto bg-amber-900 hover:bg-amber-800 text-white px-4 xs:px-6 sm:px-8 lg:px-12 py-2 xs:py-3 sm:py-3.5 lg:py-4 text-xs xs:text-sm sm:text-base lg:text-lg font-semibold transition-all transform hover:scale-105 uppercase tracking-wide">
            SHOP ALL ISLAMIC WALL ARTS
          </button>
        </div>

        <div className="text-center mt-4 xs:mt-6 sm:mt-8 text-[9px] xs:text-xs sm:text-sm lg:text-base text-gray-600">
          Free Shipping over $50 • 30-Day Returns
        </div>
      </div>
    </div>
  );
}
