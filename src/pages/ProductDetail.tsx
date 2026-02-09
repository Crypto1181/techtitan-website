import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainHeader from '@/components/layout/MainHeader';
import CategorySidebar from '@/components/layout/CategorySidebar';
import Footer from '@/components/layout/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import BackToTop from '@/components/BackToTop';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, ArrowLeft, Check, X, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useWooCommerceProducts } from '@/hooks/useWooCommerceProducts';
import { PCComponent } from '@/data/pcComponents';
import { fetchProductById } from '@/services/backendApi';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<PCComponent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('Product ID is required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Try to fetch from WooCommerce API
        const wooCommerceId = id.startsWith('csv-') ? id.replace('csv-', '') : id;
        const wcProduct = await fetchProductById(parseInt(wooCommerceId, 10));
        
        if (wcProduct) {
          // Map WooCommerce product to PCComponent
          const allImages = wcProduct.images.map(img => img.src || img.thumbnail).filter(Boolean);
          const mappedProduct: PCComponent = {
            id: wcProduct.id.toString(),
            name: wcProduct.name,
            brand: wcProduct.categories[0]?.name || 'Unknown',
            category: 'cpu', // Will be mapped properly
            price: parseFloat(wcProduct.price || wcProduct.regular_price || '0'),
            image: wcProduct.images[0]?.src || '/placeholder.svg',
            images: allImages.length > 0 ? allImages : undefined,
            specs: {},
            inStock: wcProduct.stock_status === 'instock',
            compatibility: {},
          };

          // Admin/technical fields to exclude
          const adminFields = [
            '_wp_', '_wc_', '_jetpack_', '_yoast_', '_elementor_',
            'page_template', 'product_group_id', 'facebook_commerce',
            'hide', 'hidden', 'admin', 'editor', 'template',
            'wp_page_template', 'wcsob_hide', 'jetpack_editor',
            'facebook_commerce_fields', 'product_group'
          ];

          // Extract specs from meta_data, filtering admin fields
          wcProduct.meta_data.forEach((meta: any) => {
            if (meta.key && meta.value) {
              const key = String(meta.key).toLowerCase();
              // Skip admin/technical fields
              if (!adminFields.some(field => key.includes(field.toLowerCase()))) {
                // Skip HTML-only fields that aren't useful specs
                const value = String(meta.value);
                if (value && !value.startsWith('<') && value.length < 500) {
                  mappedProduct.specs[meta.key] = value;
                }
              }
            }
          });

          // Parse description - keep HTML for proper display
          if (wcProduct.description) {
            // Store the HTML description directly for rendering
            mappedProduct.specs['description'] = wcProduct.description;
          }
          
          // Also store short description if available
          if (wcProduct.short_description) {
            mappedProduct.specs['short_description'] = wcProduct.short_description;
          }

          setProduct(mappedProduct);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleTabChange = (tab: string) => {
    navigate('/', { state: { activeTab: tab } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MainHeader
          onMenuClick={() => {}}
          activeTab=""
          onTabChange={handleTabChange}
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </main>
        <Footer onTabChange={handleTabChange} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <MainHeader
          onMenuClick={() => {}}
          activeTab=""
          onTabChange={handleTabChange}
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'Product not found'}</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </main>
        <Footer onTabChange={handleTabChange} />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

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
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <div className="bg-card rounded-lg border border-border p-4 mb-4">
                <div className="aspect-square flex items-center justify-center bg-secondary/30 rounded-lg overflow-hidden mb-4">
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain p-4"
                  />
                </div>
                
                {/* Thumbnail gallery (if multiple images) */}
                {images.length > 1 && (
                  <div className="flex gap-2">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-20 h-20 rounded border-2 overflow-hidden ${
                          selectedImage === index
                            ? 'border-primary'
                            : 'border-border'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-contain p-1"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
                <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                
                {/* Price */}
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-4xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2 mb-4">
                  {product.inStock ? (
                    <>
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-medium">In Stock</span>
                    </>
                  ) : (
                    <>
                      <X className="h-5 w-5 text-red-500" />
                      <span className="text-red-500 font-medium">Out of Stock</span>
                    </>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 mb-6">
                  <label className="text-sm font-medium">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setQuantity(Math.max(1, quantity - 1));
                      }}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setQuantity(quantity + 1);
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mb-6">
                  <Button
                    size="lg"
                    className="flex-1 bg-accent hover:bg-accent/90 text-white"
                    disabled={!product.inStock}
                    onClick={() => addToCart(product, quantity)}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className={`px-6 ${product && isInWishlist(product.id) ? 'text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-950' : ''}`}
                    onClick={() => {
                      if (product) {
                        toggleWishlist(product);
                      }
                    }}
                    title={product && isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`h-5 w-5 ${product && isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Specifications */}
              {Object.keys(product.specs).length > 0 && (
                <div className="bg-card rounded-lg border border-border p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4">Specifications</h2>
                  <div className="space-y-2">
                    {Object.entries(product.specs)
                      .filter(([key, value]) => {
                        // Skip description, short_description, and admin fields
                        const keyLower = key.toLowerCase();
                        const adminFields = ['description', 'short_description', '_wp_', '_wc_', '_jetpack_', '_yoast_', '_elementor_'];
                        return !adminFields.some(field => keyLower.includes(field)) && 
                               value && 
                               String(value).trim().length > 0 &&
                               !String(value).startsWith('<');
                      })
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-border last:border-0">
                          <span className="font-medium capitalize">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                          <span className="text-muted-foreground text-right max-w-[60%] break-words">{String(value)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {(product.specs.description || product.specs.short_description) && (
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="text-xl font-bold mb-4">Description</h2>
                  <div 
                    className="prose prose-sm max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ 
                      __html: product.specs.description || product.specs.short_description || '' 
                    }}
                  />
                </div>
              )}
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

export default ProductDetail;

