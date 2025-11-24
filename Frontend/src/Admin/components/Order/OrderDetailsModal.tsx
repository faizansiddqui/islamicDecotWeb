import { X } from 'lucide-react';
import { Order, getImageUrl, getStatusColor, getStatusIcon, getDisplayStatus } from './OrderStatusUtils';
import OrderStatusButtons from './OrderStatusButtons';

interface OrderDetailsModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    updatingOrderId: string | null;
    onStatusUpdate: (orderId: string, newStatus: string) => void;
}

export default function OrderDetailsModal({
    order,
    isOpen,
    onClose,
    updatingOrderId,
    onStatusUpdate
}: OrderDetailsModalProps) {
    if (!isOpen || !order) return null;

    // Get product image from items or Product
    const productImage = order.items && order.items.length > 0
        ? getImageUrl(order.items[0].Product.product_image)
        : (order.Product ? getImageUrl(order.Product.product_image) : '');

    // Get product name from items or Product
    const productName = order.items && order.items.length > 0
        ? (order.items[0].Product.name || order.items[0].Product.title)
        : (order.Product ? (order.Product.name || order.Product.title) : 'N/A');

    // Get product price from items or Product
    const productPrice = order.items && order.items.length > 0
        ? order.items[0].Product.selling_price
        : (order.Product ? order.Product.selling_price : 0);

    // Get original price from items or Product
    const originalPrice = order.items && order.items.length > 0
        ? order.items[0].Product.price
        : (order.Product ? order.Product.price : 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order ID:</span>
                                    <span className="font-medium">#{order.order_id.slice(0, 8)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order Date:</span>
                                    <span className="font-medium">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${getStatusColor(order.status, order.payment_status)}`}>
                                        {getStatusIcon(order.status, order.payment_status)}
                                        {getDisplayStatus(order.status, order.payment_status)}
                                    </span>
                                </div>
                                {order.payment_method && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Method:</span>
                                        <span className="font-medium">{order.payment_method}</span>
                                    </div>
                                )}
                                {order.payu_transaction_id && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Transaction ID:</span>
                                        <span className="font-medium">{order.payu_transaction_id}</span>
                                    </div>
                                )}
                                {order.payment_status && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Status:</span>
                                        <span className="font-medium capitalize">{order.payment_status}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Full Name:</span>
                                    <span className="font-medium">{order.FullName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phone 1:</span>
                                    <span className="font-medium">{order.phone1}</span>
                                </div>
                                {order.phone2 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phone 2:</span>
                                        <span className="font-medium">{order.phone2}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Address:</span>
                                    <span className="font-medium text-right">
                                        {order.address}, {order.city}, {order.state} - {order.pinCode}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                {productImage && (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={productImage}
                                            alt={productName || 'Product'}
                                            className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96?text=No+Image';
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{productName}</h4>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm">
                                            <span className="text-gray-600">Price:</span>{' '}
                                            <span className="font-medium text-gray-900">${productPrice}</span>
                                            {originalPrice > productPrice && (
                                                <span className="text-gray-500 line-through ml-2">${originalPrice}</span>
                                            )}
                                        </p>
                                        <p className="text-sm">
                                            <span className="text-gray-600">Quantity:</span>{' '}
                                            <span className="font-medium">
                                                {order.items && order.items.length > 0 ? order.items[0].quantity : 1}
                                            </span>
                                        </p>
                                        <p className="text-sm">
                                            <span className="text-gray-600">Total:</span>{' '}
                                            <span className="font-medium text-amber-700">
                                                ${(productPrice * (order.items && order.items.length > 0 ? order.items[0].quantity : 1)).toFixed(2)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">${parseFloat(order.totalAmount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping:</span>
                                <span className="font-medium">$0.00</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                                <span>Total:</span>
                                <span className="text-amber-700">${parseFloat(order.totalAmount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Update Buttons - Only show if payment is not failed and not automatically confirmed */}
                    {(order.payment_status !== 'failed' && !((order.payment_status === 'success' || order.payment_status === 'paid') && order.status.toLowerCase() === 'pending')) && (
                        <OrderStatusButtons
                            order={order}
                            updatingOrderId={updatingOrderId}
                            onStatusUpdate={onStatusUpdate}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}