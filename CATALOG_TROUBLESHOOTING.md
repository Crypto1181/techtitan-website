# 🔍 Product Catalog Troubleshooting Guide

## Issue: Nothing Showing on Product Catalog Page

### Quick Checks

1. **Open Browser Console (F12)**
   - Look for any red error messages
   - Check if you see: "Loading PDF from: /catalogs/peripherals-october-2025.pdf"
   - Check if you see: "PDF loaded successfully"

2. **Check Network Tab**
   - Look for requests to `/catalogs/peripherals-october-2025.pdf`
   - Check if it returns 200 (success) or 404 (not found)

3. **Verify PDF File**
   - File should be at: `public/catalogs/peripherals-october-2025.pdf`
   - File size: ~14.33 MB

### Common Issues

#### Issue 1: PDF Not Found (404)
**Symptoms:** Console shows 404 error for PDF file

**Fix:**
1. Verify PDF exists: `public/catalogs/peripherals-october-2025.pdf`
2. If missing, copy it from root folder:
   ```powershell
   Copy-Item "Peripherals - October 2025 (2).pdf" -Destination "public/catalogs/peripherals-october-2025.pdf"
   ```
3. Restart dev server

#### Issue 2: CORS Error
**Symptoms:** Console shows CORS error when loading PDF

**Fix:**
- PDFs in `public` folder should work without CORS issues
- If problem persists, check Vite config

#### Issue 3: PDF.js Worker Error
**Symptoms:** Console shows worker loading error

**Fix:**
- Worker is loaded from CDN, should work automatically
- Check internet connection

#### Issue 4: Large PDF Taking Too Long
**Symptoms:** Page stays on "Loading..." for a long time

**Fix:**
- 14.33 MB PDF with many pages takes time to convert
- Wait 30-60 seconds for conversion
- Check console for progress messages

#### Issue 5: Flipbook Component Not Rendering
**Symptoms:** Pages converted but flipbook doesn't show

**Fix:**
- Check if `react-pageflip` is installed: `npm list react-pageflip`
- If missing: `npm install react-pageflip`
- Restart dev server

### Debug Steps

1. **Check Console Logs:**
   ```
   ProductCatalog State: { loading: true/false, error: null/string, ... }
   Loading PDF from: /catalogs/peripherals-october-2025.pdf
   PDF loaded successfully. Pages: X
   Converting page 1 of X...
   ```

2. **Check Page State:**
   - Look at the status text below the title
   - Should show: "Loading...", "Error", or "Loaded X pages"

3. **Test PDF Directly:**
   - Try opening: `http://localhost:8080/catalogs/peripherals-october-2025.pdf`
   - Should open PDF in browser

### Fallback Solution

If flipbook doesn't work, the page now shows a direct PDF viewer (iframe) as fallback when there's an error.

### Still Not Working?

1. **Clear browser cache** (Ctrl+Shift+R)
2. **Restart dev server**
3. **Check terminal for errors**
4. **Share console errors** for further debugging
