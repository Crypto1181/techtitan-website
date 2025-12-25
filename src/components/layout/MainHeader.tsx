import { useState, useEffect } from 'react';
import { Search, User, ShoppingCart, Menu, X, ChevronDown, MapPin, Heart, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import techtitanLogo from '@/assets/techtitan-logo.png';
import { useTheme } from '@/components/ThemeProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MainHeaderProps {
  onMenuClick: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MainHeader = ({ onMenuClick, activeTab, onTabChange }: MainHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

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
            <span>📞 +961 XX XXX XXX</span>
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
            className="lg:hidden text-white hover:bg-white/10"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
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
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="search-bar">
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 text-foreground"
              />
              <button className="bg-accent hover:bg-accent/90 text-white px-4 py-2 transition-colors">
                <Search className="h-5 w-5" />
              </button>
            </div>
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

            {/* Account dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/10 hidden md:flex items-center gap-1">
                  <User className="h-5 w-5" />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs text-white/70">Welcome</p>
                    <p className="text-sm font-medium">Sign In</p>
                  </div>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>Sign In</DropdownMenuItem>
                <DropdownMenuItem>Create Account</DropdownMenuItem>
                <DropdownMenuItem>My Orders</DropdownMenuItem>
                <DropdownMenuItem>Wishlist</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hidden md:flex">
              <Heart className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Button variant="ghost" className="text-white hover:bg-white/10 relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="cart-badge">0</span>
              <span className="hidden lg:inline ml-2">Cart</span>
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 mt-3">
          <div className="search-bar">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 text-foreground"
            />
            <button className="bg-accent hover:bg-accent/90 text-white px-4 py-2">
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
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-foreground hover:bg-secondary"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
              <span className="font-medium">All Categories</span>
            </Button>

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
                onClick={() => onTabChange(item.id)}
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
                onClick={() => onTabChange(item.id)}
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