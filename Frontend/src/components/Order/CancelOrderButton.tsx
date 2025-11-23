import { useState } from 'react';
import { XCircle } from 'lucide-react';

interface CancelOrderButtonProps {
    orderId: string;
    onCancel: (orderId: string) => Promise<void>;
    disabled?: boolean;
}

export default function CancelOrderButton({ orderId, onCancel, disabled = false }: CancelOrderButtonProps) {
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancelOrder = async () => {
        if (disabled || isCancelling) return;

        if (window.confirm('Are you sure you want to cancel this order?')) {
            setIsCancelling(true);
            try {
                await onCancel(orderId);
            } catch (error) {
                console.error('Failed to cancel order:', error);
                alert('Failed to cancel order. Please try again.');
            } finally {
                setIsCancelling(false);
            }
        }
    };

    return (
        <button
            onClick={handleCancelOrder}
            disabled={disabled || isCancelling}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${disabled || isCancelling
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
        >
            <XCircle size={16} />
            {isCancelling ? 'Cancelling...' : 'Cancel Order'}
        </button>
    );
}