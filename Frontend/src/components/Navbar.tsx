import { ShoppingCart, Search, Menu, X, ChevronDown, User, Package, Heart, Settings, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface NavbarProps {
  onSearchChange?: (query: string) => void;
}

export default function Navbar({ onSearchChange }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const menuItems = [
    {
      name: 'Home Decor & Prayer',
      hasDropdown: true,
      items: ['Prayer Mats', 'Candleholders', 'Bookends', 'Tabletop Decor']
    },
    {
      name: 'Ramadan Decor',
      hasDropdown: true,
      items: ['Ramadan Lanterns', 'Moon & Star Decor', 'Ramadan Calendars']
    },

  ];

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="bg-gray-900 text-white py-1 xs:py-1.5 sm:py-2 text-center text-[8px] xs:text-[9px] sm:text-xs lg:text-sm">
          Free Shipping Over $50 • 30-Day Returns
        </div>

        <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 xs:h-14 sm:h-16 lg:h-20">
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex-1 flex justify-center lg:justify-start">
              <a href="/" className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 hover:text-amber-700 transition-colors truncate px-2">
                Abdulla Islamic Store
              </a>
            </div>

            <div className="hidden sm:flex flex-1 max-w-md mx-2 xs:mx-3 sm:mx-4 lg:mx-6">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search Islamic wall art..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-3 xs:px-4 sm:px-4 py-1.5 xs:py-2 sm:py-2 pr-8 xs:pr-9 sm:pr-10 rounded-lg border border-gray-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 focus:ring-opacity-50 outline-none transition-all text-xs xs:text-sm sm:text-sm"
                />
                <Search className="absolute right-2 xs:right-3 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="px-4 py-2 text-gray-700 hover:text-amber-700 transition-colors font-medium flex items-center gap-1">
                    {item.name}
                    {item.hasDropdown && <ChevronDown size={16} />}
                  </button>

                  {item.hasDropdown && activeDropdown === item.name && (
                    <div className="absolute top-full left-0 bg-white shadow-xl rounded-lg mt-2 py-2 w-56 animate-fadeIn">
                      {item.items?.map((subItem) => (
                        <a
                          key={subItem}
                          href="#"
                          className="block px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                        >
                          {subItem}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-3 xs:space-x-4 sm:space-x-5 lg:space-x-6">
              <button className="text-gray-700 hover:text-gray-900 transition-colors relative flex items-center gap-2 px-2 py-1">
                <ShoppingCart size={20} className="xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
                <span className="text-sm xs:text-base sm:text-base font-medium">Cart</span>
                <span className="absolute -top-1 -right-1 bg-amber-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                3
                </span>
              </button>
              <div className="hidden xs:block relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <div className="bg-amber-50 border-2 border-amber-700 rounded-full p-1.5 xs:p-2">
                    <User size={16} className="xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-amber-700" />
                  </div>
                  <ChevronDown size={16} className={`xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-gray-600 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white shadow-xl rounded-lg py-2 w-48 z-50 border border-gray-200">
                    <a
                      href="#"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <User size={16} />
                      Profile
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Package size={16} />
                      My Orders
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Heart size={16} />
                      Wishlist
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Settings size={16} />
                      Setting
                    </a>
                    <div className="border-t border-gray-200 my-1"></div>
                    <a
                      href="#"
                      className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-sm"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isMenuOpen && (
            <div className="lg:hidden pb-4 space-y-2 border-t border-gray-200 pt-4">
              {menuItems.map((item) => (
                <div key={item.name}>
                  <button className="block w-full text-left py-2 text-gray-700 hover:text-amber-700 hover:bg-amber-50 px-2 rounded transition-colors font-medium">
                    {item.name}
                  </button>
                  {item.hasDropdown && (
                    <div className="pl-4 space-y-1">
                      {item.items?.map((subItem) => (
                        <a
                          key={subItem}
                          href="#"
                          className="block py-2 text-sm text-gray-600 hover:text-amber-700 px-2"
                        >
                          {subItem}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </nav>
    </>
  );
}
