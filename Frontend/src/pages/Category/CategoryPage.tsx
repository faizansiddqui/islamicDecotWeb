import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { productAPI } from '../../services/api';
import ProductCard from '../../components/Product/ProductCard';
import ProductDetails from '../../components/Product/ProductDetails';
import Footer from '../../components/Footer/Footer';
import CategorySelector from './CategorySelector';
import ProductSortDropdown from './ProductSortDropdown';
import { getCategories, Category } from '../../data/categories';

interface Product {
    product_id: number;
    name: string;
    title?: string;
    price: number;
    selling_price: number;
    product_image: string | string[] | { [key: string]: string };
    quantity: number;
    createdAt?: string;
    Catagory?: {
        id: number;
        name: string;
    };
}

interface CategoryPageProps {
    onBack: () => void;
}

export default function CategoryPage({ onBack }: CategoryPageProps) {
    // Load categories from centralized data file
    const categoriesData = getCategories();
    const hardcodedCategories: Category[] = [
        { id: 0, name: 'All' },
        ...categoriesData
    ];

    const [selectedCategory, setSelectedCategory] = useState<string | null>('All');
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-high' | 'price-low'>('newest');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Get search query from URL and listen for changes
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            const searchMatch = hash.match(/[?&]search=([^&]*)/);
            if (searchMatch) {
                const query = decodeURIComponent(searchMatch[1] || '');
                setSearchQuery(query);
            } else {
                setSearchQuery('');
            }
        };

        // Check initial hash
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        if (selectedCategory && selectedCategory !== 'All') {
            loadProductsByCategory(selectedCategory);
        } else {
            loadAllProducts();
        }
    }, [selectedCategory]);

    const loadAllProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const response = await productAPI.getProducts();

            if (response.data.status === true && response.data.products && Array.isArray(response.data.products)) {
                setProducts(response.data.products);
            } else {
                setProducts([]);
            }
        } catch (error: unknown) {
            console.error('❌ Error loading all products:', error);
            setProducts([]);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const loadProductsByCategory = async (categoryName: string) => {
        setIsLoadingProducts(true);
        try {
            const response = await productAPI.getProductByCategory(categoryName);

            if (response.data.status === 'ok' && response.data.data) {
                const categoryData = response.data.data;
                if (categoryData && categoryData.Products && Array.isArray(categoryData.Products)) {
                    setProducts(categoryData.Products);
                } else {
                    setProducts([]);
                }
            } else {
                setProducts([]);
            }
        } catch (error: unknown) {
            console.error('❌ Error loading products:', error);
            setProducts([]);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const getImageUrl = (productImage: string | string[] | { [key: string]: string } | undefined): string => {
        if (!productImage) return '';
        if (typeof productImage === 'string') {
            return productImage;
        }
        if (Array.isArray(productImage)) {
            return productImage[0] || '';
        }
        if (typeof productImage === 'object') {
            const values = Object.values(productImage);
            return values[0] || '';
        }
        return '';
    };

    const handleProductClick = (productId: number) => {
        setSelectedProductId(productId);
    };

    // Sort and filter products based on selected sort option and search query
    const sortedProducts = useMemo(() => {
        let filtered = [...products];

        // Apply search filter if search query exists
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product => {
                const name = (product.name || product.title || '').toLowerCase();
                const category = product.Catagory?.name?.toLowerCase() || '';
                return name.includes(query) || category.includes(query);
            });
        }

        // Apply sorting
        switch (sortBy) {
            case 'newest':
                return filtered.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return dateB - dateA;
                });
            case 'oldest':
                return filtered.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return dateA - dateB;
                });
            case 'price-high':
                return filtered.sort((a, b) => {
                    const priceA = a.selling_price || a.price || 0;
                    const priceB = b.selling_price || b.price || 0;
                    return priceB - priceA;
                });
            case 'price-low':
                return filtered.sort((a, b) => {
                    const priceA = a.selling_price || a.price || 0;
                    const priceB = b.selling_price || b.price || 0;
                    return priceA - priceB;
                });
            default:
                return filtered;
        }
    }, [products, sortBy, searchQuery]);

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-gray-700 hover:text-amber-700 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-medium">Back</span>
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Categories</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <CategorySelector
                    categories={hardcodedCategories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                />

                {/* Products Grid */}
                <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory && selectedCategory !== 'All' ? `${selectedCategory} Products` : 'All Products'}
                        </h2>
                        <div className="flex items-center gap-4">
                            {products.length > 0 && (
                                <p className="text-gray-600 text-sm">
                                    {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found
                                </p>
                            )}
                            {products.length > 0 && (
                                <ProductSortDropdown
                                    sortBy={sortBy}
                                    showDropdown={showSortDropdown}
                                    onSortChange={setSortBy}
                                    onToggleDropdown={() => setShowSortDropdown(!showSortDropdown)}
                                />
                            )}
                        </div>
                    </div>

                    {isLoadingProducts ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
                        </div>
                    ) : sortedProducts.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg">
                            <p className="text-gray-600 text-lg">{searchQuery ? 'No products found for your search' : 'No Product Found'}</p>
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        window.location.hash = '#/categories';
                                    }}
                                    className="mt-4 px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop: Always grid view with smaller cards */}
                            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                {sortedProducts.map((product) => {
                                    const imageUrl = getImageUrl(product.product_image);
                                    return (
                                        <ProductCard
                                            key={product.product_id}
                                            id={product.product_id}
                                            name={product.name || product.title || 'Product'}
                                            price={product.selling_price || product.price}
                                            image={imageUrl}
                                            category={product.Catagory?.name || selectedCategory || 'Product'}
                                            inStock={product.quantity > 0}
                                        />
                                    );
                                })}
                            </div>

                            {/* Mobile: List view without Add to Cart button */}
                            <div className="sm:hidden space-y-3">
                                {sortedProducts.map((product) => {
                                    const imageUrl = getImageUrl(product.product_image);
                                    return (
                                        <div
                                            key={product.product_id}
                                            onClick={() => handleProductClick(product.product_id)}
                                            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-xl flex flex-row gap-3 p-3"
                                        >
                                            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                <img
                                                    src={imageUrl}
                                                    alt={product.name || 'Product'}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96?text=No+Image';
                                                    }}
                                                />
                                                {(!product.quantity || product.quantity < 1) && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                                                            Out of Stock
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                                <div>
                                                    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 hover:text-amber-700 transition-colors">
                                                        {product.name || product.title || 'Product'}
                                                    </h3>
                                                    <p className="text-xs text-gray-600 mb-1">
                                                        {product.Catagory?.name || selectedCategory}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base font-bold text-amber-700">
                                                            ${product.selling_price || product.price}
                                                        </span>
                                                        {product.price > product.selling_price && (
                                                            <span className="text-xs text-gray-500 line-through">
                                                                ${product.price}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-xs font-semibold ${product.quantity && product.quantity >= 1
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                        }`}>
                                                        {product.quantity && product.quantity >= 1
                                                            ? 'In Stock'
                                                            : 'Out of Stock'
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Product Details Modal */}
            {selectedProductId && (
                <ProductDetails
                    productId={selectedProductId}
                    onClose={() => setSelectedProductId(null)}
                />
            )}

            <Footer />
        </div>
    );
}