import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BestSellers from './components/BestSellers';
import ProductGrid from './components/ProductGrid';
import ProductDetails from './components/ProductDetails';
import Footer from './components/Footer';

function App() {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
