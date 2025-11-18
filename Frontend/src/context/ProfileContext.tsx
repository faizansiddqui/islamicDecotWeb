import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { Address, UserProfile, ProfileContextType } from './types';

console.log('🔵 ProfileContext: Module loaded');

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // -------------------------------
  // NORMALIZE BACKEND RESPONSE
  // -------------------------------
  const normalizeProfile = (data: any): UserProfile => {
    return {
      email: data.email || "",
      Addresses: Array.isArray(data.Addresses)
        ? data.Addresses.map((a: any) => ({
            id: a.id || 0,
            FullName: a.FullName || "",
            phone1: a.phone1 || "",
            phone2: a.phone2 || "",
            address: a.address || "",
            city: a.city || "",
            state: a.state || "",
            pinCode: a.pinCode || "",
            addressType: a.addressType || "home",
        }))
        : [],
    };
  };

  // -------------------------------
  // FETCH PROFILE
  // -------------------------------
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

      const raw =
        response.data?.data ||
        response.data?.user ||
        response.data?.profile ||
        response.data;

      if (!raw) throw new Error("Profile data missing from server");

      const normalized = normalizeProfile(raw);

      setProfile(normalized);

    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch profile";
      setError(message);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------
  // CREATE ADDRESS
  // -------------------------------
  const createAddress = async (addressData: Omit<Address, "id">) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendAddress = {
        FullName: addressData.FullName.trim(),
        phone1: addressData.phone1.trim(),
        phone2: addressData.phone2?.trim() || null,
        address: addressData.address.trim(),
        city: addressData.city.trim(),
        state: addressData.state.trim(),
        pinCode: addressData.pinCode.trim(),
        addressType: addressData.addressType,
      };

      await userAPI.createAddress(backendAddress);

      await fetchProfile();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create address";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------
  // UPDATE ADDRESS
  // -------------------------------
  const updateAddress = async (address: Address) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!address.id) throw new Error("Address ID is required for update");

      const backendAddress = {
        FullName: address.FullName.trim(),
        phone1: address.phone1.trim(),
        phone2: address.phone2?.trim() || null,
        address: address.address.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        pinCode: address.pinCode.trim(),
        addressType: address.addressType,
      };

      await userAPI.updateAddress(address.id, backendAddress);

      await fetchProfile();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update address";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------
  // RUN ON AUTH CHANGE
  // -------------------------------
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setIsLoading(false);
      setProfile(null);
    }
  }, [isAuthenticated]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        fetchProfile,
        updateProfile: fetchProfile,
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
  if (!context) throw new Error("useProfile must be used within a ProfileProvider");
  return context;
}
