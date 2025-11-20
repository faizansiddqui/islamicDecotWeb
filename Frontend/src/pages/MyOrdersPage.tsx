import { useState, useEffect } from 'react';
import { Package, ArrowLeft, Calendar } from 'lucide-react';
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

      // Handle the case where backend returns empty response
      if (!response || !response.data) {
        setOrders([]);
      } else {
        // Check if response has orders property or is an array directly
        let ordersData: Order[] = [];
        if (Array.isArray(response.data)) {
          ordersData = response.data;
        } else if (response.data.orders && Array.isArray(response.data.orders)) {
          ordersData = response.data.orders;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Handle case where orders are in data.data (nested)
          ordersData = response.data.data;
        }

        // Ensure each order has a quantity of at least 1
        const processedOrders = ordersData.map(order => ({
          ...order,
          quantity: order.quantity || 1
        }));

        setOrders(processedOrders);
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
      navigateTo('/');
    }
  };

  const handleOrderClick = (orderId: string) => {
    navigateTo(`/order/${orderId}`);
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
              <div
                key={order.order_id}
                className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleOrderClick(order.order_id)}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {order.Product && (
                    <div className="flex-shrink-0">
                      <img
                        src={getProductImage(order.Product)}
                        alt={order.Product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.Product?.name || `Order #${order.order_id.slice(0, 8)}`}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-1">
                        {order.Product && (
                          <p className="font-medium text-gray-900">
                            ${getProductPrice(order.Product).toFixed(2)} × {order.quantity} = ${(getProductPrice(order.Product) * (order.quantity || 1)).toFixed(2)}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Status: <span className="font-medium">{order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Confirmed'}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                          View Details
                        </span>
                      </div>
                    </div>
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