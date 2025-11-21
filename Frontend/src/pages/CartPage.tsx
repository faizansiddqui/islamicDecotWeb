import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { navigateTo } from '../utils/navigation';

interface CartPageProps {
    onBack?: () => void;
}

export default function CartPage({ onBack }: CartPageProps) {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
    } = useCart();
    const { isAuthenticated } = useAuth();
    const [productStocks, setProductStocks] = useState<Record<number, number>>({});
    const [loadingStocks, setLoadingStocks] = useState(false);

    const total = getTotalPrice();

    // Fetch stock information for cart items
    useEffect(() => {
        const fetchStocks = async () => {
            setLoadingStocks(true);
            const stocks: Record<number, number> = {};

            for (const item of cartItems) {
                try {
                    const response = await productAPI.getProductById(item.id);
                    if (response.data.status === 200 && response.data.data && response.data.data.length > 0) {
                        const product = response.data.data[0];
                        stocks[item.id] = product.quantity || 0;
                    } else {
                        stocks[item.id] = 0;
                    }
                } catch (error) {
                    console.error(`Failed to fetch stock for product ${item.id}:`, error);
                    stocks[item.id] = item.stock || 0;
                }
            }

            setProductStocks(stocks);

            // Auto-adjust quantities and remove out-of-stock items
            for (const item of cartItems) {
                const availableStock = stocks[item.id] ?? item.stock ?? 0;
                if (availableStock < 1) {
                    // Remove out-of-stock items
                    removeFromCart(item.id);
                } else if (item.quantity > availableStock) {
                    // Adjust quantity to available stock
                    updateQuantity(item.id, availableStock);
                }
            }

            setLoadingStocks(false);
        };

        if (cartItems.length > 0) {
            fetchStocks();
        }
    }, [cartItems, removeFromCart, updateQuantity]);

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            window.location.hash = '';
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors mb-8"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Continue Shopping</span>
                    </button>

                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <ShoppingBag size={80} className="mx-auto text-gray-300 mb-6" />
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                            <p className="text-gray-600 mb-8">
                                Looks like you haven't added anything to your cart yet.
                            </p>
                            <button
                                onClick={handleBack}
                                className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Start Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Continue Shopping</span>
                </button>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                    <span className="text-gray-600">
                        {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
                    </span>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row gap-6"
                            >
                                <div className="flex-shrink-0">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-32 h-32 object-cover rounded-lg"
                                    />
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            {item.name}
                                        </h3>
                                        <p className="text-2xl font-bold text-amber-700 mb-2">
                                            ${item.price}
                                        </p>
                                        {productStocks[item.id] !== undefined && (
                                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${productStocks[item.id] >= 1
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {productStocks[item.id] >= 1
                                                    ? `In Stock`
                                                    : 'Out of Stock'
                                                }
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center border border-gray-300 rounded-lg">
                                                <button
                                                    onClick={() => {
                                                        if (item.quantity > 1) {
                                                            updateQuantity(item.id, item.quantity - 1);
                                                        } else {
                                                            removeFromCart(item.id);
                                                        }
                                                    }}
                                                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="px-6 py-2 font-semibold min-w-[3rem] text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        const availableStock = productStocks[item.id] ?? item.stock ?? 0;
                                                        if (item.quantity < availableStock && availableStock >= 1) {
                                                            updateQuantity(item.id, item.quantity + 1);
                                                        }
                                                    }}
                                                    disabled={
                                                        loadingStocks ||
                                                        !productStocks[item.id] ||
                                                        productStocks[item.id] < 1 ||
                                                        item.quantity >= (productStocks[item.id] ?? item.stock ?? 0)
                                                    }
                                                    className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            {(productStocks[item.id] !== undefined && productStocks[item.id] < 1) && (
                                                <p className="text-xs text-red-600">Out of Stock</p>
                                            )}
                                            {(productStocks[item.id] !== undefined && productStocks[item.id] >= 1 && item.quantity > productStocks[item.id]) && (
                                                <p className="text-xs text-orange-600">Only {productStocks[item.id]} available</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="text-xl font-bold text-gray-900">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove item"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={clearCart}
                            className="text-red-600 hover:text-red-700 font-medium transition-colors"
                        >
                            Clear Cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
                            
                            <div className="border-t border-gray-200 pt-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-amber-700">
                                        ${total.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        navigateTo('/log');
                                        return;
                                    }
                                    navigateTo('/checkout');
                                }}
                                className="w-full bg-amber-700 hover:bg-amber-800 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg mb-4"
                            >
                                <Check size={20} />
                                Proceed to Checkout
                            </button>

                            <button
                                onClick={handleBack}
                                className="w-full border-2 border-gray-300 hover:border-amber-700 text-gray-700 hover:text-amber-700 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

