# WooCommerce Setup Guide for Both Websites

## How to Access WordPress Admin Panel

### For techtitanlb.com (First Website)

1. **Access the WordPress Admin Panel:**
   - Go to: `https://techtitanlb.com/wp-admin/` or `https://techtitanlb.com/wp-login.php`
   - **Email:** `techtitanstore257@gmail.com`
   - **Password:** `peqeJBV7k64%z%npj9GKqF7W`

2. **Get WooCommerce API Credentials:**
   - Once logged in, go to: **WooCommerce → Settings → Advanced → REST API**
   - Click **"Add Key"** button
   - **Description:** "React App Integration"
   - **User:** Select your admin user
   - **Permissions:** Select **"Read"** (or "Read/Write" if you need to update products)
   - Click **"Generate API Key"**
   - **IMPORTANT:** Copy both the **Consumer Key** and **Consumer Secret** immediately (you won't be able to see them again!)

### For techtitan-lb.com (Second Website - Already Set Up)

- **URL:** `https://techtitan-lb.com/wp-admin/`
- **Email:** `to.mouna.rouh@gmail.com`
- **Password:** `eahxBo$zpAnuWUumbyN)u^hl`
- **Current API Credentials:** Already configured in the app

## Setting Up Multiple WooCommerce Sites

The app will be updated to support both websites. You'll need to:

1. **Get API credentials from techtitanlb.com** (follow steps above)
2. **Provide the credentials** so I can add them to the app
3. **Products from both sites will be combined** and displayed together

## What You Need to Provide

After getting the API credentials from techtitanlb.com, please provide:

1. **Consumer Key** (starts with `ck_...`)
2. **Consumer Secret** (starts with `cs_...`)

These will be added to the Supabase secrets (secure storage) so your app can fetch products from both websites.

## Notes

- The WordPress admin panel is where you manage all your products, orders, and settings
- WooCommerce REST API allows the React app to fetch product data securely
- Both websites will be queried and products will be merged together
- Products will be deduplicated if they have the same SKU or name

