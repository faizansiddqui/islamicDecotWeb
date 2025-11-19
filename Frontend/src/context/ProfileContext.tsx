import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { Address, UserProfile, ProfileContextType } from './types';


const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  // -------------------------------
  // NORMALIZE BACKEND RESPONSE
  // -------------------------------
  const normalizeProfile = (data: unknown): UserProfile => {
    // Type guard to check if data is an object
    if (!data || typeof data !== 'object') {
      return {
        email: user?.email || "",
        Addresses: []
      };
    }

    // Cast to Record<string, unknown> for easier property access
    const dataObj = data as Record<string, unknown>;

    // Normalize addresses array
    let normalizedAddresses: Address[] = [];
    if (Array.isArray(dataObj.Addresses)) {
      normalizedAddresses = dataObj.Addresses.map((a: unknown) => {
        // Type guard for address object
        if (!a || typeof a !== 'object') {
          return {
            id: 0,
            FullName: "",
            phone1: "",
            phone2: "",
            address: "",
            city: "",
            state: "",
            pinCode: "",
            addressType: "home",
          };
        }

        const addr = a as Record<string, unknown>;
        // Ensure addressType is valid
        let addressType: 'home' | 'work' = "home";
        if (typeof addr.addressType === 'string' && (addr.addressType === 'home' || addr.addressType === 'work')) {
          addressType = addr.addressType;
        }

        return {
          id: typeof addr.id === 'number' ? addr.id : 0,
          FullName: typeof addr.FullName === 'string' ? addr.FullName : "",
          phone1: typeof addr.phone1 === 'string' ? addr.phone1 : "",
          phone2: typeof addr.phone2 === 'string' ? addr.phone2 : "",
          address: typeof addr.address === 'string' ? addr.address : "",
          city: typeof addr.city === 'string' ? addr.city : "",
          state: typeof addr.state === 'string' ? addr.state : "",
          pinCode: typeof addr.pinCode === 'string' ? addr.pinCode : "",
          addressType: addressType,
        };
      });
    }

    return {
      email: typeof dataObj.email === 'string' ? dataObj.email : user?.email || "",
      Addresses: normalizedAddresses,
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

      const raw =
        response.data?.data ||
        response.data?.user ||
        response.data?.profile ||
        response.data;

      if (!raw) throw new Error("Profile data missing from server");

      const normalized = normalizeProfile(raw);

      setProfile(normalized);

    } catch (err) {
      console.error('❌ ProfileContext: Failed to fetch profile:', err);
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
    if (isAuthenticated && user) {
      fetchProfile();
    } else {
      setIsLoading(false);
      setProfile(null);
    }
  }, [isAuthenticated, user]);

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