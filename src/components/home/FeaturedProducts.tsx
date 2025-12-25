import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sampleComponents, PCComponent } from '@/data/pcComponents';

interface FeaturedProductsProps {
  title: string;
  products?: PCComponent[];
  showViewAll?: boolean;
}

const FeaturedProducts = ({ title, products = sampleComponents.slice(0, 5), showViewAll = true }: FeaturedProductsProps) => {
  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        {showViewAll && (
          <Button variant="link" className="text-primary">
            View All →
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {products.map((product) => (
          <div key={product.id} className="product-card group">
            {/* Wishlist button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
            >
              <Heart className="h-4 w-4" />
            </Button>

            {/* Product image */}
            <div className="h-32 md:h-40 flex items-center justify-center mb-3 bg-secondary/30 rounded-md overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform"
              />
            </div>

            {/* Brand */}
            <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>

            {/* Product name */}
            <h3 className="text-sm font-medium line-clamp-2 mb-2 min-h-[40px]">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">(24)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-lg font-bold text-foreground">${product.price.toFixed(2)}</span>
              {product.price > 100 && (
                <span className="text-xs text-muted-foreground line-through">
                  ${(product.price * 1.2).toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock status */}
            <p className={`text-xs mb-3 ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
              {product.inStock ? '✓ In Stock' : 'Out of Stock'}
            </p>

            {/* Add to cart */}
            <Button
              size="sm"
              className="w-full bg-accent hover:bg-accent/90 text-white"
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;