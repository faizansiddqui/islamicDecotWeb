import { ShoppingCart, Search, Menu, X, ChevronDown, User } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  onSearchChange?: (query: string) => void;
}

export default function Navbar({ onSearchChange }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const menuItems = [
    { name: 'New Arrivals', href: '#' },
 
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

            <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3 lg:space-x-4">
              <button
                className="text-gray-700 hover:text-amber-700 transition-colors p-1 xs:p-1.5 sm:p-2"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search size={16} className="xs:w-5 xs:h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </button>
              <button className="hidden xs:block text-gray-700 hover:text-amber-700 transition-colors p-1 xs:p-1.5 sm:p-2">
                <User size={16} className="xs:w-5 xs:h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </button>
              <button className="text-gray-700 hover:text-amber-700 transition-colors relative p-1 xs:p-1.5 sm:p-2">
                <ShoppingCart size={16} className="xs:w-5 xs:h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <span className="absolute top-0 right-0 bg-amber-700 text-white text-[8px] xs:text-[9px] sm:text-xs rounded-full h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  0
                </span>
              </button>

              <div className="hidden md:flex items-center gap-1 lg:gap-2 border-l border-gray-300 pl-2 lg:pl-4">
                <img
                  src="https://flagcdn.com/w40/us.png"
                  alt="EN"
                  className="w-4 h-3 lg:w-6 lg:h-4 object-cover rounded"
                />
                <span className="text-xs lg:text-sm font-medium">EN</span>
                <ChevronDown size={14} className="lg:w-4 lg:h-4 text-gray-500" />
              </div>

              <div className="hidden md:flex items-center gap-1 lg:gap-2 border-l border-gray-300 pl-2 lg:pl-4">
                <span className="text-xs lg:text-sm font-medium">USD</span>
                <ChevronDown size={14} className="lg:w-4 lg:h-4 text-gray-500" />
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

        {isSearchOpen && (
          <div className="bg-gray-50 border-t border-gray-200 py-2 xs:py-3 sm:py-4 animate-fadeIn">
            <div className="max-w-3xl mx-auto px-2 xs:px-3 sm:px-4 lg:px-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Islamic wall art..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-3 xs:px-4 sm:px-6 py-2 xs:py-3 sm:py-4 pr-8 xs:pr-10 sm:pr-12 rounded-lg border-2 border-gray-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-700 focus:ring-opacity-50 outline-none transition-all text-xs xs:text-sm sm:text-base lg:text-lg"
                  autoFocus
                />
                <Search className="absolute right-2 xs:right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
