import { Star, ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sampleComponents, PCComponent } from '@/data/pcComponents';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';

interface ProductCarouselProps {
  title: string;
  products?: PCComponent[];
  showViewAll?: boolean;
  autoplay?: boolean;
}

const ProductCarousel = ({ 
  title, 
  products = sampleComponents.slice(0, 10), 
  showViewAll = true,
  autoplay = true 
}: ProductCarouselProps) => {
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

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

      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={autoplay ? [plugin.current] : []}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-3">
          {products.map((product) => (
            <CarouselItem 
              key={product.id} 
              className="pl-2 md:pl-3 basis-1/2 md:basis-1/3 lg:basis-1/5"
            >
              <div className="product-card group h-full">
                {/* Wishlist button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white z-10"
                >
                  <Heart className="h-4 w-4" />
                </Button>

                {/* Product image */}
                <div className="h-28 md:h-36 flex items-center justify-center mb-3 bg-secondary/30 rounded-md overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Brand */}
                <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>

                {/* Product name */}
                <h3 className="text-xs md:text-sm font-medium line-clamp-2 mb-2 min-h-[32px] md:min-h-[40px]">
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
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-base md:text-lg font-bold text-foreground">${product.price.toFixed(2)}</span>
                  {product.price > 100 && (
                    <span className="text-xs text-muted-foreground line-through">
                      ${(product.price * 1.2).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Stock status */}
                <p className={`text-xs mb-2 ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
                  {product.inStock ? '✓ In Stock' : 'Out of Stock'}
                </p>

                {/* Add to cart */}
                <Button
                  size="sm"
                  className="w-full bg-accent hover:bg-accent/90 text-white text-xs"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:flex items-center justify-center gap-4 mt-4">
          <CarouselPrevious className="static translate-y-0 bg-background/80 hover:bg-background border-primary/20" />
          <CarouselNext className="static translate-y-0 bg-background/80 hover:bg-background border-primary/20" />
        </div>
      </Carousel>
    </section>
  );
};

export default ProductCarousel;
