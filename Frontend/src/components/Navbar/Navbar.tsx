import { ShoppingCart, Search, Menu, X, ChevronDown, User, Package, Settings, LogOut, LogIn } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { navigateTo } from '../../utils/navigation';
import { productAPI } from '../../services/api';
import SearchSuggestions from '../Search/SearchSuggestions';
import { Product } from '../../utils/productUtils';

interface NavbarProps {
  onSearchChange?: (query: string) => void;
}

export default function Navbar({ onSearchChange }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const expandedSearchRef = useRef<HTMLDivElement>(null);
  const { getTotalItems, saveCartToLocalStorage } = useCart();
  const { isAuthenticated, logout } = useAuth();

  // Load all products for suggestions
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const response = await productAPI.getProducts();
        if (response.data.status && Array.isArray(response.data.products)) {
          setAllProducts(response.data.products);
        }
      } catch (error) {
        console.error('Error loading products for suggestions:', error);
      }
    };
    loadAllProducts();
  }, []);

  // Get filtered suggestions based on search query
  const getFilteredSuggestions = () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      return [];
    }
    const query = searchQuery.toLowerCase();
    return allProducts.filter((product) => {
      const name = (product.name || product.title || '').toLowerCase();
      const category = product.Catagory?.name?.toLowerCase() || '';
      return name.includes(query) || category.includes(query);
    }).slice(0, 5);
  };

  const handleCartClick = () => {
    navigateTo('/cart');
  };

  const handleLogout = () => {
    // Save cart to localStorage before logout
    saveCartToLocalStorage();
    logout();
    setIsProfileDropdownOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      // Navigate to search page instead of categories page
      navigateTo(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleSuggestionSelect = (productId: number) => {
    setShowSuggestions(false);
    // Navigate to product details page
    navigateTo(`/product/${productId}`);
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

  // Close mobile menu when route changes
  useEffect(() => {
    const handleHashChange = () => {
      setIsMenuOpen(false);
      setShowSuggestions(false);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  const handleCategoryClick = () => {
    navigateTo('/categories');
  };

  const handleSearchFocus = () => {
    setIsSearchExpanded(true);
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => {
      setIsSearchExpanded(false);
      setShowSuggestions(false);
    }, 150);
  };

  // Close expanded search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedSearchRef.current && !expandedSearchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
        setShowSuggestions(false);
      }
    };

    if (isSearchExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchExpanded]);

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

            <div className="flex-1 flex justify-center lg:justify-start min-w-0">
              <a href="/" className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 hover:text-amber-700 transition-colors truncate px-2">
                Abdulla Islamic Store
              </a>
            </div>

            {/* Search - Always visible, responsive size */}
            <div
              className={`flex flex-1 max-w-md mx-2 xs:mx-3 sm:mx-4 lg:mx-6 ${isSearchExpanded ? 'hidden' : 'block'}`}
              ref={searchContainerRef}
            >
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Islamic wall art..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={handleSearchFocus}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchSubmit(e);
                      }
                    }}
                    className="w-full px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 pr-7 xs:pr-8 sm:pr-10 rounded-lg border border-gray-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 focus:ring-opacity-50 outline-none transition-all text-[10px] xs:text-xs sm:text-sm"
                  />
                  <button type="submit" className="absolute right-1.5 xs:right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-700 transition-colors">
                    <Search size={14} />
                  </button>
                </div>
              </form>
            </div>
            <div className="hidden lg:flex items-center space-x-1">
              <button
                onClick={handleCategoryClick}
                className="px-4 py-2 text-gray-700 hover:text-amber-700 transition-colors font-medium"
              >
                Category
              </button>
            </div>

            <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4 lg:space-x-6">
              <button
                onClick={handleCartClick}
                className="text-gray-700 hover:text-gray-900 transition-colors relative flex items-center gap-1 xs:gap-2 px-1 xs:px-2 py-1"
              >
                <ShoppingCart size={18} className="xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
                <span className="hidden xs:inline text-sm xs:text-base sm:text-base font-medium">Cart</span>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-700 text-white text-[10px] xs:text-xs rounded-full h-4 w-4 xs:h-5 xs:w-5 flex items-center justify-center font-semibold">
                    {getTotalItems()}
                  </span>
                )}
              </button>
              {/* Profile - Hidden on mobile */}
              <div className="hidden sm:block relative" ref={profileDropdownRef}>
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
                  <div className="absolute right-0 top-full mt-2 bg-white shadow-xl rounded-lg py-2 w-48 xs:w-52 sm:w-56 z-50 border border-gray-200">
                    {isAuthenticated ? (
                      <>
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            navigateTo('/profile');
                          }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm"
                        >
                          <User size={16} />
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            navigateTo('/orders');
                          }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm"
                        >
                          <Package size={16} />
                          My Orders
                        </button>

                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            navigateTo('/wishlist');
                          }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          My Wishlist
                        </button>

                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            navigateTo('/settings');
                          }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm"
                        >
                          <Settings size={16} />
                          Settings
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-sm"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          navigateTo('/log');
                        }}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm"
                      >
                        <LogIn size={16} />
                        Sign In
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden pb-4 space-y-2 border-t border-gray-200 pt-4">

              <button
                onClick={() => {
                  handleCategoryClick();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-gray-700 hover:text-amber-700 hover:bg-amber-50 px-2 rounded transition-colors font-medium"
              >
                Category
              </button>

              {/* Mobile Profile Menu */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigateTo('/profile');
                      }}
                      className="block w-full text-left py-2 text-gray-700 hover:text-amber-700 hover:bg-amber-50 px-2 rounded transition-colors font-medium flex items-center gap-2"
                    >
                      <User size={18} />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigateTo('/orders');
                      }}
                      className="block w-full text-left py-2 text-gray-700 hover:text-amber-700 hover:bg-amber-50 px-2 rounded transition-colors font-medium flex items-center gap-2"
                    >
                      <Package size={18} />
                      My Orders
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigateTo('/wishlist');
                      }}
                      className="block w-full text-left py-2 text-gray-700 hover:text-amber-700 hover:bg-amber-50 px-2 rounded transition-colors font-medium flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      My Wishlist
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigateTo('/settings');
                      }}
                      className="block w-full text-left py-2 text-gray-700 hover:text-amber-700 hover:bg-amber-50 px-2 rounded transition-colors font-medium flex items-center gap-2"
                    >
                      <Settings size={18} />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 text-red-600 hover:bg-red-50 hover:text-red-700 px-2 rounded transition-colors font-medium flex items-center gap-2"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigateTo('/log');
                    }}
                    className="block w-full text-left py-2 text-gray-700 hover:text-amber-700 hover:bg-amber-50 px-2 rounded transition-colors font-medium flex items-center gap-2"
                  >
                    <LogIn size={18} />
                    Sign In
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </nav>

      {/* Expanded Search Bar - Full width below navbar */}
      {isSearchExpanded && (
        <div
          ref={expandedSearchRef}
          className="bg-white shadow-lg border-t border-gray-200 z-40 w-full"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Islamic wall art..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onBlur={handleSearchBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(e);
                    }
                  }}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-700 focus:ring-opacity-50 outline-none text-base"
                  autoFocus
                />
                <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-700 transition-colors">
                  <Search size={20} />
                </button>
              </div>
              {showSuggestions && (
                <div className="relative">
                  <SearchSuggestions
                    suggestions={getFilteredSuggestions()}
                    onSelect={(productId) => {
                      handleSuggestionSelect(productId);
                      setIsSearchExpanded(false);
                      setShowSuggestions(false);
                    }}
                    searchQuery={searchQuery}
                  />
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
