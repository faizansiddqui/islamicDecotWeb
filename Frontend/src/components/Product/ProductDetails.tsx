import { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { productAPI } from '../../services/api';
import ProductImageGallery from './ProductImageGallery';
import ProductInfo from './ProductInfo';
import ProductActions from './ProductActions';
import { navigateTo } from '../../utils/navigation';

interface ProductSpecification {
  specification_id?: number;
  key?: string;
  value?: string;
}

interface ProductData {
  product_id: number;
  name: string;
  title?: string;
  price: number;
  selling_price: number;
  product_image: string | string[] | { [key: string]: string };
  quantity: number;
  description?: string;
  ProductSpecification?: ProductSpecification[];
  ProductSpecifications?: ProductSpecification[]; // Sequelize might return plural
}

interface ProductDetailsProps {
  productId: number;
  onClose: () => void;
}

export default function ProductDetails({ productId, onClose }: ProductDetailsProps) {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const loadProduct = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await productAPI.getProductById(productId);

      if (response.data.status === 200 && response.data.data && response.data.data.length > 0) {
        setProduct(response.data.data[0]);
      } else {
        setError('Product not found');
      }
    } catch (error: unknown) {
      console.error('❌ Error loading product:', error);
      const err = error as {
        response?: {
          status?: number;
          data?: { message?: string };
        };
        message?: string;
      };
      setError(err.response?.data?.message || err.message || 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      // Pass product data to addToCart
      addToCart(product.product_id, quantity, {
        name: product.name || product.title || 'Product',
        price: product.selling_price || product.price,
        image: Array.isArray(product.product_image) 
          ? product.product_image[0] 
          : typeof product.product_image === 'string' 
            ? product.product_image 
            : Object.values(product.product_image)[0] || ''
      });
      setAddedToCart(true);
    }
  };


  const getImageArray = (productImage: string | string[] | { [key: string]: string } | undefined): string[] => {
    if (!productImage) return [];
    if (typeof productImage === 'string') {
      return [productImage];
    }
    if (Array.isArray(productImage)) {
      return productImage;
    }
    if (typeof productImage === 'object') {
      return Object.values(productImage);
    }
    return [];
  };



  const handleGoToCart = () => {
    onClose();
    navigateTo('/cart');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <button
            onClick={onClose}
            className="w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const images = getImageArray(product.product_image);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen py-2 sm:py-4 lg:py-8 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-amber-700 transition-colors"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base font-medium">Back to Products</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12 p-4 sm:p-6 lg:p-8 xl:p-12">
            <ProductImageGallery
              images={images}
              selectedImage={selectedImage}
              onImageSelect={setSelectedImage}
              productName={product.name || product.title || 'Product'}
            />

            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              <ProductInfo
                name={product.name || product.title || 'Product'}
                title={product.title}
                description={product.description}
                price={product.price}
                sellingPrice={product.selling_price}
                specifications={product.ProductSpecification || product.ProductSpecifications || []}
                quantity={product.quantity}
              />

              <ProductActions
                quantity={product.quantity}
                selectedQuantity={quantity}
                onQuantityDecrease={() => setQuantity(Math.max(1, quantity - 1))}
                onQuantityIncrease={() => setQuantity(quantity + 1)}
                onAddToCart={handleAddToCart}
                addedToCart={addedToCart}
                onGoToCart={handleGoToCart}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}