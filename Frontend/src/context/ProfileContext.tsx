import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { Address, UserProfile, ProfileContextType } from './types';

console.log('🔵 ProfileContext: Module loaded');

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);
console.log('🔵 ProfileContext: Context created');

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to show loading initially
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchProfile = async () => {
    if (!isAuthenticated) {
      setProfile(null);
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await userAPI.getProfile();
      console.log("Profile response:", response.data);
  
      // Accept ANY of these common API shapes
      const data =
        response.data?.data ||
        response.data?.user ||
        response.data?.profile ||
        response.data;
  
      if (!data) {
        throw new Error("Profile data missing from server");
      }
  
      setProfile(data); // <-- finally sets the profile!
  
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch profile";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const updateProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Note: There's no direct profile update endpoint in the backend
      // Profile updates are done through address management
      await fetchProfile(); // Refresh profile after any changes
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createAddress = async (addressData: Omit<Address, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const backendAddress = {
        FullName: addressData.FullName.trim(),
        phoneNo: addressData.phone1.trim(),
        alt_Phone: addressData.phone2?.trim() || undefined,
        address: addressData.address.trim(),
        city: addressData.city.trim(),
        state: addressData.state.trim(),
        pinCode: addressData.pinCode.trim(),
        addressType: addressData.addressType,
      };

      await userAPI.createAddress(backendAddress);

      // Refresh profile to get the new address
      await fetchProfile();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create address';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAddress = async (address: Address) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!address.id) {
        throw new Error('Address ID is required for update');
      }

      const backendAddress = {
        FullName: address.FullName.trim(),
        phoneNo: address.phone1.trim(),
        alt_Phone: address.phone2?.trim() || undefined,
        address: address.address.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pinCode: address.pinCode.trim(),
        addressType: address.addressType,
      };

      await userAPI.updateAddress(address.id, backendAddress);

      // Refresh profile to get the updated address
      await fetchProfile();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update address';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile on mount and when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        fetchProfile,
        updateProfile,
        updateAddress,
        createAddress,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}