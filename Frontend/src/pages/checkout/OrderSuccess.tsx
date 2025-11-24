import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { navigateTo } from '../../utils/navigation';

interface OrderSuccessProps {
    onContinueShopping: () => void;
    orderId?: string;
}

export default function OrderSuccess({ onContinueShopping, orderId }: OrderSuccessProps) {
    const { clearCart } = useCart();

    // Clear the cart when the component mounts
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    // Get order ID from URL query parameters if not provided as prop
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get('orderId');
    const finalOrderId = orderId || orderIdFromUrl;

    const handleViewOrder = () => {
        if (finalOrderId) {
            navigateTo(`/order/${finalOrderId}`);
        } else {
            onContinueShopping();
        }
    };

    const handleContinueShopping = () => {
        navigateTo('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="bg-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Check size={40} className="text-emerald-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
                <p className="text-gray-600 mb-8">
                    Thank you for your purchase. Your order has been confirmed and you will receive an email confirmation shortly.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleViewOrder}
                        className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                        View Order Details
                    </button>

                    <button
                        onClick={handleContinueShopping}
                        className="w-full border border-amber-700 text-amber-700 hover:bg-amber-50 py-3 rounded-lg font-semibold transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}