import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
    id: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string) => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
    verifyCode: (email: string, code: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    console.log('🔵 AuthContext: AuthProvider mounted');

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    console.log('🔵 AuthContext: Initial state - user:', user, 'isLoading:', isLoading);

    useEffect(() => {
        console.log('🔄 AuthContext: useEffect triggered');
        // Check if user is authenticated by checking cookies
        checkAuth();
    }, []);

    const checkAuth = async () => {
        console.log('🔵 AuthContext: checkAuth called');

        try {
            // Check if user info is stored in localStorage
            const savedUser = localStorage.getItem('user');
            const isAuth = localStorage.getItem('isAuthenticated');

            console.log('🔵 AuthContext: localStorage check - savedUser:', savedUser, 'isAuth:', isAuth);

            if (savedUser && isAuth === 'true') {
                try {
                    const userData = JSON.parse(savedUser);
                    console.log('✅ AuthContext: User data found in localStorage:', userData);
                    setUser(userData);
                } catch (parseError) {
                    console.error('❌ AuthContext: Failed to parse user data from localStorage', parseError);
                    localStorage.removeItem('user');
                    localStorage.removeItem('isAuthenticated');
                }
            } else {
                console.log('⚠️ AuthContext: No user data found in localStorage');
            }
        } catch (error) {
            console.error('❌ AuthContext: Auth check failed:', error);
        } finally {
            console.log('🏁 AuthContext: Setting isLoading to false');
            setIsLoading(false);
        }
    };

    const login = async (email: string) => {
        try {
            console.log('🔵 Sending OTP request for:', email);
            const response = await authAPI.login(email);
            console.log('🟢 OTP sent, response:', response.data);
            // Backend sends OTP to email via Supabase
            // No user data yet, user needs to verify OTP in email
        } catch (error: unknown) {
            const err = error as { response?: { data?: { Message?: string; message?: string } } };
            console.error('❌ Login request failed:', err);
            const errorMessage = err.response?.data?.Message || err.response?.data?.message || 'Failed to send verification code. Please try again.';
            throw new Error(errorMessage);
        }
    };

    const verifyEmail = async (token: string) => {
        try {
            console.log('🔵 Verifying email with Supabase token');

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
            console.log('🟢 Email verification response:', response.data);

            // Backend sets httpOnly cookies (accessToken, refreshToken)
            // and returns success message
            if (response.data && response.data.Message) {
                console.log('✅ Login successful, cookies set');

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

            throw new Error('Invalid response from server');
        } catch (error: unknown) {
            const err = error as {
                response?: {
                    status?: number;
                    data?: { message?: string; Message?: string }
                };
                message?: string
            };

            console.error('❌ Email verification failed:', err);

            if (err.response?.status === 401) {
                throw new Error('Invalid or expired token. Please try logging in again.');
            }

            const errorMessage = err.response?.data?.message || err.response?.data?.Message || err.message || 'Verification failed. Please try again.';
            throw new Error(errorMessage);
        }
    };

    const verifyCode = async (email: string, code: string) => {
        try {
            console.log('🔵 Verifying code for:', email);
            const response = await authAPI.verifyCode(email, code);
            console.log('🟢 Verify response:', response.data);

            // Backend returns user data after successful verification
            if (response.data && response.data.status) {
                // Extract user data from response
                const userData = {
                    id: response.data.user_id || response.data.id || '',
                    email: email
                };

                console.log('✅ Login successful, user data:', userData);
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('authToken', response.data.token || 'authenticated');
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
        console.log('🔴 AuthContext: Logging out user');
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');

        // Try to call logout endpoint if it exists
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        console.log('🔵 AuthContext: Calling logout endpoint at:', `${apiUrl}/api/auth/logout`);

        fetch(`${apiUrl}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        }).catch((error) => {
            // Logout endpoint may not exist, that's okay
            console.log('⚠️ AuthContext: Logout endpoint not available or failed:', error);
        });

        // Redirect to home page using navigateTo
        console.log('🔵 AuthContext: Redirecting to home page');
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
                {console.log('🔵 AuthContext: Provider rendering - isAuthenticated:', !!user, 'user:', user, 'isLoading:', isLoading)}
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

