import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';
import FlipbookCatalog from '@/components/FlipbookCatalog';
import { AdminCategoryManagerContent } from './AdminCategoryManager';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Settings } from 'lucide-react';

const ProductCatalog = () => {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainHeader
        onMenuClick={() => {}}
        activeTab="catalog"
        onTabChange={() => {}}
      />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-4 flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => setShowAdmin(!showAdmin)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {showAdmin ? 'View Catalog' : 'Manage Categories'}
          </Button>
        </div>

        {showAdmin ? (
          <AdminCategoryManagerContent />
        ) : (
          <FlipbookCatalog 
            title="Product Catalog" 
            subtitle="Peripherals - October 2025" 
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductCatalog;
