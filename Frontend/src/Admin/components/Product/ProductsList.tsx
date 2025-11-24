import { useState, useEffect } from 'react';
import { adminAPI } from '../../../services/api';
import AlertMessage from '../Admin/AlertMessage';
import EditProductModal from './EditProductModal';
import { Package, RefreshCw, Edit } from 'lucide-react';

interface Product {
    product_id: number;
    name: string;
    title: string;
    price: number;
    selling_price: number;
    quantity: number;
    sku: string | null;
    description: string | null;
    product_image: string | string[] | { [key: string]: string };
    catagory_id: number;
    Catagory?: {
        id: number;
        name: string;
    };
}

export default function ProductsList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await adminAPI.getProducts();

            if (response.data.status && Array.isArray(response.data.products)) {
                setProducts(response.data.products);
            } else {
                setError('Invalid response format from server');
            }
        } catch (err: unknown) {
            console.error('❌ Error fetching products:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const getImageUrl = (productImage: string | string[] | { [key: string]: string }): string => {
        if (typeof productImage === 'string') {
            return productImage;
        }
        if (Array.isArray(productImage)) {
            return productImage[0] || '';
        }
        if (typeof productImage === 'object') {
            // Handle object with image URLs
            const values = Object.values(productImage);
            return values[0] || '';
        }
        return '';
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2
        }).format(price);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setEditingProduct(null);
    };

    const handleSave = async (productId: number, data: { price: number; selling_price: number; quantity: number }) => {
        try {
            await adminAPI.updateProduct(productId, data);

            // Update the product in the local state
            setProducts(prevProducts =>
                prevProducts.map(p =>
                    p.product_id === productId
                        ? { ...p, price: data.price, selling_price: data.selling_price, quantity: data.quantity }
                        : p
                )
            );

            setSuccess('Product updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update product. Please try again.';
            setError(errorMessage);
            throw err; // Re-throw to let the modal handle it
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
                <button
                    onClick={fetchProducts}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {error && (
                <AlertMessage
                    type="error"
                    message={error}
                    onClose={() => setError('')}
                />
            )}

            {success && (
                <AlertMessage
                    type="success"
                    message={success}
                    onClose={() => setSuccess('')}
                />
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw size={32} className="animate-spin text-amber-700" />
                    <span className="ml-3 text-gray-600">Loading products...</span>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">No products found</p>
                    <p className="text-gray-500 text-sm mt-2">Upload your first product to get started</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => {
                                const imageUrl = getImageUrl(product.product_image);
                                return (
                                    <tr key={product.product_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={product.name}
                                                    className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Image';
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <Package size={24} className="text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{product.title || '-'}</div>
                                            {product.description && (
                                                <div className="text-xs text-gray-500 truncate max-w-xs mt-1">
                                                    {product.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                                                {product.Catagory?.name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatPrice(product.price)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-green-600">{formatPrice(product.selling_price)}</div>
                                            {product.price > product.selling_price && (
                                                <div className="text-xs text-gray-500">
                                                    {Math.round(((product.price - product.selling_price) / product.price) * 100)}% off
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.quantity > 0
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {product.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {product.sku || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-amber-700 hover:text-amber-800 p-2 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Edit Product"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <EditProductModal
                product={editingProduct}
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
            />
        </div>
    );
}

