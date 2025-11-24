import { CreditCard, User, Lock, Mail, Building2 } from 'lucide-react';

type PaymentMethod = 'credit' | 'debit' | 'paypal' | 'cod' | 'bank' | 'payu';

interface PaymentDetailsProps {
    paymentMethod: PaymentMethod;
    formData: {
        cardNumber: string;
        cardName: string;
        expiryDate: string;
        cvv: string;
        paypalEmail: string;
        bankAccount: string;
        bankName: string;
    };
    errors: Record<string, string>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PaymentDetails({ paymentMethod, formData, errors, onInputChange }: PaymentDetailsProps) {
    if (paymentMethod === 'credit' || paymentMethod === 'debit') {
        return (
            <div className="space-y-4">
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <CreditCard size={16} />
                        Card Number *
                    </label>
                    <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={onInputChange}
                        maxLength={19}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="1234 5678 9012 3456"
                    />
                    {errors.cardNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                    )}
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User size={16} />
                        Cardholder Name *
                    </label>
                    <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={onInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.cardName ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="John Doe"
                    />
                    {errors.cardName && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            Expiry Date *
                        </label>
                        <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={onInputChange}
                            maxLength={5}
                            placeholder="MM/YY"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.expiryDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Lock size={16} />
                            CVV *
                        </label>
                        <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={onInputChange}
                            maxLength={4}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.cvv ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="123"
                        />
                        {errors.cvv && (
                            <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (paymentMethod === 'paypal') {
        return (
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} />
                    PayPal Email *
                </label>
                <input
                    type="email"
                    name="paypalEmail"
                    value={formData.paypalEmail}
                    onChange={onInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.paypalEmail ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="your.email@paypal.com"
                />
                {errors.paypalEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.paypalEmail}</p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                    You will be redirected to PayPal to complete your payment.
                </p>
            </div>
        );
    }

    if (paymentMethod === 'bank') {
        return (
            <div className="space-y-4">
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Building2 size={16} />
                        Bank Name *
                    </label>
                    <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={onInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.bankName ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Bank Name"
                    />
                    {errors.bankName && (
                        <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
                    )}
                </div>
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        Account Number *
                    </label>
                    <input
                        type="text"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={onInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.bankAccount ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Account Number"
                    />
                    {errors.bankAccount && (
                        <p className="mt-1 text-sm text-red-600">{errors.bankAccount}</p>
                    )}
                </div>
            </div>
        );
    }

    // PayU payment method
    if (paymentMethod === 'payu') {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 font-medium">
                    You will be redirected to PayU to complete your payment.
                </p>
                <p className="text-amber-700 text-sm mt-2">
                    PayU is a secure payment gateway that accepts various payment methods including credit cards, debit cards, and net banking.
                </p>
            </div>
        );
    }

    // Cash on Delivery
    return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 font-medium">
                You will pay cash when your order is delivered.
            </p>
        </div>
    );
}