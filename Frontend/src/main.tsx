import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProfileProvider } from './context/ProfileContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { WishlistProvider } from './context/WishlistContext';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <>
      <AuthProvider>
        <AdminAuthProvider>
          <ProfileProvider>
            <CartProvider>
              <WishlistProvider>
                <App />
              </WishlistProvider>
            </CartProvider>
          </ProfileProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </>
  </StrictMode>
);