import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';
import FlipbookCatalog from '@/components/FlipbookCatalog';

const ProductCatalog = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainHeader
        onMenuClick={() => {}}
        activeTab="catalog"
        onTabChange={() => {}}
      />
      
      <main className="flex-1">
        <FlipbookCatalog 
          title="Product Catalog" 
          subtitle="Peripherals - October 2025" 
        />
      </main>

      <Footer />
    </div>
  );
};

export default ProductCatalog;
