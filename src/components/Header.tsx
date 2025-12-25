import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Cpu, Search, ShoppingCart, User } from 'lucide-react';

interface HeaderProps {
  activeTab: 'builder' | 'finder' | 'compare';
  onTabChange: (tab: 'builder' | 'finder' | 'compare') => void;
}

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Cpu className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-wide bg-gradient-to-r from-blue-400 via-blue-500 to-accent bg-clip-text text-transparent">
                TechTitan
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                PC Builder
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={activeTab === 'builder' ? 'default' : 'ghost'}
              onClick={() => onTabChange('builder')}
              className="font-display"
            >
              Build Your PC
            </Button>
            <Button
              variant={activeTab === 'finder' ? 'default' : 'ghost'}
              onClick={() => onTabChange('finder')}
              className="font-display"
            >
              PC Finder
            </Button>
            <Button
              variant={activeTab === 'compare' ? 'default' : 'ghost'}
              onClick={() => onTabChange('compare')}
              className="font-display"
            >
              Compare
            </Button>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="glow" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                0
              </span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <nav className="flex flex-col gap-2">
              <Button
                variant={activeTab === 'builder' ? 'default' : 'ghost'}
                onClick={() => { onTabChange('builder'); setMobileMenuOpen(false); }}
                className="justify-start font-display"
              >
                Build Your PC
              </Button>
              <Button
                variant={activeTab === 'finder' ? 'default' : 'ghost'}
                onClick={() => { onTabChange('finder'); setMobileMenuOpen(false); }}
                className="justify-start font-display"
              >
                PC Finder
              </Button>
              <Button
                variant={activeTab === 'compare' ? 'default' : 'ghost'}
                onClick={() => { onTabChange('compare'); setMobileMenuOpen(false); }}
                className="justify-start font-display"
              >
                Compare
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
