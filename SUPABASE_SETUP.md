# Supabase Edge Functions Setup Guide

## Why Use Supabase Edge Functions?

Supabase Edge Functions solve CORS issues by:
- Running on the server side (no CORS restrictions)
- Keeping API keys secure (not exposed to client)
- Providing a reliable proxy to WooCommerce API

## Step 1: Set Up Supabase Secrets

1. Go to your Supabase Dashboard
2. Navigate to: **Project Settings** → **Edge Functions** → **Secrets**
3. Add the following secrets (you already have them based on your screenshot):

   ```
   WOOCOMMERCE_BASE_URL = https://techtitanlb.com/wp-json/wc/v3
   WOOCOMMERCE_CONSUMER_KEY = ck_483ec3eded8f44b515a0ad930c4c1c9bfa3bd334
   WOOCOMMERCE_CONSUMER_SECRET = cs_e6d57c833bfa11e3bc54772193dd193acc037950
   ```

## Step 2: Deploy Edge Functions

You need to deploy the Edge Functions to Supabase. You can do this via:

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy all functions
supabase functions deploy woocommerce-products
supabase functions deploy woocommerce-categories
supabase functions deploy woocommerce-product
```

### Option B: Using Supabase Dashboard

1. Go to **Edge Functions** in your Supabase Dashboard
2. Click **Create a new function**
3. For each function:
   - **woocommerce-products**: Copy content from `supabase/functions/woocommerce-products/index.ts`
   - **woocommerce-categories**: Copy content from `supabase/functions/woocommerce-categories/index.ts`
   - **woocommerce-product**: Copy content from `supabase/functions/woocommerce-product/index.ts`

## Step 3: Verify Functions Are Working

After deployment, test the functions:

1. Go to **Edge Functions** → **woocommerce-products**
2. Click **Invoke** and use this test body:
   ```json
   {
     "per_page": 10,
     "page": 1
   }
   ```
3. You should see products returned

## Step 4: Update Your Environment Variables

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### If functions return errors:
1. Check that secrets are set correctly in Supabase Dashboard
2. Verify the function code is deployed
3. Check function logs in Supabase Dashboard → Edge Functions → Logs

### If CORS errors persist:
- Supabase Edge Functions should handle CORS automatically
- Check that functions are deployed and accessible
- Verify your Supabase project URL and anon key are correct

### If products still don't load:
- Check browser console for specific error messages
- Verify Supabase functions are being called (check Network tab)
- Make sure secrets match your WooCommerce credentials
