import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, userAPI } from '../services/api';

interface User {
    id: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string) => Promise<{ loginType: string }>;
    verifyEmail: (token: string) => Promise<void>;
    verifyCode: (email: string, code: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated by checking cookies
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {

            // Check if user info is stored in localStorage
            const savedUser = localStorage.getItem('user');
            const isAuth = localStorage.getItem('isAuthenticated');


            if (savedUser && isAuth === 'true') {
                try {
                    const userData = JSON.parse(savedUser);
                    setUser(userData);
                } catch (parseError) {
                    console.error('❌ AuthContext: Failed to parse user data from localStorage', parseError);
                    localStorage.removeItem('user');
                    localStorage.removeItem('isAuthenticated');
                }
            } else {
                console.log('AuthContext: No saved user data or not authenticated');
            }
        } catch (error) {
            console.error('❌ AuthContext: Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string) => {
        try {
            const response = await authAPI.login(email);

            // For existing users, the backend immediately authenticates them
            // We need to update the frontend state to reflect this
            if (response.data.loginType === 'normal') {
                // For normal login, we need to fetch the user profile since it's not returned in the login response
                try {
                    // Try to fetch user profile
                    const profileResponse = await userAPI.getProfile();

                    // Extract user data from profile response
                    const profileData = profileResponse.data?.data || profileResponse.data?.user || profileResponse.data?.profile || profileResponse.data;
                    if (profileData && profileData.email) {
                        const userData = {
                            id: profileData.id || '',
                            email: profileData.email
                        };

                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                        localStorage.setItem('isAuthenticated', 'true');
                    } else {
                        // Fallback to using the email from the login
                        const userData = {
                            id: '', // We don't have the ID, but this should be enough for now
                            email: email
                        };

                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                        localStorage.setItem('isAuthenticated', 'true');
                    }
                } catch (profileError) {
                    console.error('❌ AuthContext: Failed to fetch profile after login:', profileError);
                    // Fallback to using the email from the login
                    const userData = {
                        id: '', // We don't have the ID, but this should be enough for now
                        email: email
                    };

                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    localStorage.setItem('isAuthenticated', 'true');
                }
            }

            // Backend sends OTP to email via Supabase for new users
            // For existing users, it returns loginType: "normal"
            return {
                loginType: response.data.loginType || 'magic_link'
            };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { Message?: string; message?: string } } };
            console.error('❌ Login request failed:', err);
            const errorMessage = err.response?.data?.Message || err.response?.data?.message || 'Failed to send verification code. Please try again.';
            throw new Error(errorMessage);
        }
    };

    const verifyEmail = async (token: string) => {
        try {
            // Decode JWT to get email (without verification for display purposes only)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            const userEmail = payload.email || payload.user_metadata?.email || '';
            const userId = payload.sub || '';

            const response = await authAPI.verifyEmail(token);


            // Backend sets httpOnly cookies (accessToken, refreshToken)
            // and returns success message
            // Check for various possible response formats
            if (response.data &&
                (response.data.Message ||
                    response.data.message ||
                    response.data.success ||
                    response.data.status === 200 ||
                    response.data.status === 'success')) {
                // Store user data extracted from token
                const userData = {
                    id: userId,
                    email: userEmail
                };

                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('isAuthenticated', 'true');

                return;
            }

            console.warn('AuthContext: Unexpected response format', response);
            throw new Error('Invalid response from server');
        } catch (error: unknown) {
            const err = error as {
                response?: {
                    status?: number;
                    data?: { message?: string; Message?: string; error?: string }
                };
                message?: string
            };

            console.error('❌ Email verification failed:', err);

            if (err.response?.status === 401) {
                throw new Error('Invalid or expired token. Please try logging in again.');
            }

            const errorMessage = err.response?.data?.message || err.response?.data?.Message || err.response?.data?.error || err.message || 'Verification failed. Please try again.';
            throw new Error(errorMessage);
        }
    };

    const verifyCode = async (email: string, code: string) => {
        try {
            const response = await authAPI.verifyCode(email, code);

            // Backend returns user data after successful verification
            if (response.data && response.data.status) {
                // Extract user data from response
                const userData = {
                    id: response.data.user_id || response.data.id || '',
                    email: email
                };

                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('authToken', response.data.token || 'authenticated');
                localStorage.setItem('isAuthenticated', 'true');
                return;
            }

            throw new Error('Invalid response from server');
        } catch (error: unknown) {
            const err = error as {
                response?: {
                    status?: number;
                    data?: { Message?: string; message?: string; error?: string }
                };
                code?: string;
                message?: string
            };

            console.error('❌ Verification failed:', err);

            // Check if it's a 404 (endpoint doesn't exist)
            if (err.response?.status === 404) {
                throw new Error('Verification endpoint not available. Please contact administrator.');
            }

            // Check if it's invalid code
            if (err.response?.status === 400 || err.response?.status === 401) {
                throw new Error('Invalid verification code. Please try again.');
            }

            // Check if it's a network/CORS error
            if (err.code === 'ERR_NETWORK' || err.message?.includes('CORS')) {
                throw new Error('Network error: Cannot connect to server.');
            }

            const errorMessage = err.response?.data?.Message ||
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                'Verification failed. Please try again.';
            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        // Clear wishlist only when user signs out
        localStorage.removeItem('wishlist');

        // Try to call logout endpoint if it exists
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

        fetch(`${apiUrl}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        }).catch((error) => {
            // Logout endpoint may not exist, that's okay
            console.log('⚠️ AuthContext: Logout endpoint not available or failed:', error);
        });

        // Redirect to home page using navigateTo
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                verifyEmail,
                verifyCode,
                logout,
            }}
        >
            <>
                {children}
            </>
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}