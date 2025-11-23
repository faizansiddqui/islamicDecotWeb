import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AddressForm from './AddressForm';
import { Home, Building, MapPin, Phone, Plus, Edit } from 'lucide-react';

// Create a local Address interface that matches the backend response
interface LocalAddress {
    id: number;
    FullName: string;
    phone1: string;
    phone2: string | null;
    country: string;
    state: string;
    city: string;
    pinCode: string;
    address: string;
    addressType: string;
    createdAt: string;
    updatedAt: string;
    user_id: string;
}

// Create an Address interface that matches AddressForm's expectations
interface FormAddress {
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

interface AddressSelectorProps {
    selectedAddressId: number | null;
    onAddressSelect: (addressId: number) => void;
}

export default function AddressSelector({ selectedAddressId, onAddressSelect }: AddressSelectorProps) {
    const { isAuthenticated } = useAuth();
    const [addresses, setAddresses] = useState<LocalAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<LocalAddress | null>(null);

    useEffect(() => {
        loadAddresses();
    }, [isAuthenticated]);

    const loadAddresses = async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            setError(null);
            const response = await userAPI.getAddresses();

            if (response.data.status && Array.isArray(response.data.data)) {
                setAddresses(response.data.data);
                // If no address is selected and we have addresses, select the first one
                if (selectedAddressId === null && response.data.data.length > 0 && response.data.data[0].id !== undefined) {
                    onAddressSelect(response.data.data[0].id);
                }
            } else {
                setAddresses([]);
            }
        } catch (err: unknown) {
            console.error('Failed to fetch addresses:', err);
            setError('Failed to load addresses. Please try again later.');
            setAddresses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSubmit = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
        loadAddresses(); // Refresh the address list
    };

    const handleAddressCancel = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
    };

    // Convert LocalAddress to FormAddress
    const convertToLocalAddress = (address: LocalAddress): FormAddress => {
        return {
            id: address.id,
            FullName: address.FullName,
            phone1: address.phone1,
            phone2: address.phone2,
            country: address.country,
            state: address.state,
            city: address.city,
            pinCode: address.pinCode,
            address: address.address,
            addressType: address.addressType
        };
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Select Shipping Address</h3>
                <button
                    onClick={() => {
                        setEditingAddress(null);
                        setShowAddressForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Plus size={16} />
                    Add New Address
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="text-center py-8">
                    <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
                    <p className="text-gray-500 mb-6">Add your first address to get started</p>
                    <button
                        onClick={() => {
                            setEditingAddress(null);
                            setShowAddressForm(true);
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Add Address
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`border rounded-xl p-5 cursor-pointer transition-all ${selectedAddressId === address.id
                                ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-100'
                                : 'border-gray-200 hover:shadow-sm'
                                }`}
                            onClick={() => address.id && onAddressSelect(address.id)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <input
                                            type="radio"
                                            name="address"
                                            checked={selectedAddressId === address.id}
                                            onChange={() => address.id && onAddressSelect(address.id)}
                                            className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                                        />
                                        <h3 className="font-semibold text-gray-900">{address.FullName}</h3>
                                        {address.addressType === 'home' ? (
                                            <Home size={16} className="text-amber-600" />
                                        ) : (
                                            <Building size={16} className="text-amber-600" />
                                        )}
                                        <span className="bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full capitalize">
                                            {address.addressType}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-gray-600 ml-6">
                                        <p className="flex items-start gap-2">
                                            <MapPin size={16} className="flex-shrink-0 mt-0.5 text-gray-400" />
                                            <span className="text-sm">
                                                {address.address}, {address.city}, {address.state}, {address.country} - {address.pinCode}
                                            </span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Phone size={16} className="flex-shrink-0 text-gray-400" />
                                            <span className="text-sm">{address.phone1}</span>
                                            {address.phone2 && <span className="text-sm">/ {address.phone2}</span>}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingAddress(address);
                                        setShowAddressForm(true);
                                    }}
                                    className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-1 p-2 rounded-lg hover:bg-amber-50 transition-colors"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Dialog for Address Form */}
            {showAddressForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <AddressForm
                            address={editingAddress ? convertToLocalAddress(editingAddress) : undefined}
                            onSubmit={handleAddressSubmit}
                            onCancel={handleAddressCancel}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}