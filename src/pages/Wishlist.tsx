import { Link, useNavigate } from 'react-router-dom';
import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import BackToTop from '@/components/BackToTop';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

const Wishlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();

  const handleAddToCart = (product: PCComponent) => {
    addToCart(product, 1);
  };

  const handleTabChange = (tab: string) => {
    navigate('/', { state: { activeTab: tab } });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MainHeader
          onMenuClick={() => {}}
          activeTab=""
          onTabChange={handleTabChange}
        />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your wishlist
            </p>
            <Button onClick={() => navigate('/login')} className="bg-accent hover:bg-accent/90 text-white">
              Sign In
            </Button>
          </div>
        </main>
        <Footer onTabChange={handleTabChange} />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MainHeader
          onMenuClick={() => {}}
          activeTab=""
          onTabChange={handleTabChange}
        />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h1>
            <p className="text-muted-foreground mb-6">
              Start adding products to your wishlist to save them for later
            </p>
            <Button onClick={() => navigate('/products')} className="bg-accent hover:bg-accent/90 text-white">
              Browse Products
            </Button>
          </div>
        </main>
        <Footer onTabChange={handleTabChange} />
        <WhatsAppWidget />
        <BackToTop />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainHeader
        onMenuClick={() => {}}
        activeTab=""
        onTabChange={handleTabChange}
      />

      <main className="flex-1">
        <div className="container py-6">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>

          {/* Wishlist Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wishlistItems.map((product) => (
              <div key={product.id} className="product-card group relative">
                {/* Remove from Wishlist Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white z-10"
                  onClick={() => removeFromWishlist(product.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>

                {/* Product Image */}
                <Link to={`/product/${product.id}`} className="block">
                  <div className="h-48 flex items-center justify-center mb-3 bg-secondary/30 rounded-md overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform"
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-sm font-medium line-clamp-2 mb-2 min-h-[40px] hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-lg font-bold text-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>

                  <p className={`text-xs mb-3 ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
                    {product.inStock ? '✓ In Stock' : 'Out of Stock'}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-accent hover:bg-accent/90 text-white text-xs"
                      disabled={!product.inStock}
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer onTabChange={handleTabChange} />
      <WhatsAppWidget />
      <BackToTop />
    </div>
  );
};

export default Wishlist;

