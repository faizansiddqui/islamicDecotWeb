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
                    {/* Order Header */}
                    <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">Order #{order.order_id}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getDisplayStatus(order.status)}
                        </span>
                    </div>

                    {/* Product Information */}
                    {order.items && order.items.length > 0 ? (
                        order.items.map((item) => (
                            <div key={item.order_item_id} className="border-b border-gray-200 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
                                <h4 className="font-semibold text-gray-900 mb-4">Product Information</h4>
                                <div className="flex gap-4">
                                    {item.Product && getImageUrl(item.Product.product_image) && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={getImageUrl(item.Product.product_image)}
                                                alt={item.Product.name || item.Product.title}
                                                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=No+Image';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-lg text-gray-900 mb-2">
                                            {item.Product.name || item.Product.title}
                                        </h5>
                                        <div className="space-y-2 text-sm">
                                            <p>
                                                <span className="font-medium text-gray-700">Product ID:</span>{' '}
                                                <span className="text-gray-900">#{item.Product.product_id}</span>
                                            </p>
                                            <p>
                                                <span className="font-medium text-gray-700">Price:</span>{' '}
                                                <span className="text-gray-900">${item.Product.selling_price}</span>
                                                {item.Product.price > item.Product.selling_price && (
                                                    <span className="text-gray-500 line-through ml-2">${item.Product.price}</span>
                                                )}
                                            </p>
                                            <p>
                                                <span className="font-medium text-gray-700">Quantity:</span>{' '}
                                                <span className="text-gray-900">{item.quantity}</span>
                                            </p>
                                            <p>
                                                <span className="font-medium text-gray-700">Total:</span>{' '}
                                                <span className="text-gray-900">${(item.Product.selling_price * item.quantity).toFixed(2)}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : order.Product ? (
                        <div className="flex gap-4">
                            {getImageUrl(order.Product.product_image) && (
                                <div className="flex-shrink-0">
                                    <img
                                        src={getImageUrl(order.Product.product_image)}
                                        alt={order.Product.name || order.Product.title}
                                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=No+Image';
                                        }}
                                    />
                                </div>
                            )}
                            <div className="flex-1">
                                <h5 className="font-semibold text-lg text-gray-900 mb-2">
                                    {order.Product.name || order.Product.title}
                                </h5>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <span className="font-medium text-gray-700">Product ID:</span>{' '}
                                        <span className="text-gray-900">#{order.Product.product_id}</span>
                                    </p>
                                    <p>
                                        <span className="font-medium text-gray-700">Price:</span>{' '}
                                        <span className="text-gray-900">${order.Product.selling_price}</span>
                                        {order.Product.price > order.Product.selling_price && (
                                            <span className="text-gray-500 line-through ml-2">${order.Product.price}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="font-medium text-gray-700">Name:</span>{' '}
                                    <span className="text-gray-900">{order.FullName}</span>
                                </p>
                                <p>
                                    <span className="font-medium text-gray-700">Phone:</span>{' '}
                                    <span className="text-gray-900">{order.phone1}</span>
                                </p>
                                {order.phone2 && (
                                    <p>
                                        <span className="font-medium text-gray-700">Alternate Phone:</span>{' '}
                                        <span className="text-gray-900">{order.phone2}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Shipping Address</h4>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-900">{order.address}</p>
                                <p className="text-gray-900">
                                    {order.city}, {order.state} {order.pinCode}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Order Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p>
                                    <span className="font-medium text-gray-700">Order ID:</span>{' '}
                                    <span className="text-gray-900">{order.order_id}</span>
                                </p>
                                <p className="mt-2">
                                    <span className="font-medium text-gray-700">Payment Method:</span>{' '}
                                    <span className="text-gray-900">Paid via PayU</span>
                                </p>
                                {order.payu_transaction_id && (
                                    <p className="mt-2">
                                        <span className="font-medium text-gray-700">Transaction ID:</span>{' '}
                                        <span className="text-gray-900">{order.payu_transaction_id}</span>
                                    </p>
                                )}
                            </div>
                            <div>
                                <p>
                                    <span className="font-medium text-gray-700">Order Date:</span>{' '}
                                    <span className="text-gray-900">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </p>
                                <p className="mt-2">
                                    <span className="font-medium text-gray-700">Status:</span>{' '}
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {getDisplayStatus(order.status)}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status Update Buttons */}
                    <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Update Order Status</h4>
                        <OrderStatusButtons
                            order={order}
                            updatingOrderId={updatingOrderId}
                            onStatusUpdate={onStatusUpdate}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

