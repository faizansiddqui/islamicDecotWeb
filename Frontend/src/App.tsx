import { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import BestSellers from './components/BestSellers';
import NewArrivals from './components/NewArrivals';
import Features from './components/Features';
import ProductGrid from './components/Product/ProductGrid';
import ProductDetails from './components/Product/ProductDetails';
import Footer from './components/Footer/Footer';
import AdminPage from './Admin/AdminPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import MyOrdersPage from './pages/MyOrdersPage';
import WishlistPage from './pages/WishlistPage';
import SettingsPage from './pages/SettingsPage';
import CategoryPage from './pages/Category/CategoryPage';
import ContactPage from './pages/ContactPage';
import ShippingInfoPage from './pages/ShippingInfoPage';
import ReturnsPage from './pages/ReturnsPage';
import FAQPage from './pages/FAQPage';
import { useAdminAuth } from './context/AdminAuthContext';
import { navigateTo } from './utils/navigation';
import AuthCallback from './pages/AuthCallback';
// import AuthCallback from './pages/AuthCallback';


function App() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<'home' | 'admin' | 'cart' | 'checkout' | 'log' | 'verify' | 'profile' | 'orders' | 'settings' | 'categories' | 'contact' | 'shipping' | 'returns' | 'faq' | 'wishlist'>('home');
  const { isAdminLoggedIn, logout: adminLogout } = useAdminAuth();

  // Track previous path to detect route changes
  const previousPathRef = useRef<string>(window.location.pathname);

  // Check URL pathname for page routing and listen for popstate changes
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      const previousPath = previousPathRef.current;

      // If admin is logged in and navigates to any non-admin route, logout admin
      if (isAdminLoggedIn && path !== '/admin' && path !== '/') {
        console.log('🔴 Admin navigated to user route, logging out admin...');
        adminLogout();
        // Continue to the user route they wanted to visit
      }

      // If admin is logged in and navigates to home
      if (isAdminLoggedIn && previousPath === '/admin' && path === '/') {
        console.log('🔴 Admin returned to home, logging out admin...');
        adminLogout();
      }

      previousPathRef.current = path;

      if (path === '/admin') {
        setCurrentPage('admin');
      } else if (path === '/auth/callback') {
        setCurrentPage('auth-callback');
      } else if (path === '/cart') {
        setCurrentPage('cart');
      } else if (path === '/checkout') {
        setCurrentPage('checkout');
      } else if (path === '/log') {
        setCurrentPage('log');
      } else if (path === '/api/auth/verify') {
        setCurrentPage('verify');
      } else if (path === '/profile') {
        setCurrentPage('profile');
      } else if (path === '/orders') {
        setCurrentPage('orders');
      } else if (path === '/wishlist') {
        setCurrentPage('wishlist');

      } else if (path === '/settings') {
        setCurrentPage('settings');
      } else if (path === '/categories') {
        setCurrentPage('categories');
      } else if (path === '/contact') {
        setCurrentPage('contact');
      } else if (path === '/shipping') {
        setCurrentPage('shipping');
      } else if (path === '/returns') {
        setCurrentPage('returns');
      } else if (path === '/faq') {
        setCurrentPage('faq');
      } else {
        setCurrentPage('home');
      }
    };

    // Check initial path
    handleRouteChange();

    // Listen for popstate (back/forward browser navigation)
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [isAdminLoggedIn, adminLogout]);

  if (currentPage === 'admin') {
    return <AdminPage onBack={() => navigateTo('/')} />;
  }

  if (currentPage === 'cart') {
    return <CartPage onBack={() => navigateTo('/')} />;
  }

  if (currentPage === 'checkout') {
    return <CheckoutPage onBack={() => navigateTo('/cart')} />;
  }

  if (currentPage === 'log' || currentPage === 'verify') {
    return <LoginPage onBack={() => navigateTo('/')} />;
  }

  if (currentPage === 'profile') {
    return <ProfilePage onBack={() => navigateTo('/')} />;
  }

  if (currentPage === 'orders') {
    return <MyOrdersPage onBack={() => navigateTo('/')} />;
  }

  if (currentPage === 'wishlist') {
    return <WishlistPage onBack={() => navigateTo('/')} />;
  }



  if (currentPage === 'settings') {
    return <SettingsPage onBack={() => navigateTo('/')} />;
  }

  if (currentPage === 'categories') {
    return <CategoryPage onBack={() => navigateTo('/')} />;
  }

  if (currentPage === 'contact') {
    return <ContactPage onBack={() => navigateTo('/')} />;
  }

  if (currentPage === 'shipping') {
    return <ShippingInfoPage onBack={() => navigateTo('/')} />;
  }

  if (currentPage === 'returns') {
    return <ReturnsPage onBack={() => navigateTo('/')} />;
  }

  if (currentPage === 'faq') {
    return <FAQPage onBack={() => navigateTo('/')} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onSearchChange={setSearchQuery} />
      <Hero />
      <BestSellers onProductClick={(id) => setSelectedProductId(id)} />
      <NewArrivals onProductClick={(id) => setSelectedProductId(id)} />
      <ProductGrid onProductClick={(id) => setSelectedProductId(id)} searchQuery={searchQuery} />
      <Features />
      <Footer />

      {selectedProductId && (
        <ProductDetails
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </div>
  );
}

export default App;
