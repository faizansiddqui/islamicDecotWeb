export interface Address {
    id?: number;
    FullName: string;
    phone1: string;
    phone2?: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    addressType: 'home' | 'work';
}

export interface UserProfile {
    email: string;
    Addresses?: Address[];
}

export interface ProfileContextType {
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    fetchProfile: () => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    updateAddress: (address: Address) => Promise<void>;
    createAddress: (address: Omit<Address, 'id'>) => Promise<void>;
}