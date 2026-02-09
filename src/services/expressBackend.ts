import axios from 'axios';
import type { WooCommerceProduct } from '@/types/woocommerce';

// Get API base URL from environment or use default
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://build-your-dream-pc-backend.onrender.com/api';

export interface FetchProductsParams {
    per_page?: number;
    page?: number;
    category?: number;
    search?: string;
    pc_category?: string;
    orderby?: string;
    order?: string;
}

export interface FetchProductsResult {
    products: WooCommerceProduct[];
    total: number;
    totalPages: number;
    page: number;
    perPage: number;
}

/**
 * Express Backend Service
 * Replaces Supabase for product fetching
 */
class ExpressBackendService {
    private client = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    constructor() {
        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('Express API Error:', error.message);
                if (error.response) {
                    console.error('Response data:', error.response.data);
                    console.error('Response status:', error.response.status);
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Fetch products from Express API (cached in PostgreSQL)
     */
    async fetchProducts(params: FetchProductsParams = {}): Promise<FetchProductsResult> {
        try {
            const response = await this.client.get('/products', { params });
            return response.data;
        } catch (error: any) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    /**
     * Fetch a single product by ID
     */
    async fetchProductById(id: number | string): Promise<WooCommerceProduct> {
        try {
            const response = await this.client.get(`/products/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }

    /**
     * Fetch all products (paginated automatically)
     */
    async fetchAllProducts(params: Omit<FetchProductsParams, 'page' | 'per_page'> = {}): Promise<WooCommerceProduct[]> {
        const allProducts: WooCommerceProduct[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            try {
                const result = await this.fetchProducts({
                    ...params,
                    page,
                    per_page: 100,
                });

                allProducts.push(...result.products);

                if (page >= result.totalPages || result.products.length === 0) {
                    hasMore = false;
                } else {
                    page++;
                }
            } catch (error) {
                console.error(`Error fetching page ${page}:`, error);
                hasMore = false;
            }
        }

        return allProducts;
    }

    /**
     * Fetch products directly from WooCommerce (bypass cache)
     */
    async fetchWooCommerceProducts(params: FetchProductsParams = {}): Promise<FetchProductsResult> {
        try {
            const response = await this.client.get('/woocommerce/products', { params });
            return response.data;
        } catch (error: any) {
            console.error('Error fetching from WooCommerce:', error);
            throw error;
        }
    }

    /**
     * Fetch categories
     */
    async fetchCategories(): Promise<any[]> {
        try {
            const response = await this.client.get('/categories');
            return response.data;
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    /**
     * Trigger manual product sync
     */
    async syncProducts(): Promise<{ success: boolean; synced: number; message: string }> {
        try {
            const response = await this.client.post('/sync/products');
            return response.data;
        } catch (error: any) {
            console.error('Error syncing products:', error);
            throw error;
        }
    }

    /**
     * Check backend health
     */
    async checkHealth(): Promise<{ status: string; timestamp: string; environment: string }> {
        try {
            const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
            return response.data;
        } catch (error: any) {
            console.error('Error checking health:', error);
            throw error;
        }
    }

    /**
     * Fetch site settings
     */
    async fetchSettings(): Promise<Record<string, string>> {
        try {
            const response = await this.client.get('/settings');
            return response.data;
        } catch (error: any) {
            console.error('Error fetching settings:', error);
            // Return empty object instead of throwing to avoid breaking UI
            return {};
        }
    }

    /**
     * Update a setting
     */
    async updateSetting(key: string, value: string): Promise<any> {
        try {
            const response = await this.client.post('/settings', { key, value });
            return response.data;
        } catch (error: any) {
            console.error(`Error updating setting ${key}:`, error);
            throw error;
        }
    }
}

// Singleton instance
export const expressBackend = new ExpressBackendService();

// Export convenience functions
export const fetchProducts = (params?: FetchProductsParams) => expressBackend.fetchProducts(params);
export const fetchAllProducts = (params?: Omit<FetchProductsParams, 'page' | 'per_page'>) =>
    expressBackend.fetchAllProducts(params);
export const fetchProductById = (id: number | string) => expressBackend.fetchProductById(id);
export const fetchCategories = () => expressBackend.fetchCategories();
export const syncProducts = () => expressBackend.syncProducts();
export const checkBackendHealth = () => expressBackend.checkHealth();
export const fetchSettings = () => expressBackend.fetchSettings();
export const updateSetting = (key: string, value: string) => expressBackend.updateSetting(key, value);
