import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook
import { useCart } from '../../context/CartContext'; // Import useCart hook
import { navigateTo } from '../../utils/navigation'; // Import navigateTo function

interface ProductActionsProps {
    quantity: number;
    selectedQuantity: number;
    onQuantityDecrease: () => void;
    onQuantityIncrease: () => void;
    onAddToCart: () => void;
    addedToCart: boolean;
    onGoToCart: () => void;
    productId: number;
    productName: string;
    productPrice: number;
    productImage: string;
}

export default function ProductActions({
    quantity,
    selectedQuantity,
    onQuantityDecrease,
    onQuantityIncrease,
    onAddToCart,
    addedToCart,
    onGoToCart,
    productId,
    productName,
    productPrice,
    productImage
}: ProductActionsProps) {
    const { isAuthenticated } = useAuth(); // Get authentication status
    const { addToCart } = useCart(); // Get cart functions

    const handleBuyNow = () => {
        if (isAuthenticated) {
            // If user is logged in, add to cart and go to checkout
            addToCart(productId, selectedQuantity, {
                name: productName,
                price: productPrice,
                image: productImage
            });
            navigateTo('/checkout');
        } else {
            // If user is not logged in, go to login page
            navigateTo('/log');
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4">
            <div className="flex items-center border border-gray-300 rounded-lg self-start sm:self-auto">
                <button
                    onClick={onQuantityDecrease}
                    disabled={selectedQuantity <= 1}
                    className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    -
                </button>
                <span className="px-4 sm:px-6 py-2 sm:py-3 font-semibold text-sm sm:text-base min-w-[3rem] text-center">{selectedQuantity}</span>
                <button
                    onClick={onQuantityIncrease}
                    disabled={selectedQuantity >= quantity}
                    className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    +
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                {addedToCart ? (
                    <button
                        onClick={onGoToCart}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 sm:py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                        Go to Cart
                        <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                    </button>
                ) : (
                    <button
                        onClick={onAddToCart}
                        disabled={quantity === 0}
                        className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 sm:py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                        <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
                        {quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                )}

                {/* Buy Now Button - Visible on mobile view */}
                <button
                    onClick={handleBuyNow}
                    disabled={quantity === 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 sm:py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base sm:hidden"
                >
                    {quantity === 0 ? 'Out of Stock' : 'Buy Now'}
                </button>
            </div>

            {/* Buy Now Button - Hidden on mobile view */}
            <button
                onClick={handleBuyNow}
                disabled={quantity === 0}
                className="hidden sm:flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 sm:py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {quantity === 0 ? 'Out of Stock' : 'Buy Now'}
            </button>
        </div>
    );
}