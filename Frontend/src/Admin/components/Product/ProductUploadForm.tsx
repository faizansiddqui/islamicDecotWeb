import { useState } from 'react';
import { adminAPI } from '../../../services/api';
import AlertMessage from '../Admin/AlertMessage';
import ProductFormFields from './ProductFormFields';
import ProductImageUpload from './ProductImageUpload';
import { getCategories, Category } from '../../../data/categories';

interface ProductFormData {
    name: string;
    title: string;
    price: string;
    selling_price: string;
    quantity: string;
    sku: string;
    description: string;
    catagory: string;
    specification: string;
}

export default function ProductUploadForm() {
    const [productForm, setProductForm] = useState<ProductFormData>({
        name: '',
        title: '',
        price: '',
        selling_price: '',
        quantity: '',
        sku: '',
        description: '',
        catagory: '',
        specification: '',
    });
    const [productImages, setProductImages] = useState<File[]>([]);
    const [productError, setProductError] = useState('');
    const [productSuccess, setProductSuccess] = useState('');
    const [isUploadingProduct, setIsUploadingProduct] = useState(false);

    // Load categories from centralized data file
    const hardcodedCategories: Category[] = getCategories();

    const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 5) {
            setProductError('Maximum 5 images allowed');
            return;
        }
        setProductImages(files);
        setProductError('');
    };

    const handleFormChange = (field: keyof ProductFormData, value: string) => {
        setProductForm(prev => ({ ...prev, [field]: value }));
    };

    const handleUploadProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (productImages.length === 0) {
            setProductError('At least one image is required');
            return;
        }
        if (!productForm.name.trim() || !productForm.title.trim() || !productForm.price || !productForm.selling_price || !productForm.quantity || !productForm.catagory.trim()) {
            setProductError('Please fill in all required fields (name, title, price, selling price, quantity, category)');
            return;
        }

        // Validate quantity is a positive integer
        const quantityNum = parseInt(productForm.quantity.trim());
        if (!productForm.quantity.trim() || isNaN(quantityNum) || quantityNum < 0) {
            setProductError('Quantity must be a valid positive number');
            return;
        }

        setIsUploadingProduct(true);
        setProductError('');
        setProductSuccess('');

        try {
            const formData = new FormData();

            // Add images
            productImages.forEach((image, index) => {
                console.log(`🔵 Adding image ${index + 1}:`, image.name, image.type, image.size);
                formData.append('images', image);
            });

            // Add product data according to backend
            formData.append('name', productForm.name.trim());
            formData.append('title', productForm.title.trim());
            formData.append('price', productForm.price.trim());
            formData.append('selling_price', productForm.selling_price.trim());
            // Ensure quantity is sent as a valid number string (must be >= 0)
            if (isNaN(quantityNum) || quantityNum < 0) {
                throw new Error('Invalid quantity value. Please enter a valid positive number.');
            }
            formData.append('quantity', quantityNum.toString());
            if (productForm.sku.trim()) {
                formData.append('sku', productForm.sku);
            }
            formData.append('description', productForm.description || '');
            formData.append('catagory', productForm.catagory);


            // Verify quantity in FormData
            const quantityValue = formData.get('quantity');
            console.log('🔵 Verified quantity in FormData:', quantityValue, 'Type:', typeof quantityValue);

            // Add specification as JSON string if provided
            if (productForm.specification.trim()) {
                try {
                    const specs = JSON.parse(productForm.specification);
                    formData.append('specification', JSON.stringify(specs));
                } catch {
                    setProductError('Invalid JSON format for specification');
                    setIsUploadingProduct(false);
                    return;
                }
            }

            const response = await adminAPI.uploadProduct(formData);
            console.log('🟢 Product upload successful:', response);
            setProductSuccess('Product uploaded successfully!');

            // Reset form
            setProductForm({
                name: '',
                title: '',
                price: '',
                selling_price: '',
                quantity: '',
                sku: '',
                description: '',
                catagory: '',
                specification: '',
            });
            setProductImages([]);
        } catch (error: unknown) {
            console.error('❌ Product upload failed - Full error:', error);

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as {
                    response?: {
                        status?: number;
                        data?: { message?: string; error?: string; err?: string;[key: string]: unknown };
                        statusText?: string;
                    };
                    message?: string;
                    code?: string;
                };

                console.error('❌ Axios Error Details:');
                console.error('  - Status:', axiosError.response?.status);
                console.error('  - Status Text:', axiosError.response?.statusText);
                console.error('  - Response Data:', axiosError.response?.data);
                console.error('  - Error Code:', axiosError.code);
                console.error('  - Error Message:', axiosError.message);

                // Get detailed error message from backend
                let errorMsg = '';
                if (axiosError.response?.data) {
                    const errorData = axiosError.response.data;
                    // Show the actual error message from backend
                    const backendError = errorData.error || errorData.err || errorData.message;
                    errorMsg = backendError || JSON.stringify(errorData);

                    // Provide helpful context for common errors
                    if (backendError && backendError.includes('invalid input syntax for type integer')) {
                        errorMsg = `Database Error: ${backendError}. The backend is trying to use a UUID where an integer is expected. This is a backend issue - check backend code for product_id usage.`;
                    } else if (backendError && backendError.includes('not null')) {
                        errorMsg = `Database Error: ${backendError}. A required field is missing. Check if 'quantity' field needs to be set in backend.`;
                    }
                } else {
                    errorMsg = axiosError.message || `Failed to upload product (Status: ${axiosError.response?.status || 'Unknown'})`;
                }

                // Add status code to error message for 500 errors
                if (axiosError.response?.status === 500) {
                    errorMsg = `Server Error (500): ${errorMsg}`;
                }

                console.error('❌ Final error message to display:', errorMsg);
                setProductError(errorMsg);
            } else {
                const errorMessage = error instanceof Error ? error.message : 'Failed to upload product. Please try again.';
                console.error('❌ Unknown error type:', error);
                setProductError(errorMessage);
            }
        } finally {
            setIsUploadingProduct(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload New Product</h2>

            {productError && (
                <AlertMessage
                    type="error"
                    message={productError}
                    onClose={() => setProductError('')}
                />
            )}

            {productSuccess && (
                <AlertMessage
                    type="success"
                    message={productSuccess}
                    onClose={() => setProductSuccess('')}
                />
            )}

            <form onSubmit={handleUploadProduct} className="space-y-6">
                <ProductFormFields
                    productForm={productForm}
                    categories={hardcodedCategories}
                    onFormChange={handleFormChange}
                />

                <ProductImageUpload
                    productImages={productImages}
                    onImageChange={handleProductImageChange}
                    error={productError}
                />

                <button
                    type="submit"
                    disabled={isUploadingProduct}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUploadingProduct ? 'Uploading...' : 'Upload Product'}
                </button>
            </form>
        </div>
    );
}
