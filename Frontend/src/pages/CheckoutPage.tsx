import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';
import OrderSuccess from './checkout/OrderSuccess';
import AddressSelector from '../components/AddressSelector';
import { userAPI } from '../services/api';
import PayUPayment from '../components/PayUPayment'; // Add this import
import { PayUParams } from '../components/PayUPayment'; // Import PayUParams type
import { useAuthProtection } from '../utils/authProtection';

interface CheckoutPageProps {
  onBack?: () => void;
}

export default function CheckoutPage({ onBack }: CheckoutPageProps) {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { isLoading: authLoading } = useAuthProtection();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  // Add state for PayU payment
  const [payuPaymentData, setPayuPaymentData] = useState<{ payuUrl: string; params: PayUParams } | null>(null);

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
      // Create items array from cart items
      const items = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }));

      // Create order with all items
      const response = await userAPI.createOrder({
        address_id: selectedAddressId!,
        items
      });

      // Check if the response contains PayU payment data
      if (response.data && response.data.payuUrl && response.data.params) {
        // Set PayU payment data to trigger the PayUPayment component
        setPayuPaymentData({
          payuUrl: response.data.payuUrl,
          params: response.data.params
        });
      } else {
        // Handle non-PayU flow (existing logic)
        clearCart();
        setIsProcessing(false);
        setOrderPlaced(true);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setIsProcessing(false);
      alert('Failed to create order. Please try again.');
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

  // If we have PayU payment data, render the PayUPayment component
  if (payuPaymentData) {
    return <PayUPayment payuUrl={payuPaymentData.payuUrl} params={payuPaymentData.params} />;
  }

  if (orderPlaced) {
    return <OrderSuccess onContinueShopping={handleContinueShopping} />;
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-zpin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  // The useAuthProtection hook handles authentication redirect automatically
  // No need for manual authentication check here

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

              {/* Payment Information - Simplified for PayU only */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="text-amber-700" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                </div>

                {/* Simplified payment info for PayU only */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-amber-800 font-medium">
                    You will be redirected to PayU to complete your payment.
                  </p>
                  <p className="text-amber-700 text-sm mt-2">
                    PayU is a secure payment gateway that accepts various payment methods including credit cards, debit cards, and net banking.
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