import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Package } from 'lucide-react';
import { userAPI } from '../services/api';

interface Product {
    product_id: number;
    name: string;
    price: number;
    selling_price?: number;
    product_image: string | string[] | { [key: string]: string };
    description?: string;
}

interface Order {
    order_id: string;
    product_id: number;
    FullName: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    phone1: string;
    phone2?: string;
    createdAt: string;
    status?: string;
    quantity?: number;
    Product?: Product;
}

interface OrderDetailsPageProps {
    orderId: string;
    onBack: () => void;
}

export default function OrderDetailsPage({ orderId, onBack }: OrderDetailsPageProps) {
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const response = await userAPI.getOrders();

            if (response && response.data) {
                let orders: Order[] = [];

                // Handle different response structures
                if (Array.isArray(response.data)) {
                    orders = response.data;
                } else if (response.data.orders && Array.isArray(response.data.orders)) {
                    orders = response.data.orders;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    orders = response.data.data;
                }

                // Find the specific order
                const foundOrder = orders.find(o => o.order_id === orderId);
                if (foundOrder) {
                    setOrder(foundOrder);
                } else {
                    setError('Order not found');
                }
            } else {
                setError('Failed to load order details');
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
            setError('Failed to load order details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getProductImage = (product?: Product) => {
        if (!product || !product.product_image) return '';

        if (typeof product.product_image === 'string') {
            return product.product_image;
        } else if (Array.isArray(product.product_image)) {
            return product.product_image[0] || '';
        } else if (typeof product.product_image === 'object' && product.product_image !== null) {
            const imageValues = Object.values(product.product_image);
            return imageValues[0] || '';
        }

        return '';
    };

    const getProductPrice = (product?: Product) => {
        if (!product) return 0;

        if (typeof product.selling_price === 'number' && !isNaN(product.selling_price) && product.selling_price > 0) {
            return product.selling_price;
        } else if (typeof product.price === 'number' && !isNaN(product.price) && product.price > 0) {
            return product.price;
        }

        return 0;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors mb-8"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Orders</span>
                    </button>

                    <div className="bg-red-50 border border-red-200 rounded-xl shadow-md p-8 text-center">
                        <Package size={80} className="mx-auto text-red-300 mb-6" />
                        <h2 className="text-2xl font-bold text-red-900 mb-4">Error Loading Order</h2>
                        <p className="text-red-700 mb-6">{error}</p>
                        <button
                            onClick={fetchOrderDetails}
                            className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors mb-8"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Orders</span>
                    </button>

                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <Package size={80} className="mx-auto text-gray-300 mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
                        <p className="text-gray-600 mb-8">
                            The requested order could not be found.
                        </p>
                        <button
                            onClick={onBack}
                            className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Back to Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const totalPrice = getProductPrice(order.Product) * (order.quantity || 1);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Orders</span>
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Details</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Order #{order.order_id.slice(0, 8)}</h2>
                                <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-semibold">
                                    {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Confirmed'}
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6">
                                {order.Product && (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={getProductImage(order.Product)}
                                            alt={order.Product.name}
                                            className="w-32 h-32 object-cover rounded-lg"
                                        />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {order.Product?.name || 'Product'}
                                    </h3>

                                    {order.Product?.description && (
                                        <p className="text-gray-600 mb-4">{order.Product.description}</p>
                                    )}

                                    <div className="space-y-2">
                                        <p className="flex justify-between">
                                            <span className="text-gray-600">Price:</span>
                                            <span className="font-medium">${getProductPrice(order.Product).toFixed(2)}</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span className="text-gray-600">Quantity:</span>
                                            <span className="font-medium">{order.quantity}</span>
                                        </p>
                                        <div className="border-t border-gray-200 pt-2 mt-2">
                                            <p className="flex justify-between text-lg font-bold">
                                                <span>Total:</span>
                                                <span className="text-amber-700">${totalPrice.toFixed(2)}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Information */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Information</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="text-amber-700 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Order Date</p>
                                        <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Package className="text-amber-700 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Order ID</p>
                                        <p className="font-medium font-mono">{order.order_id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>

                            <div className="space-y-2">
                                <p className="font-medium">{order.FullName}</p>
                                <p className="flex items-start gap-2">
                                    <MapPin size={16} className="text-amber-700 mt-1 flex-shrink-0" />
                                    <span>{order.address}, {order.city}, {order.state} {order.pinCode}</span>
                                </p>
                                <p>Phone: {order.phone1}{order.phone2 ? `, ${order.phone2}` : ''}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}