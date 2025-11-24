import { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import BestSellers from './components/BestSellers';
import NewArrivals from './components/NewArrivals';
import Features from './components/Features';
import ProductGrid from './components/Product/ProductGrid';
import Footer from './components/Footer/Footer';
import AdminPage from './Admin/AdminPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import MyOrdersPage from './pages/MyOrdersPage';
import SettingsPage from './pages/SettingsPage';
import CategoryPage from './pages/Category/CategoryPage';
import ContactPage from './pages/ContactPage';
import ShippingInfoPage from './pages/ShippingInfoPage';
import ReturnsPage from './pages/ReturnsPage';
import FAQPage from './pages/FAQPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrderSuccess from './pages/checkout/OrderSuccess';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import SearchPage from './pages/SearchPage';
import WishlistPage from './pages/WishlistPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import { useAdminAuth } from './context/AdminAuthContext';
import { navigateTo } from './utils/navigation';
// import AuthCallback from './pages/AuthCallback';

type PageType = 'home' | 'admin' | 'cart' | 'checkout' | 'log' | 'verify' | 'profile' | 'orders' | 'order-details' | 'order-success' | 'settings' | 'categories' | 'contact' | 'shipping' | 'returns' | 'faq' | 'wishlist' | 'auth-callback' | 'privacy' | 'terms' | 'search' | 'product-details';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const { isAdminLoggedIn, logout: adminLogout } = useAdminAuth();

  // State for order details
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // State for product details
  const [selectedProductDetailsId, setSelectedProductDetailsId] = useState<number | null>(null);

  // Track previous path to detect route changes
  const previousPathRef = useRef<string>(window.location.pathname);

  // Check URL pathname for page routing and listen for popstate changes
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      const previousPath = previousPathRef.current;

      // If admin is logged in and navigates to any non-admin route, logout admin
      if (isAdminLoggedIn && path !== '/admin' && path !== '/') {
        adminLogout();
        // Continue to the user route they wanted to visit
      }

      // If admin is logged in and navigates to home
      if (isAdminLoggedIn && previousPath === '/admin' && path === '/') {
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
      } else if (path.startsWith('/order/')) {
        const orderId = path.split('/').pop() || '';
        setSelectedOrderId(orderId);
        setCurrentPage('order-details');
      } else if (path.startsWith('/product/')) {
        const productId = path.split('/').pop();
        if (productId) {
          const productIdNum = parseInt(productId, 10);
          if (!isNaN(productIdNum)) {
            setSelectedProductDetailsId(productIdNum);
            setCurrentPage('product-details');
          }
        }
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
      } else if (path === '/privacy') {
        setCurrentPage('privacy');
      } else if (path === '/terms') {
        setCurrentPage('terms');
      } else if (path === '/search') {
        setCurrentPage('search');
      } else if (path === '/order-success') {
        setCurrentPage('order-success');
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

  if (currentPage === 'order-details' && selectedOrderId) {
    return <OrderDetailsPage orderId={selectedOrderId} onBack={() => navigateTo('/orders')} />;
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

  if (currentPage === 'privacy') {
    return <PrivacyPolicyPage onBack={() => navigateTo('/')} />;
  }

  if (currentPage === 'terms') {
    return <TermsOfServicePage onBack={() => navigateTo('/')} />;
  }

  if (currentPage === 'search') {
    return <SearchPage onBack={() => navigateTo('/')} />;
  }

  if (currentPage === 'wishlist') {
    return <WishlistPage />;
  }

  if (currentPage === 'product-details' && selectedProductDetailsId) {
    return <ProductDetailsPage productId={selectedProductDetailsId} />;
  }

  if (currentPage === 'order-success') {
    return <OrderSuccess onContinueShopping={() => navigateTo('/')} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onSearchChange={setSearchQuery} />
      <Hero />
      <BestSellers />
      <NewArrivals />
      <ProductGrid searchQuery={searchQuery} />
      <Features />
      <Footer />
    </div>
  );
}
