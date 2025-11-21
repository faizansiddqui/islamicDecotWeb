import { Truck, Shield, RotateCcw, Headphones } from 'lucide-react';

export default function Features() {
    const features = [
        {
            icon: Truck,
            title: 'Free Shipping',
            description: 'Free delivery on orders above $999',
            color: 'bg-blue-50 text-blue-600'
        },
        {
            icon: Shield,
            title: 'Secure Payment',
            description: '100% secure payment methods',
            color: 'bg-green-50 text-green-600'
        },
        {
            icon: RotateCcw,
            title: '7-Day Returns',
            description: 'Easy return and exchange policy',
            color: 'bg-amber-50 text-amber-600'
        },
        {
            icon: Headphones,
            title: '24/7 Support',
            description: 'Dedicated customer service team',
            color: 'bg-purple-50 text-purple-600'
        }
    ];

    return (
        <div className="bg-gradient-to-br from-gray-50 to-amber-50 py-12 sm:py-16 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group bg-white rounded-xl p-6 text-center sm:hover:shadow-xl sm:transition-all sm:duration-300 sm:transform sm:hover:-translate-y-2 border border-gray-100"
                            >
                                <div className={`inline-flex p-4 rounded-full ${feature.color} mb-4 sm:group-hover:scale-110 sm:transition-transform sm:duration-300`}>
                                    <Icon size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}