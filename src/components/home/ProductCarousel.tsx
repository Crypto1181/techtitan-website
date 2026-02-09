import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sampleComponents, PCComponent } from '@/data/pcComponents';
import { useCart } from '@/contexts/CartContext';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

interface ProductCarouselProps {
  title: string;
  products?: PCComponent[];
  showViewAll?: boolean;
  autoplay?: boolean;
  loading?: boolean;
  viewAllLink?: string; // Custom link for "View All" button
}

const ProductCard = ({ product }: { product: PCComponent }) => {
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get all available images (use images array if available, otherwise fallback to single image)
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const currentImage = images[currentImageIndex] || product.image;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleMouseEnter = () => {
    if (images.length > 1) {
      // Show next image on hover
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handleMouseLeave = () => {
    // Reset to first image when mouse leaves
    setCurrentImageIndex(0);
  };

  return (
    <Link to={`/product/${product.id}`} className="block h-full">
      <div 
        className="product-card group h-full cursor-pointer relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white z-10"
      >
        <Heart className="h-4 w-4" />
      </Button>
      <div className="aspect-square flex items-center justify-center mb-3 bg-secondary/30 rounded-md overflow-hidden">
        <img
          src={currentImage}
          alt={product.name}
          className="w-full h-full object-contain transition-opacity duration-300"
        />
      </div>
      <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
      <h3 className="text-xs md:text-sm font-medium line-clamp-2 mb-2 min-h-[32px] md:min-h-[40px]">
        {product.name}
      </h3>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-base md:text-lg font-bold text-foreground">${product.price.toFixed(2)}</span>
        {product.price > 100 && (
          <span className="text-xs text-muted-foreground line-through">
            ${(product.price * 1.2).toFixed(2)}
          </span>
        )}
      </div>
      <p className={`text-xs mb-2 ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
        {product.inStock ? '✓ In Stock' : 'Out of Stock'}
      </p>
      <Button
        size="sm"
        className="w-full bg-accent hover:bg-accent/90 text-white text-xs"
        disabled={!product.inStock}
        onClick={handleAddToCart}
      >
        <ShoppingCart className="h-3 w-3 mr-1" />
        Add to Cart
      </Button>
    </div>
  </Link>
  );
};

const ProductCarousel = ({ 
  title, 
  products = sampleComponents.slice(0, 10), 
  showViewAll = true,
  autoplay = true,
  loading = false,
  viewAllLink = '/products'
}: ProductCarouselProps) => {
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const displayProducts = products.slice(0, 20);
  const row1Products = displayProducts.slice(0, 10);
  const row2Products = displayProducts.slice(10, 20);

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        {showViewAll && (
          <Link to={viewAllLink}>
            <Button variant="link" className="text-primary">
              View All →
            </Button>
          </Link>
        )}
      </div>

      {/* Desktop: 2-row grid (hidden on mobile) */}
      <div className="hidden lg:block">
        {loading ? (
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={`loading-${i}`} className="product-card h-full animate-pulse">
                <div className="aspect-square bg-secondary/30 rounded-md mb-3" />
                <div className="h-4 bg-secondary/30 rounded mb-2" />
                <div className="h-6 bg-secondary/30 rounded mb-2" />
                <div className="h-4 bg-secondary/30 rounded mb-2" />
                <div className="h-8 bg-secondary/30 rounded" />
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No products available
          </div>
        ) : (
          <>
            {/* First Row */}
            <div className="grid grid-cols-5 gap-4">
              {row1Products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {/* Second Row */}
            {row2Products.length > 0 && (
              <div className="grid grid-cols-5 gap-4 mt-4">
                {row2Products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile/Tablet: Carousel (visible on mobile/tablet) */}
      <div className="lg:hidden relative -mx-4 px-4 md:-mx-6 md:px-6">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          plugins={autoplay ? [plugin.current] : []}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-3 pr-8 md:pr-12">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <CarouselItem 
                  key={`loading-${i}`} 
                  className="pl-2 md:pl-3 basis-1/2 md:basis-1/3"
                >
                  <div className="product-card h-full animate-pulse">
                    <div className="aspect-square bg-secondary/30 rounded-md mb-3" />
                    <div className="h-4 bg-secondary/30 rounded mb-2" />
                    <div className="h-6 bg-secondary/30 rounded mb-2" />
                    <div className="h-4 bg-secondary/30 rounded mb-2" />
                    <div className="h-8 bg-secondary/30 rounded" />
                  </div>
                </CarouselItem>
              ))
            ) : displayProducts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No products available
              </div>
            ) : (
              displayProducts.slice(0, 10).map((product) => (
                <CarouselItem 
                  key={product.id} 
                  className="pl-2 md:pl-3 basis-1/2 md:basis-1/3"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          <div className="hidden md:flex items-center justify-center gap-4 mt-4">
            <CarouselPrevious className="static translate-y-0 bg-background/80 hover:bg-background border-primary/20" />
            <CarouselNext className="static translate-y-0 bg-background/80 hover:bg-background border-primary/20" />
          </div>
        </Carousel>
        {/* Gradient fade on right side to indicate more items */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
};

export default ProductCarousel;
