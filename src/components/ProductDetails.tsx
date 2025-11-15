import { useState } from 'react';
import { X, ShoppingCart, Heart, Share2, Star, Check, ArrowLeft } from 'lucide-react';
import { products } from '../productDetails';

interface ProductDetailsProps {
  productId: number;
  onClose: () => void;
  onProductChange?: (newId: number) => void;
}

export default function ProductDetails({ productId, onClose, onProductChange }: ProductDetailsProps) {
  const product = products.find((p) => p.id === productId);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) return null;

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleRelatedClick = (relatedId: number) => {
    setSelectedImage(0);
    if (onProductChange) {
      onProductChange(relatedId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Products</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 p-8 lg:p-12">
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`absolute top-4 right-4 p-3 rounded-full transition-all ${
                    isFavorite
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-red-50'
                  }`}
                >
                  <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden transition-all ${
                      selectedImage === index
                        ? 'ring-4 ring-emerald-600 scale-105'
                        : 'hover:opacity-75'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {product.category}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {product.theme}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className="text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">(128 reviews)</span>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="border-t border-b border-gray-200 py-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-bold text-emerald-700">
                    ${product.price}
                  </span>
                  <span className="text-gray-500 line-through text-xl">
                    ${Math.round(product.price * 1.3)}
                  </span>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                    Save {Math.round((1 - product.price / (product.price * 1.3)) * 100)}%
                  </span>
                </div>
                <p className="text-emerald-600 font-medium mt-2">
                  {product.shipping}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-600 text-sm">Material</span>
                      <p className="font-semibold">{product.material}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-600 text-sm">Dimensions</span>
                      <p className="font-semibold">{product.dimensions}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-6 py-3 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
                <button className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg">
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button className="p-4 border-2 border-gray-300 hover:border-emerald-700 hover:text-emerald-700 rounded-lg transition-colors">
                  <Share2 size={20} />
                </button>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Check size={20} />
                  <span className="font-semibold">In Stock - Ships within 2-3 business days</span>
                </div>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="border-t border-gray-200 px-8 lg:px-12 py-12 bg-gray-50">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Related Products
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct.id}
                    onClick={() => handleRelatedClick(relatedProduct.id)}
                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <span className="text-xl font-bold text-emerald-700">
                        ${relatedProduct.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}