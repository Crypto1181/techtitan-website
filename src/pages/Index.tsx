import { useState } from 'react';
import MainHeader from '@/components/layout/MainHeader';
import CategorySidebar from '@/components/layout/CategorySidebar';
import HeroBanner from '@/components/home/HeroBanner';
import DealCards from '@/components/home/DealCards';
import ProductCarousel from '@/components/home/ProductCarousel';
import BrandsCarousel from '@/components/home/BrandsCarousel';
import CustomerReviews from '@/components/home/CustomerReviews';
import ContactBar from '@/components/home/ContactBar';
import Footer from '@/components/layout/Footer';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import FlipbookCatalog from '@/components/FlipbookCatalog';
import BuildSummary from '@/components/BuildSummary';
import ComponentSelector from '@/components/ComponentSelector';
import PCFinder from '@/components/PCFinder';
import LaptopFinder from '@/components/LaptopFinder';
import PSUCalculator from '@/components/PSUCalculator';
import CompareProducts from '@/components/CompareProducts';
import { PCComponent, ComponentCategory, sampleComponents } from '@/data/pcComponents';

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<Record<string, PCComponent | null>>({});
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | null>(null);

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

  const isHomePage = activeTab === 'home';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="flex-1 flex">
        {isHomePage && (
          <CategorySidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onCategorySelect={(categoryId) => {
              console.log('Selected category:', categoryId);
              setSidebarOpen(false);
            }}
          />
        )}

        <main className="flex-1 min-w-0">
          {isHomePage && (
            <>
              <div className="p-4 lg:p-6 space-y-6">
                <HeroBanner onCtaClick={handleBannerClick} />

                <section>
                  <h2 className="text-xl font-bold mb-4">Today's Top Deals</h2>
                  <DealCards onCategoryClick={(categoryId) => console.log('Deal:', categoryId)} />
                </section>

                <ProductCarousel title="Featured Products" products={sampleComponents.slice(0, 10)} />
                <ProductCarousel title="Best Sellers" products={sampleComponents.slice(5, 15)} />

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

                <ProductCarousel title="New Arrivals" products={sampleComponents.slice(2, 12)} />
              </div>

              <BrandsCarousel />
              <FlipbookCatalog />
              <CustomerReviews />
              <ContactBar />
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
    </div>
  );
};

export default Index;
