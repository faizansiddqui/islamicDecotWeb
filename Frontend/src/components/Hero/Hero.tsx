import { Star, ArrowRight, Sparkles } from 'lucide-react';
import { navigateTo } from '../../utils/navigation';

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-amber-50 via-white to-amber-50 text-gray-900 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-700 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fadeIn z-10 text-center lg:text-left">
            {/* Rating Badge */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-amber-600">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="sm:w-5 sm:h-5 fill-current" />
                ))}
              </div>
              <span className="text-sm sm:text-base font-medium">Trusted by 70,000+ Customers</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-2 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                Premium
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800">
                  Islamic Home Decor
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-2xl">
                Transform your home with our exquisite collection of authentic Islamic art and decor
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm sm:text-base text-gray-700">
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-700" size={20} />
                <span>Handcrafted Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-700" size={20} />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="text-amber-700" size={20} />
                <span>30-Day Returns</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <button
                onClick={() => navigateTo('/categories')}
                className="group w-full sm:w-auto bg-amber-700 hover:bg-amber-800 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-lg text-sm sm:text-base lg:text-lg font-semibold transition-all sm:transform sm:hover:scale-105 shadow-lg sm:hover:shadow-xl flex items-center justify-center gap-2"
              >
                Shop Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  const bestSellersSection = document.querySelector('[data-section="bestsellers"]');
                  bestSellersSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-amber-700 border-2 border-amber-700 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-lg text-sm sm:text-base lg:text-lg font-semibold transition-all sm:transform sm:hover:scale-105 shadow-md"
              >
                View Best Sellers
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-4 sm:pt-6 text-xs sm:text-sm text-gray-600 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Free Shipping over $500
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                30-Day Returns
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Secure Payment
              </span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative order-first lg:order-last">
            <div className="relative aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200"></div>
              <img
                src="/hero4.png"
                alt="Islamic Home Decor"
                className="relative w-full h-full object-contain sm:object-cover"
                loading="eager"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-amber-700/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-4 w-32 h-32 bg-amber-600/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}