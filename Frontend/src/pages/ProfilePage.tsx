import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import AddressForm from '../components/AddressForm';
import { ArrowLeft, Mail, Phone, MapPin, Home, Building, Plus, Edit, User } from 'lucide-react';
import { navigateTo } from '../utils/navigation';

interface Address {
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

export default function ProfilePage({ onBack }: { onBack?: () => void }) {
    const { user, isAuthenticated, logout } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!isAuthenticated) return;

            try {
                setLoading(true);
                setError(null);
                const response = await userAPI.getAddresses();

                if (response.data.status && Array.isArray(response.data.data)) {
                    setAddresses(response.data.data);
                } else {
                    setAddresses([]);
                }
            } catch (err: unknown) {
                console.error('Failed to fetch addresses:', err);
                // Check if it's an authentication error
                if (typeof err === 'object' && err !== null && 'response' in err) {
                    const axiosError = err as { response?: { status?: number } };
                    if (axiosError.response?.status === 403) {
                        setError('Authentication required. Please log in again.');
                        // Redirect to login page
                        setTimeout(() => {
                            navigateTo('/log');
                        }, 2000);
                    } else {
                        setError('Failed to load addresses. Please try again later.');
                    }
                } else {
                    setError('Failed to load addresses. Please try again later.');
                }
                setAddresses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, [isAuthenticated]);

    const loadAddresses = async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            setError(null);
            const response = await userAPI.getAddresses();

            if (response.data.status && Array.isArray(response.data.data)) {
                setAddresses(response.data.data);
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

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigateTo('/');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
                    <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
                    <button
                        onClick={() => navigateTo('/log')}
                        className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back</span>
                </button>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Profile Header - Clean and Centered */}
                    <div className="px-6 py-8">
                        <div className="flex flex-col items-center">
                            {/* Avatar */}
                            <div className="bg-gray-200 border-2 border-dashed rounded-full w-20 h-20 flex items-center justify-center mb-4">
                                <User size={32} className="text-gray-500" />
                            </div>

                            {/* Profile Title */}
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>

                            {/* Verified Email */}
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-gray-500" />
                                <span className="text-gray-700">{user?.email}</span>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Verified
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200"></div>

                    {/* Profile Content */}
                    <div className="p-6">
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Addresses</h2>
                                <button
                                    onClick={() => {
                                        setEditingAddress(null);
                                        setShowAddressForm(true);
                                    }}
                                    disabled={addresses.length >= 3}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${addresses.length >= 3
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                                        }`}
                                >
                                    <Plus size={16} />
                                    Add Address
                                </button>
                            </div>

                            {addresses.length >= 3 && (
                                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
                                    <p className="text-amber-700 text-sm">
                                        You have reached the maximum limit of 3 addresses. You can edit existing addresses.
                                    </p>
                                </div>
                            )}

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                                    <p className="text-red-700">{error}</p>
                                    {error.includes('Authentication') && (
                                        <p className="text-red-500 text-sm mt-2">Redirecting to login page...</p>
                                    )}
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className="text-center py-12">
                                    <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
                                    <p className="text-gray-500 mb-6">Add your first address to get started</p>
                                    <button
                                        onClick={() => {
                                            setEditingAddress(null);
                                            setShowAddressForm(true);
                                        }}
                                        disabled={addresses.length >= 3}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${addresses.length >= 3
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-amber-600 hover:bg-amber-700 text-white'
                                            }`}
                                    >
                                        Add Address
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {addresses.map((address) => (
                                        <div key={address.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-3">
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

                                                    <div className="space-y-2 text-gray-600">
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
                                                    onClick={() => {
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
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                            <button
                                onClick={logout}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Dialog for Address Form */}
            {showAddressForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <AddressForm
                            address={editingAddress || undefined}
                            onSubmit={handleAddressSubmit}
                            onCancel={handleAddressCancel}
                            addressCount={addresses.length}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}