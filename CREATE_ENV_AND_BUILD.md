# 🚀 Quick Setup: Update Frontend for Render Backend

## Step 1: Get Your Render Backend URL

1. Go to https://dashboard.render.com
2. Click on your backend service
3. Copy the URL (e.g., `https://build-your-dream-pc-backend.onrender.com`)

## Step 2: Create .env.production File

**Location:** `Tecttian source/.env.production`

**Content:**
```env
VITE_BACKEND_API_URL=https://your-render-url.onrender.com/api
```

**Replace `your-render-url.onrender.com` with your actual Render URL!**

## Step 3: Run Build Script

**Option A: Use the automated script**
1. Go to `Tecttian source` folder
2. Double-click: `setup-and-build.bat`
3. Enter your Render URL when prompted
4. Wait for build to complete

**Option B: Manual commands**
1. Open Command Prompt in `Tecttian source` folder
2. Create `.env.production` file (see Step 2)
3. Run:
   ```cmd
   npm run build
   ```

## Step 4: Verify Build

After build completes:
- ✅ Check `dist` folder exists
- ✅ Check `dist/index.html` exists
- ✅ Check `dist/.htaccess` exists

## Step 5: Test Locally (Optional)

```cmd
npm run preview
```

Visit `http://localhost:4173` to test.

## Step 6: Deploy to Hostinger

Upload all files from `dist` folder to Hostinger's `public_html` folder.

---

## 📝 Example .env.production

If your Render URL is: `https://build-your-dream-pc-backend.onrender.com`

Then `.env.production` should be:
```env
VITE_BACKEND_API_URL=https://build-your-dream-pc-backend.onrender.com/api
```

**Important:** Keep `/api` at the end!
