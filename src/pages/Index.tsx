import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainHeader from '@/components/layout/MainHeader';
import CategorySidebar from '@/components/layout/CategorySidebar';
import HeroBanner from '@/components/home/HeroBanner';
import ProductCarousel from '@/components/home/ProductCarousel';
import BrandsCarousel from '@/components/home/BrandsCarousel';
import CustomerReviews from '@/components/home/CustomerReviews';
import CategoryProducts from '@/components/home/CategoryProducts';
import Footer from '@/components/layout/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import FlipbookCatalog from '@/components/FlipbookCatalog';
import BackToTop from '@/components/BackToTop';
import BuildSummary from '@/components/BuildSummary';
import ComponentSelector from '@/components/ComponentSelector';
import PCFinder from '@/components/PCFinder';
import LaptopFinder from '@/components/LaptopFinder';
import PSUCalculator from '@/components/PSUCalculator';
import CompareProducts from '@/components/CompareProducts';
import { PCComponent, ComponentCategory, sampleComponents } from '@/data/pcComponents';
import { useWooCommerceProducts } from '@/hooks/useWooCommerceProducts';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<Record<string, PCComponent | null>>({});
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | null>(null);

  // Fetch latest products from WooCommerce for "New Arrivals"
  // Use useLive: true to fetch directly from WooCommerce for real-time updates
  const { products: newArrivals, loading: loadingNewArrivals } = useWooCommerceProducts({
    per_page: 20,
    orderby: 'date',
    order: 'desc',
    useLive: true,
  });

  // Fetch featured products - use explicit featured flag and random order for variety
  const { products: featuredProductsRaw, loading: loadingFeatured } = useWooCommerceProducts({
    per_page: 20,
    featured: true,
    orderby: 'rand',
  });

  // Get random featured products - use fetched products or shuffle if we have more
  const [featuredProducts, setFeaturedProducts] = useState<PCComponent[]>([]);

  useEffect(() => {
    if (featuredProductsRaw.length > 0) {
      setFeaturedProducts(featuredProductsRaw);
    } else if (!loadingFeatured) {
      // If no products, use samples
      const shuffled = [...sampleComponents].sort(() => Math.random() - 0.5);
      setFeaturedProducts(shuffled.slice(0, 20));
    }
  }, [featuredProductsRaw, loadingFeatured]);

  // Fetch best selling products (using random order to ensure variety and uniqueness on every load)
  const { products: bestSellersRaw, loading: loadingBestSellers } = useWooCommerceProducts({
    per_page: 20,
    orderby: 'rand',
  });

  // Deduplicate products across sections to ensure variety
  // New Arrivals is the priority (keep as is)
  // Featured Products should not overlap with New Arrivals
  // Best Sellers should not overlap with New Arrivals or Featured
  const [uniqueFeatured, setUniqueFeatured] = useState<PCComponent[]>([]);
  const [uniqueBestSellers, setUniqueBestSellers] = useState<PCComponent[]>([]);

  useEffect(() => {
    // Filter Featured: Remove items already in New Arrivals
    const filteredFeatured = featuredProducts.filter(
      fp => !newArrivals.some(na => na.id === fp.id)
    );
    setUniqueFeatured(filteredFeatured.length > 0 ? filteredFeatured : featuredProducts);
  }, [featuredProducts, newArrivals]);

  useEffect(() => {
    // Filter Best Sellers: Remove items in New Arrivals or Featured
    const filteredBestSellers = bestSellersRaw.filter(
      bs => !newArrivals.some(na => na.id === bs.id) && 
            !uniqueFeatured.some(uf => uf.id === bs.id)
    );
    setUniqueBestSellers(filteredBestSellers.length > 0 ? filteredBestSellers : bestSellersRaw);
  }, [bestSellersRaw, newArrivals, uniqueFeatured]);

  const handleSelectComponent = (category: string, component: PCComponent) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [category]: prev[category]?.id === component.id ? null : component,
    }));
  };

  const handleRemoveComponent = (category: string) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [category]: null,
    }));
  };

  const handleSelectBuild = (components: Record<string, PCComponent | null>) => {
    setSelectedComponents(components);
    setActiveTab('builder');
  };

  const handleBannerClick = (bannerId: string) => {
    if (bannerId === '1') {
      setActiveTab('builder');
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'deals' || tab === 'best-sellers') {
      setActiveTab('home');
    } else {
      setActiveTab(tab);
    }
    if (tab !== 'home' && tab !== 'deals' && tab !== 'best-sellers') {
      setSidebarOpen(false);
    }
  };

  // Handle tab changes from navigation state (when coming from other pages)
  useEffect(() => {
    if (location.state) {
      const state = location.state as any;
      if (state.activeTab) {
        const tab = state.activeTab;
        if (tab === 'deals' || tab === 'best-sellers') {
          setActiveTab('home');
        } else {
          setActiveTab(tab);
        }
        if (tab !== 'home' && tab !== 'deals' && tab !== 'best-sellers') {
          setSidebarOpen(false);
        }
      }
      // Handle pre-selected component from Compare tool
      if (state.preSelectComponent) {
        const { category, component } = state.preSelectComponent;
        setSelectedComponents(prev => ({
          ...prev,
          [category]: component
        }));
        setActiveCategory(category);
        setActiveTab('builder');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const isHomePage = activeTab === 'home';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="flex-1 flex">
        <CategorySidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onCategorySelect={(categoryId) => {
            // Navigate to products page with category filter
            navigate(`/products?category=${encodeURIComponent(categoryId)}`);
            setSidebarOpen(false);
          }}
        />

        <main className="flex-1 min-w-0">
          {isHomePage && (
            <>
              <div className="p-4 lg:p-6 space-y-6">
                <HeroBanner onCtaClick={handleBannerClick} />

                <ProductCarousel 
                  title="New Arrivals" 
                  products={newArrivals.length > 0 ? newArrivals.slice(0, 20) : sampleComponents.slice(2, 22)}
                  loading={loadingNewArrivals}
                  viewAllLink="/products?sort=date&order=desc"
                />
                <ProductCarousel 
                  title="Featured Products" 
                  products={uniqueFeatured.length > 0 ? uniqueFeatured.slice(0, 20) : sampleComponents.slice(0, 20)}
                  loading={loadingFeatured}
                  viewAllLink="/products?featured=true"
                />
                <ProductCarousel 
                  title="Best Sellers" 
                  products={uniqueBestSellers.length > 0 ? uniqueBestSellers.slice(0, 20) : sampleComponents.slice(5, 25)}
                  loading={loadingBestSellers}
                  viewAllLink="/products?sort=popularity&order=desc"
                />

                {/* Tools Promo Section */}
                <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg p-5">
                    <h3 className="text-lg font-bold mb-2">PC Builder</h3>
                    <p className="text-white/80 text-sm mb-3">Build your custom PC with compatibility checking</p>
                    <button
                      className="bg-white text-primary px-4 py-2 rounded text-sm font-medium hover:bg-white/90 transition-colors"
                      onClick={() => setActiveTab('builder')}
                    >
                      Start Building →
                    </button>
                  </div>
                  <div className="bg-gradient-to-r from-accent to-orange-600 text-white rounded-lg p-5">
                    <h3 className="text-lg font-bold mb-2">PC Finder</h3>
                    <p className="text-white/80 text-sm mb-3">Get personalized PC recommendations</p>
                    <button
                      className="bg-white text-accent px-4 py-2 rounded text-sm font-medium hover:bg-white/90 transition-colors"
                      onClick={() => setActiveTab('finder')}
                    >
                      Find Your PC →
                    </button>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg p-5">
                    <h3 className="text-lg font-bold mb-2">Laptop Finder</h3>
                    <p className="text-white/80 text-sm mb-3">Find the perfect laptop for your needs</p>
                    <button
                      className="bg-white text-purple-600 px-4 py-2 rounded text-sm font-medium hover:bg-white/90 transition-colors"
                      onClick={() => setActiveTab('laptop-finder')}
                    >
                      Find Laptop →
                    </button>
                  </div>
                  <div className="bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-lg p-5">
                    <h3 className="text-lg font-bold mb-2">PSU Calculator</h3>
                    <p className="text-white/80 text-sm mb-3">Calculate your power supply needs</p>
                    <button
                      className="bg-white text-amber-600 px-4 py-2 rounded text-sm font-medium hover:bg-white/90 transition-colors"
                      onClick={() => setActiveTab('psu-calc')}
                    >
                      Calculate →
                    </button>
                  </div>
                </section>

              </div>

              <BrandsCarousel />
              <FlipbookCatalog />
              <CategoryProducts />
              <CustomerReviews />
            </>
          )}

          {activeTab === 'builder' && (
            <div className="p-4 lg:p-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ComponentSelector
                    selectedComponents={selectedComponents}
                    onSelectComponent={handleSelectComponent}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                  />
                </div>
                <div className="lg:col-span-1">
                  <BuildSummary
                    selectedComponents={selectedComponents}
                    onRemoveComponent={handleRemoveComponent}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finder' && (
            <div className="p-4 lg:p-6">
              <PCFinder onSelectBuild={handleSelectBuild} />
            </div>
          )}

          {activeTab === 'laptop-finder' && (
            <div className="p-4 lg:p-6">
              <LaptopFinder />
            </div>
          )}

          {activeTab === 'psu-calc' && (
            <div className="p-4 lg:p-6">
              <PSUCalculator />
            </div>
          )}

          {activeTab === 'compare' && (
            <div className="p-4 lg:p-6">
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Compare Products</h1>
                <p className="text-muted-foreground">Compare specifications side by side</p>
              </div>
              <CompareProducts />
            </div>
          )}

          {activeTab === 'catalog' && (
            <div className="p-4 lg:p-6">
              <FlipbookCatalog title="TechTitan Product Catalog" />
            </div>
          )}
        </main>
      </div>

      <Footer onTabChange={handleTabChange} />
      <WhatsAppWidget />
      <BackToTop />
    </div>
  );
};

export default Index;
