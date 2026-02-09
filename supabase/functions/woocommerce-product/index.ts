// Supabase Edge Function to fetch a single product by ID

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Get WooCommerce credentials from Supabase secrets
// These should be set in Supabase Dashboard > Project Settings > Edge Functions > Secrets
const WOOCOMMERCE_BASE_URL = Deno.env.get('WOOCOMMERCE_BASE_URL') || 'https://techtitanlb.com/wp-json/wc/v3';
const CONSUMER_KEY = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY') || Deno.env.get('VITE_WC_CONSUMER_KEY');
const CONSUMER_SECRET = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET') || Deno.env.get('VITE_WC_CONSUMER_SECRET');

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
    const { id } = await req.json();

    if (!id) {
      throw new Error('Product ID is required');
    }

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

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Error in woocommerce-product function:', error);
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

