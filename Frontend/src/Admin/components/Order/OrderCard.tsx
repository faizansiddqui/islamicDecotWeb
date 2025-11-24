import { Order, getImageUrl, getStatusColor, getStatusIcon, getDisplayStatus } from './OrderStatusUtils';
import OrderStatusButtons from './OrderStatusButtons';

interface OrderCardProps {
    order: Order;
    updatingOrderId: string | null;
    onStatusUpdate: (orderId: string, newStatus: string) => void;
}

export default function OrderCard({ order, updatingOrderId, onStatusUpdate }: OrderCardProps) {
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
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Product Image */}
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

                {/* Order Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="font-semibold text-gray-900">Order #{order.order_id.slice(0, 8)}</h3>
                            <p className="text-sm text-gray-700 mt-1 font-medium">
                                {productName}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${getStatusColor(order.status, order.payment_status)}`}>
                            {getStatusIcon(order.status, order.payment_status)}
                            {getDisplayStatus(order.status, order.payment_status)}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                            <p><span className="font-medium">Customer:</span> {order.FullName}</p>
                            <p><span className="font-medium">Phone:</span> {order.phone1}</p>
                            {order.phone2 && (
                                <p><span className="font-medium">Alt Phone:</span> {order.phone2}</p>
                            )}
                        </div>
                        <div>
                            <p><span className="font-medium">Address:</span> {order.address}</p>
                            <p>{order.city}, {order.state} {order.pinCode}</p>
                            <p className="text-gray-500 mt-1">
                                <span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                            {/* Show payment method and transaction ID if available */}
                            {order.payment_method && (
                                <p className="text-gray-500 mt-1">
                                    <span className="font-medium">Payment Method:</span> {order.payment_method}
                                </p>
                            )}
                            {order.payu_transaction_id && (
                                <p className="text-gray-500 mt-1">
                                    <span className="font-medium">Transaction ID:</span> {order.payu_transaction_id}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm">
                            <span className="font-medium text-gray-700">Price:</span>{' '}
                            <span className="text-gray-900">${productPrice}</span>
                            {originalPrice > productPrice && (
                                <span className="text-gray-500 line-through ml-2">${originalPrice}</span>
                            )}
                        </p>
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