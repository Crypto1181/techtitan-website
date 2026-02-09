// Supabase Edge Function to proxy WooCommerce API calls
// This keeps API keys secure on the server side

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Get WooCommerce credentials from Supabase secrets
// These should be set in Supabase Dashboard > Project Settings > Edge Functions > Secrets
const WOOCOMMERCE_BASE_URL = Deno.env.get('WOOCOMMERCE_BASE_URL') || 'https://techtitanlb.com/wp-json/wc/v3';
const CONSUMER_KEY = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY') || Deno.env.get('VITE_WC_CONSUMER_KEY');
const CONSUMER_SECRET = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET') || Deno.env.get('VITE_WC_CONSUMER_SECRET');

interface FetchProductsParams {
  per_page?: number;
  page?: number;
  category?: number;
  search?: string;
  orderby?: 'date' | 'price' | 'popularity' | 'rating' | 'title';
  order?: 'asc' | 'desc';
  featured?: boolean;
  status?: 'publish' | 'draft' | 'pending';
}

const getAuthHeader = (): string => {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error('WooCommerce API credentials not configured');
  }
  const credentials = `${CONSUMER_KEY}:${CONSUMER_SECRET}`;
  return `Basic ${btoa(credentials)}`;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  // Set CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  try {
    // Check if credentials are configured
    if (!CONSUMER_KEY || !CONSUMER_SECRET) {
      console.error('WooCommerce credentials not configured in Edge Function secrets');
      return new Response(
        JSON.stringify({
          error: 'WooCommerce API credentials not configured. Please set WOOCOMMERCE_CONSUMER_KEY and WOOCOMMERCE_CONSUMER_SECRET in Supabase Edge Function secrets.'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const params: FetchProductsParams = await req.json().catch(() => ({}));

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

    // Extract total count from WooCommerce response headers
    const totalProducts = response.headers.get('X-WP-Total')
      ? parseInt(response.headers.get('X-WP-Total') || '0', 10)
      : undefined;
    const totalPages = response.headers.get('X-WP-TotalPages')
      ? parseInt(response.headers.get('X-WP-TotalPages') || '0', 10)
      : undefined;

    // Return products with metadata
    const responseData = {
      products: data,
      totalProducts,
      totalPages,
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Error in woocommerce-products function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error instanceof Error ? error.stack : String(error)
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});

