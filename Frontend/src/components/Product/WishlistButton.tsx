import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { Product } from '../../utils/productUtils';

interface WishlistButtonProps {
    product: Product;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function WishlistButton({ product, size = 'md', showLabel = false }: WishlistButtonProps) {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        setIsWishlisted(isInWishlist(product.product_id));
    }, [product.product_id, isInWishlist]);

    const handleClick = async () => {
        if (isWishlisted) {
            await removeFromWishlist(product.product_id);
        } else {
            await addToWishlist(product);
        }
        setIsWishlisted(!isWishlisted);
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return 'p-1.5';
            case 'lg': return 'p-3';
            default: return 'p-2';
        }
    };

    const getIconSize = () => {
        switch (size) {
            case 'sm': return 16;
            case 'lg': return 24;
            default: return 20;
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`${getSizeClasses()} rounded-full border border-gray-300 hover:border-amber-600 transition-colors flex items-center gap-1 group`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                size={getIconSize()}
                className={`${isWishlisted ? 'fill-amber-600 text-amber-600' : 'text-gray-400 group-hover:text-amber-600'} transition-colors`}
            />
            {showLabel && (
                <span className="text-xs font-medium text-gray-700 group-hover:text-amber-600">
                    {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                </span>
            )}
        </button>
    );
}