import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BestSellers from './components/BestSellers';
import ProductGrid from './components/ProductGrid';
import ProductDetails from './components/ProductDetails';
import Footer from './components/Footer';
import AdminPage from './Admin/AdminPage';

function App() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<'home' | 'admin'>('home');

  // Check URL hash for admin page and listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#/admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('home');
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (currentPage === 'admin') {
    return <AdminPage onBack={() => {
      setCurrentPage('home');
      window.location.hash = '';
    }} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onSearchChange={setSearchQuery} />
      <Hero />
      <BestSellers onProductClick={(id) => setSelectedProductId(id)} />
      <ProductGrid onProductClick={(id) => setSelectedProductId(id)} searchQuery={searchQuery} />
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
