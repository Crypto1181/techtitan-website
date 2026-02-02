/**
 * Backend API Service
 * Replaces Supabase/WooCommerce direct calls with our Node.js backend
 */

// Backend API base URL - defaults to localhost:3001
// Set VITE_BACKEND_API_URL in .env file to override
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api';

export interface FetchProductsParams {
  per_page?: number;
  page?: number;
  category?: number | number[]; // Can be single ID or array of IDs
  search?: string;
  pc_component_category?: string;
  featured?: boolean;
  min_price?: number;
  max_price?: number;
  orderby?: string;
  order?: 'asc' | 'desc';
}

export interface FetchProductsResult {
  products: any[];
  totalProducts?: number;
  totalPages?: number;
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

/**
 * Fetch products from backend API
 */
export const fetchProducts = async (params: FetchProductsParams = {}): Promise<FetchProductsResult> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.category) {
      // Handle both single number and array
      const categoryValue = Array.isArray(params.category) 
        ? params.category[0]?.toString() || '' 
        : params.category.toString();
      if (categoryValue) {
        queryParams.append('category', categoryValue);
      }
    }
    if (params.search) queryParams.append('search', params.search);
    if (params.pc_component_category) queryParams.append('pc_component_category', params.pc_component_category);
    if (params.featured) queryParams.append('featured', 'true');
    if (params.min_price) queryParams.append('min_price', params.min_price.toString());
    if (params.max_price) queryParams.append('max_price', params.max_price.toString());
    if (params.orderby) queryParams.append('orderby', params.orderby);
    if (params.order) queryParams.append('order', params.order);

    const url = `${API_BASE_URL}/products?${queryParams.toString()}`;
    console.log(`🔵 Fetching products from backend: ${url}`);
    console.log(`📋 Request params:`, {
      category: params.category,
      page: params.page,
      per_page: params.per_page,
      search: params.search,
      pc_component_category: params.pc_component_category
    });
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform backend products to WooCommerce format for compatibility
    const transformedProducts = data.products.map((product: any) => transformBackendProductToWooCommerce(product));

    console.log(`✅ Fetched ${transformedProducts.length} products from backend (Total: ${data.pagination?.total || transformedProducts.length})`);

    return {
      products: transformedProducts,
      totalProducts: data.pagination?.total || data.products.length,
      totalPages: data.pagination?.total_pages || 1,
    };
  } catch (error) {
    console.error('❌ Error fetching products from backend:', error);
    throw error;
  }
};

/**
 * Fetch ALL products (with pagination)
 */
export const fetchAllProducts = async (params: Omit<FetchProductsParams, 'page'> = {}): Promise<any[]> => {
  const allProducts: any[] = [];
  let page = 1;
  let hasMore = true;
  const perPage = params.per_page || 100;

  while (hasMore) {
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
        
        // Check if we've reached the end
        if (result.totalPages && page >= result.totalPages) {
          hasMore = false;
        } else if (result.products.length < perPage) {
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
export const fetchProductById = async (id: number): Promise<any> => {
  try {
    console.log(`🔵 Fetching product ${id} from backend`);
    const response = await fetch(`${API_BASE_URL}/products/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Product not found');
      }
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const product = await response.json();
    const transformed = transformBackendProductToWooCommerce(product);
    console.log(`✅ Fetched product ${id} from backend`);
    return transformed;
  } catch (error) {
    console.error(`❌ Error fetching product ${id} from backend:`, error);
    throw error;
  }
};

/**
 * Fetch categories from backend API
 * @param all - If true, fetch all categories including subcategories. Default: true
 */
export const fetchCategories = async (all: boolean = true): Promise<any[]> => {
  try {
    console.log(`🔵 Fetching ${all ? 'all' : 'root'} categories from backend`);
    const url = all 
      ? `${API_BASE_URL}/categories?all=true`
      : `${API_BASE_URL}/categories`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const categories = await response.json();
    
    // Transform backend categories to WooCommerce format
    const transformed = categories.map((cat: any) => ({
      id: cat.woo_commerce_id || cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      parent: cat.parent_id,
      count: cat.count || 0,
      // Keep internal database ID for reference
      _internalId: cat.id,
    }));
    
    console.log(`✅ Fetched ${transformed.length} categories from backend (${all ? 'all' : 'root only'})`);
    return transformed;
  } catch (error) {
    console.error('❌ Error fetching categories from backend:', error);
    throw error;
  }
};

/**
 * Fetch category tree from backend API (with parent-child relationships)
 */
export const fetchCategoryTree = async (): Promise<any[]> => {
  try {
    console.log(`🔵 Fetching category tree from backend`);
    const response = await fetch(`${API_BASE_URL}/categories/tree`);

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const categoryTree = await response.json();
    
    // Transform backend category tree to frontend format
    const transformCategory = (cat: any): any => ({
      id: cat.woo_commerce_id || cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      parent: cat.parent_id,
      count: cat.count || 0,
      image_url: cat.image_url,
      children: cat.children ? cat.children.map(transformCategory) : [],
    });
    
    const transformed = categoryTree.map(transformCategory);
    
    console.log(`✅ Fetched category tree with ${transformed.length} root categories from backend`);
    return transformed;
  } catch (error) {
    console.error('❌ Error fetching category tree from backend:', error);
    throw error;
  }
};

/**
 * Search products
 */
export const searchProducts = async (query: string, params: FetchProductsParams = {}): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}&limit=50`);

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.products.map((product: any) => transformBackendProductToWooCommerce(product));
  } catch (error) {
    console.error('❌ Error searching products:', error);
    throw error;
  }
};

/**
 * Transform backend product format to WooCommerce format for compatibility
 */
function transformBackendProductToWooCommerce(product: any): any {
  // Parse JSONB fields if they're strings
  const images = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
  const categories = typeof product.categories === 'string' ? JSON.parse(product.categories) : (product.categories || []);
  const tags = typeof product.tags === 'string' ? JSON.parse(product.tags) : (product.tags || []);
  const attributes = typeof product.attributes === 'string' ? JSON.parse(product.attributes) : (product.attributes || []);
  const meta_data = typeof product.meta_data === 'string' ? JSON.parse(product.meta_data) : (product.meta_data || []);

  return {
    id: product.woo_commerce_id || product.id,
    name: product.name,
    slug: product.slug,
    permalink: product.permalink || `/${product.slug}`,
    type: product.type || 'simple',
    status: product.status || 'publish',
    featured: product.featured || false,
    description: product.description || '',
    short_description: product.short_description || '',
    sku: product.sku || '',
    price: product.price?.toString() || product.regular_price?.toString() || '0',
    regular_price: product.regular_price?.toString() || product.price?.toString() || '0',
    sale_price: product.sale_price?.toString() || '',
    on_sale: product.on_sale || false,
    purchasable: product.purchasable !== false,
    stock_status: product.stock_status || 'instock',
    stock_quantity: product.stock_quantity,
    manage_stock: product.manage_stock || false,
    images: images.map((img: any) => ({
      id: img.id || 0,
      src: img.src || img.url || '',
      name: img.name || '',
      alt: img.alt || '',
    })),
    categories: categories.map((cat: any) => ({
      id: typeof cat === 'object' ? (cat.id || cat.woo_commerce_id) : cat,
      name: typeof cat === 'object' ? (cat.name || '') : '',
      slug: typeof cat === 'object' ? (cat.slug || '') : '',
    })),
    tags: tags.map((tag: any) => ({
      id: typeof tag === 'object' ? (tag.id || tag.woo_commerce_id) : tag,
      name: typeof tag === 'object' ? (tag.name || '') : '',
      slug: typeof tag === 'object' ? (tag.slug || '') : '',
    })),
    attributes: attributes.map((attr: any) => ({
      id: attr.id || 0,
      name: attr.name || '',
      options: Array.isArray(attr.options) ? attr.options : [],
    })),
    meta_data: meta_data.map((meta: any) => ({
      id: meta.id || 0,
      key: meta.key || '',
      value: meta.value || '',
    })),
    // Keep backend-specific fields for reference
    _backend_id: product.id,
    _pc_component_category: product.pc_component_category,
  };
}
