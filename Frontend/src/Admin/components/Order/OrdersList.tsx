import { useState, useEffect, useMemo } from 'react';
import { adminAPI } from '../../../services/api';
import { ShoppingBag, RefreshCw } from 'lucide-react';
import AlertMessage from '../Admin/AlertMessage';
import OrderFilters from './OrderFilters';
import OrderPagination from './OrderPagination';
import OrderDetailsModal from './OrderDetailsModal';
import { Order, getStatusColor, getStatusIcon, getDisplayStatus } from './OrderStatusUtils';

export default function OrdersList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersError, setOrdersError] = useState('');
    const [ordersSuccess, setOrdersSuccess] = useState('');
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const ordersPerPage = 10;

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setIsLoadingOrders(true);
        setOrdersError('');
        setOrdersSuccess('');
        try {
            const response = await adminAPI.getOrders();

            if (response.data.status && Array.isArray(response.data.orders)) {
                setOrders(response.data.orders);
            } else {
                setOrders([]);
            }
        } catch (error: unknown) {
            console.error('❌ Error loading orders:', error);
            const err = error as {
                response?: {
                    status?: number;
                    data?: { message?: string }
                };
                message?: string
            };

            // Handle 404 as no orders found (not an error)
            if (err.response?.status === 404) {
                setOrders([]);
            } else {
                const errorMessage = err.response?.data?.message || err.message || 'Failed to load orders. Please try again.';
                setOrdersError(errorMessage);
            }
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingOrderId(orderId);
        setOrdersError('');
        setOrdersSuccess('');

        try {
            await adminAPI.updateOrderStatus(orderId, newStatus);

            // Update the order status in local state without refreshing
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.order_id === orderId
                        ? { ...order, status: newStatus }
                        : order
                )
            );

            // Show success message
            setOrdersSuccess('Order status updated');
            setUpdatingOrderId(null);
        } catch (error: unknown) {
            console.error('❌ Error updating order status:', error);
            const err = error as {
                response?: {
                    status?: number;
                    data?: { message?: string }
                };
                message?: string
            };
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update order status. Please try again.';
            setOrdersError(errorMessage);
            setUpdatingOrderId(null);
        }
    };

    // Filter and sort orders
    const filteredAndSortedOrders = useMemo(() => {
        let filtered = [...orders];

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => {
                const statusLower = order.status.toLowerCase();
                if (statusFilter === 'confirmed') {
                    return statusLower === 'confirm' || statusLower === 'confirmed';
                } else if (statusFilter === 'ongoing') {
                    return statusLower === 'pending' || statusLower === 'ongoing';
                } else {
                    return statusLower === statusFilter;
                }
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return filtered;
    }, [orders, statusFilter, sortOrder]);

    // Paginate orders
    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ordersPerPage;
        const endIndex = startIndex + ordersPerPage;
        return filteredAndSortedOrders.slice(startIndex, endIndex);
    }, [filteredAndSortedOrders, currentPage, ordersPerPage]);

    const totalPages = Math.ceil(filteredAndSortedOrders.length / ordersPerPage);

    // Reset to page 1 when filter or sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, sortOrder]);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleOrderClick = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleStatusUpdateWithModal = async (orderId: string, newStatus: string) => {
        await handleStatusUpdate(orderId, newStatus);
        // Update the selected order in modal if it's the same order
        if (selectedOrder && selectedOrder.order_id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
                <button
                    onClick={loadOrders}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                    Refresh
                </button>
            </div>

            <OrderFilters
                statusFilter={statusFilter}
                sortOrder={sortOrder}
                onStatusFilterChange={setStatusFilter}
                onSortOrderChange={setSortOrder}
                totalOrders={filteredAndSortedOrders.length}
                currentPage={currentPage}
                ordersPerPage={ordersPerPage}
            />

            {ordersError && (
                <AlertMessage
                    type="error"
                    message={ordersError}
                    onClose={() => setOrdersError('')}
                />
            )}

            {ordersSuccess && (
                <AlertMessage
                    type="success"
                    message={ordersSuccess}
                    onClose={() => setOrdersSuccess('')}
                />
            )}

            {isLoadingOrders ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw size={32} className="animate-spin text-amber-700" />
                    <span className="ml-3 text-gray-600">Loading orders...</span>
                </div>
            ) : filteredAndSortedOrders.length === 0 ? (
                <div className="text-center py-12">
                    <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 text-lg">No orders found</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Address</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedOrders.map((order) => {
                                    // const productImage = order.Product ? getImageUrl(order.Product.product_image) : '';
                                    return (
                                        <tr
                                            key={order.order_id}
                                            onClick={() => handleOrderClick(order)}
                                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                                                #{order.order_id.slice(0, 8)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-900">
                                                        {order.Product?.name || order.Product?.title || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{order.FullName}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{order.phone1}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700 max-w-xs truncate">
                                                {order.address}, {order.city}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {getDisplayStatus(order.status)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                                ${order.Product?.selling_price || 'N/A'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <OrderPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPreviousPage={handlePreviousPage}
                        onNextPage={handleNextPage}
                    />

                    <OrderDetailsModal
                        order={selectedOrder}
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        updatingOrderId={updatingOrderId}
                        onStatusUpdate={handleStatusUpdateWithModal}
                    />
                </>
            )}
        </div>
    );
}
