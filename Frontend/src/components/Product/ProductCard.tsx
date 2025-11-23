import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import WishlistButton from './WishlistButton';
import { Product } from '../../utils/productUtils';
import { navigateTo } from '../../utils/navigation';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  badge?: 'new' | 'bestseller' | null;
  oldPrice?: number;
  disableHover?: boolean;
}

export default function ProductCard({ id, name, price, image, category, inStock, badge, oldPrice, disableHover = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  // Create a product object for the wishlist button
  const product: Product = {
    product_id: id,
    name: name,
    price: price,
    selling_price: price,
    product_image: image,
    quantity: inStock ? 10 : 0, // Just a placeholder quantity
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inStock) {
      // Pass product data to addToCart
      addToCart(id, 1, {
        name: name,
        price: price,
        image: image
      });
      setAddedToCart(true);
    }
  };

  const handleGoToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigateTo('/cart');
  };

  const handleProductClick = () => {
    navigateTo(`/product/${id}`);
  };

  // Only apply hover effects if not disabled
  const shouldApplyHover = !disableHover;

  return (
    <div
      className={`group bg-white rounded-lg xs:rounded-xl shadow-md overflow-hidden cursor-pointer ${shouldApplyHover ? 'sm:transition-all sm:duration-300 sm:hover:shadow-2xl sm:hover:-translate-y-1 sm:hover:-translate-y-2' : ''}`}
      onMouseEnter={() => shouldApplyHover && setIsHovered(true)}
      onMouseLeave={() => shouldApplyHover && setIsHovered(false)}
      onClick={handleProductClick}
    >
      <div className="relative overflow-hidden aspect-square">
        <img
          src={image}
          alt={name}
          className={`w-full h-full object-cover ${shouldApplyHover ? 'sm:transition-transform sm:duration-500' : ''} ${isHovered && shouldApplyHover ? 'sm:scale-110' : 'sm:scale-100'}`}
          loading="lazy"
        />

        {!inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 rounded-lg font-semibold text-[9px] xs:text-xs sm:text-sm">
              Out of Stock
            </span>
          </div>
        )}

        <div className="absolute top-1.5 xs:top-2 sm:top-3 left-1.5 xs:left-2 sm:left-3 flex flex-col gap-1">
          {badge && (
            <span className={`px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 rounded-full text-[8px] xs:text-[9px] sm:text-xs font-bold uppercase ${badge === 'new'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
              }`}>
              {badge === 'new' ? 'New' : 'Bestseller'}
            </span>
          )}
          {category && (
            <span className="bg-amber-700 text-white px-1.5 xs:px-2 sm:px-3 py-0.5 xs:py-1 rounded-full text-[8px] xs:text-[9px] sm:text-xs font-semibold">
              {category}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-1.5 xs:top-2 sm:top-3 right-1.5 xs:right-2 sm:right-3">
          <WishlistButton product={product} size="sm" />
        </div>

        <div
          className={`hidden sm:block absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 xs:p-3 sm:p-4 ${shouldApplyHover ? 'sm:transition-all sm:duration-300' : ''} ${isHovered || addedToCart ? 'sm:translate-y-0 sm:opacity-100' : 'sm:translate-y-full sm:opacity-0'}`}
        >
          {addedToCart ? (
            <button
              onClick={handleGoToCart}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 xs:py-2 rounded-lg font-semibold flex items-center justify-center gap-1 xs:gap-2 sm:transition-colors text-xs xs:text-sm"
            >
              Go to Cart
              <ArrowRight size={14} className="xs:w-4 xs:h-4" />
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white py-1.5 xs:py-2 rounded-lg font-semibold flex items-center justify-center gap-1 xs:gap-2 sm:transition-colors text-xs xs:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!inStock}
            >
              <ShoppingCart size={14} className="xs:w-4 xs:h-4" />
              Add to Cart
            </button>
          )}
        </div>
      </div>

      <div className="p-2 xs:p-2.5 sm:p-3 lg:p-4">
        <h3 className={`font-semibold text-[10px] xs:text-xs sm:text-sm text-gray-900 mb-1 xs:mb-1.5 sm:mb-2 line-clamp-2 min-h-[2rem] xs:min-h-[2.25rem] sm:min-h-[2.5rem] ${shouldApplyHover ? 'sm:group-hover:text-amber-700 sm:transition-colors' : ''}`}>
          {name}
        </h3>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs xs:text-sm sm:text-base lg:text-lg font-bold text-amber-700">${price}</span>
            {oldPrice && oldPrice > price && (
              <>
                <span className="text-[9px] xs:text-[10px] sm:text-xs text-gray-400 line-through">${oldPrice}</span>
                <span className="bg-green-100 text-green-700 px-1.5 xs:px-2 py-0.5 rounded-full text-[8px] xs:text-[9px] sm:text-xs font-semibold">
                  Save {Math.round(((oldPrice - price) / oldPrice) * 100)}%
                </span>
              </>
            )}
          </div>
          {inStock && (
            <span className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500">Free Shipping</span>
          )}
        </div>
      </div>
    </div>
  );
}