import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import type { Country, State } from 'state-country';

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
    addressCount?: number;
}

export default function AddressForm({ address, onSubmit, onCancel, addressCount = 0 }: AddressFormProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState<Address>({
        FullName: address?.FullName || '',
        phone1: address?.phone1 || '',
        phone2: address?.phone2 || '',
        country: address?.country || '',
        state: address?.state || '',
        city: address?.city || '',
        pinCode: address?.pinCode || '',
        address: address?.address || '',
        addressType: address?.addressType || 'home',
    });

    // State for available states based on selected country
    const [availableStates, setAvailableStates] = useState<string[]>([]);

    // State for countries and states data
    const [countriesList, setCountriesList] = useState<string[]>([]);
    const [countriesAndStates, setCountriesAndStates] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);

    // Load country data when component mounts
    useEffect(() => {
        const loadCountryData = async () => {
            try {
                const stateCountry = await import('state-country');
                const sc = stateCountry.default;

                // Get all countries
                const allCountries: Country[] = sc.getAllCountries();

                // Create country list and state map
                const countryList: string[] = [];
                const countryStateMap: Record<string, string[]> = {};

                // Process countries
                allCountries.forEach((country: Country) => {
                    countryList.push(country.name);

                    // Get states for this country
                    const countryStates: State[] = sc.getAllStatesInCountry(country.name);
                    countryStateMap[country.name] = countryStates.map((state: State) => state.name);
                });

                setCountriesList(countryList);
                setCountriesAndStates(countryStateMap);

                // Set default country if none selected
                if (!formData.country && countryList.length > 0) {
                    setFormData(prev => ({ ...prev, country: countryList[0] }));
                }
            } catch (error) {
                console.error('Failed to load country data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCountryData();
    }, []);

    // Initialize available states based on selected country
    useEffect(() => {
        const states = countriesAndStates[formData.country] || [];
        setAvailableStates(states);
    }, [formData.country, countriesAndStates]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Handle country change to update available states
        if (name === 'country') {
            const countryStates = countriesAndStates[value] || [];
            setAvailableStates(countryStates);
            // Reset state selection when country changes
            setFormData(prev => ({ ...prev, state: '' }));
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

        setIsSubmitting(true);

        try {
            let userId = user?.id;

            // If user ID is missing, try to get it from profile
            if (!userId || userId === '') {
                try {
                    const profileResponse = await userAPI.getProfile();

                    // Try different paths to extract profile data
                    const profileData = profileResponse.data?.data || profileResponse.data?.user || profileResponse.data?.profile || profileResponse.data;

                    if (profileData && profileData.id) {
                        userId = profileData.id;
                    } else {
                        // Try to get user ID from the main user object
                        if (profileData && typeof profileData === 'object' && 'user' in profileData) {
                            const userData = (profileData as { user?: { id?: string } }).user;
                            if (userData && userData.id) {
                                userId = userData.id;
                            }
                        }
                        // Try to get user ID from localStorage
                        if ((!userId || userId === '') && profileData && typeof profileData === 'object' && 'email' in profileData) {
                            const savedUser = localStorage.getItem('user');
                            if (savedUser) {
                                try {
                                    const userData = JSON.parse(savedUser);
                                    if (userData && userData.id) {
                                        userId = userData.id;
                                    }
                                } catch (parseError) {
                                    console.error('Error parsing localStorage user data:', parseError);
                                }
                            }
                        }
                    }
                } catch (profileError) {
                    console.error('Error fetching user profile:', profileError);
                }
            }

            if (address?.id) {
                // Update existing address
                // For update, backend expects phone1 and phone2
                const updateData = {
                    ...formData,
                    phone1: formData.phone1,
                    phone2: formData.phone2,
                    address_id: address.id,
                    decode_user: userId, // Add user ID for update
                };
                await userAPI.updateAddress(address.id, updateData);
            } else {
                // Create new address
                // For create, backend expects phoneNo and alt_Phone
                if (!userId || userId === '') {
                    throw new Error('Unable to retrieve user ID for address creation. Please log out and log back in.');
                }

                const createData = {
                    ...formData,
                    phoneNo: formData.phone1,
                    alt_Phone: formData.phone2,
                    decode_user: userId,
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

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {address?.id ? 'Edit Address' : 'Add New Address'}
                </h2>
                <button
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Show warning when trying to create a new address and limit is reached */}
            {!address?.id && addressCount >= 3 && (
                <div className="mb-6 bg-amber-50 border border-amber-100 rounded-lg p-4">
                    <p className="text-amber-700 text-sm">
                        You have reached the maximum limit of 3 addresses. You can edit existing addresses.
                    </p>
                </div>
            )}

            {errors.form && (
                <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{errors.form}</p>
                </div>
            )}

            {/* Changed from form to div to avoid nested forms */}
            <div className="space-y-6">
                {/* Disable form fields when trying to create new address and limit is reached */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${!address?.id && addressCount >= 3 ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="FullName"
                            value={formData.FullName}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors ${errors.FullName ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="Enter full name"
                            disabled={!address?.id && addressCount >= 3}
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
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors ${errors.phone1 ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="Enter 10-digit phone number"
                            disabled={!address?.id && addressCount >= 3}
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
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors ${errors.phone2 ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="Enter 10-digit phone number (optional)"
                            disabled={!address?.id && addressCount >= 3}
                        />
                        {errors.phone2 && <p className="mt-1 text-sm text-red-600">{errors.phone2}</p>}
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={3}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors ${errors.address ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="Enter complete address"
                            disabled={!address?.id && addressCount >= 3}
                        />
                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
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
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors ${errors.city ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="Enter city"
                            disabled={!address?.id && addressCount >= 3}
                        />
                        {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            State *
                        </label>
                        <select
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors ${errors.state ? 'border-red-300' : 'border-gray-300'}`}
                            disabled={!address?.id && addressCount >= 3 || availableStates.length === 0}
                        >
                            <option value="">Select State</option>
                            {availableStates.map((state) => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                        {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
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
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors ${errors.pinCode ? 'border-red-300' : 'border-gray-300'}`}
                            placeholder="Enter 6-digit PIN code"
                            disabled={!address?.id && addressCount >= 3}
                        />
                        {errors.pinCode && <p className="mt-1 text-sm text-red-600">{errors.pinCode}</p>}
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country *
                        </label>
                        <select
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-amber-600 outline-none transition-colors ${errors.country ? 'border-red-300' : 'border-gray-300'}`}
                            disabled={!address?.id && addressCount >= 3}
                        >
                            <option value="">Select Country</option>
                            {countriesList.map((country) => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                        {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address Type *
                        </label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="addressType"
                                    value="home"
                                    checked={formData.addressType === 'home'}
                                    onChange={handleChange}
                                    className="text-amber-600 focus:ring-amber-500"
                                    disabled={!address?.id && addressCount >= 3}
                                />
                                <span className="ml-2 text-gray-700">Home</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="addressType"
                                    value="work"
                                    checked={formData.addressType === 'work'}
                                    onChange={handleChange}
                                    className="text-amber-600 focus:ring-amber-500"
                                    disabled={!address?.id && addressCount >= 3}
                                />
                                <span className="ml-2 text-gray-700">Work</span>
                            </label>
                        </div>
                        {errors.addressType && <p className="mt-1 text-sm text-red-600">{errors.addressType}</p>}
                    </div>
                </div>


                <div className="flex justify-end gap-4 pt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${(!address?.id && addressCount >= 3) || isSubmitting
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                            }`}
                        disabled={(!address?.id && addressCount >= 3) || isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                            </span>
                        ) : address?.id ? (
                            'Update Address'
                        ) : (
                            'Add Address'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
