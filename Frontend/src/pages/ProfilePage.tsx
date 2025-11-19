import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { User, Mail, Phone, MapPin, Save, Edit2, ArrowLeft, CheckCircle } from 'lucide-react';
export default function ProfilePage() {
  const { profile, isLoading, error, updateAddress, createAddress } = useProfile();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    id: 0,
    FullName: '',
    phone1: '',
    phone2: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    addressType: 'home' as 'home' | 'work'
  });

  // Initialize form data from profile
  useEffect(() => {
    console.log('🔄 ProfilePage: Profile useEffect triggered');
    console.log('🔄 ProfilePage: Profile data changed:', profile);
    console.log('🔄 ProfilePage: Auth user:', user);

    // STOP IMMEDIATELY IF PROFILE IS NULL
    if (!profile) {
      console.log("⛔ Profile is null");
      return;
    }

    // STOP IF ADDRESSES IS MISSING OR EMPTY
    if (!Array.isArray(profile.Addresses) || profile.Addresses.length === 0) {
      console.log("⚠️ No address found");
      // Initialize with empty values but keep email
      setFormData({
        id: 0,
        FullName: '',
        phone1: '',
        phone2: '',
        address: '',
        city: '',
        state: '',
        pinCode: '',
        addressType: 'home',
      });
      return;
    }

    // SAFE NOW — WE KNOW address EXISTS
    const address = profile.Addresses[0];

    setFormData({
      id: address.id ?? 0,
      FullName: address.FullName || '',
      phone1: address.phone1 || '',
      phone2: address.phone2 || '',
      address: address.address || '',
      city: address.city || '',
      state: address.state || '',
      pinCode: address.pinCode || '',
      addressType: address.addressType || 'home',
    });
  }, [profile, user]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.FullName.trim()) {
      errors.FullName = 'Full name is required';
    }

    if (!formData.phone1.trim()) {
      errors.phone1 = 'Primary phone is required';
    } else if (!/^\d{10}$/.test(formData.phone1)) {
      errors.phone1 = 'Phone must be exactly 10 digits';
    }

    if (formData.phone2 && !/^\d{10}$/.test(formData.phone2)) {
      errors.phone2 = 'Alternative phone must be exactly 10 digits';
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    } else if (formData.address.length < 8) {
      errors.address = 'Address must be at least 8 characters';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }

    if (!formData.pinCode.trim()) {
      errors.pinCode = 'Pin code is required';
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      errors.pinCode = 'Pin code must be exactly 6 digits';
    }

    return errors;
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    setFieldErrors({});

    if (!user) {
      setErrorMessage('⚠️ You must be logged in to save your profile.');
      setIsSaving(false);
      return;
    }

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('⚠️ Please fix the errors below.');
      setIsSaving(false);
      return;
    }

    try {
      if (formData.id) {
        // Update existing address
        await updateAddress({
          id: formData.id,
          FullName: formData.FullName,
          phone1: formData.phone1,
          phone2: formData.phone2,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pinCode: formData.pinCode,
          addressType: formData.addressType,
        });
      } else {
        // Create new address
        await createAddress({
          FullName: formData.FullName,
          phone1: formData.phone1,
          phone2: formData.phone2,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pinCode: formData.pinCode,
          addressType: formData.addressType,
        });
      }

      setIsEditing(false);
      setSuccessMessage('✅ Profile saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to save profile. Please try again.';
      setErrorMessage('❌ ' + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    window.location.hash = '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
            >
              Retry
            </button>
          </div>
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

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          {/* Updated heading with verified email and green badge */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.email || user?.email || 'User Profile'}
              </h1>
              <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                <CheckCircle size={16} className="text-emerald-600" />
                <span className="text-xs font-medium text-emerald-600">Verified</span>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            )}
          </div>

          <div className="space-y-6">
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded">
                <p className="text-sm font-medium">{successMessage}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="FullName"
                  value={formData.FullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${fieldErrors.FullName ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100' : ''}`}
                />
                {fieldErrors.FullName && (
                  <p className="text-xs text-red-600 mt-1 font-medium">⚠️ {fieldErrors.FullName}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} />
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={profile?.email || user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 pr-24 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                    <CheckCircle size={16} className="text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-600">Verified</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} />
                  Primary Phone
                </label>
                <input
                  type="tel"
                  name="phone1"
                  value={formData.phone1}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="10 digits (e.g., 9876543210)"
                  maxLength={10}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${fieldErrors.phone1 ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100' : ''}`}
                />
                {fieldErrors.phone1 ? (
                  <p className="text-xs text-red-600 mt-1 font-medium">⚠️ {fieldErrors.phone1}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Must be exactly 10 digits</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} />
                  Alternative Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone2"
                  value={formData.phone2}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="10 digits (e.g., 9876543210)"
                  maxLength={10}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${fieldErrors.phone2 ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100' : ''}`}
                />
                {fieldErrors.phone2 ? (
                  <p className="text-xs text-red-600 mt-1 font-medium">⚠️ {fieldErrors.phone2}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Optional: exactly 10 digits if provided</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="At least 8 characters"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${fieldErrors.address ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100' : ''}`}
                />
                {fieldErrors.address ? (
                  <p className="text-xs text-red-600 mt-1 font-medium">⚠️ {fieldErrors.address}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters required</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${fieldErrors.city ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100' : ''}`}
                />
                {fieldErrors.city && (
                  <p className="text-xs text-red-600 mt-1 font-medium">⚠️ {fieldErrors.city}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${fieldErrors.state ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100' : ''}`}
                />
                {fieldErrors.state && (
                  <p className="text-xs text-red-600 mt-1 font-medium">⚠️ {fieldErrors.state}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  Pin Code
                </label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="6 digits (e.g., 110001)"
                  maxLength={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${fieldErrors.pinCode ? 'border-red-500' : 'border-gray-300'} ${!isEditing ? 'bg-gray-100' : ''}`}
                />
                {fieldErrors.pinCode ? (
                  <p className="text-xs text-red-600 mt-1 font-medium">⚠️ {fieldErrors.pinCode}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Must be exactly 6 digits</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  Address Type
                </label>
                <select
                  name="addressType"
                  value={formData.addressType}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none ${!isEditing ? 'bg-gray-100' : ''}`}
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                </select>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to original values
                    if (profile?.Addresses && profile.Addresses.length > 0) {
                      const address = profile.Addresses[0];
                      setFormData({
                        id: address.id || 0,
                        FullName: address.FullName || '',
                        phone1: address.phone1 || '',
                        phone2: address.phone2 || '',
                        address: address.address || '',
                        city: address.city || '',
                        state: address.state || '',
                        pinCode: address.pinCode || '',
                        addressType: address.addressType || 'home',
                      });
                    }
                  }}
                  className="px-6 py-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}