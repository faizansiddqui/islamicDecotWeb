import { Plus } from 'lucide-react';

interface AdminHeaderProps {
  onAddProduct: () => void;
  onBack?: () => void;
}

export default function AdminHeader({ onAddProduct, onBack }: AdminHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage your products and inventory</p>
        </div>
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Store
            </button>
          )}
          <button
            onClick={onAddProduct}
            className="flex items-center gap-2 bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition-colors shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Add New Product
          </button>
        </div>
      </div>
    </div>
  );
}

