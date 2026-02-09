# Setting Up Supabase Secrets

Now that your Supabase project is configured, you need to set the WooCommerce API credentials as secrets in Supabase.

## Option 1: Using Supabase CLI (Recommended)

```bash
# Make sure you're logged in
supabase login

# Link your project (if not already linked)
supabase link --project-ref iouqceslbovrdiuuhscf

# Set the WooCommerce API secrets
supabase secrets set WOOCOMMERCE_CONSUMER_KEY=ck_3c459d9a2e83fdd9a29a646cbc23da920e0eef8a
supabase secrets set WOOCOMMERCE_CONSUMER_SECRET=cs_09a9e2fe3e8f5ddb96b7fa4877c976316834b9e4
supabase secrets set WOOCOMMERCE_BASE_URL=https://techtitan-lb.com/wp-json/wc/v3
```

## Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add the following secrets:
   - **Name**: `WOOCOMMERCE_CONSUMER_KEY`
     **Value**: `ck_3c459d9a2e83fdd9a29a646cbc23da920e0eef8a`
   
   - **Name**: `WOOCOMMERCE_CONSUMER_SECRET`
     **Value**: `cs_09a9e2fe3e8f5ddb96b7fa4877c976316834b9e4`
   
   - **Name**: `WOOCOMMERCE_BASE_URL`
     **Value**: `https://techtitan-lb.com/wp-json/wc/v3`

## Deploy Edge Functions

After setting secrets, deploy the functions:

```bash
# Deploy all functions at once
supabase functions deploy

# Or deploy individually
supabase functions deploy woocommerce-products
supabase functions deploy woocommerce-product
supabase functions deploy woocommerce-categories
```

## Verify Setup

1. Check that secrets are set:
   ```bash
   supabase secrets list
   ```

2. Test a function:
   ```bash
   supabase functions serve woocommerce-products
   ```

3. Check function logs:
   ```bash
   supabase functions logs woocommerce-products
   ```

## Your Project Details

- **Project ID**: `iouqceslbovrdiuuhscf`
- **Project URL**: `https://iouqceslbovrdiuuhscf.supabase.co`
- **Anon Key**: Already configured in `.env`

## Next Steps

Once secrets are set and functions are deployed:
1. Your React app will automatically use Supabase Edge Functions
2. API keys will be secure on the server
3. No code changes needed!

