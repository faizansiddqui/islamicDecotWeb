import { ShoppingCart, ArrowRight } from 'lucide-react';

interface ProductActionsProps {
    quantity: number;
    selectedQuantity: number;
    onQuantityDecrease: () => void;
    onQuantityIncrease: () => void;
    onAddToCart: () => void;
    addedToCart: boolean;
    onGoToCart: () => void;
}

export default function ProductActions({
    quantity,
    selectedQuantity,
    onQuantityDecrease,
    onQuantityIncrease,
    onAddToCart,
    addedToCart,
    onGoToCart
}: ProductActionsProps) {
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
        </div>
    );
}