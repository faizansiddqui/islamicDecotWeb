import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Clock, Package, Truck, XCircle } from 'lucide-react';
import { userAPI } from '../services/api';
import { navigateTo } from '../utils/navigation';
import { useAuthProtection } from '../utils/authProtection';

interface Product {
    product_id: number;
    name: string;
    price: number;
    selling_price?: number;
    product_image: string | string[] | { [key: string]: string };
    description?: string;
}

// Add OrderItem interface
interface OrderItem {
    order_item_id: number;
    order_id: string;
    product_id: number;
    quantity: number;
    price: string;
    Product: Product;
}

interface Order {
    order_id: string;
    FullName: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    phone1: string;
    phone2?: string;
    createdAt: string;
    status?: string;
    totalAmount: string;
    payment_method?: string;
    payu_transaction_id?: string;
    payment_status?: string; // Add payment_status property
    Product?: Product;
    items?: OrderItem[]; // Add items array
}

interface OrderDetailsPageProps {
    orderId: string;
    onBack: () => void;
}

export default function OrderDetailsPage({ orderId, onBack }: OrderDetailsPageProps) {
    const { isLoading: authLoading } = useAuthProtection();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState<string | null>(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [isCancelDropdownOpen, setIsCancelDropdownOpen] = useState(false); // Add this state for dropdown

    useEffect(() => {
        fetchOrderDetails();

        // Close cancel dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            const dropdown = document.getElementById('cancel-dropdown');
            if (dropdown && !dropdown.contains(event.target as Node)) {
                setIsCancelDropdownOpen(false);
            }
        };

        if (isCancelDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [orderId, isCancelDropdownOpen]);

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
                    // If payment failed, set order status to 'payment failed'
                    if (foundOrder.payment_status === 'failed') {
                        setOrder({ ...foundOrder, status: 'payment failed' });
                    }
                    // If payment is successful (paid/success) and order is pending, automatically confirm the order
                    else if ((foundOrder.payment_status === 'success' || foundOrder.payment_status === 'paid') && foundOrder.status?.toLowerCase() === 'pending') {
                        setOrder({ ...foundOrder, status: 'confirmed' });
                    }
                    // If order is pending (and payment is not successful), automatically set status to 'payment failed'
                    else if (foundOrder.status?.toLowerCase() === 'pending') {
                        setOrder({ ...foundOrder, status: 'payment failed' });
                    } else {
                        setOrder(foundOrder);
                    }
                } else {
                    setError('Order not found');
                }
            } else {
                setError('Failed to load order details');
            }
        } catch (err) {
            console.error('Error fetching order details:', err);

            // Type guard for axios error
            if (err && typeof err === 'object' && 'request' in err) {
                const axiosError = err as { response?: { status?: number }; request?: unknown };

                // Check if it's a network error
                if (!axiosError.response && axiosError.request) {
                    setError('Check your internet connection');
                }
                // Check if it's a backend error
                else if (axiosError.response?.status && axiosError.response.status >= 500) {
                    setError('We will fix it soon');
                }
                // For other errors
                else {
                    setError('Failed to load order details. Please try again.');
                }
            } else {
                setError('Failed to load order details. Please try again.');
            }
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
            setShowCancelDialog(false);
        } catch (error) {
            console.error('Failed to cancel order:', error);

            // Type guard for axios error
            if (error && typeof error === 'object' && 'request' in error) {
                const axiosError = error as { response?: { status?: number }; request?: unknown };

                // Check if it's a network error
                if (!axiosError.response && axiosError.request) {
                    setCancelError('Check your internet connection');
                }
                // Check if it's a backend error
                else if (axiosError.response?.status && axiosError.response.status >= 500) {
                    setCancelError('We will fix it soon');
                }
                // For other errors
                else {
                    setCancelError('Failed to cancel order. Please try again.');
                }
            } else {
                setCancelError('Failed to cancel order. Please try again.');
            }
        } finally {
            setIsCancelling(false);
        }
    };

    const handleCancelConfirmation = () => {
        setShowCancelDialog(true);
    };

    const closeCancelDialog = () => {
        setShowCancelDialog(false);
    };

    const confirmCancelOrder = async () => {
        await handleCancelOrder();
    };

    if (authLoading || isLoading) {
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

    // Calculate total price from items or Product
    const totalPrice = order.items && order.items.length > 0
        ? order.items.reduce((sum, item) => sum + (getProductPrice(item.Product) * item.quantity), 0)
        : (order.Product ? getProductPrice(order.Product) : 0);

    // Determine the current status index for progress tracking
    const getStatusIndex = (status?: string, paymentStatus?: string) => {
        // If payment failed, show payment failed status
        if (paymentStatus === 'failed' || status?.toLowerCase() === 'payment failed') {
            return 1; // Show progress to payment failed status
        }

        // If payment is successful (paid/success) and order was pending, show confirmed status
        if ((paymentStatus === 'success' || paymentStatus === 'paid') && status?.toLowerCase() === 'pending') {
            return 1; // Show progress to confirmed status
        }

        if (!status) return 0;

        // Normalize status string
        const normalizedStatus = status.toLowerCase().trim().replace(' ', '_').replace('-', '_');

        // For cancelled orders, show direct path from pending to cancelled
        if (normalizedStatus === 'cancelled') {
            return 1; // Show progress to cancelled status
        }

        // For rejected orders, show direct path from pending to rejected
        if (normalizedStatus === 'rejected' || normalizedStatus === 'reject') {
            return 1; // Show progress to rejected status
        }

        // For RTO orders, show path from pending to delivered to RTO
        if (normalizedStatus === 'rto') {
            return 4; // Show progress to RTO status (beyond delivered)
        }

        // Explicit status mapping for better reliability
        switch (normalizedStatus) {
            case 'pending':
            case 'payment failed':
                return 1; // Show progress to payment failed status
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

    const statusIndex = getStatusIndex(order.status, order.payment_status);

    // Updated status steps to include cancelled, payment failed, and RTO status
    const statusSteps = order.payment_status === 'failed' || order.status?.toLowerCase() === 'payment failed'
        ? [
            { name: 'Payment in Pending', icon: Clock, color: 'bg-amber-500' },
            { name: 'Payment Failed', icon: XCircle, color: 'bg-red-500' }
        ]
        : (order.payment_status === 'success' || order.payment_status === 'paid') && order.status?.toLowerCase() === 'pending'
            ? [
                { name: 'Payment in Pending', icon: Clock, color: 'bg-amber-500' },
                { name: 'Payment Confirmed', icon: Check, color: 'bg-blue-500' },
                { name: 'On the Way', icon: Truck, color: 'bg-indigo-500' },
                { name: 'Delivered', icon: Check, color: 'bg-green-500' }
            ]
            : order.status === 'cancelled'
                ? [
                    { name: 'Payment in Pending', icon: Clock, color: 'bg-amber-500' },
                    { name: 'Cancelled', icon: XCircle, color: 'bg-red-500' }
                ]
                : order.status === 'reject' || order.status === 'rejected'
                    ? [
                        { name: 'Payment in Pending', icon: Clock, color: 'bg-amber-500' },
                        { name: 'Rejected', icon: XCircle, color: 'bg-red-500' }
                    ]
                    : order.status === 'rto'
                        ? [
                            { name: 'Payment in Pending', icon: Clock, color: 'bg-amber-500' },
                            { name: 'Payment Confirmed', icon: Check, color: 'bg-blue-500' },
                            { name: 'On the Way', icon: Truck, color: 'bg-indigo-500' },
                            { name: 'Delivered', icon: Check, color: 'bg-green-500' },
                            { name: 'RTO', icon: XCircle, color: 'bg-orange-500' }
                        ]
                        : [
                            { name: 'Payment in Pending', icon: Clock, color: 'bg-amber-500' },
                            { name: 'Payment Confirmed', icon: Check, color: 'bg-blue-500' },
                            { name: 'On the Way', icon: Truck, color: 'bg-indigo-500' },
                            { name: 'Delivered', icon: Check, color: 'bg-green-500' }
                        ];

    const shouldShowCancelButton = (order: Order) => {
        // Don't show cancel button if more than 24 hours have passed since order creation
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const hoursDifference = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

        if (hoursDifference > 24) {
            return false;
        }

        // Don't show cancel button for delivered, cancelled, rejected, RTO, or payment failed orders
        const statusLower = order.status?.toLowerCase();
        if (statusLower === 'delivered' || statusLower === 'cancelled' ||
            statusLower === 'rejected' || statusLower === 'reject' || statusLower === 'rto' ||
            statusLower === 'payment failed') {
            return false;
        }

        // Show cancel button for all other orders within 24 hours
        return true;
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
                        <div className="absolute top-5 left-[60px] right-[25px] h-1 bg-gray-200 -z-0">

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
                                <span className={`px-4 py-2 rounded-lg font-semibold ${order.payment_status === 'failed' || order.status?.toLowerCase() === 'payment failed'
                                    ? 'bg-red-100 text-red-700'
                                    : (order.payment_status === 'success' || order.payment_status === 'paid') && order.status?.toLowerCase() === 'pending'
                                        ? 'bg-blue-100 text-blue-700'
                                        : order.status === 'cancelled'
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
                                    {order.payment_status === 'failed' || order.status?.toLowerCase() === 'payment failed'
                                        ? 'Payment Failed'
                                        : (order.payment_status === 'success' || order.payment_status === 'paid') && order.status?.toLowerCase() === 'pending'
                                            ? 'Confirmed'
                                            : order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ') : 'Pending in Confirmation'}
                                </span>
                            </div>

                            {order.items && order.items.length > 0 ? (
                                order.items.map((item) => (
                                    <div key={item.order_item_id} className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-gray-100 last:mb-0 last:pb-0 last:border-0">
                                        {item.Product && (
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={getProductImage(item.Product)}
                                                    alt={item.Product.name}
                                                    className="w-32 h-32 object-cover rounded-lg cursor-pointer"
                                                    onClick={() => navigateTo(`/product/${item.Product?.product_id}`)}
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                {item.Product?.name || 'Product'}
                                            </h3>

                                            {item.Product?.description && (
                                                <p className="text-gray-600 mb-4">{item.Product.description}</p>
                                            )}

                                            <div className="space-y-2">
                                                <p className="flex justify-between">
                                                    <span className="text-gray-600">Price:</span>
                                                    <span className="font-medium">${getProductPrice(item.Product).toFixed(2)}</span>
                                                </p>
                                                <p className="flex justify-between">
                                                    <span className="text-gray-600">Quantity:</span>
                                                    <span className="font-medium">{item.quantity}</span>
                                                </p>
                                                <div className="border-t border-gray-200 pt-2 mt-2">
                                                    <p className="flex justify-between text-lg font-bold">
                                                        <span>Total:</span>
                                                        <span className="text-amber-700">${(getProductPrice(item.Product) * item.quantity).toFixed(2)}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : order.Product ? (
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
                                                <span className="font-medium">1</span>
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
                            ) : null}

                            {/* Order Information Section - Moved to bottom of order summary */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
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

                                                        {/* Cancel Order Section - Moved to bottom with dropdown functionality */}
                            {shouldShowCancelButton(order) && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="bg-gray-50 rounded-lg p-4" id="cancel-dropdown">
                                        <button
                                            onClick={() => setIsCancelDropdownOpen(!isCancelDropdownOpen)}
                                            className="w-full flex justify-between items-center py-2 text-left"
                                        >
                                            <h3 className="text-lg font-semibold text-gray-900">Cancel and Return Refund Policy</h3>
                                            <svg
                                                className={`w-5 h-5 text-gray-500 transition-transform ${isCancelDropdownOpen ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {isCancelDropdownOpen && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <p className="text-gray-600 text-sm mb-4">
                                                    For refund contact the support on WhatsApp on <a href="/contact" className="text-blue-500">Contact Page</a> and read the <a href="/returns" className="text-blue-500">Return & Refund Policy</a>
                                                </p>
                                                {cancelError && (
                                                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                                        {cancelError}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={handleCancelConfirmation}
                                                    disabled={isCancelling}
                                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isCancelling
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Information - Customer Details and Delivery Address */}
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

            {/* Cancel Confirmation Dialog */}
            {showCancelDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Cancellation</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to cancel this order?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeCancelDialog}
                                className="px-4 py-2 rounded-lg font-medium text-sm bg-amber-700 text-white hover:bg-amber-800 transition-colors"
                            >
                                No
                            </button>
                            <button
                                onClick={confirmCancelOrder}
                                disabled={isCancelling}
                                className={
                                    isCancelling
                                        ? 'px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'px-4 py-2 rounded-lg font-medium text-sm bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }
                            >
                                {isCancelling ? 'Cancelling...' : 'Yes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}