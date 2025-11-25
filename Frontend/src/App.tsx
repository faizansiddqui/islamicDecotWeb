import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import AuthCallback from './pages/AuthCallback';
import { useParams } from 'react-router-dom';

// Wrapper component for OrderDetailsPage to extract orderId from route params
const OrderDetailsPageRoute = () => {
  const { orderId } = useParams<{ orderId: string }>();
  return <OrderDetailsPage orderId={orderId || ''} onBack={() => window.history.back()} />;
};

// Wrapper component for ProductDetailsPage to extract productId from route params
const ProductDetailsPageRoute = () => {
  const { productId } = useParams<{ productId: string }>();
  const productIdNum = productId ? parseInt(productId, 10) : 0;
  return <ProductDetailsPage productId={productIdNum} />;
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar onSearchChange={setSearchQuery} />

        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <BestSellers />
              <NewArrivals />
              <ProductGrid searchQuery={searchQuery} />
              <Features />
            </>
          } />

          <Route path="/admin" element={<AdminPage onBack={() => window.history.back()} />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/cart" element={<CartPage onBack={() => window.history.back()} />} />
          <Route path="/checkout" element={<CheckoutPage onBack={() => window.history.back()} />} />
          <Route path="/log" element={<LoginPage onBack={() => window.history.back()} />} />
          <Route path="/api/auth/verify" element={<LoginPage onBack={() => window.history.back()} />} />
          <Route path="/profile" element={<ProfilePage onBack={() => window.history.back()} />} />
          <Route path="/orders" element={<MyOrdersPage onBack={() => window.history.back()} />} />
          <Route path="/order/:orderId" element={<OrderDetailsPageRoute />} />
          <Route path="/order-success" element={<OrderSuccess onContinueShopping={() => window.location.href = '/'} />} />
          <Route path="/product/:productId" element={<ProductDetailsPageRoute />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/settings" element={<SettingsPage onBack={() => window.history.back()} />} />
          <Route path="/categories" element={<CategoryPage onBack={() => window.history.back()} onSearchChange={setSearchQuery} />} />
          <Route path="/contact" element={<ContactPage onBack={() => window.history.back()} />} />
          <Route path="/shipping" element={<ShippingInfoPage onBack={() => window.history.back()} />} />
          <Route path="/returns" element={<ReturnsPage onBack={() => window.history.back()} />} />
          <Route path="/faq" element={<FAQPage onBack={() => window.history.back()} />} />
          <Route path="/privacy" element={<PrivacyPolicyPage onBack={() => window.history.back()} />} />
          <Route path="/terms" element={<TermsOfServicePage onBack={() => window.history.back()} />} />
          <Route path="/search" element={<SearchPage onBack={() => window.history.back()} onSearchChange={setSearchQuery} />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}