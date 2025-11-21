import { Search } from 'lucide-react';
import { Product, getImageUrl } from '../../utils/productUtils';

interface SearchSuggestionsProps {
    suggestions: Product[];
    onSelect: (productId: number) => void;
    searchQuery: string;
}

export default function SearchSuggestions({ suggestions, onSelect, searchQuery }: SearchSuggestionsProps) {
    if (suggestions.length === 0 || !searchQuery.trim()) {
        return null;
    }

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto sm:left-auto sm:right-auto sm:w-full sm:min-w-[400px]">
            <div className="p-3">
                <div className="text-xs text-gray-500 px-3 py-2 font-medium">
                    Suggestions ({suggestions.length})
                </div>
                {suggestions.slice(0, 5).map((product) => {
                    const imageUrl = getImageUrl(product.product_image);
                    return (
                        <button
                            key={product.product_id}
                            onClick={() => onSelect(product.product_id)}
                            className="w-full flex items-center gap-4 px-3 py-3 hover:bg-amber-50 rounded-lg transition-colors text-left"
                        >
                            {imageUrl && (
                                <img
                                    src={imageUrl}
                                    alt={product.name || product.title || 'Product'}
                                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Image';
                                    }}
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {product.name || product.title || 'Product'}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    ${product.selling_price || product.price}
                                    {product.Catagory?.name && ` • ${product.Catagory.name}`}
                                </p>
                            </div>
                            <Search size={16} className="text-gray-400 flex-shrink-0" />
                        </button>
                    );
                })}
                {suggestions.length > 5 && (
                    <div className="text-xs text-gray-500 px-3 py-2 text-center border-t border-gray-200 mt-2">
                        Press Enter to see all {suggestions.length} results
                    </div>
                )}
            </div>
        </div>
    );
}