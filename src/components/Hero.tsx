import { Star } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('https://i.pinimg.com/736x/5c/8e/f2/5c8ef2a8f8e8f8c8f8c8f8c8f8c8f8.jpg')] bg-cover bg-center"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 py-6 xs:py-8 sm:py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6 sm:gap-8 lg:gap-12 items-center">
          <div className="space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6 animate-fadeIn z-10">
            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="currentColor" />
              ))}
            </div>

            <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-gray-300 leading-snug">
              Over 70,000 Homes Adorned Islamic Home Decor
            </p>

            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              Functional
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                Islamic Home Decor
              </span>
            </h1>

            <p className="text-sm xs:text-base sm:text-lg lg:text-xl text-gray-300">
              Explore our Islamic Candleholder Section
            </p>

            <button className="w-full sm:w-auto bg-white text-gray-900 px-4 xs:px-6 sm:px-8 lg:px-10 py-2 xs:py-3 sm:py-3.5 lg:py-4 rounded-none text-xs xs:text-sm sm:text-base lg:text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl uppercase tracking-wide">
              SHOP CANDLEHOLDER
            </button>

            <div className="pt-2 xs:pt-3 sm:pt-4 lg:pt-6 text-xs xs:text-sm sm:text-base text-gray-300">
              Free Shipping over $50 • 30-Day Returns
            </div>
          </div>

          <div className="relative animate-slideIn order-first lg:order-last">
            <div className="relative">
              <img
                src="https://i.pinimg.com/736x/5c/8e/f2/5c8ef2a8f8e8f8c8f8c8f8c8f8c8f8.jpg"
                alt="Islamic Candleholder"
                className="w-full h-auto rounded-lg shadow-2xl"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
