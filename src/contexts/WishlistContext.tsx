import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PCComponent } from '@/data/pcComponents';
import { useToast } from '@/hooks/use-toast';

interface WishlistContextType {
  items: PCComponent[];
  addToWishlist: (product: PCComponent) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: PCComponent) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const [items, setItems] = useState<PCComponent[]>([]);
  const { toast } = useToast();

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('techtitan-wishlist');
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('techtitan-wishlist', JSON.stringify(items));
  }, [items]);

  const addToWishlist = (product: PCComponent) => {
    setItems((prevItems) => {
      if (prevItems.find((item) => item.id === product.id)) {
        return prevItems; // Already in wishlist
      }
      toast({
        title: 'Added to Wishlist',
        description: `${product.name} has been added to your wishlist.`,
      });
      return [...prevItems, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setItems((prevItems) => {
      const item = prevItems.find((item) => item.id === productId);
      const updated = prevItems.filter((item) => item.id !== productId);
      
      if (item) {
        toast({
          title: 'Removed from Wishlist',
          description: `${item.name} has been removed from your wishlist.`,
        });
      }
      
      return updated;
    });
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.id === productId);
  };

  const toggleWishlist = (product: PCComponent) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

