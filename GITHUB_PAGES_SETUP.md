# GitHub Pages Setup Instructions

## Step 1: Enable GitHub Pages in Repository Settings

1. Go to your repository: https://github.com/Crypto1181/techtitan-website
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - **Source**: `GitHub Actions`
5. Click **Save**

## Step 2: Build Your Project Locally

Run these commands to build your project:

```bash
cd "/home/programmer/Documents/my flutter project/build-your-dream-pc-main"
npm run build
```

This creates a `dist` folder with your built website.

## Step 3: Deploy Using GitHub Actions (After enabling Pages)

Once you enable GitHub Pages with GitHub Actions as the source, the workflow will automatically:
- Build your project
- Deploy it to GitHub Pages
- Give you a live URL

## Your Live Website URL Will Be:

After deployment completes, your site will be available at:
**https://crypto1181.github.io/techtitan-website/**

## Alternative: Manual Deployment (if Actions don't work)

If you prefer to deploy manually:

1. Build your project: `npm run build`
2. Create a `gh-pages` branch
3. Copy the `dist` folder contents to the root
4. Push to `gh-pages` branch
5. In Settings → Pages, select `gh-pages` branch

---

**Note**: The workflow file is already in your repository. Once you enable GitHub Pages with GitHub Actions as the source, it will automatically deploy on every push to `main`.

