import { supabase } from '@/lib/supabase';

export interface OrderItem {
  product_id: number;
  quantity: number;
  name: string;
  price: number;
}

export interface BillingAddress {
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

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  postcode: string;
  country: string;
}

export interface CreateOrderData {
  billing: BillingAddress;
  shipping: ShippingAddress;
  line_items: OrderItem[];
  payment_method: string;
  payment_method_title: string;
  customer_note?: string;
  set_paid: boolean;
}

export interface WooCommerceOrder {
  id: number;
  status: string;
  currency: string;
  total: string;
  billing: BillingAddress;
  shipping: ShippingAddress;
  line_items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: string;
  }>;
}

// Check if Supabase is configured
const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && url.length > 0 && key.length > 0);
};

/**
 * Create an order in WooCommerce
 */
export const createOrder = async (orderData: CreateOrderData): Promise<WooCommerceOrder> => {
  // Try Supabase Edge Function first
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.functions.invoke('woocommerce-create-order', {
        body: orderData,
      });

      if (error) {
        console.error('Supabase function error:', error);
        // If function doesn't exist or isn't accessible, fall through to direct API
        if (error.message?.includes('Function not found') || 
            error.message?.includes('Failed to send') ||
            error.message?.includes('Edge Function')) {
          console.warn('Supabase Edge Function not available, falling back to direct API');
        } else {
          throw new Error(error.message || 'Failed to create order');
        }
      } else if (data && data.id) {
        console.log(`✓ Order created successfully: #${data.id}`);
        return data;
      } else if (data && !data.id) {
        // Invalid response, try fallback
        console.warn('Invalid response from Supabase function, falling back to direct API');
      }
    } catch (error: any) {
      console.error('Error creating order via Supabase:', error);
      // If it's a network/function error, try fallback
      if (error.message?.includes('Failed to send') || 
          error.message?.includes('Function not found') ||
          error.message?.includes('Edge Function')) {
        console.warn('Supabase Edge Function error, falling back to direct API');
      } else {
        // Re-throw other errors
        throw error;
      }
    }
  }

  // Fallback to direct API call (using same pattern as woocommerce.ts)
  const WOOCOMMERCE_BASE_URL = 'https://techtitanlb.com/wp-json/wc/v3';
  const CONSUMER_KEY = import.meta.env.VITE_WC_CONSUMER_KEY || 'ck_483ec3eded8f44b515a0ad930c4c1c9bfa3bd334';
  const CONSUMER_SECRET = import.meta.env.VITE_WC_CONSUMER_SECRET || 'cs_e6d57c833bfa11e3bc54772193dd193acc037950';

  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error('WooCommerce credentials not configured. Please set VITE_WC_CONSUMER_KEY and VITE_WC_CONSUMER_SECRET in your environment variables.');
  }

  try {
    const credentials = `${CONSUMER_KEY}:${CONSUMER_SECRET}`;
    const authHeader = `Basic ${btoa(credentials)}`;

    console.log('Creating order via direct WooCommerce API...');
    const response = await fetch(`${WOOCOMMERCE_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...orderData,
        status: 'pending', // Order status
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.code || `HTTP error! status: ${response.status}`;
      console.error('WooCommerce API error:', errorData);
      throw new Error(errorMessage);
    }

    const order = await response.json();
    console.log(`✓ Order created successfully: #${order.id}`);
    return order;
  } catch (error: any) {
    console.error('Error creating order:', error);
    // Provide more helpful error message
    if (error.message?.includes('CORS') || error.message?.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection and try again. If the problem persists, the Supabase Edge Function may need to be deployed.');
    }
    throw new Error(error.message || 'Failed to create order. Please try again.');
  }
};

export interface WhatsAppOrderData {
  orderId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  notes?: string;
}

/**
 * Send order information to WhatsApp
 * Creates a WhatsApp link with pre-filled message containing order details
 */
export const sendOrderToWhatsApp = async (orderData: WhatsAppOrderData): Promise<void> => {
  const whatsappNumber = '96176653008'; // Lebanon WhatsApp number

  // Build order summary message
  const itemsList = orderData.items
    .map((item) => `• ${item.name} × ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`)
    .join('\n');

  const message = `🛒 *New Order Received*

*Order #${orderData.orderId}*

*Customer Information:*
👤 Name: ${orderData.customerName}
📞 Phone: ${orderData.customerPhone}
📧 Email: ${orderData.customerEmail}
📍 Address: ${orderData.customerAddress}

*Order Items:*
${itemsList}

*Total: $${orderData.total.toFixed(2)}*

${orderData.notes ? `*Notes:*\n${orderData.notes}\n\n` : ''}
Please contact the customer on WhatsApp to confirm the order and delivery details.`;

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // Create WhatsApp link
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  // Open WhatsApp in new tab/window
  // This will open WhatsApp Web or the app with the message pre-filled
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

  console.log('Order information sent to WhatsApp:', {
    orderId: orderData.orderId,
    customerName: orderData.customerName,
    whatsappUrl,
  });
};

