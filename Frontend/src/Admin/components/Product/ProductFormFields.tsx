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

interface Category {
    id: number;
    name: string;
}

interface ProductFormFieldsProps {
    productForm: ProductFormData;
    categories: Category[];
    onFormChange: (field: keyof ProductFormData, value: string) => void;
}

export default function ProductFormFields({ productForm, categories, onFormChange }: ProductFormFieldsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => onFormChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={productForm.title}
                    onChange={(e) => onFormChange('title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
              Price($) <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => onFormChange('price', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
        Selling Price($) <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    step="0.01"
                    value={productForm.selling_price}
                    onChange={(e) => onFormChange('selling_price', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    min="0"
                    step="1"
                    value={productForm.quantity}
                    onChange={(e) => onFormChange('quantity', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                    placeholder="0"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU (Stock Keeping Unit)
                </label>
                <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => onFormChange('sku', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                    placeholder="Optional product identifier"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs text-gray-500">(Category will be saved to database if it doesn't exist)</span>
                </label>
                <select
                    value={productForm.catagory}
                    onChange={(e) => {
                        onFormChange('catagory', e.target.value);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                    required
                >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    value={productForm.description}
                    onChange={(e) => onFormChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
                />
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specification (JSON format)
                </label>
                <textarea
                    value={productForm.specification}
                    onChange={(e) => onFormChange('specification', e.target.value)}
                    rows={4}
                    placeholder='{"Material": "Cotton", "Size": "Large"}'
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Enter specifications as JSON object</p>
            </div>
        </div>
    );
}

