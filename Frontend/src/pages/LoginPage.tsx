import { useState, useEffect } from 'react';
import { Mail, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { navigateTo } from '../utils/navigation';

interface LoginPageProps {
  onBack?: () => void;
}

export default function LoginPage({ onBack }: LoginPageProps) {
  const { login, verifyEmail, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'waiting'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect authenticated users to home page
  useEffect(() => {
    if (isAuthenticated && user) {
      navigateTo('/');
      if (onBack) onBack();
    }
  }, [isAuthenticated, user, onBack]);

  // Check for access token in URL (from email link redirect)
  // Supabase sends token in hash fragment
  useEffect(() => {
    const checkForToken = async () => {
      // Check hash fragment first (Supabase default)
      const hash = window.location.hash;
      let accessToken = null;

      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        accessToken = hashParams.get('access_token');
      }

      // Fallback to query params
      if (!accessToken) {
        const urlParams = new URLSearchParams(window.location.search);
        accessToken = urlParams.get('access_token');
      }

      if (accessToken) {
        setIsLoading(true);
        setStep('waiting');
        try {
          console.log('🔑 Access token found in URL, verifying...');
          await verifyEmail(accessToken);
          setSuccess('Login successful! Redirecting...');
          // Clear the URL hash/query
          window.history.replaceState({}, '', window.location.pathname);
          setTimeout(() => {
            navigateTo('/');
            if (onBack) onBack();
          }, 1500);
        } catch (err: unknown) {
          const error = err as { message?: string };
          setError(error.message || 'Verification failed. Please try logging in again.');
          setStep('email');
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkForToken();
  }, [verifyEmail, onBack]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(email);

      // If user is already registered, they should be authenticated now
      // Redirect them to home page immediately
      if (response.loginType === 'normal') {
        setSuccess('Login successful! Redirecting to your account...');
        // Force a check of the auth state
        setTimeout(() => {
          navigateTo('/');
          if (onBack) onBack();
        }, 1500);
      } else {
        // New user - they need to check their email
        setSuccess('Verification email sent! Please check your inbox.');
        setStep('waiting');
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to send verification email. Please try again.');
      setStep('email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setError('');
    setSuccess('');
  };

  const handleResendEmail = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await login(email);
      setSuccess('Verification email resent! Please check your inbox.');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show the login page if user is already authenticated
  if (isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {step === 'email' ? 'Login / Register' : 'Check Your Email'}
            </h1>
            <p className="text-gray-600">
              {step === 'email'
                ? 'Enter your email to get started'
                : 'We sent a verification link to your email'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-600" />
              <p className="text-emerald-600 text-sm">{success}</p>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                  placeholder="your.email@example.com"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending Link...
                  </>
                ) : (
                  <>
                    Login / SignUp
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
                  <Mail size={40} className="text-amber-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
                <p className="text-gray-600 mb-4">
                  We sent a verification link to:
                </p>
                <p className="font-medium text-gray-900 mb-4">{email}</p>
                <p className="text-sm text-gray-500">
                  Click the link in the email to complete your login.
                  The link will expire in 5 minutes.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Resending...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      Resend Email
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  disabled={isLoading}
                  className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                >
                  Use a different email
                </button>
              </div>
            </div>
          )}

          {onBack && (
            <button
              onClick={onBack}
              className="mt-6 w-full text-gray-600 hover:text-amber-700 transition-colors text-sm"
            >
              ← Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}