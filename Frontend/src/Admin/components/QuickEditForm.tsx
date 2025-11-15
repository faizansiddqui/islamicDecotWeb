import { X, DollarSign, AlertCircle, Save } from 'lucide-react';

interface QuickEditFormProps {
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  stock: number | 'in stock' | 'out of stock';
  stockType: 'number' | 'dropdown';
  errors: Record<string, string>;
  onMrpChange: (value: number) => void;
  onSellingPriceChange: (value: number) => void;
  onStockChange: (value: number | 'in stock' | 'out of stock') => void;
  onStockTypeChange: (type: 'number' | 'dropdown') => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function QuickEditForm({
  mrp,
  sellingPrice,
  discountPercentage,
  stock,
  stockType,
  errors,
  onMrpChange,
  onSellingPriceChange,
  onStockChange,
  onStockTypeChange,
  onSubmit,
  onCancel,
  setErrors
}: QuickEditFormProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Quick Edit</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
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
              value={mrp || ''}
              onChange={(e) => {
                onMrpChange(parseFloat(e.target.value) || 0);
                if (errors.mrp) setErrors(prev => ({ ...prev, mrp: '' }));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
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
              value={sellingPrice || ''}
              onChange={(e) => {
                onSellingPriceChange(parseFloat(e.target.value) || 0);
                if (errors.sellingPrice) setErrors(prev => ({ ...prev, sellingPrice: '' }));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
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
              Discount (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={discountPercentage}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
            <p className="mt-1 text-xs text-gray-500">Auto-calculated</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Type</label>
            <select
              value={stockType}
              onChange={(e) => {
                const type = e.target.value as 'number' | 'dropdown';
                onStockTypeChange(type);
                onStockChange(type === 'number' ? 0 : 'in stock');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
            >
              <option value="number">Number</option>
              <option value="dropdown">In Stock / Out of Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock {stockType === 'number' ? '(Quantity) *' : '*'}
            </label>
            {stockType === 'number' ? (
              <input
                type="number"
                min="0"
                value={typeof stock === 'number' ? stock : ''}
                onChange={(e) => {
                  onStockChange(parseInt(e.target.value) || 0);
                  if (errors.stock) setErrors(prev => ({ ...prev, stock: '' }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none"
              />
            ) : (
              <select
                value={stock as string}
                onChange={(e) => onStockChange(e.target.value as 'in stock' | 'out of stock')}
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
            Update
          </button>
        </div>
      </form>
    </div>
  );
}

