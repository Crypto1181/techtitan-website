# 🚀 Hostinger Deployment Guide

## Build Output Location
The production build is located in: `dist/` folder

## Files to Upload to Hostinger

Upload **ALL contents** of the `dist/` folder to your Hostinger hosting:

### Required Files:
- ✅ `index.html` - Main HTML file
- ✅ `assets/` folder - All CSS, JS, and image files
- ✅ `.htaccess` - For React Router (SPA routing)
- ✅ `catalogs/` folder - PDF catalog files (if exists)

## Deployment Steps

### Option 1: Using File Manager (Recommended)

1. **Login to Hostinger hPanel**
   - Go to your Hostinger account
   - Navigate to **File Manager**

2. **Navigate to Public HTML**
   - Go to `public_html` folder (or your domain's root folder)

3. **Backup Existing Files** (if any)
   - Create a backup folder: `backup_YYYYMMDD`
   - Move existing files there

4. **Upload Files**
   - Upload **ALL files** from the `dist/` folder
   - Make sure `.htaccess` is uploaded (it's a hidden file)
   - Upload the entire `assets/` folder
   - Upload `catalogs/` folder if it exists

5. **Verify .htaccess**
   - Make sure `.htaccess` file is in the root (public_html)
   - If it's missing, create it with this content:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

6. **Set Permissions** (if needed)
   - `.htaccess` should have 644 permissions
   - Folders should have 755 permissions
   - Files should have 644 permissions

### Option 2: Using FTP (FileZilla, WinSCP, etc.)

1. **Connect to Hostinger FTP**
   - Host: `ftp.yourdomain.com` or IP address
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (or 22 for SFTP)

2. **Navigate to public_html**
   - Connect and go to `public_html` folder

3. **Upload Files**
   - Upload all files from `dist/` folder
   - Make sure to show hidden files to see `.htaccess`
   - Upload folders recursively

### Option 3: Using Git (if you have SSH access)

```bash
# SSH into your Hostinger server
ssh username@yourdomain.com

# Navigate to public_html
cd public_html

# Pull from your repository (if you have one)
git pull origin main

# Or manually copy files
# Use scp or rsync to copy dist/ contents
```

## Post-Deployment Checklist

- [ ] Website loads at your domain
- [ ] All pages work (Products, Catalog, etc.)
- [ ] Images load correctly
- [ ] PDF catalog loads at `/catalog`
- [ ] React Router works (try navigating to different pages)
- [ ] No 404 errors in browser console
- [ ] Mobile view works

## Troubleshooting

### Issue: 404 Errors on Page Refresh
**Solution:** Make sure `.htaccess` is uploaded and in the root folder

### Issue: Assets Not Loading
**Solution:** 
- Check that `assets/` folder is uploaded
- Verify file paths in browser console
- Clear browser cache (Ctrl+Shift+R)

### Issue: PDF Catalog Not Showing
**Solution:**
- Verify `catalogs/peripherals-october-2025.pdf` exists in `public_html/catalogs/`
- Check file permissions (should be 644)

### Issue: CORS Errors
**Solution:**
- If using Supabase, check environment variables
- If using WooCommerce API, ensure CORS is configured on the WordPress site

## Environment Variables (if needed)

If your app uses environment variables, you may need to:
1. Create a `.env` file in the root (if supported)
2. Or configure them in Hostinger's environment settings
3. Or hardcode them in the build (not recommended for sensitive data)

## Build Command

To rebuild after changes:
```bash
cd "Tecttian source"
node node_modules\vite\bin\vite.js build
```

Then upload the new `dist/` folder contents.

## Quick Upload Script (PowerShell)

```powershell
# Navigate to dist folder
cd "Tecttian source\dist"

# Use FTP or SCP to upload
# Example with WinSCP or FileZilla
# Or use Hostinger's File Manager web interface
```

---

**Note:** The build is optimized for production with:
- Minified JavaScript and CSS
- Code splitting
- Optimized assets
- Production-ready configuration
