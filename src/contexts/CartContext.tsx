import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PCComponent } from '@/data/pcComponents';
import { useToast } from '@/hooks/use-toast';

export interface CartItem extends PCComponent {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: PCComponent, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('techtitan-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('techtitan-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: PCComponent, quantity: number = 1) => {
    if (!product.inStock) {
      toast({
        title: 'Out of Stock',
        description: 'This product is currently out of stock.',
        variant: 'destructive',
      });
      return;
    }

    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        // Update quantity if item already exists
        const updatedItems = prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        toast({
          title: 'Cart Updated',
          description: `${product.name} quantity updated in cart.`,
        });
        return updatedItems;
      } else {
        // Add new item to cart
        const newItem: CartItem = { ...product, quantity };
        toast({
          title: 'Added to Cart',
          description: `${product.name} has been added to your cart.`,
        });
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => {
      const item = prevItems.find((item) => item.id === productId);
      const updatedItems = prevItems.filter((item) => item.id !== productId);
      
      if (item) {
        toast({
          title: 'Removed from Cart',
          description: `${item.name} has been removed from your cart.`,
        });
      }
      
      return updatedItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: 'Cart Cleared',
      description: 'All items have been removed from your cart.',
    });
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

