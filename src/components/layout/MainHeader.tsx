import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, X, ChevronDown, MapPin, Heart, Moon, Sun, LogOut } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import techtitanLogo from '@/assets/new tech 200x 200.png';
import { useTheme } from '@/components/ThemeProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useWooCommerceCategoryTree } from '@/hooks/useWooCommerceCategoryTree';
import { useWooCommerceProducts } from '@/hooks/useWooCommerceProducts';

interface MainHeaderProps {
  onMenuClick: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MainHeader = ({ onMenuClick, activeTab, onTabChange }: MainHeaderProps) => {
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const { categoryTree } = useWooCommerceCategoryTree();
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Fetch products for search autocomplete (limit to 50 for better results)
  const { products: searchProducts, loading: searchLoading } = useWooCommerceProducts({
    per_page: 50,
    search: searchQuery.trim().length >= 2 ? searchQuery.trim() : undefined,
  });
  
  // Filter and rank search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase().trim();
    const queryWords = query.split(/\s+/).filter(w => w.length > 0);
    
      // First filter: Only include products where ALL words match (AND logic)
      // Also handle variations like "II" matching "2", "III" matching "3", etc.
      const productsMatchingAllWords = searchProducts.filter(product => {
        const nameLower = product.name.toLowerCase();
        const brandLower = product.brand.toLowerCase();
        const searchText = `${nameLower} ${brandLower}`;
        
        // Check if ALL query words are found in the product name or brand
        return queryWords.every(word => {
          // Normalize word for matching (handle roman numerals and numbers)
          const normalizedWord = word.toLowerCase().trim();
          
          // Check direct match first
          if (searchText.includes(normalizedWord)) {
            return true;
          }
          
          // Handle roman numeral and number variations
          // "ii" should match "2", "two", "ii", "iii" (if we're lenient)
          // "2" should match "ii", "two", "2"
          const variations: string[] = [normalizedWord];
          
          // Add number variations
          if (normalizedWord === 'ii' || normalizedWord === '2' || normalizedWord === 'two') {
            variations.push('ii', '2', 'two', 'iii', '3', 'three', 'iv', '4', 'four');
          } else if (normalizedWord === 'iii' || normalizedWord === '3' || normalizedWord === 'three') {
            variations.push('ii', '2', 'two', 'iii', '3', 'three', 'iv', '4', 'four');
          } else if (normalizedWord === 'iv' || normalizedWord === '4' || normalizedWord === 'four') {
            variations.push('iii', '3', 'three', 'iv', '4', 'four', 'v', '5', 'five');
          } else if (/^\d+$/.test(normalizedWord)) {
            // If it's a number, also check for roman numerals
            const num = parseInt(normalizedWord, 10);
            if (num === 2) variations.push('ii', 'two');
            if (num === 3) variations.push('iii', 'three');
            if (num === 4) variations.push('iv', 'four');
            if (num === 5) variations.push('v', 'five');
          }
          
          // Check if any variation matches
          return variations.some(variation => searchText.includes(variation));
        });
      });
    
    // Score products based on relevance (only those that match all words)
    const scoredProducts = productsMatchingAllWords.map(product => {
      const nameLower = product.name.toLowerCase();
      const brandLower = product.brand.toLowerCase();
      const searchText = `${nameLower} ${brandLower}`;
      
      let score = 0;
      
      // Exact phrase match (highest priority) - e.g., "cloud 2" should match "Cloud 2" exactly
      const exactPhraseRegex = new RegExp(`\\b${query.replace(/\s+/g, '\\s+')}\\b`, 'i');
      if (exactPhraseRegex.test(nameLower)) {
        score += 2000; // Highest priority for exact phrase match
      }
      
      // Exact match in name (very high priority)
      if (nameLower === query) score += 1500;
      else if (nameLower.startsWith(query)) score += 800;
      else if (nameLower.includes(query)) {
        // Check if it's a word boundary match (better than substring match)
        const wordBoundaryRegex = new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (wordBoundaryRegex.test(nameLower)) {
          score += 400; // Word boundary match is better
        } else {
          score += 200; // Regular substring match
        }
      }
      
      // Brand match
      if (brandLower === query) score += 300;
      else if (brandLower.includes(query)) score += 100;
      
      // Word-by-word matching (for multi-word queries like "cloud 2")
      const nameWords = nameLower.split(/\s+/);
      let wordMatchScore = 0;
      
      queryWords.forEach((word, index) => {
        nameWords.forEach((nameWord, nameIndex) => {
          if (nameWord === word) {
            // Exact word match - higher score if words are in same position
            if (index === nameIndex) wordMatchScore += 200;
            else wordMatchScore += 80;
          } else if (nameWord.startsWith(word)) {
            wordMatchScore += 40;
          } else if (nameWord.includes(word)) {
            wordMatchScore += 15;
          }
        });
      });
      
      score += wordMatchScore * 1.5; // Boost for word matches
      
      // Boost score if query appears early in the name
      const queryIndex = nameLower.indexOf(query);
      if (queryIndex >= 0 && queryIndex < 10) score += 50;
      
      return { product, score };
    });
    
    // Sort by score (descending) and take top 8
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => item.product);
  }, [searchQuery, searchProducts]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim();
    }
    return user?.email?.split('@')[0] || 'User';
  };

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const navItems = [
    { id: 'deals', label: 'Hot Deals', highlight: true },
    { id: 'builder', label: 'PC Builder' },
    { id: 'finder', label: 'PC Finder' },
    { id: 'laptop-finder', label: 'Laptop Finder' },
    { id: 'psu-calc', label: 'PSU Calculator' },
    { id: 'compare', label: 'Compare' },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="info-bar hidden md:block">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>📞 +961 76 653 008</span>
            <span>✉️ info@techtitan.lb</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>🚚 Cash on Delivery Available</span>
            <span>🛡️ Warranty on All Products</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="header-main py-3">
        <div className="container flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-[hsl(var(--header-foreground))] hover:bg-white/10 dark:hover:bg-white/10 relative z-[60] touch-manipulation"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMenuClick();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            type="button"
          >
            <Menu className="h-6 w-6 pointer-events-none text-[hsl(var(--header-foreground))]" />
          </Button>

          {/* Logo */}
          <a href="/" className="flex-shrink-0 flex items-center gap-2">
            <img src={techtitanLogo} alt="TechTitan Logo" className="h-8 w-8 md:h-10 md:w-10 object-contain" />
            <h1 className="text-xl md:text-2xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-accent bg-clip-text text-transparent">
                TechTitan
              </span>
            </h1>
          </a>

          {/* Location selector - Desktop */}
          <div className="hidden lg:flex items-center gap-1 text-white/80 text-sm cursor-pointer hover:text-white">
            <MapPin className="h-4 w-4" />
            <span>Lebanon</span>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl hidden md:block relative" ref={searchRef}>
            <div className="search-bar">
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(e.target.value.trim().length >= 2);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) {
                    setShowSearchDropdown(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setShowSearchDropdown(false);
                    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                  } else if (e.key === 'Escape') {
                    setShowSearchDropdown(false);
                  }
                }}
                className="border-0 focus-visible:ring-0 text-foreground"
              />
              <button 
                type="button"
                onClick={() => {
                  if (searchQuery.trim()) {
                    setShowSearchDropdown(false);
                    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                className="bg-accent hover:bg-accent/90 text-white px-4 py-2 transition-colors cursor-pointer"
                aria-label="Search products"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
            
            {/* Search Dropdown - Outside search-bar to avoid overflow clipping */}
            {showSearchDropdown && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-[100] max-h-[400px] overflow-y-auto">
                <div className="p-2">
                  {searchLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            setSearchQuery('');
                            setShowSearchDropdown(false);
                            navigate(`/products?search=${encodeURIComponent(product.name)}`);
                          }}
                          className="w-full text-left p-3 rounded-lg hover:bg-secondary transition-colors flex items-center gap-3"
                        >
                          {product.image && product.image !== '/placeholder.svg' && !product.image.includes('placeholder') ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-12 h-12 object-contain rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : null}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                          </div>
                          <p className="text-sm font-semibold text-accent">${product.price.toFixed(2)}</p>
                        </button>
                      ))}
                      {searchQuery.trim() && (
                        <button
                          onClick={() => {
                            setShowSearchDropdown(false);
                            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                          }}
                          className="w-full text-center p-2 text-sm text-primary hover:bg-secondary rounded-lg mt-1 border-t border-border pt-2"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No products found. Try a different search term.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Account dropdown - Desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/10 hidden md:flex items-center gap-1">
                  <User className="h-5 w-5" />
                  <div className="hidden lg:block text-left">
                    {user ? (
                      <>
                        <p className="text-xs text-white/70">Welcome</p>
                        <p className="text-sm font-medium">{getUserDisplayName()}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-white/70">Welcome</p>
                        <p className="text-sm font-medium">Sign In</p>
                      </>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user ? (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{getUserDisplayName()}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate('/orders')}
                      className="cursor-pointer"
                    >
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/wishlist')}
                      className="cursor-pointer"
                    >
                      Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/account')}
                      className="cursor-pointer"
                    >
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem 
                      onClick={() => navigate('/login')}
                      className="cursor-pointer"
                    >
                      Sign In
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/signup')}
                      className="cursor-pointer"
                    >
                      Create Account
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/orders')}
                      className="cursor-pointer"
                    >
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/wishlist')}
                      className="cursor-pointer"
                    >
                      Wishlist
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Account dropdown - Mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 md:hidden">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user ? (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{getUserDisplayName()}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate('/orders')}
                      className="cursor-pointer"
                    >
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/wishlist')}
                      className="cursor-pointer"
                    >
                      Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/account')}
                      className="cursor-pointer"
                    >
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem 
                      onClick={() => navigate('/login')}
                      className="cursor-pointer"
                    >
                      Sign In
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/signup')}
                      className="cursor-pointer"
                    >
                      Create Account
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/orders')}
                      className="cursor-pointer"
                    >
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/wishlist')}
                      className="cursor-pointer"
                    >
                      Wishlist
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wishlist */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10 hidden md:flex"
              onClick={() => navigate('/wishlist')}
              title="View Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10 relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="cart-badge">{getTotalItems()}</span>
              )}
              <span className="hidden lg:inline ml-2">Cart</span>
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 mt-3">
          <div className="search-bar relative">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="border-0 focus-visible:ring-0 text-foreground"
            />
            <button 
              type="button"
              onClick={() => {
                if (searchQuery.trim()) {
                  navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="bg-accent hover:bg-accent/90 text-white px-4 py-2 cursor-pointer"
              aria-label="Search products"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="bg-card border-b border-border">
        <div className="container">
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 py-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-foreground hover:bg-secondary"
                >
                  <Menu className="h-5 w-5" />
                  <span className="font-medium">All Categories</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 max-h-[600px] overflow-y-auto">
                {categoryTree.map((category) => {
                  const Icon = category.icon;
                  const hasChildren = category.children && category.children.length > 0;
                  
                  return hasChildren ? (
                    <DropdownMenuSub key={category.id}>
                      <DropdownMenuSubTrigger>
                        <Icon className="h-4 w-4 mr-2" />
                        {category.name}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {category.children!.map((subcat) => (
                          <DropdownMenuItem
                            key={subcat.slug}
                            onClick={() => {
                              navigate(`/products?category=${encodeURIComponent(subcat.slug)}`);
                            }}
                          >
                            {subcat.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ) : (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() => {
                        navigate(`/products?category=${encodeURIComponent(category.slug)}`);
                      }}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.name}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-6 w-px bg-border mx-2" />

            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`text-sm ${
                  item.highlight 
                    ? 'text-accent font-semibold hover:text-accent' 
                    : activeTab === item.id 
                      ? 'text-primary font-semibold' 
                      : 'text-foreground'
                }`}
                onClick={() => {
                  if ((item as any).route) {
                    navigate((item as any).route);
                  } else {
                    onTabChange(item.id);
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* Mobile nav */}
          <div className="md:hidden flex items-center gap-2 py-2 overflow-x-auto scrollbar-thin">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`text-xs whitespace-nowrap ${
                  item.highlight 
                    ? 'text-accent font-semibold' 
                    : activeTab === item.id 
                      ? 'text-primary font-semibold' 
                      : 'text-foreground'
                }`}
                onClick={() => {
                  if ((item as any).route) {
                    navigate((item as any).route);
                  } else {
                    onTabChange(item.id);
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default MainHeader;