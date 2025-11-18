import { MapPin, User, Mail, Phone, Edit2, Save, X } from 'lucide-react';

interface ShippingFormProps {
    isEditingAddress: boolean;
    formData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    errors: Record<string, string>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onEditAddress: () => void;
    onSaveAddress: () => void;
    onCancelEdit: () => void;
}

export default function ShippingForm({
    isEditingAddress,
    formData,
    errors,
    onInputChange,
    onEditAddress,
    onSaveAddress,
    onCancelEdit
}: ShippingFormProps) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <MapPin className="text-amber-700" size={24} />
                    <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
                </div>
                {!isEditingAddress && (
                    <button
                        type="button"
                        onClick={onEditAddress}
                        className="flex items-center gap-2 px-4 py-2 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                        <Edit2 size={18} />
                        Edit
                    </button>
                )}
            </div>

            {!isEditingAddress ? (
                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-lg">
                            {formData.firstName || ''} {formData.lastName || ''}
                        </h3>
                    </div>
                    <p className="text-gray-600">{formData.address}</p>
                    <p className="text-gray-600">
                        {formData.city}, {formData.state} {formData.zipCode || ''}
                    </p>
                    <p className="text-gray-600">{formData.country || ''}</p>
                    <div className="pt-3 border-t border-gray-200 space-y-1">
                        <p className="text-gray-600">
                            <Mail size={14} className="inline mr-2" />
                            {formData.email || ''}
                        </p>
                        <p className="text-gray-600">
                            <Phone size={14} className="inline mr-2" />
                            {formData.phone || ''}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <User size={16} />
                                First Name *
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={onInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="John"
                            />
                            {errors.firstName && (
                                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                            )}
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <User size={16} />
                                Last Name *
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={onInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Doe"
                            />
                            {errors.lastName && (
                                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                            )}
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Mail size={16} />
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={onInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="john.doe@example.com"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Phone size={16} />
                                Phone *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={onInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="1234567890"
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <MapPin size={16} />
                                Address *
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={onInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.address ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="123 Main Street"
                            />
                            {errors.address && (
                                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                            )}
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                City *
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={onInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.city ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="New York"
                            />
                            {errors.city && (
                                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                            )}
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                State *
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={onInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.state ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="NY"
                            />
                            {errors.state && (
                                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                            )}
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                Zip Code *
                            </label>
                            <input
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={onInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.zipCode ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="10001"
                            />
                            {errors.zipCode && (
                                <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                            )}
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                Country *
                            </label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={onInputChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.country ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="United States"
                            />
                            {errors.country && (
                                <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onSaveAddress}
                            className="flex items-center gap-2 px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold transition-colors"
                        >
                            <Save size={18} />
                            Save Address
                        </button>
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="flex items-center gap-2 px-6 py-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
                        >
                            <X size={18} />
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

