import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';
import ShippingForm from './checkout/ShippingForm';
import PaymentMethodSelector from './checkout/PaymentMethodSelector';
import PaymentDetails from './checkout/PaymentDetails';
import OrderSummary from './checkout/OrderSummary';
import OrderSuccess from './checkout/OrderSuccess';
import { navigateTo } from '../utils/navigation';

interface CheckoutPageProps {
  onBack?: () => void;
}

type PaymentMethod = 'credit' | 'debit' | 'paypal' | 'cod' | 'bank';

export default function CheckoutPage({ onBack }: CheckoutPageProps) {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { profile } = useProfile();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigateTo('/log');
    }
  }, [isAuthenticated, authLoading]);

  const subtotal = getTotalPrice();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    paypalEmail: '',
    bankAccount: '',
    bankName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load saved address on mount
  useEffect(() => {
    if (profile?.Addresses && profile.Addresses.length > 0) {
      const address = profile.Addresses[0];
      setFormData((prev) => ({
        ...prev,
        firstName: address.FullName.split(' ')[0] || '',
        lastName: address.FullName.split(' ').slice(1).join(' ') || '',
        email: profile.email || '',
        phone: address.phone1 || '',
        address: address.address || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.pinCode || '',
        country: '',
      }));
      setIsEditingAddress(false);
    } else {
      setIsEditingAddress(true);
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveAddress = () => {
    // In a real app, this would save to backend using profile context
    // For now, just set editing to false
    setIsEditingAddress(false);
  };

  const handleEditAddress = () => {
    setIsEditingAddress(true);
  };

  const handleCancelEdit = () => {
    setIsEditingAddress(false);
    // Reset to saved address if available
    if (profile?.Addresses && profile.Addresses.length > 0) {
      const address = profile.Addresses[0];
      setFormData((prev) => ({
        ...prev,
        firstName: address.FullName.split(' ')[0] || '',
        lastName: address.FullName.split(' ').slice(1).join(' ') || '',
        email: profile.email || '',
        phone: address.phone1 || '',
        address: address.address || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.pinCode || '',
        country: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Address validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Zip code is required';
    } else if (!/^\d{5,6}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Invalid zip code';
    }
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    // Payment validation based on method
    if (paymentMethod === 'credit' || paymentMethod === 'debit') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{13,19}$/.test(formData.cardNumber.replace(/\D/g, ''))) {
        newErrors.cardNumber = 'Invalid card number';
      }
      if (!formData.cardName.trim()) newErrors.cardName = 'Cardholder name is required';
      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Invalid format (MM/YY)';
      }
      if (!formData.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = 'Invalid CVV';
      }
    } else if (paymentMethod === 'paypal') {
      if (!formData.paypalEmail.trim()) {
        newErrors.paypalEmail = 'PayPal email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.paypalEmail)) {
        newErrors.paypalEmail = 'Invalid email format';
      }
    } else if (paymentMethod === 'bank') {
      if (!formData.bankAccount.trim()) {
        newErrors.bankAccount = 'Bank account number is required';
      }
      if (!formData.bankName.trim()) {
        newErrors.bankName = 'Bank name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    clearCart();
    setIsProcessing(false);
    setOrderPlaced(true);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.hash = '#/cart';
    }
  };

  const handleContinueShopping = () => {
    window.location.hash = '';
    if (onBack) {
      onBack();
    }
  };

  if (orderPlaced) {
    return <OrderSuccess onContinueShopping={handleContinueShopping} />;
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
              <ShippingForm
                isEditingAddress={isEditingAddress}
                formData={formData}
                errors={errors}
                onInputChange={handleInputChange}
                onEditAddress={handleEditAddress}
                onSaveAddress={handleSaveAddress}
                onCancelEdit={handleCancelEdit}
              />

              {/* Payment Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="text-amber-700" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                </div>

                <PaymentMethodSelector
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={setPaymentMethod}
                />

                <PaymentDetails
                  paymentMethod={paymentMethod}
                  formData={formData}
                  errors={errors}
                  onInputChange={handleInputChange}
                />
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

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              cartItems={cartItems}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
