import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import { PCComponent } from '@/data/pcComponents';
import { useWooCommerceProducts } from '@/hooks/useWooCommerceProducts';
import { useWooCommerceCategories } from '@/hooks/useWooCommerceCategories';
import { categorySlugMap } from '@/data/woocommerce-categories';
import { useCart } from '@/contexts/CartContext';

interface CategorySection {
  title: string;
  category: string;
  wooCommerceSlugs: string[]; // WooCommerce category slugs
  link: string;
}

const categories: CategorySection[] = [
  {
    title: 'Gaming Laptops',
    category: 'gaming-laptops',
    wooCommerceSlugs: ['gaming-laptops'],
    link: '/products?category=gaming-laptops',
  },
  {
    title: 'Graphics Cards',
    category: 'graphic-cards',
    wooCommerceSlugs: ['graphic-cards'],
    link: '/products?category=graphic-cards',
  },
  {
    title: 'Processors',
    category: 'cpu',
    wooCommerceSlugs: ['cpu'],
    link: '/products?category=cpu',
  },
  {
    title: 'Gaming Headsets',
    category: 'headsets',
    wooCommerceSlugs: ['headsets', 'gaming-headsets'],
    link: '/products?category=headsets',
  },
];

const CategoryProductCard = ({ product }: { product: PCComponent }) => {
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
        {/* Wishlist button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white z-10"
        >
          <Heart className="h-4 w-4" />
        </Button>

        {/* Product image */}
        <div className="aspect-square flex items-center justify-center mb-3 bg-secondary/30 rounded-md overflow-hidden">
          <img
            src={currentImage}
            alt={product.name}
            className="w-full h-full object-contain transition-opacity duration-300"
          />
        </div>

        {/* Brand */}
        <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>

        {/* Product name */}
        <h3 className="text-xs md:text-sm font-medium line-clamp-2 mb-2 min-h-[32px] md:min-h-[40px]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-base md:text-lg font-bold text-foreground">
            ${product.price.toFixed(2)}
          </span>
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
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-3 w-3 mr-1" />
          Add to Cart
        </Button>
      </div>
    </Link>
  );
};

const CategoryProducts = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const { addToCart } = useCart();

  // Fetch WooCommerce categories to map slugs to IDs
  const { getCategoryIdBySlug, loading: loadingCategories } = useWooCommerceCategories();

  // Get WooCommerce category IDs for the active category
  const wooCommerceCategoryIds = useMemo(() => {
    // Don't try to get category IDs until categories are loaded
    if (loadingCategories) return undefined;
    
    const activeCat = categories[activeCategory];
    if (!activeCat) return undefined;

    const categoryIds: number[] = [];
    
    for (const slug of activeCat.wooCommerceSlugs) {
      // Try direct slug lookup
      const directSlugs = categorySlugMap[slug] || [slug];
      for (const wcSlug of directSlugs) {
        const id = getCategoryIdBySlug(wcSlug);
        if (id && !categoryIds.includes(id)) {
          categoryIds.push(id);
        }
      }
    }
    
    if (categoryIds.length === 0) {
      console.warn(`No category IDs found for "${activeCat.title}" with slugs:`, activeCat.wooCommerceSlugs);
    } else {
      console.log(`Found ${categoryIds.length} category IDs for "${activeCat.title}":`, categoryIds);
    }
    
    return categoryIds.length > 0 ? categoryIds : undefined;
  }, [activeCategory, getCategoryIdBySlug, loadingCategories]);

  // Fetch products for the active category by WooCommerce category IDs
  // Only fetch if categories are loaded and we have category IDs
  const shouldFetch = !loadingCategories && !!wooCommerceCategoryIds && wooCommerceCategoryIds.length > 0;
  const { products, loading } = useWooCommerceProducts(
    shouldFetch
      ? {
          category: wooCommerceCategoryIds,
          per_page: 8,
          orderby: 'date',
          order: 'desc',
        }
      : {
          per_page: 0, // Signal to skip fetching
        }
  );

  // Show loading state while categories are loading OR products are loading
  const isLoading = loadingCategories || loading;

  return (
    <section className="py-12 bg-gradient-to-b from-background to-secondary/20">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Shop by Category</h2>
          <p className="text-muted-foreground">Explore our top categories</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-8">
          {categories.map((cat, index) => (
            <Button
              key={cat.category}
              variant={activeCategory === index ? 'default' : 'outline'}
              onClick={() => setActiveCategory(index)}
              className={`transition-all ${
                activeCategory === index
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
              }`}
            >
              {cat.title}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-card h-full animate-pulse">
                <div className="aspect-square bg-secondary/30 rounded-md mb-3" />
                <div className="h-4 bg-secondary/30 rounded mb-2" />
                <div className="h-6 bg-secondary/30 rounded mb-2" />
                <div className="h-4 bg-secondary/30 rounded mb-2" />
                <div className="h-8 bg-secondary/30 rounded" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {products.slice(0, 8).map((product) => (
                <CategoryProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-8">
              <Link to={categories[activeCategory].link}>
                <Button variant="outline" size="lg">
                  View All {categories[activeCategory].title} →
                </Button>
              </Link>
            </div>
          </>
        ) : !loadingCategories ? (
          <div className="text-center py-12 text-muted-foreground">
            No products found in this category
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default CategoryProducts;

