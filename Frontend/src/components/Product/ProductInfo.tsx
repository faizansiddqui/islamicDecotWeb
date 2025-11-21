import { Star, Check } from 'lucide-react';

interface ProductSpecification {
    specification_id?: number;
    key?: string;
    value?: string;
}

interface ProductInfoProps {
    name: string;
    title?: string;
    description?: string;
    price: number;
    sellingPrice: number;
    specifications?: ProductSpecification[];
    quantity: number;
}

export default function ProductInfo({
    name,
    title,
    description,
    price,
    sellingPrice,
    specifications,
    quantity
}: ProductInfoProps) {
    return (
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
                    {name || title || 'Product'}
                </h1>
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                className="sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-yellow-400 fill-current"
                            />
                        ))}
                    </div>
                    <span className="text-sm sm:text-base text-gray-600">(Reviews)</span>
                </div>
                {description && (
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
                        {description}
                    </p>
                )}
            </div>

            <div className="border-t border-b border-gray-200 py-4 sm:py-5 lg:py-6">
                <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 lg:gap-4">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-700">
                        ${sellingPrice || price}
                    </span>
                    {price > sellingPrice && (
                        <>
                            <span className="text-base sm:text-lg lg:text-xl text-gray-500 line-through">
                                ${price}
                            </span>
                            <span className="bg-red-100 text-red-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
                                Save {Math.round((1 - sellingPrice / price) * 100)}%
                            </span>
                        </>
                    )}
                </div>
                <p className="text-sm sm:text-base text-amber-600 font-medium mt-2">
                    Free Shipping Over $500
                </p>
            </div>

            {(() => {
                const specs = specifications || [];

                if (specs.length > 0) {
                    return (
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Specifications</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                    {specs.map((spec, index) => (
                                        <div key={index} className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                                            <span className="text-xs sm:text-sm text-gray-600 block mb-1">{spec.key || 'Specification'}</span>
                                            <p className="text-sm sm:text-base font-semibold">{spec.value || 'N/A'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                }
                return null;
            })()}

            <div className={`${quantity > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'} rounded-lg p-3 sm:p-4`}>
                <div className={`flex items-center gap-2 ${quantity > 0 ? 'text-green-800' : 'text-red-800'}`}>
                    <Check size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base font-semibold">
                        {quantity > 0
                            ? `In Stock - Ships within 2-3 business days`
                            : 'Out of Stock'
                        }
                    </span>
                </div>
            </div>
        </div>
    );
}

