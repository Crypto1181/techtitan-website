import { useState, useEffect } from 'react';
import { PCComponent, ComponentCategory } from '@/data/pcComponents';
import { loadCSVProducts, getCSVProductsByCategory, getAllCSVProducts } from '@/data/csvProducts';

interface UseCSVProductsReturn {
  products: PCComponent[];
  loading: boolean;
  error: Error | null;
  productCounts: Record<ComponentCategory, number>;
}

interface UseCSVProductsOptions {
  category?: ComponentCategory;
  fetchAll?: boolean;
}

export const useCSVProducts = (options: UseCSVProductsOptions = {}): UseCSVProductsReturn => {
  const { category, fetchAll = false } = options;
  const [products, setProducts] = useState<PCComponent[]>([]);
  const [productCounts, setProductCounts] = useState<Record<ComponentCategory, number>>({
    cpu: 0,
    gpu: 0,
    motherboard: 0,
    ram: 0,
    storage: 0,
    psu: 0,
    case: 0,
    cooler: 0,
    mouse: 0,
    keyboard: 0,
    headset: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (fetchAll) {
          const allProducts = await getAllCSVProducts();
          setProducts(allProducts);
        } else if (category) {
          const categoryProducts = await getCSVProductsByCategory(category);
          setProducts(categoryProducts);
        } else {
          const allProducts = await getAllCSVProducts();
          setProducts(allProducts);
        }
        
        // Get counts
        const allProductsByCategory = await loadCSVProducts();
        const counts: Record<ComponentCategory, number> = {
          cpu: allProductsByCategory.cpu.length,
          gpu: allProductsByCategory.gpu.length,
          motherboard: allProductsByCategory.motherboard.length,
          ram: allProductsByCategory.ram.length,
          storage: allProductsByCategory.storage.length,
          psu: allProductsByCategory.psu.length,
          case: allProductsByCategory.case.length,
          cooler: allProductsByCategory.cooler.length,
          mouse: allProductsByCategory.mouse.length,
          keyboard: allProductsByCategory.keyboard.length,
          headset: allProductsByCategory.headset.length,
        };
        setProductCounts(counts);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load CSV products'));
        console.error('Error loading CSV products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category, fetchAll]);

  return {
    products,
    loading,
    error,
    productCounts,
  };
};

