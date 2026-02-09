# Quick Start: Supabase Backend

## 🚀 Quick Setup (5 minutes)

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com) → New Project
- Copy your **Project URL** and **anon key** from Settings → API

### 2. Set Environment Variables

Create `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Install Supabase CLI
```bash
npm install -g supabase
supabase login
```

### 4. Link & Deploy
```bash
# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets (your WooCommerce API keys)
supabase secrets set WOOCOMMERCE_CONSUMER_KEY=ck_3c459d9a2e83fdd9a29a646cbc23da920e0eef8a
supabase secrets set WOOCOMMERCE_CONSUMER_SECRET=cs_09a9e2fe3e8f5ddb96b7fa4877c976316834b9e4
supabase secrets set WOOCOMMERCE_BASE_URL=https://techtitan-lb.com/wp-json/wc/v3

# Deploy functions
supabase functions deploy
```

### 5. Test
```bash
npm run dev
```

## ✅ What's Working Now

- ✅ **Secure API calls** - Keys stay on server
- ✅ **Automatic fallback** - Works even if Supabase isn't configured (uses direct WooCommerce)
- ✅ **Edge Functions** - Fast, global CDN
- ✅ **No code changes needed** - Your React app automatically uses Supabase when configured

## 📝 Current Status

The app will:
1. **Try Supabase first** (if configured)
2. **Fall back to direct WooCommerce** (if Supabase not available)

This means you can test immediately, then set up Supabase when ready!

## 🔒 Security Note

For production, **always use Supabase**. Direct WooCommerce calls expose your API keys in the browser.

## 📚 Full Documentation

See `SUPABASE_SETUP.md` for detailed instructions.

