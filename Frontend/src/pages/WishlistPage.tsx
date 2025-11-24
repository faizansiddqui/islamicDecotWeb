import { useWishlist } from '../context/WishlistContext';
import { ArrowLeft, Heart, ShoppingCart, X } from 'lucide-react';
import ProductCard from '../components/Product/ProductCard';
import { useCart } from '../context/CartContext';
import { navigateTo } from '../utils/navigation';
import { Product } from '../utils/productUtils';
import { useAuthProtection } from '../utils/authProtection';

export default function WishlistPage() {
    useAuthProtection(); // Protect this route
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleRemoveFromWishlist = async (productId: number) => {
        await removeFromWishlist(productId);
    };

    const handleAddToCart = async (product: Product) => {
        try {
            await addToCart(product.product_id, 1);
            // Optionally remove from wishlist after adding to cart
            // await removeFromWishlist(product.product_id);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    const handleBack = () => {
        navigateTo('/profile');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Profile</span>
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <Heart className="text-amber-700" size={32} />
                    <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <Heart size={48} className="text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-600 mb-6">Start adding items you love to your wishlist</p>
                        <button
                            onClick={() => navigateTo('/')}
                            className="bg-amber-700 hover:bg-amber-800 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistItems.map((product) => (
                            <div key={product.product_id} className="bg-white rounded-xl shadow-md overflow-hidden relative">
                                <button
                                    onClick={() => handleRemoveFromWishlist(product.product_id)}
                                    className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors z-10"
                                >
                                    <X size={20} className="text-gray-600" />
                                </button>

                                <ProductCard
                                    id={product.product_id}
                                    name={product.name}
                                    price={product.selling_price}
                                    image={typeof product.product_image === 'string' ? product.product_image : Array.isArray(product.product_image) ? product.product_image[0] : Object.values(product.product_image)[0]}
                                    category={product.Catagory?.name || 'Uncategorized'}
                                    inStock={product.quantity > 0}
                                    disableHover={true}
                                />

                                <div className="p-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product);
                                        }}
                                        className="w-full bg-amber-700 hover:bg-amber-800 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <ShoppingCart size={18} />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}