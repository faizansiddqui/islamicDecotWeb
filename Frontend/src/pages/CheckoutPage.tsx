import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';
import OrderSuccess from './checkout/OrderSuccess';
import { navigateTo } from '../utils/navigation';
import AddressSelector from '../components/AddressSelector';
import { userAPI } from '../services/api';

// Define Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
  prefill?: {
    email?: string;
    phone?: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface CheckoutPageProps {
  onBack?: () => void;
}

export default function CheckoutPage({ onBack }: CheckoutPageProps) {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigateTo('/log');
    }
  }, [isAuthenticated, authLoading]);

  // Load Razorpay script if not already loaded
  useEffect(() => {
    if (window.Razorpay) return;

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const subtotal = getTotalPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if an address is selected
    if (!selectedAddressId) {
      alert('Please select a delivery address');
      return;
    }

    // Check if user is authenticated and has a valid ID
    const user = localStorage.getItem('user');
    let userId = null;
    if (user) {
      try {
        const userData = JSON.parse(user);
        userId = userData.id;
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }

    if (!userId) {
      alert('User not authenticated. Please log in again.');
      return;
    }

    setIsProcessing(true);

    try {
      // For now, we'll create one order per item in the cart
      // In a real application, you might want to create a single order with multiple items
      const orderPromises = cartItems.map(item => {
        return userAPI.createOrder({
          quantity: item.quantity,
          address_id: selectedAddressId,
          product_id: item.id
        });
      });

      // Wait for all orders to be created
      const results = await Promise.all(orderPromises);

      // Get the first order details for Razorpay checkout
      if (results.length > 0 && results[0].data) {
        const orderData = results[0].data;

        // Open Razorpay checkout
        if (window.Razorpay && orderData.razorpay_order) {
          // Get user data for prefilling
          const user = localStorage.getItem('user');
          let userEmail = '';
          if (user) {
            try {
              const userData = JSON.parse(user);
              userEmail = userData.email || '';
            } catch (e) {
              console.error('Failed to parse user data:', e);
            }
          }

          const options: RazorpayOptions = {
            key: orderData.key, // Razorpay key from backend
            amount: orderData.razorpay_order.amount,
            currency: orderData.razorpay_order.currency,
            name: 'Islamic Decot',
            description: 'Order Payment',
            order_id: orderData.razorpay_order.id,
            handler: function (response: RazorpayResponse) {

              // Set the order ID immediately when payment is successful
              setOrderId(orderData.local_order_id);

              // Verify payment with backend
              verifyPayment(response, orderData.local_order_id);

              clearCart();
              setIsProcessing(false);
              setOrderPlaced(true);
            },
            modal: {
              ondismiss: function () {
                // Handle payment cancellation
                setIsProcessing(false);
              }
            },
            prefill: {
              email: userEmail,
            },
            theme: {
              color: '#B4540E' // Amber color to match your theme
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          setOrderId(orderData.local_order_id || orderData.order_id);
          clearCart();
          setIsProcessing(false);
          setOrderPlaced(true);
        }
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setIsProcessing(false);
      alert('Failed to create order. Please try again.');
    }
  };

  const verifyPayment = async (response: RazorpayResponse, localOrderId: string) => {
    try {
      // Send payment details to backend for verification
      const result = await userAPI.verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        order_id: localOrderId
      });

      if (result.data && result.data.success) {
        // Set the order ID after successful verification
        setOrderId(localOrderId);
      } else {
        console.warn('Payment verification response:', result.data);
        // Even if verification response isn't success, still set the order ID
        setOrderId(localOrderId);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      // Even if verification fails, we still consider the order placed
      // In a production app, you might want to handle this differently
      // For example, you might want to show a warning to the user
      alert('Payment processed but verification failed. Please contact support with your order ID: ' + localOrderId);
      // Still set the order ID so the user can see it
      setOrderId(localOrderId);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.hash = '/orders';
    }
  };

  const handleContinueShopping = () => {
    window.location.hash = '';
    if (onBack) {
      onBack();
    }
  };

  if (orderPlaced) {
    return <OrderSuccess onContinueShopping={handleContinueShopping} orderId={orderId || undefined} />;
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-8">You need to be signed in to proceed to checkout.</p>
          <button
            onClick={() => navigateTo('/log')}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Please add items to your cart before checkout.</p>
          <button
            onClick={handleBack}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Cart
          </button>
        </div>
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
          <span className="font-medium">Back to Cart</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <p className="text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Items</span>
                      <span className="font-semibold">{cartItems.reduce((total, item) => total + item.quantity, 0)}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-amber-700">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Address Selection */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <AddressSelector
                  selectedAddressId={selectedAddressId}
                  onAddressSelect={setSelectedAddressId}
                />
              </div>

              {/* Payment Information - Simplified for default payment method */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="text-amber-700" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 font-medium">
                    Payment will be processed through our secure payment gateway. You'll be redirected to complete your payment.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Place Order
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}