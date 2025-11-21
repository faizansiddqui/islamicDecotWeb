import { useState, useEffect } from 'react';
import { Star, Sparkles, Clock } from 'lucide-react';
import { productAPI } from '../services/api';
import { Product, getImageUrl } from '../utils/productUtils';

interface NewArrivalsProps {
    onProductClick: (productId: number) => void;
}

export default function NewArrivals({ onProductClick }: NewArrivalsProps) {
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
                // Get the most recent products (last 6)
                const newArrivals = response.data.products
                    .sort((a: Product, b: Product) => {
                        const dateA = new Date(a.createdAt || 0).getTime();
                        const dateB = new Date(b.createdAt || 0).getTime();
                        return dateB - dateA;
                    })
                    .slice(0, 6);
                setProducts(newArrivals);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Error loading new arrivals:', error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateDiscount = (price: number, oldPrice: number) => {
        return Math.round(((oldPrice - price) / oldPrice) * 100);
    };

    if (isLoading) {
        return (
            <div className="bg-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="bg-white py-12 sm:py-16 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Clock className="text-amber-700" size={24} />
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                            New Arrivals
                        </h2>
                        <Clock className="text-amber-700" size={24} />
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                        Fresh additions to our collection - Be the first to own these exclusive pieces
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
                    {products.map((product) => {
                        const imageUrl = getImageUrl(product.product_image);
                        const displayPrice = product.selling_price || product.price;
                        const oldPrice = product.price > product.selling_price ? product.price : undefined;

                        return (
                            <div
                                key={product.product_id}
                                onClick={() => onProductClick(product.product_id)}
                                className="group cursor-pointer bg-white rounded-lg overflow-hidden sm:hover:shadow-xl sm:transition-all sm:duration-300 sm:transform sm:hover:-translate-y-1 border border-gray-200"
                            >
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                    <div className="absolute top-2 left-2 z-10">
                                        <span className="px-2 py-1 rounded-full text-xs font-bold uppercase bg-green-600 text-white flex items-center gap-1">
                                            <Sparkles size={12} />
                                            New
                                        </span>
                                    </div>
                                    <img
                                        src={imageUrl}
                                        alt={product.name || product.title || 'Product'}
                                        className="w-full h-full object-cover sm:group-hover:scale-110 sm:transition-transform sm:duration-500"
                                        loading="lazy"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image';
                                        }}
                                    />
                                </div>

                                <div className="p-3">
                                    <div className="flex items-center gap-0.5 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={10} className="text-yellow-400 fill-current" />
                                        ))}
                                    </div>

                                    <h3 className="text-xs sm:text-sm text-gray-900 font-medium mb-2 line-clamp-2 min-h-[2rem] sm:group-hover:text-amber-700 sm:transition-colors">
                                        {product.name || product.title || 'Product'}
                                    </h3>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-base sm:text-lg font-bold text-amber-700">
                                            ${displayPrice}
                                        </span>
                                        {oldPrice && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400 line-through">
                                                    ${oldPrice}
                                                </span>
                                                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
                                                    -{calculateDiscount(displayPrice, oldPrice)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-10">
                    <button
                        onClick={() => window.location.pathname = '/categories'}
                        className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 text-sm sm:text-base font-semibold transition-all sm:transform sm:hover:scale-105 uppercase tracking-wide rounded-lg shadow-lg"
                    >
                        Explore All New Items
                    </button>
                </div>
            </div>
        </div>
    );
}