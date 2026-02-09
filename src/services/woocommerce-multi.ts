import type { WooCommerceProduct } from '@/types/woocommerce';
import type { FetchProductsResult } from './woocommerce';

/**
 * Configuration for multiple WooCommerce sites
 */
export interface WooCommerceSite {
  id: string;
  name: string;
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

/**
 * Get all configured WooCommerce sites
 * Currently using only techtitanlb.com (latest products)
 */
export const getWooCommerceSites = (): WooCommerceSite[] => {
  const sites: WooCommerceSite[] = [];

  // Site: techtitanlb.com (latest products - 5,188 products)
  // Priority: Use environment variables if set, otherwise use default credentials
  const siteKey = import.meta.env.VITE_WC_CONSUMER_KEY || 'ck_483ec3eded8f44b515a0ad930c4c1c9bfa3bd334';
  const siteSecret = import.meta.env.VITE_WC_CONSUMER_SECRET || 'cs_e6d57c833bfa11e3bc54772193dd193acc037950';
  
  if (siteKey && siteSecret) {
    console.log('✓ WooCommerce API configured for techtitanlb.com');
    sites.push({
      id: 'site1',
      name: 'TechTitan Store',
      baseUrl: 'https://techtitanlb.com/wp-json/wc/v3',
      consumerKey: siteKey,
      consumerSecret: siteSecret,
    });
  } else {
    console.error('⚠️ WooCommerce API credentials missing for techtitanlb.com');
  }

  return sites;
};

/**
 * Create basic auth header for WooCommerce API
 */
const getAuthHeader = (consumerKey: string, consumerSecret: string): string => {
  const credentials = `${consumerKey}:${consumerSecret}`;
  return `Basic ${btoa(credentials)}`;
};

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

/**
 * Fetch products from a single WooCommerce site
 */
const fetchProductsFromSite = async (
  site: WooCommerceSite,
  params: FetchProductsParams = {}
): Promise<WooCommerceProduct[]> => {
  const {
    per_page = 100,
    page = 1,
    category,
    search,
    orderby = 'date',
    order = 'desc',
    featured,
    status = 'publish',
  } = params;

  const queryParams = new URLSearchParams({
    per_page: per_page.toString(),
    page: page.toString(),
    orderby,
    order,
    status,
  });

  if (category) {
    queryParams.append('category', category.toString());
  }

  if (search) {
    queryParams.append('search', search);
  }

  if (featured !== undefined) {
    queryParams.append('featured', featured.toString());
  }

  try {
    const response = await fetch(`${site.baseUrl}/products?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(site.consumerKey, site.consumerSecret),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`❌ WooCommerce API error for ${site.name}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: `${site.baseUrl}/products?${queryParams.toString()}`,
      });
      throw new Error(`WooCommerce API error for ${site.name}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // Add site identifier to each product
    const products = data.map((product: WooCommerceProduct) => ({
      ...product,
      _siteId: site.id,
      _siteName: site.name,
    }));
    
    console.log(`  ✓ ${site.name}: ${products.length} products fetched`);
    return products;
  } catch (error) {
    console.error(`❌ Error fetching products from ${site.name}:`, error);
    // Return empty array on error instead of throwing
    return [];
  }
};

/**
 * Fetch products from ALL configured WooCommerce sites
 * Products are merged and deduplicated by SKU or name
 */
export const fetchAllProducts = async (params: FetchProductsParams = {}): Promise<FetchProductsResult> => {
  const sites = getWooCommerceSites();
  
  if (sites.length === 0) {
    console.warn('⚠️ No WooCommerce sites configured');
    return { products: [] };
  }

  console.log(`🔍 Fetching products from ${sites.length} WooCommerce site(s)...`);
  if (params.category) {
    console.log(`  Category filter: ${params.category}`);
  }
  if (params.search) {
    console.log(`  Search query: ${params.search}`);
  }

  // Fetch from all sites in parallel
  const promises = sites.map(site => fetchProductsFromSite(site, params));
  const results = await Promise.allSettled(promises);

  // Combine all products
  const allProducts: WooCommerceProduct[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const products = result.value;
      console.log(`✓ Successfully fetched ${products.length} products from ${sites[index].name}`);
      allProducts.push(...products);
    } else {
      console.error(`✗ Failed to fetch from ${sites[index].name}:`, result.reason);
    }
  });

  // Deduplicate products by SKU or name
  const seen = new Set<string>();
  const uniqueProducts: WooCommerceProduct[] = [];

  for (const product of allProducts) {
    const identifier = product.sku || product.name.toLowerCase().trim();
    if (!seen.has(identifier)) {
      seen.add(identifier);
      uniqueProducts.push(product);
    }
  }

  console.log(`📦 Total unique products: ${uniqueProducts.length} (${allProducts.length - uniqueProducts.length} duplicates removed)`);

  return { products: uniqueProducts };
};

/**
 * Fetch a single product by ID from all sites
 */
export const fetchProductById = async (id: number, siteId?: string): Promise<WooCommerceProduct | null> => {
  const sites = getWooCommerceSites();
  const sitesToCheck = siteId 
    ? sites.filter(s => s.id === siteId)
    : sites;

  for (const site of sitesToCheck) {
    try {
      const response = await fetch(`${site.baseUrl}/products/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': getAuthHeader(site.consumerKey, site.consumerSecret),
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const product = await response.json();
        return {
          ...product,
          _siteId: site.id,
          _siteName: site.name,
        };
      }
    } catch (error) {
      console.error(`Error fetching product ${id} from ${site.name}:`, error);
    }
  }

  return null;
};

/**
 * Fetch categories from all sites
 */
export const fetchAllCategories = async () => {
  const sites = getWooCommerceSites();
  
  if (sites.length === 0) {
    console.warn('⚠️ No WooCommerce sites configured for category fetch');
    return [];
  }

  console.log(`🔍 Fetching categories from ${sites.length} WooCommerce site(s)...`);
  
  const promises = sites.map(async (site) => {
    try {
      const response = await fetch(`${site.baseUrl}/products/categories?per_page=100`, {
        method: 'GET',
        headers: {
          'Authorization': getAuthHeader(site.consumerKey, site.consumerSecret),
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const categories = await response.json();
        const mappedCategories = categories.map((cat: any) => ({
          ...cat,
          _siteId: site.id,
          _siteName: site.name,
        }));
        console.log(`✓ Fetched ${mappedCategories.length} categories from ${site.name}`);
        return mappedCategories;
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`❌ Failed to fetch categories from ${site.name}:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        return [];
      }
    } catch (error) {
      console.error(`❌ Error fetching categories from ${site.name}:`, error);
      return [];
    }
  });

  const results = await Promise.allSettled(promises);
  const allCategories: any[] = [];

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allCategories.push(...result.value);
    }
  });

  // Deduplicate categories by name
  const seen = new Set<string>();
  const uniqueCategories: any[] = [];

  for (const category of allCategories) {
    const identifier = category.name.toLowerCase().trim();
    if (!seen.has(identifier)) {
      seen.add(identifier);
      uniqueCategories.push(category);
    }
  }

  console.log(`📦 Total unique categories: ${uniqueCategories.length}`);
  return uniqueCategories;
};

