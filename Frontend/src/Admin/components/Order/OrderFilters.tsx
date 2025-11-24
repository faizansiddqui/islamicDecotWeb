import { Filter, ArrowUpDown } from 'lucide-react';

interface OrderFiltersProps {
    statusFilter: string;
    sortOrder: 'newest' | 'oldest';
    onStatusFilterChange: (filter: string) => void;
    onSortOrderChange: (sort: 'newest' | 'oldest') => void;
    totalOrders: number;
    currentPage: number;
    ordersPerPage: number;
}

export default function OrderFilters({
    statusFilter,
    sortOrder,
    onStatusFilterChange,
    onSortOrderChange,
    totalOrders,
    currentPage,
    ordersPerPage
}: OrderFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-600" />
                <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
                    Filter by Status:
                </label>
                <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="delivered">Delivered</option>
                    <option value="rto">RTO</option>
                    <option value="reject">Rejected</option>
                    <option value="payment failed">Payment Failed</option>
                </select>
            </div>
            <div className="flex items-center gap-2">
                <ArrowUpDown size={18} className="text-gray-600" />
                <label htmlFor="sortOrder" className="text-sm font-medium text-gray-700">
                    Sort by Date:
                </label>
                <select
                    id="sortOrder"
                    value={sortOrder}
                    onChange={(e) => onSortOrderChange(e.target.value as 'newest' | 'oldest')}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
            </div>
            <div className="flex-1"></div>
            <div className="text-sm text-gray-600 flex items-center">
                Showing {totalOrders > 0 ? (currentPage - 1) * ordersPerPage + 1 : 0} - {Math.min(currentPage * ordersPerPage, totalOrders)} of {totalOrders} orders
            </div>
        </div>
    );
}

