import { useState } from 'react';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';

interface Address {
    id?: number;
    FullName: string;
    phone1: string;
    phone2: string | null;
    country: string;
    state: string;
    city: string;
    pinCode: string;
    address: string;
    addressType: string;
}

interface AddressFormProps {
    address?: Address;
    onSubmit: (address: Address) => void;
    onCancel: () => void;
}

export default function AddressForm({ address, onSubmit, onCancel }: AddressFormProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState<Address>({
        FullName: address?.FullName || '',
        phone1: address?.phone1 || '',
        phone2: address?.phone2 || '',
        country: address?.country || 'India',
        state: address?.state || '',
        city: address?.city || '',
        pinCode: address?.pinCode || '',
        address: address?.address || '',
        addressType: address?.addressType || 'home',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.FullName.trim()) {
            newErrors.FullName = 'Full name is required';
        }

        if (!formData.phone1.trim()) {
            newErrors.phone1 = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone1)) {
            newErrors.phone1 = 'Phone number must be 10 digits';
        }

        if (formData.phone2 && !/^\d{10}$/.test(formData.phone2)) {
            newErrors.phone2 = 'Alternative phone number must be 10 digits';
        }

        if (!formData.country.trim()) {
            newErrors.country = 'Country is required';
        }

        if (!formData.state.trim()) {
            newErrors.state = 'State is required';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        }

        if (!formData.pinCode.trim()) {
            newErrors.pinCode = 'PIN code is required';
        } else if (!/^\d{6}$/.test(formData.pinCode)) {
            newErrors.pinCode = 'PIN code must be 6 digits';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        } else if (formData.address.length < 10) {
            newErrors.address = 'Address must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (!user?.id) {
            setErrors({ form: 'User not authenticated' });
            return;
        }

        setIsSubmitting(true);

        try {
            if (address?.id) {
                // Update existing address
                // For update, backend expects phone1 and phone2
                const updateData = {
                    ...formData,
                    phone1: formData.phone1,
                    phone2: formData.phone2,
                    address_id: address.id
                };
                await userAPI.updateAddress(address.id, updateData);
            } else {
                // Create new address
                // For create, backend expects phoneNo and alt_Phone
                const createData = {
                    ...formData,
                    phoneNo: formData.phone1,
                    alt_Phone: formData.phone2,
                    decode_user: user.id,
                };
                await userAPI.createAddress(createData);
            }

            onSubmit(formData);
        } catch (error: unknown) {
            console.error('Error saving address:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to save address. Please try again.';
            setErrors({ form: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {address?.id ? 'Edit Address' : 'Add New Address'}
                        </h2>
                        <button
                            onClick={onCancel}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {errors.form && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-700 text-sm">{errors.form}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="FullName"
                                    value={formData.FullName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.FullName ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter full name"
                                />
                                {errors.FullName && <p className="mt-1 text-sm text-red-600">{errors.FullName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone1"
                                    value={formData.phone1}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.phone1 ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter 10-digit phone number"
                                />
                                {errors.phone1 && <p className="mt-1 text-sm text-red-600">{errors.phone1}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alternative Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone2"
                                    value={formData.phone2 || ''}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.phone2 ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter 10-digit phone number (optional)"
                                />
                                {errors.phone2 && <p className="mt-1 text-sm text-red-600">{errors.phone2}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country *
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter country"
                                />
                                {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    State *
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter state"
                                />
                                {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter city"
                                />
                                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    PIN Code *
                                </label>
                                <input
                                    type="text"
                                    name="pinCode"
                                    value={formData.pinCode}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.pinCode ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter 6-digit PIN code"
                                />
                                {errors.pinCode && <p className="mt-1 text-sm text-red-600">{errors.pinCode}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address *
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter complete address"
                                />
                                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address Type *
                                </label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="addressType"
                                            value="home"
                                            checked={formData.addressType === 'home'}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-amber-700 focus:ring-amber-700"
                                        />
                                        <span className="ml-2 text-gray-700">Home</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="addressType"
                                            value="work"
                                            checked={formData.addressType === 'work'}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-amber-700 focus:ring-amber-700"
                                        />
                                        <span className="ml-2 text-gray-700">Work</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : address?.id ? 'Update Address' : 'Add Address'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}