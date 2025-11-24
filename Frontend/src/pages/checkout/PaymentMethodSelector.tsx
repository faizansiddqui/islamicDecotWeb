import { CreditCard, Wallet, Building2, CreditCardIcon } from 'lucide-react';

type PaymentMethod = 'credit' | 'debit' | 'paypal' | 'cod' | 'bank' | 'payu';

interface PaymentMethodSelectorProps {
    paymentMethod: PaymentMethod;
    onPaymentMethodChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ paymentMethod, onPaymentMethodChange }: PaymentMethodSelectorProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <button
                type="button"
                onClick={() => onPaymentMethodChange('credit')}
                className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === 'credit'
                    ? 'border-amber-700 bg-amber-50'
                    : 'border-gray-300 hover:border-amber-300'
                    }`}
            >
                <CreditCard className="mx-auto mb-2" size={24} />
                <p className="text-sm font-semibold">Credit Card</p>
            </button>

            <button
                type="button"
                onClick={() => onPaymentMethodChange('debit')}
                className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === 'debit'
                    ? 'border-amber-700 bg-amber-50'
                    : 'border-gray-300 hover:border-amber-300'
                    }`}
            >
                <CreditCard className="mx-auto mb-2" size={24} />
                <p className="text-sm font-semibold">Debit Card</p>
            </button>

            <button
                type="button"
                onClick={() => onPaymentMethodChange('paypal')}
                className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === 'paypal'
                    ? 'border-amber-700 bg-amber-50'
                    : 'border-gray-300 hover:border-amber-300'
                    }`}
            >
                <Wallet className="mx-auto mb-2" size={24} />
                <p className="text-sm font-semibold">PayPal</p>
            </button>

            <button
                type="button"
                onClick={() => onPaymentMethodChange('bank')}
                className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === 'bank'
                    ? 'border-amber-700 bg-amber-50'
                    : 'border-gray-300 hover:border-amber-300'
                    }`}
            >
                <Building2 className="mx-auto mb-2" size={24} />
                <p className="text-sm font-semibold">Bank Transfer</p>
            </button>

            <button
                type="button"
                onClick={() => onPaymentMethodChange('payu')}
                className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === 'payu'
                    ? 'border-amber-700 bg-amber-50'
                    : 'border-gray-300 hover:border-amber-300'
                    }`}
            >
                <CreditCardIcon className="mx-auto mb-2" size={24} />
                <p className="text-sm font-semibold">PayU</p>
            </button>

            <button
                type="button"
                onClick={() => onPaymentMethodChange('cod')}
                className={`p-4 border-2 rounded-lg transition-all md:col-span-2 ${paymentMethod === 'cod'
                    ? 'border-amber-700 bg-amber-50'
                    : 'border-gray-300 hover:border-amber-300'
                    }`}
            >
                <Wallet className="mx-auto mb-2" size={24} />
                <p className="text-sm font-semibold">Cash on Delivery</p>
            </button>
        </div>
    );
}