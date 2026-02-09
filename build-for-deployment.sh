#!/bin/bash

# Build script for Hostinger deployment
# This script builds the project and lists what needs to be uploaded

echo "🔨 Building project..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Files to upload to Hostinger (public_html/):"
echo ""
echo "=== Root files ==="
ls -lh dist/*.{html,ico,txt,svg} 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'

echo ""
echo "=== Assets folder (upload entire folder) ==="
echo "  assets/"
ls -lh dist/assets/ 2>/dev/null | tail -n +2 | awk '{print "    " $9 " (" $5 ")"}'

echo ""
echo "📋 Instructions:"
echo "1. Delete old 'assets' folder on Hostinger"
echo "2. Upload all files from dist/ to public_html/"
echo "3. Upload entire assets/ folder to public_html/assets/"
echo "4. Clear browser cache (Ctrl+Shift+R)"
echo ""

