import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  product_id: number;
  quantity: number;
  name: string;
  price: number;
}

interface BillingAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

interface ShippingAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  postcode: string;
  country: string;
}

interface CreateOrderData {
  billing: BillingAddress;
  shipping: ShippingAddress;
  line_items: OrderItem[];
  payment_method: string;
  payment_method_title: string;
  customer_note?: string;
  set_paid: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get WooCommerce credentials from environment variables (Supabase secrets)
    const WOOCOMMERCE_BASE_URL = Deno.env.get('WOOCOMMERCE_BASE_URL') || 'https://techtitanlb.com/wp-json/wc/v3';
    const CONSUMER_KEY = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
    const CONSUMER_SECRET = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');

    if (!CONSUMER_KEY || !CONSUMER_SECRET) {
      return new Response(
        JSON.stringify({ error: 'WooCommerce credentials not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get order data from request body
    const orderData: CreateOrderData = await req.json();

    // Create basic auth header
    const credentials = `${CONSUMER_KEY}:${CONSUMER_SECRET}`;
    const authHeader = `Basic ${btoa(credentials)}`;

    // Create order in WooCommerce
    const response = await fetch(`${WOOCOMMERCE_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...orderData,
        status: 'pending', // Order status: pending, processing, on-hold, completed, cancelled, refunded, failed
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('WooCommerce API error:', errorData);
      return new Response(
        JSON.stringify({ error: errorData.message || `HTTP error! status: ${response.status}` }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const order = await response.json();

    return new Response(
      JSON.stringify(order),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

