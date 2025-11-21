import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { userAPI } from '../services/api';
import AddressForm from '../components/AddressForm';
import { Settings, LogOut, Shield, Globe, ArrowLeft, MapPin, Plus, Edit } from 'lucide-react';
import { navigateTo } from '../utils/navigation';

interface SettingsPageProps {
  onBack?: () => void;
}

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
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { user, logout } = useAuth();
  const { saveCartToLocalStorage } = useCart();
  // const [notifications, setNotifications] = useState(true);
  // const [emailNotifications, setEmailNotifications] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    if (!user?.id) return;

    try {
      setLoadingAddresses(true);
      const response = await userAPI.getAddresses();
      if (response.data.status && Array.isArray(response.data.data)) {
        setAddresses(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleLogout = () => {
    // Save cart to localStorage before logout
    saveCartToLocalStorage();
    logout();
    // logout() already redirects to home, so no need to redirect here
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
      window.location.hash = '';
    }
  };

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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="text-amber-700" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
            </div>
          </div>
          {/* Privacy & Security */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-amber-700" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Privacy & Security</h2>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => navigateTo('/privacy')}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium text-gray-900">Privacy Policy</p>
                <p className="text-sm text-gray-500">Read our privacy policy</p>
              </button>
            </div>
          </div>

          {/* Terms & Policy */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-amber-700" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Terms & Policy</h2>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => navigateTo('/terms')}
                className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium text-gray-900">Terms of Service</p>
                <p className="text-sm text-gray-500">Read our terms of service</p>
              </button>
            </div>
          </div>

          {/* Language & Region */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="text-amber-700" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Language & Region</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none">
                  <option>English</option>
                  <option>Arabic</option>
                  <option>Urdu</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Management */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MapPin className="text-amber-700" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">Address Management</h2>
              </div>
              <button
                onClick={() => {
                  setEditingAddress(null);
                  setShowAddressForm(true);
                }}
                className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus size={16} />
                Add Address
              </button>
            </div>

            {loadingAddresses ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
                <p className="text-gray-500 mb-4">Add your first address to get started</p>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setShowAddressForm(true);
                  }}
                  className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{address.FullName}</h3>
                          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full capitalize">
                            {address.addressType}
                          </span>
                        </div>

                        <div className="space-y-1 text-gray-600">
                          <p>{address.address}, {address.city}, {address.state}, {address.country} - {address.pinCode}</p>
                          <p>Phone: {address.phone1}{address.phone2 && ` / ${address.phone2}`}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setEditingAddress(address);
                          setShowAddressForm(true);
                        }}
                        className="text-amber-700 hover:text-amber-800 font-medium text-sm flex items-center gap-1"
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

          {/* Logout */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {showAddressForm && (
        <AddressForm
          address={editingAddress || undefined}
          onSubmit={handleAddressSubmit}
          onCancel={handleAddressCancel}
        />
      )}
    </div>
  );
}

