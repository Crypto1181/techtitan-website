import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainHeader from '@/components/layout/MainHeader';
import CategorySidebar from '@/components/layout/CategorySidebar';
import Footer from '@/components/layout/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import BackToTop from '@/components/BackToTop';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    navigate('/', { state: { activeTab: tab } });
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MainHeader
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          activeTab=""
          onTabChange={handleTabChange}
        />
        <div className="flex-1 flex">
          <CategorySidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onCategorySelect={(categoryId) => {
              navigate(`/products?category=${encodeURIComponent(categoryId)}`);
              setSidebarOpen(false);
            }}
          />
          <main className="flex-1 min-w-0 flex items-center justify-center py-12 px-4">
            <div className="text-center max-w-md">
              <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Button onClick={() => navigate('/products')} className="bg-accent hover:bg-accent/90 text-white">
                Continue Shopping
              </Button>
            </div>
          </main>
        </div>
        <Footer onTabChange={handleTabChange} />
        <WhatsAppWidget />
        <BackToTop />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        activeTab=""
        onTabChange={handleTabChange}
      />
      <div className="flex-1 flex">
        <CategorySidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onCategorySelect={(categoryId) => {
            navigate(`/products?category=${encodeURIComponent(categoryId)}`);
            setSidebarOpen(false);
          }}
        />

        <main className="flex-1 min-w-0">
          <div className="container py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Shopping Cart</h1>
              <p className="text-muted-foreground">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-lg p-4 md:p-6"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Product Image */}
                    <Link
                      to={`/product/${item.id}`}
                      className="flex-shrink-0 w-full md:w-32 h-32 flex items-center justify-center bg-secondary/30 rounded-md overflow-hidden"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain p-2"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <Link to={`/product/${item.id}`}>
                          <h3 className="text-lg font-medium mb-1 hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-2">{item.brand}</p>
                        <p className="text-xl font-bold text-primary">
                          ${item.price.toFixed(2)}
                        </p>
                        {!item.inStock && (
                          <p className="text-sm text-destructive mt-1">Out of Stock</p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={!item.inStock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="mt-4 pt-4 border-t border-border flex justify-end">
                    <p className="text-sm text-muted-foreground">
                      Subtotal: <span className="font-bold text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ${getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-accent hover:bg-accent/90 text-white"
                    size="lg"
                    onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/products')}
                  >
                    Continue Shopping
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-muted/50 rounded border border-border">
                  <p className="text-xs text-muted-foreground">
                    <strong>Shipping Note:</strong> Standard shipping is $3 for small items. 
                    Large-volume items (gaming chairs, desks, etc.) are not included in the flat rate. 
                    Please contact us at checkout for a shipping quote based on your location.
                  </p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </main>
      </div>

      <Footer onTabChange={handleTabChange} />
      <WhatsAppWidget />
      <BackToTop />
    </div>
  );
};

export default Cart;

