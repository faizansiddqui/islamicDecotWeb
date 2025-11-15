import { ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  onClick: () => void;
}

export default function ProductCard({ id, name, price, image, category, inStock, onClick }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div
      className="group bg-white rounded-lg xs:rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative overflow-hidden aspect-square">
        <img
          src={image}
          alt={name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          loading="lazy"
        />

        {!inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 rounded-lg font-semibold text-[9px] xs:text-xs sm:text-sm">
              Out of Stock
            </span>
          </div>
        )}

        <div className="absolute top-1.5 xs:top-2 sm:top-3 left-1.5 xs:left-2 sm:left-3">
          <span className="bg-amber-700 text-white px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 rounded-full text-[8px] xs:text-[9px] sm:text-xs font-semibold">
            {category}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={`absolute top-1.5 xs:top-2 sm:top-3 right-1.5 xs:right-2 sm:right-3 p-1 xs:p-1.5 sm:p-2 rounded-full transition-all transform ${
            isFavorite
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <Heart size={14} className="xs:w-4 xs:h-4 sm:w-4 sm:h-4" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        <div
          className={`hidden sm:block absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 xs:p-3 sm:p-4 transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white py-1.5 xs:py-2 rounded-lg font-semibold flex items-center justify-center gap-1 xs:gap-2 transition-colors text-xs xs:text-sm"
            disabled={!inStock}
          >
            <ShoppingCart size={14} className="xs:w-4 xs:h-4" />
            Add to Cart
          </button>
        </div>
      </div>

      <div className="p-2 xs:p-3 sm:p-4 lg:p-5">
        <h3 className="font-semibold text-[10px] xs:text-xs sm:text-sm lg:text-base text-gray-900 mb-1 xs:mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors min-h-[2rem] xs:min-h-[2.5rem] sm:min-h-[3rem]">
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm xs:text-base sm:text-lg lg:text-2xl font-bold text-amber-700">${price}</span>
          {inStock && (
            <span className="hidden xs:block text-[9px] xs:text-[10px] sm:text-xs lg:text-sm text-gray-500">Free Ship</span>
          )}
        </div>
      </div>
    </div>
  );
}
