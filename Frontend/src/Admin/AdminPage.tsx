import { useState, useEffect } from 'react';
import { Product, ProductFormData } from './types';
import AdminHeader from './components/AdminHeader';
import ProductForm from './components/ProductForm';
import QuickEditForm from './components/QuickEditForm';
import ProductTable from './components/ProductTable';

interface AdminPageProps {
    onBack?: () => void;
}

const initialFormData: ProductFormData = {
    images: [],
    title: '',
    description: '',
    mrp: 0,
    sellingPrice: 0,
    discountPercentage: 0,
    material: '',
    dimensions: '',
    stock: 0,
    stockType: 'number',
    category: '',
    features: [],
    skuId: ''
};

export default function AdminPage({ onBack }: AdminPageProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<ProductFormData>(initialFormData);
    const [editData, setEditData] = useState({ mrp: 0, sellingPrice: 0, stock: 0 as number | 'in stock' | 'out of stock', stockType: 'number' as 'number' | 'dropdown' });

    // Calculate discount
    useEffect(() => {
        const discount = formData.mrp > 0 && formData.sellingPrice > 0
            ? Math.round(((formData.mrp - formData.sellingPrice) / formData.mrp) * 10000) / 100
            : 0;
        setFormData(prev => ({ ...prev, discountPercentage: discount }));
    }, [formData.mrp, formData.sellingPrice]);

    // Load products
    useEffect(() => {
        const saved = localStorage.getItem('adminProducts');
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as (Product | { features?: string | string[] } & Omit<Product, 'features'>)[];
                const converted = parsed.map((p) => ({
                    ...p,
                    features: Array.isArray(p.features) ? p.features : (typeof p.features === 'string' && p.features ? [p.features] : [])
                })) as Product[];
                setProducts(converted);
            } catch (error) {
                console.error('Error loading products:', error);
            }
        }
    }, []);

    // Save products
    useEffect(() => {
        if (products.length > 0) {
            localStorage.setItem('adminProducts', JSON.stringify(products));
        }
    }, [products]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 5) {
            setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
            return;
        }
        setFormData(prev => ({ ...prev, images: files }));
        setErrors(prev => ({ ...prev, images: '' }));
    };

    const validateForm = (isQuickEdit = false): boolean => {
        const newErrors: Record<string, string> = {};

        if (isQuickEdit) {
            if (editData.mrp <= 0) newErrors.mrp = 'MRP must be greater than 0';
            if (editData.sellingPrice <= 0) newErrors.sellingPrice = 'Selling Price must be greater than 0';
            if (editData.sellingPrice > editData.mrp) newErrors.sellingPrice = 'Selling Price cannot be greater than MRP';
            if (editData.stockType === 'number' && typeof editData.stock === 'number' && editData.stock < 0) {
                newErrors.stock = 'Stock cannot be negative';
            }
        } else {
            if (formData.images.length === 0) newErrors.images = 'At least one image is required';
            if (!formData.title.trim()) newErrors.title = 'Title is required';
            if (!formData.description.trim()) newErrors.description = 'Description is required';
            if (formData.mrp <= 0) newErrors.mrp = 'MRP must be greater than 0';
            if (formData.sellingPrice <= 0) newErrors.sellingPrice = 'Selling Price must be greater than 0';
            if (formData.sellingPrice > formData.mrp) newErrors.sellingPrice = 'Selling Price cannot be greater than MRP';
            if (!formData.material.trim()) newErrors.material = 'Material is required';
            if (!formData.dimensions.trim()) newErrors.dimensions = 'Dimensions are required';
            if (formData.stockType === 'number' && typeof formData.stock === 'number' && formData.stock < 0) {
                newErrors.stock = 'Stock cannot be negative';
            }
            if (!formData.category) newErrors.category = 'Category is required';
            if (formData.features.length === 0 || formData.features.every(f => !f.trim())) {
                newErrors.features = 'At least one feature point is required';
            }
            if (!formData.skuId.trim()) newErrors.skuId = 'SKU ID is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (isEditing && editingId) {
            setProducts(prev => prev.map(p => p.id === editingId
                ? { ...p, ...formData, id: editingId, images: formData.images as (File | string)[] }
                : p
            ));
        } else {
            setProducts(prev => [...prev, { ...formData, id: Date.now().toString(), images: formData.images as (File | string)[] }]);
        }
        resetForm();
    };

    const handleQuickEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;

        const newErrors: Record<string, string> = {};
        if (editData.mrp <= 0) newErrors.mrp = 'MRP must be greater than 0';
        if (editData.sellingPrice <= 0) newErrors.sellingPrice = 'Selling Price must be greater than 0';
        if (editData.sellingPrice > editData.mrp) newErrors.sellingPrice = 'Selling Price cannot be greater than MRP';
        if (editData.stockType === 'number' && typeof editData.stock === 'number' && editData.stock < 0) {
            newErrors.stock = 'Stock cannot be negative';
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        const discount = editData.mrp > 0 && editData.sellingPrice > 0
            ? Math.round(((editData.mrp - editData.sellingPrice) / editData.mrp) * 10000) / 100
            : 0;

        setProducts(prev => prev.map(p => p.id === editingId
            ? { ...p, mrp: editData.mrp, sellingPrice: editData.sellingPrice, discountPercentage: discount, stock: editData.stock, stockType: editData.stockType }
            : p
        ));
        resetForm();
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setEditData({ mrp: 0, sellingPrice: 0, stock: 0, stockType: 'number' });
        setErrors({});
        setIsEditing(false);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (product: Product) => {
        setEditData({
            mrp: product.mrp,
            sellingPrice: product.sellingPrice,
            stock: product.stock,
            stockType: product.stockType
        });
        setIsEditing(true);
        setEditingId(product.id);
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    const getImageUrl = (image: File | string): string => {
        return image instanceof File ? URL.createObjectURL(image) : image;
    };

    const updateEditDiscount = (mrp: number, sellingPrice: number) => {
        return mrp > 0 && sellingPrice > 0
            ? Math.round(((mrp - sellingPrice) / mrp) * 10000) / 100
            : 0;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AdminHeader
                    onAddProduct={() => { resetForm(); setShowForm(true); }}
                    onBack={onBack}
                />

                {showForm && isEditing ? (
                    <QuickEditForm
                        mrp={editData.mrp}
                        sellingPrice={editData.sellingPrice}
                        discountPercentage={updateEditDiscount(editData.mrp, editData.sellingPrice)}
                        stock={editData.stock}
                        stockType={editData.stockType}
                        errors={errors}
                        onMrpChange={(val) => setEditData(prev => ({ ...prev, mrp: val }))}
                        onSellingPriceChange={(val) => setEditData(prev => ({ ...prev, sellingPrice: val }))}
                        onStockChange={(val) => setEditData(prev => ({ ...prev, stock: val }))}
                        onStockTypeChange={(type) => setEditData(prev => ({ ...prev, stockType: type, stock: type === 'number' ? 0 : 'in stock' }))}
                        onSubmit={handleQuickEdit}
                        onCancel={resetForm}
                        setErrors={setErrors}
                    />
                ) : showForm ? (
                    <ProductForm
                        formData={formData}
                        errors={errors}
                        isEditing={false}
                        onFormDataChange={setFormData}
                        onImageChange={handleImageChange}
                        onRemoveImage={(idx) => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                        onSubmit={handleSubmit}
                        onCancel={resetForm}
                        getImageUrl={getImageUrl}
                        setErrors={setErrors}
                    />
                ) : null}

                <ProductTable
                    products={products}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    getImageUrl={getImageUrl}
                />
            </div>
        </div>
    );
}
