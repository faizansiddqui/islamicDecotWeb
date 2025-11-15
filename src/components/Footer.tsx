import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 lg:px-8 py-6 xs:py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6 sm:gap-8 mb-6 xs:mb-8">
          <div className="col-span-1 xs:col-span-2 lg:col-span-1">
            <h3 className="text-white text-sm xs:text-base sm:text-lg lg:text-xl font-bold mb-2 xs:mb-3 sm:mb-4">
              Abdulla Islamic Store
            </h3>
            <p className="text-gray-400 mb-3 xs:mb-4 text-[10px] xs:text-xs sm:text-sm leading-relaxed">
              Bringing spiritual beauty to your home with premium Abdulla Islamic Store and decor.
            </p>
            <div className="flex gap-2 xs:gap-3">
              <button className="p-1.5 xs:p-2 bg-gray-800 hover:bg-amber-700 rounded-full transition-colors">
                <Facebook size={16} className="xs:w-5 xs:h-5" />
              </button>
              <button className="p-1.5 xs:p-2 bg-gray-800 hover:bg-amber-700 rounded-full transition-colors">
                <Instagram size={16} className="xs:w-5 xs:h-5" />
              </button>
              <button className="p-1.5 xs:p-2 bg-gray-800 hover:bg-amber-700 rounded-full transition-colors">
                <Twitter size={16} className="xs:w-5 xs:h-5" />
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2 xs:mb-3 sm:mb-4 text-xs xs:text-sm sm:text-base">Shop</h4>
            <ul className="space-y-1 xs:space-y-1.5 sm:space-y-2">
              <li><a href="#" className="hover:text-amber-400 transition-colors text-[10px] xs:text-xs sm:text-sm">Wall Arts</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors text-[10px] xs:text-xs sm:text-sm">Home Decor</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors text-[10px] xs:text-xs sm:text-sm">Prayer Items</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors text-[10px] xs:text-xs sm:text-sm">Ramadan Decor</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors text-[10px] xs:text-xs sm:text-sm">New Arrivals</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2 xs:mb-3 sm:mb-4 text-xs xs:text-sm sm:text-base">Customer Service</h4>
            <ul className="space-y-1 xs:space-y-1.5 sm:space-y-2">
              <li><a href="#" className="hover:text-amber-400 transition-colors text-[10px] xs:text-xs sm:text-sm">Contact Us</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors text-[10px] xs:text-xs sm:text-sm">Shipping Info</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors text-[10px] xs:text-xs sm:text-sm">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors text-[10px] xs:text-xs sm:text-sm">FAQ</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors text-[10px] xs:text-xs sm:text-sm">Track Order</a></li>
            </ul>
          </div>

          <div className="col-span-1 xs:col-span-2 lg:col-span-1">
            <h4 className="text-white font-semibold mb-2 xs:mb-3 sm:mb-4 text-xs xs:text-sm sm:text-base">Contact Info</h4>
            <ul className="space-y-2 xs:space-y-2.5 sm:space-y-3">
              <li className="flex items-start gap-1.5 xs:gap-2">
                <MapPin size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                <span className="text-[10px] xs:text-xs sm:text-sm">123 Abdulla ART Street, Kanpur, India</span>
              </li>
              <li className="flex items-center gap-1.5 xs:gap-2">
                <Phone size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-[10px] xs:text-xs sm:text-sm">+91 (740) 809-7278</span>
              </li>
              <li className="flex items-center gap-1.5 xs:gap-2">
                <Mail size={14} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-[10px] xs:text-xs sm:text-sm">info@abdullaislamicstore.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4 xs:pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 text-[10px] xs:text-xs sm:text-sm">
            © 2024 Abdulla Islamic Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
