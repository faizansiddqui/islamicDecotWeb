import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { navigateTo } from './navigation';

/**
 * Custom hook to protect routes that require authentication
 * Redirects to login page if user is not authenticated
 * @param redirectTo Path to redirect to if not authenticated (default: '/log')
 */
export const useAuthProtection = (redirectTo: string = '/log') => {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigateTo(redirectTo);
        }
    }, [isAuthenticated, isLoading, redirectTo]);

    return { isAuthenticated, isLoading };
};