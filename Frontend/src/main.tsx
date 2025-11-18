import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProfileProvider } from './context/ProfileContext';
import { AdminAuthProvider } from './context/AdminAuthContext';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <>
      <AuthProvider>
        <AdminAuthProvider>
          <ProfileProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </ProfileProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </>
  </StrictMode>
);
