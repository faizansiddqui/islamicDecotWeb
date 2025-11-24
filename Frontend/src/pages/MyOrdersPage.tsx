import { useState, useEffect, useMemo } from 'react';
import { Package, ArrowLeft, Calendar } from 'lucide-react';
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
  Product?: Product;
  items?: OrderItem[]; // Add items array
}

interface MyOrdersPageProps {
  onBack?: () => void;
}

export default function MyOrdersPage({ onBack }: MyOrdersPageProps) {
  const { isLoading: authLoading } = useAuthProtection();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'priceHigh' | 'priceLow'>('newest');

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

        // No need to process quantity as it's handled in the item calculation
        setOrders(ordersData);
      }
      setError(null);
    } catch (error: unknown) {
      // Type guard for axios error
      if (error && typeof error === 'object' && 'request' in error) {
        const axiosError = error as { message?: string; response?: { status?: number }; request?: unknown };

        // Check if it's a network error
        if (!axiosError.response && axiosError.request) {
          setError('Check your internet connection');
        }
        // Check if it's a backend error (5xx)
        else if (axiosError.response?.status && axiosError.response.status >= 500) {
          setError('We will fix it soon');
        }
        // Handle 404 specifically
        else if (axiosError.response?.status === 404) {
          setError('Order service is currently unavailable. Please try again later.');
        }
        // For other errors
        else {
          const errorMessage = axiosError.message || 'Failed to fetch orders. Please try again.';
          setError(errorMessage);
        }
      } else {
        setError('Failed to fetch orders. Please try again.');
      }

      // Set orders to empty array on error to avoid showing stale data
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedOrders = useMemo(() => {
    const sorted = [...orders];

    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      default:
        return sorted;
    }
  }, [orders, sortOption]);

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

  if (authLoading || isLoading) {
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

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">My Orders</h1>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              id="sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as 'newest' | 'oldest' | 'priceHigh' | 'priceLow')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

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
        ) : sortedOrders.length === 0 ? (
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
            {sortedOrders.map((order) => {
              // Get product image from items or Product
              const productImage = order.items && order.items.length > 0
                ? getProductImage(order.items[0].Product)
                : (order.Product ? getProductImage(order.Product) : '');

              // Get product name from items or Product
              const productName = order.items && order.items.length > 0
                ? (order.items[0].Product?.name || `Order #${order.order_id.slice(0, 8)}`)
                : (order.Product?.name || `Order #${order.order_id.slice(0, 8)}`);

              // Calculate total price from items or Product
              let totalPrice = 0;
              if (order.items && order.items.length > 0) {
                totalPrice = order.items.reduce((sum, item) =>
                  sum + (getProductPrice(item.Product) * item.quantity), 0);
              } else if (order.Product) {
                totalPrice = getProductPrice(order.Product);
              }

              return (
                <div
                  key={order.order_id}
                  className="bg-white rounded-xl shadow-md p-4 md:p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleOrderClick(order.order_id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Image and Name */}
                    <div className="flex items-center gap-4 flex-1">
                      {productImage && (
                        <div className="flex-shrink-0">
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">
                          {productName}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Desktop: Price and Status */}
                    <div className="hidden md:flex items-center justify-between gap-8 flex-1">
                      <div className="text-center">
                        <p className="font-medium text-gray-900 text-base md:text-lg">
                          ${totalPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs md:text-sm text-gray-600">
                          <span className="font-medium">
                            {order.status?.toLowerCase() === 'payment failed' ? 'Payment Failed' :
                              order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile: Price and Status at the bottom */}
                  <div className="md:hidden flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <div className="text-left flex flex-row items-center justify-center gap-2">
                      <p className="font-medium text-gray-900 text-base">
                        ${totalPrice.toFixed(2)}
                      </p>
                      <div className="text-right">
                        <h4 className="text-xs text-gray-600">
                          <span className="font-medium">
                            {order.status?.toLowerCase() === 'payment failed' ? 'Payment Failed' :
                              order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                          </span>
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}