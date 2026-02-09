# Category Mapping System

## Automatic Category Sync with WooCommerce

The category mapping is now **automatically generated** from your WooCommerce store. This means:

✅ **No more manual updates needed**  
✅ **Always in sync with WooCommerce**  
✅ **Handles all 147 categories automatically**  
✅ **Includes all variations (singular, plural, spaces, hyphens)**

## How It Works

1. **Auto-Generated Mapping**: The file `src/data/woocommerce-categories.ts` is automatically generated from your WooCommerce API
2. **Comprehensive Coverage**: Maps 514+ category keys to 147 WooCommerce categories
3. **Automatic Variations**: Handles singular/plural, spaces/hyphens, and common name variations

## Updating Categories

When you add, remove, or rename categories in WooCommerce:

1. **Run the generator script**:
   ```bash
   node scripts/generate-category-mapping.js
   ```

2. **Rebuild the app**:
   ```bash
   npm run build
   ```

That's it! The mapping will automatically include all your WooCommerce categories.

## What Gets Mapped

The script automatically creates mappings for:
- Category slugs (e.g., `tv-accessories`)
- Category names (e.g., `TV Accessories`)
- Hyphenated variations (e.g., `tv-accessories`)
- Spaced variations (e.g., `tv accessories`)
- Singular/plural forms (e.g., `usb-drive` and `usb-drives`)
- Common name variations

## Files

- **`scripts/generate-category-mapping.js`**: Script that fetches categories from WooCommerce and generates the mapping
- **`src/data/woocommerce-categories.ts`**: Auto-generated mapping file (DO NOT EDIT MANUALLY)
- **`src/pages/Products.tsx`**: Uses the generated mapping for category resolution

## Troubleshooting

If categories are showing wrong products:

1. **Regenerate the mapping**:
   ```bash
   node scripts/generate-category-mapping.js
   ```

2. **Check the generated file**:
   ```bash
   cat src/data/woocommerce-categories.ts | head -50
   ```

3. **Rebuild and redeploy**:
   ```bash
   npm run build
   ```

The system will automatically pick up any changes in your WooCommerce categories!

