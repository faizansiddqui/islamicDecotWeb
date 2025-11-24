import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Clock, Package, Truck, XCircle } from 'lucide-react';
import { userAPI } from '../services/api';
import { navigateTo } from '../utils/navigation';

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
    payment_method?: string;
    payu_transaction_id?: string;
}

interface OrderDetailsPageProps {
    orderId: string;
    onBack: () => void;
}

export default function OrderDetailsPage({ orderId, onBack }: OrderDetailsPageProps) {
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState<string | null>(null);

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

    const handleCancelOrder = async () => {
        if (isCancelling) return;

        setIsCancelling(true);
        setCancelError(null);
        try {
            await userAPI.cancelOrder(orderId);
            // Update the order status locally to reflect the cancellation immediately
            if (order) {
                setOrder({
                    ...order,
                    status: 'cancelled'
                });
            }
        } catch (error) {
            console.error('Failed to cancel order:', error);
            setCancelError('Failed to cancel order. Please try again.');
        } finally {
            setIsCancelling(false);
        }
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

    // Determine the current status index for progress tracking
    const getStatusIndex = (status?: string) => {
        if (!status) return 0;

        // Normalize status string
        const normalizedStatus = status.toLowerCase().trim().replace(' ', '_').replace('-', '_');

        // For cancelled orders, show direct path from pending to cancelled
        if (normalizedStatus === 'cancelled') {
            return 1; // Show progress to cancelled status
        }

        // For RTO orders, show path from pending to delivered to RTO
        if (normalizedStatus === 'rto') {
            return 4; // Show progress to RTO status (beyond delivered)
        }

        // Explicit status mapping for better reliability
        switch (normalizedStatus) {
            case 'pending':
                return 0;
            case 'confirm':
            case 'confirmed':
                return 1;
            case 'ongoing':
            case 'out_for_delivery':
            case 'outfordelivery':
            case 'out for delivery':
                return 2;
            case 'delivered':
                return 3;
            default:
                return 0; // Default to pending
        }
    };

    const statusIndex = getStatusIndex(order.status);

    // Updated status steps to include cancelled and RTO status
    const statusSteps = order.status === 'cancelled'
        ? [
            { name: 'Pending in Confirmation', icon: Clock, color: 'bg-amber-500' },
            { name: 'Cancelled', icon: XCircle, color: 'bg-red-500' }
        ]
        : order.status === 'rto'
            ? [
                { name: 'Pending in Confirmation', icon: Clock, color: 'bg-amber-500' },
                { name: 'Confirmed', icon: Check, color: 'bg-blue-500' },
                { name: 'Ongoing On the Way', icon: Truck, color: 'bg-indigo-500' },
                { name: 'Delivered', icon: Check, color: 'bg-green-500' },
                { name: 'RTO', icon: XCircle, color: 'bg-orange-500' }
            ]
            : [
                { name: 'Pending in Confirmation', icon: Clock, color: 'bg-amber-500' },
                { name: 'Confirmed', icon: Check, color: 'bg-blue-500' },
                { name: 'Ongoing On the Way', icon: Truck, color: 'bg-indigo-500' },
                { name: 'Delivered', icon: Check, color: 'bg-green-500' }
            ];

    const shouldShowCancelButton = (order: Order) => {
        // Only show cancel button for pending orders
        if (order.status?.toLowerCase() === 'pending') {
            return true;
        }

        // For all other statuses, don't show cancel button
        return false;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Orders</span>
                    </button>
                </div>

                {/* Progress Tracker - Desktop Only (Horizontal) */}
                <div className="hidden md:block bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="flex justify-between relative">
                        {/* Progress line */}
                        <div className="absolute top-5 left-[60px] right-[15px] h-1 bg-gray-200 -z-0">

                            <div
                                className="h-full bg-emerald-500 transition-all duration-500 ease-in-out"
                                style={{ width: `${statusIndex === 0 ? 0 : Math.min((statusIndex / (statusSteps.length - 1)) * 100, 100)}%` }}
                            />
                        </div>

                        {statusSteps.map((step, index) => {
                            const isCompleted = index <= statusIndex;
                            const isActive = index === statusIndex;
                            const Icon = step.icon;

                            return (
                                <div key={index} className="flex flex-col items-center relative z-10">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? step.color : 'bg-gray-300'} ${isActive ? 'ring-4 ring-offset-2 ring-emerald-100' : ''}`}
                                    >
                                        <Icon className="text-white" size={16} />
                                    </div>
                                    <span className={`text-xs font-medium mt-2 text-center px-2 ${isCompleted ? 'text-gray-900' : 'text-gray-500'} ${isActive ? 'font-bold' : ''}`}>
                                        {step.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Order #{order.order_id.slice(0, 8)}</h2>
                                <span className={`px-4 py-2 rounded-lg font-semibold ${order.status === 'cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : order.status === 'delivered'
                                        ? 'bg-green-100 text-green-700'
                                        : order.status === 'confirm' || order.status === 'confirmed'
                                            ? 'bg-blue-100 text-blue-700'
                                            : order.status === 'reject' || order.status === 'rejected'
                                                ? 'bg-red-100 text-red-700'
                                                : order.status === 'rto'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : order.status === 'out_for_delivery' || order.status === 'out for delivery' || order.status === 'ongoing'
                                                        ? 'bg-indigo-100 text-indigo-700'
                                                        : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ') : 'Pending in Confirmation'}
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6">
                                {order.Product && (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={getProductImage(order.Product)}
                                            alt={order.Product.name}
                                            className="w-32 h-32 object-cover rounded-lg cursor-pointer"
                                            onClick={() => navigateTo(`/product/${order.Product?.product_id}`)}
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

                            {/* Cancel Order Button - Only show if order can be cancelled */}
                            {shouldShowCancelButton(order) ? (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    {cancelError && (
                                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                            {cancelError}
                                        </div>
                                    )}
                                    <button
                                        onClick={handleCancelOrder}
                                        disabled={isCancelling}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isCancelling
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                                            }`}
                                    >
                                        <XCircle size={16} />
                                        {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        {/* Order Information Section - Added at the bottom of order summary */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Order ID</p>
                                    <p className="font-medium">#{order.order_id}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Order Date & Time</p>
                                    <p className="font-medium">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                                    <p className="font-medium">Paid via PayU</p>
                                    {order.payu_transaction_id && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Transaction ID: {order.payu_transaction_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Progress Tracker - Mobile Only (Vertical at bottom) */}
                        <div className="md:hidden bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Progress</h3>
                            <div className="flex flex-col items-start relative">
                                {/* Vertical line */}
                                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200 -z-0">
                                    {/* Progress line */}
                                    <div
                                        className="w-full bg-emerald-500 transition-all duration-500 ease-in-out"
                                        style={{
                                            height: `${statusIndex === 0 ? 0 : Math.min((statusIndex / (statusSteps.length - 1)) * 100, 100)}%`
                                        }}
                                    />
                                </div>

                                {statusSteps.map((step, index) => {
                                    const isCompleted = index <= statusIndex;
                                    const isActive = index === statusIndex;
                                    const Icon = step.icon;

                                    return (
                                        <div key={index} className="flex items-center mb-6 last:mb-0 w-full relative z-10">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${isCompleted ? step.color : 'bg-gray-300'} ${isActive ? 'ring-4 ring-offset-2 ring-emerald-100' : ''}`}
                                            >
                                                <Icon className="text-white" size={16} />
                                            </div>
                                            <div className="flex-1 flex items-center">
                                                {isActive && (
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                                )}
                                                <span className={`text-sm font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'} ${isActive ? 'font-bold' : ''}`}>
                                                    {step.name}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Order Information */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Customer Details</h2>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                                    <p className="font-medium">{order.FullName}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Contact Info</p>
                                    <p>{order.phone1}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Delivery Address</h2>

                            <div className="space-y-2">
                                <p className="font-medium">{order.FullName}</p>
                                <p className="text-gray-600">
                                    {order.address}, {order.city}, {order.state} {order.pinCode}
                                </p>
                                <p className="text-gray-600">Phone: {order.phone1}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}