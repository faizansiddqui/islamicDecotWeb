import { useState, useEffect } from 'react';
import { Package, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { userAPI } from '../services/api';

interface Order {
  order_id: string;
  product_id: number;
  FullName: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone1: string;
  createdAt: string;
}

interface MyOrdersPageProps {
  onBack?: () => void;
}

export default function MyOrdersPage({ onBack }: MyOrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await userAPI.getOrders();
      // Handle the case where backend returns empty response (res.end())
      if (!response || !response.data) {
        setOrders([]);
      } else {
        // Check if response has orders property or is an array directly
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else if (response.data.orders && Array.isArray(response.data.orders)) {
          setOrders(response.data.orders);
        } else {
          setOrders([]);
        }
      }
      setError(null);
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { status: number } };

      // Handle 404 specifically
      if (err.response && err.response.status === 404) {
        setError('Order service is currently unavailable. Please try again later.');
      } else {
        const errorMessage = err.message || 'Failed to fetch orders. Please try again.';
        setError(errorMessage);
      }
      // Set orders to empty array on error to avoid showing stale data
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.hash = '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
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
          <span className="font-medium">Back</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl shadow-md p-8 text-center">
            <Package size={80} className="mx-auto text-red-300 mb-6" />
            <h2 className="text-2xl font-bold text-red-900 mb-4">Error Loading Orders</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={fetchOrders}
              className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Package size={80} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <button
              onClick={handleBack}
              className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.order_id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Package className="text-amber-700" size={24} />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.order_id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="font-medium text-gray-900">{order.FullName}</p>
                      <p className="flex items-center gap-1">
                        <MapPin size={14} />
                        {order.address}, {order.city}, {order.state} {order.pinCode}
                      </p>
                      <p>Phone: {order.phone1}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-semibold">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

