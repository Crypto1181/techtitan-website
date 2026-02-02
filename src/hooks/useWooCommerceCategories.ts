import { useState, useEffect } from 'react';
import { fetchCategories } from '@/services/backendApi';
import type { WooCommerceCategory } from '@/types/woocommerce';

interface UseWooCommerceCategoriesReturn {
  categories: WooCommerceCategory[];
  loading: boolean;
  error: Error | null;
  getCategoryIdBySlug: (slug: string) => number | null; // Returns WooCommerce ID (for API calls)
  getCategorySlugById: (id: number) => string | null;
  getCategoryWooCommerceIdBySlug: (slug: string) => number | null; // Explicitly returns WooCommerce ID
}

// Cache for categories
let categoriesCache: WooCommerceCategory[] | null = null;
let categoriesCacheTime: number = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const useWooCommerceCategories = (): UseWooCommerceCategoriesReturn => {
  const [categories, setCategories] = useState<WooCommerceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Return cached data if available - don't set loading to true if we have cache
    if (categoriesCache && Date.now() - categoriesCacheTime < CACHE_DURATION) {
      setCategories(categoriesCache);
      setLoading(false);
      // Only refresh in background if cache is getting old (more than 80% of the duration)
      // This prevents unnecessary refreshes when navigating between pages
      const cacheAge = Date.now() - categoriesCacheTime;
      const shouldRefresh = cacheAge > (CACHE_DURATION * 0.8); // Only refresh when cache is 80% expired
      
      if (shouldRefresh) {
        // Still try to refresh in background (but don't show loading)
        // This ensures cache stays fresh without blocking navigation
        const loadCategories = async () => {
          try {
            const fetchedCategories = await fetchCategories();
            categoriesCache = fetchedCategories;
            categoriesCacheTime = Date.now();
            setCategories(fetchedCategories);
            console.log(`Refreshed ${fetchedCategories.length} WooCommerce categories in background`);
          } catch (err) {
            // Silently fail background refresh - keep using cache
            console.warn('Background category refresh failed, using cached data:', err);
          }
        };
        // Refresh cache in background after a longer delay to avoid interfering with navigation
        // Only refresh when user is idle (not actively navigating)
        setTimeout(loadCategories, 5000);
      }
      return;
    }

    const loadCategories = async () => {
      // Only set loading to true if we don't have cache
      // This prevents the "loading" flash when navigating between pages
      if (!categoriesCache) {
        setLoading(true);
      }
      setError(null);

      // Retry logic for production (slower connections)
      const maxRetries = 3;
      let retryCount = 0;
      let lastError: Error | null = null;

      while (retryCount < maxRetries) {
        try {
          const fetchedCategories = await fetchCategories();
          categoriesCache = fetchedCategories;
          categoriesCacheTime = Date.now();
          setCategories(fetchedCategories);
          console.log(`Loaded ${fetchedCategories.length} WooCommerce categories${retryCount > 0 ? ` (after ${retryCount} retry${retryCount > 1 ? 'ies' : 'y'})` : ''}`);
          setLoading(false);
          return; // Success - exit retry loop
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Failed to fetch categories');
          retryCount++;
          
          if (retryCount < maxRetries) {
            // Wait before retrying (exponential backoff)
            const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
            console.warn(`Category fetch failed (attempt ${retryCount}/${maxRetries}), retrying in ${delay}ms...`, lastError);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      // All retries failed
      setError(lastError);
      console.error('Error loading WooCommerce categories after all retries:', lastError);
      // Keep cached categories if available, even on error
      if (categoriesCache) {
        console.warn('Using cached categories due to fetch error');
        setCategories(categoriesCache);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const getCategoryIdBySlug = (slug: string): number | null => {
    if (!slug) {
      return null;
    }
    
    if (categories.length === 0) {
      console.warn(`Cannot lookup category "${slug}" - categories not loaded yet (${loading ? 'loading' : 'empty'})`);
      return null;
    }
    
    const normalizedSlug = slug.toLowerCase().trim();
    
    // PRIORITY 1: Exact match on slug (most reliable)
    let category = categories.find(cat => {
      const catSlug = cat.slug?.toLowerCase().trim();
      return catSlug === normalizedSlug;
    });
    
    if (category) {
      console.log(`✓ Found category by exact slug match: "${category.name}" (ID: ${category.id}, Slug: "${category.slug}")`);
      return category.id;
    }
    
    // PRIORITY 2: Exact match on name (after normalizing)
      const normalizedName = normalizedSlug.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
      category = categories.find(cat => {
      const catName = cat.name?.toLowerCase().trim().replace(/&amp;/g, '&').replace(/&/g, 'and');
      const normalizedCatName = catName.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
      return normalizedCatName === normalizedName || catName === normalizedSlug;
      });
    
    if (category) {
      console.log(`✓ Found category by exact name match: "${category.name}" (ID: ${category.id}, Slug: "${category.slug}")`);
      return category.id;
    }
    
    // PRIORITY 3: Exact match on slug with variations (plural/singular)
    const slugVariations = [
      normalizedSlug,
      normalizedSlug + 's',
      normalizedSlug.replace(/s$/, ''),
      normalizedSlug.replace(/ies$/, 'y'),
      normalizedSlug.replace(/y$/, 'ies'),
    ];
    
    for (const variation of slugVariations) {
      category = categories.find(cat => {
        const catSlug = cat.slug?.toLowerCase().trim();
        return catSlug === variation;
      });
      if (category) {
        console.log(`✓ Found category by slug variation: "${category.name}" (ID: ${category.id}, Slug: "${category.slug}")`);
        return category.id;
      }
    }
    
    // PRIORITY 4: Partial match on slug (only if slug is specific enough, > 3 chars)
    if (normalizedSlug.length > 3) {
      category = categories.find(cat => {
        const catSlug = cat.slug?.toLowerCase() || '';
        // Only match if one contains the other and they're similar length (avoid false matches)
        const lengthDiff = Math.abs(catSlug.length - normalizedSlug.length);
        return (catSlug.includes(normalizedSlug) || normalizedSlug.includes(catSlug)) && lengthDiff < 5;
      });
      
      if (category) {
        console.log(`⚠️ Found category by partial slug match: "${category.name}" (ID: ${category.id}, Slug: "${category.slug}") - verify this is correct!`);
        return category.id;
      }
    }
    
    // If not found, warn
    if (normalizedSlug.length > 2) {
      const similarCategories = categories
        .filter(cat => {
          const catSlug = cat.slug?.toLowerCase() || '';
          const catName = cat.name?.toLowerCase() || '';
          return catSlug.includes(normalizedSlug.substring(0, 3)) || 
                 catName.includes(normalizedSlug.substring(0, 3));
        })
        .slice(0, 5)
        .map(c => `${c.slug} (${c.name})`);
      
      console.warn(`⚠️ Category not found: "${slug}". Similar categories: ${similarCategories.join(', ')}`);
    }
    
    return null;
  };

  const getCategorySlugById = (id: number): string | null => {
    const category = categories.find(cat => cat.id === id);
    return category ? category.slug : null;
  };

  return {
    categories,
    loading,
    error,
    getCategoryIdBySlug,
    getCategorySlugById,
  };
};

