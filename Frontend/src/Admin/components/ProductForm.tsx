import { X, Tag, Package, DollarSign, FileText, Settings, Grid, AlertCircle, Save } from 'lucide-react';
import { ProductFormData } from '../types';
import { categories } from '../types';
import ImageUpload from './ImageUpload';
import FeaturesInput from './FeaturesInput';

interface ProductFormProps {
    formData: ProductFormData;
    errors: Record<string, string>;
    isEditing: boolean;
    onFormDataChange: (data: ProductFormData) => void;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: (index: number) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    getImageUrl: (image: File | string) => string;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function ProductForm({
    formData,
    errors,
    isEditing,
    onFormDataChange,
    onImageChange,
    onRemoveImage,
    onSubmit,
    onCancel,
    getImageUrl,
    setErrors
}: ProductFormProps) {
    const updateField = <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
        onFormDataChange({ ...formData, [field]: value });
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                    {isEditing ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                {/* Images Upload */}
                <ImageUpload
                    images={formData.images}
                    errors={errors.images}
                    onImageChange={onImageChange}
                    onRemoveImage={onRemoveImage}
                    getImageUrl={getImageUrl}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Tag size={18} />
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => {
                                updateField('title', e.target.value);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                            placeholder="Enter product title"
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle size={14} />
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* SKU ID */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Package size={18} />
                            SKU ID *
                        </label>
                        <input
                            type="text"
                            value={formData.skuId}
                            onChange={(e) => updateField('skuId', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                            placeholder="Enter SKU ID"
                        />
                        {errors.skuId && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle size={14} />
                                {errors.skuId}
                            </p>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText size={18} />
                        Description *
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                        placeholder="Enter product description"
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.description}
                        </p>
                    )}
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <DollarSign size={18} />
                            MRP (₹) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.mrp || ''}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                updateField('mrp', value);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                            placeholder="0.00"
                        />
                        {errors.mrp && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle size={14} />
                                {errors.mrp}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <DollarSign size={18} />
                            Selling Price (₹) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.sellingPrice || ''}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                updateField('sellingPrice', value);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                            placeholder="0.00"
                        />
                        {errors.sellingPrice && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle size={14} />
                                {errors.sellingPrice}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Tag size={18} />
                            Discount (%)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.discountPercentage}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                            placeholder="Auto-calculated"
                        />
                        <p className="mt-1 text-xs text-gray-500">Automatically calculated</p>
                    </div>
                </div>

                {/* Specifications */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Settings size={20} />
                        Specifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Material *
                            </label>
                            <input
                                type="text"
                                value={formData.material}
                                onChange={(e) => updateField('material', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                                placeholder="e.g., Cotton, Silk, etc."
                            />
                            {errors.material && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.material}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dimensions *
                            </label>
                            <input
                                type="text"
                                value={formData.dimensions}
                                onChange={(e) => updateField('dimensions', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                                placeholder="e.g., 10x10x5 cm"
                            />
                            {errors.dimensions && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.dimensions}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Type
                        </label>
                        <select
                            value={formData.stockType}
                            onChange={(e) => {
                                const stockType = e.target.value as 'number' | 'dropdown';
                                updateField('stockType', stockType);
                                updateField('stock', stockType === 'number' ? 0 : 'in stock');
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                        >
                            <option value="number">In Stock</option>
                            <option value="dropdown">Out of Stock</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock {formData.stockType === 'number' ? '(Quantity) *' : '*'}
                        </label>
                        {formData.stockType === 'number' ? (
                            <input
                                type="number"
                                min="0"
                                value={typeof formData.stock === 'number' ? formData.stock : ''}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value) || 0;
                                    updateField('stock', value);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                                placeholder="0"
                            />
                        ) : (
                            <select
                                value={formData.stock as string}
                                onChange={(e) => {
                                    updateField('stock', e.target.value as 'in stock' | 'out of stock');
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                            >
                                <option value="in stock">In Stock</option>
                                <option value="out of stock">Out of Stock</option>
                            </select>
                        )}
                        {errors.stock && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle size={14} />
                                {errors.stock}
                            </p>
                        )}
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Grid size={18} />
                        Category *
                    </label>
                    <select
                        value={formData.category}
                        onChange={(e) => updateField('category', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                    >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {errors.category && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.category}
                        </p>
                    )}
                </div>

                {/* Features */}
                <FeaturesInput
                    features={formData.features}
                    error={errors.features}
                    onChange={(features) => updateField('features', features)}
                />

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors shadow-md"
                    >
                        <Save size={18} />
                        {isEditing ? 'Update Product' : 'Upload Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}

