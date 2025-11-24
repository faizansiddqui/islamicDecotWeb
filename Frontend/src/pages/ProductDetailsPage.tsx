import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { productAPI } from '../services/api';
import ProductImageGallery from '../components/Product/ProductImageGallery';
import ProductInfo from '../components/Product/ProductInfo';
import ProductActions from '../components/Product/ProductActions';
import WishlistButton from '../components/Product/WishlistButton';
import { navigateTo } from '../utils/navigation';
import { Product } from '../utils/productUtils';

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

interface ProductDetailsPageProps {
    productId: number;
    onBack?: () => void;
}

export default function ProductDetailsPage({ productId, onBack }: ProductDetailsPageProps) {
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
        navigateTo('/cart');
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigateTo('/');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
                        <button
                            onClick={handleBack}
                            className="bg-amber-700 hover:bg-amber-800 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
                        >
                            Back to Products
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const images = getImageArray(product.product_image);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors mb-6"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-medium">Back to Products</span>
                </button>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-8 p-6 lg:p-8">
                        <ProductImageGallery
                            images={images}
                            selectedImage={selectedImage}
                            onImageSelect={setSelectedImage}
                            productName={product.name || product.title || 'Product'}
                        />

                        <div className="space-y-6">
                            <ProductInfo
                                name={product.name || product.title || 'Product'}
                                title={product.title}
                                description={product.description}
                                price={product.price}
                                sellingPrice={product.selling_price}
                                specifications={product.ProductSpecification || product.ProductSpecifications || []}
                                quantity={product.quantity}
                            />

                            {/* Wishlist Button */}
                            <div className="flex justify-end">
                                <WishlistButton
                                    product={product as Product}
                                    size="lg"
                                    showLabel={true}
                                />
                            </div>

                            <ProductActions
                                quantity={product.quantity}
                                selectedQuantity={quantity}
                                onQuantityDecrease={() => setQuantity(Math.max(1, quantity - 1))}
                                onQuantityIncrease={() => setQuantity(quantity + 1)}
                                onAddToCart={handleAddToCart}
                                addedToCart={addedToCart}
                                onGoToCart={handleGoToCart}
                                productId={product.product_id}
                                productName={product.name || product.title || 'Product'}
                                productPrice={product.selling_price || product.price}
                                productImage={Array.isArray(product.product_image)
                                    ? product.product_image[0]
                                    : typeof product.product_image === 'string'
                                        ? product.product_image
                                        : Object.values(product.product_image)[0] || ''
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}