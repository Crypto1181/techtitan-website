import { supabase } from '@/lib/supabase';
import type { WooCommerceProduct } from '@/types/woocommerce';
import { fetchProducts as fetchDirect, fetchProductById as fetchDirectById, fetchCategories as fetchDirectCategories } from './woocommerce';
import { fetchAllProducts as fetchMultiProducts, fetchProductById as fetchMultiProductById, fetchAllCategories as fetchMultiCategories } from './woocommerce-multi';

export interface FetchProductsParams {
  per_page?: number;
  page?: number;
  category?: number;
  search?: string;
  orderby?: 'date' | 'price' | 'popularity' | 'rating' | 'title';
  order?: 'asc' | 'desc';
  featured?: boolean;
  status?: 'publish' | 'draft' | 'pending';
}

// Check if Supabase is configured
const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && url.length > 0 && key.length > 0);
};

/**
 * Fetch products from WooCommerce via Supabase Edge Function
 * Falls back to direct WooCommerce calls if Supabase is not configured
 * Supports pagination - can fetch all products if needed
 */
export interface FetchProductsResult {
  products: WooCommerceProduct[];
  totalProducts?: number;
  totalPages?: number;
}

export const fetchProducts = async (params: FetchProductsParams = {}): Promise<FetchProductsResult> => {
  // PRIORITY 1: Try Supabase Edge Function first (avoids CORS issues)
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.functions.invoke('woocommerce-products', {
        body: params,
      });

      if (error) {
        console.error('Supabase function error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
      } else if (data) {
        // Check if response includes metadata (new format) or just products array (old format)
        if (data.products && Array.isArray(data.products)) {
          console.log(`✓ Fetched ${data.products.length} products via Supabase Edge Function (Total: ${data.totalProducts || 'unknown'})`);
          return {
            products: data.products,
            totalProducts: data.totalProducts,
            totalPages: data.totalPages,
          };
        } else if (Array.isArray(data)) {
          // Old format - just products array
          console.log(`✓ Fetched ${data.length} products via Supabase Edge Function`);
          return { products: data };
        } else if (data.error) {
          console.error('Supabase function returned error:', data.error);
        } else {
          console.warn('Unexpected response format from Supabase:', data);
        }
      }
    } catch (error) {
      console.error('Error fetching products via Supabase:', error);
      console.error('Error details:', error instanceof Error ? error.stack : String(error));
    }
  }

  // PRIORITY 2: Try multi-site (direct API with auth - may have CORS issues)
  try {
    const multiResult = await fetchMultiProducts(params);
    if (multiResult.products && multiResult.products.length > 0) {
      console.log(`✓ Fetched ${multiResult.products.length} products via multi-site API (Total: ${multiResult.totalProducts || 'unknown'})`);
      return multiResult;
    }
  } catch (error) {
    console.warn('Error fetching from multiple sites:', error);
  }

  // PRIORITY 3: Fallback to direct WooCommerce (will likely fail due to CORS)
  try {
    const directResult = await fetchDirect(params);
    if (directResult.products && directResult.products.length > 0) {
      console.log(`✓ Fetched ${directResult.products.length} products via direct API (Total: ${directResult.totalProducts || 'unknown'})`);
      return directResult;
    }
  } catch (error) {
    console.error('All product fetch methods failed:', error);
  }

  // Return empty result if all methods fail
  console.error('⚠️ Failed to fetch products from all sources');
  return { products: [] };
};

/**
 * Fetch ALL products from WooCommerce (with pagination)
 * This will fetch all pages automatically
 * Limited to 1000 products max to prevent performance issues
 */
export const fetchAllProducts = async (params: Omit<FetchProductsParams, 'page'> = {}): Promise<WooCommerceProduct[]> => {
  const allProducts: WooCommerceProduct[] = [];
  let page = 1;
  let hasMore = true;
  const perPage = params.per_page || 100;
  const maxProducts = 1000; // Limit to prevent performance issues

  while (hasMore && allProducts.length < maxProducts) {
    try {
      const result = await fetchProducts({
        ...params,
        page,
        per_page: perPage,
      });

      if (result.products.length === 0) {
        hasMore = false;
      } else {
        allProducts.push(...result.products);
        // If we got fewer products than per_page, we've reached the end
        if (result.products.length < perPage) {
          hasMore = false;
        } else if (allProducts.length >= maxProducts) {
          // Stop if we've hit the limit
          console.warn(`Reached maximum product limit of ${maxProducts} products`);
          hasMore = false;
        } else {
          page++;
        }
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      hasMore = false;
    }
  }

  return allProducts;
};

/**
 * Fetch a single product by ID
 */
export const fetchProductById = async (id: number): Promise<WooCommerceProduct> => {
  // Try multi-site first
  try {
    const product = await fetchMultiProductById(id);
    if (product) {
      return product;
    }
  } catch (error) {
    console.warn(`Error fetching product ${id} from multiple sites, trying Supabase:`, error);
  }

  // Fallback to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.functions.invoke('woocommerce-product', {
        body: { id },
      });

      if (error) {
        console.warn(`Supabase function error for product ${id}, falling back to direct API:`, error);
        return fetchDirectById(id);
      }

      if (!data) {
        throw new Error('Product not found');
      }

      return data;
    } catch (error) {
      console.warn(`Error fetching product ${id} via Supabase, falling back to direct API:`, error);
      return fetchDirectById(id);
    }
  }

  // Final fallback to direct WooCommerce
  return fetchDirectById(id);
};

/**
 * Fetch categories from WooCommerce via Supabase Edge Function
 */
export const fetchCategories = async () => {
  // PRIORITY 1: Try Supabase Edge Function first (avoids CORS issues)
  if (isSupabaseConfigured()) {
    try {
      console.log('Attempting to fetch categories via Supabase Edge Function...');
      const { data, error } = await supabase.functions.invoke('woocommerce-categories', {
        body: {},
      });

      if (error) {
        console.error('Supabase function error for categories:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
      } else if (data) {
        if (Array.isArray(data)) {
          console.log(`✓ Fetched ${data.length} categories via Supabase Edge Function`);
          return data;
        } else if (data.error) {
          console.error('Supabase function returned error:', data.error);
        } else {
          console.warn('Unexpected response format from Supabase:', data);
        }
      }
    } catch (error) {
      console.error('Error fetching categories via Supabase:', error);
      console.error('Error details:', error instanceof Error ? error.stack : String(error));
    }
  } else {
    console.warn('Supabase not configured, skipping Edge Function');
  }

  // PRIORITY 2: Try multi-site (direct API with auth - may have CORS issues)
  try {
    const categories = await fetchMultiCategories();
    if (categories.length > 0) {
      console.log(`✓ Fetched ${categories.length} categories via multi-site API`);
      return categories;
    }
  } catch (error) {
    console.warn('Error fetching categories from multiple sites:', error);
  }

  // PRIORITY 3: Fallback to direct WooCommerce (will likely fail due to CORS)
  try {
    const directCategories = await fetchDirectCategories();
    if (directCategories.length > 0) {
      console.log(`✓ Fetched ${directCategories.length} categories via direct API`);
      return directCategories;
    }
  } catch (error) {
    console.error('All category fetch methods failed:', error);
  }

  // Return empty array if all methods fail
  console.error('⚠️ Failed to fetch categories from all sources');
  return [];
};

/**
 * Search products via Supabase Edge Function
 */
export const searchProducts = async (query: string, params: FetchProductsParams = {}): Promise<WooCommerceProduct[]> => {
  return fetchProducts({
    ...params,
    search: query,
  });
};

