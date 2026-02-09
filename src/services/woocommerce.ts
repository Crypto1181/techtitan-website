import type { WooCommerceProduct } from '@/types/woocommerce';

const WOOCOMMERCE_BASE_URL = 'https://techtitanlb.com/wp-json/wc/v3';
const CONSUMER_KEY = import.meta.env.VITE_WC_CONSUMER_KEY || 'ck_483ec3eded8f44b515a0ad930c4c1c9bfa3bd334';
const CONSUMER_SECRET = import.meta.env.VITE_WC_CONSUMER_SECRET || 'cs_e6d57c833bfa11e3bc54772193dd193acc037950';

// Create basic auth header
const getAuthHeader = (): string => {
  const credentials = `${CONSUMER_KEY}:${CONSUMER_SECRET}`;
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

export interface FetchProductsResult {
  products: WooCommerceProduct[];
  totalProducts?: number;
  totalPages?: number;
}

// Re-export FetchProductsResult for use in other files
export type { FetchProductsResult } from './woocommerce';

export const fetchProducts = async (params: FetchProductsParams = {}): Promise<FetchProductsResult> => {
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
    const response = await fetch(`${WOOCOMMERCE_BASE_URL}/products?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract total count from response headers (WooCommerce REST API provides these)
    const totalProducts = response.headers.get('X-WP-Total') 
      ? parseInt(response.headers.get('X-WP-Total') || '0', 10)
      : undefined;
    const totalPages = response.headers.get('X-WP-TotalPages')
      ? parseInt(response.headers.get('X-WP-TotalPages') || '0', 10)
      : undefined;

    return {
      products: data,
      totalProducts,
      totalPages,
    };
  } catch (error) {
    console.error('Error fetching products from WooCommerce:', error);
    throw error;
  }
};

export const fetchProductById = async (id: number): Promise<WooCommerceProduct> => {
  try {
    const response = await fetch(`${WOOCOMMERCE_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching product ${id} from WooCommerce:`, error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await fetch(`${WOOCOMMERCE_BASE_URL}/products/categories?per_page=100`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories from WooCommerce:', error);
    throw error;
  }
};

