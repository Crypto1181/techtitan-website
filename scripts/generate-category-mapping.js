/**
 * Script to generate complete category mapping from WooCommerce API
 * Run this to regenerate category mappings when WooCommerce categories change
 */

const WOOCOMMERCE_BASE_URL = 'https://techtitanlb.com/wp-json/wc/v3';
const CONSUMER_KEY = 'ck_483ec3eded8f44b515a0ad930c4c1c9bfa3bd334';
const CONSUMER_SECRET = 'cs_e6d57c833bfa11e3bc54772193dd193acc037950';
const authHeader = 'Basic ' + Buffer.from(CONSUMER_KEY + ':' + CONSUMER_SECRET).toString('base64');

async function generateCategoryMapping() {
  try {
    console.log('Fetching all WooCommerce categories...\n');
    
    // Fetch ALL categories with pagination
    let allCategories = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(`${WOOCOMMERCE_BASE_URL}/products/categories?per_page=100&page=${page}`, {
        headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' }
      });
      const categories = await response.json();
      allCategories.push(...categories);
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);
      hasMore = page < totalPages;
      page++;
    }

    console.log(`Found ${allCategories.length} total categories\n`);

    // Create parent map
    const parentMap = new Map();
    allCategories.forEach(cat => parentMap.set(cat.id, cat));

    // Generate comprehensive mapping
    const categorySlugMap = new Map();
    const categoryIdMap = new Map(); // For reverse lookup

    allCategories.forEach(cat => {
      const slug = cat.slug;
      const name = cat.name;
      const id = cat.id;
      const count = cat.count;
      const parent = cat.parent ? parentMap.get(cat.parent) : null;
      
      // Store ID mapping
      categoryIdMap.set(id, { slug, name, count, parent: parent ? parent.slug : null });
      
      // Generate all possible keys for this category
      const keys = new Set();
      
      // Add slug itself
      keys.add(slug);
      
      // Add name variations
      const nameLower = name.toLowerCase();
      const nameHyphenated = nameLower.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
      const nameSpaced = nameLower.replace(/[^a-z0-9\s]/g, '');
      
      keys.add(nameHyphenated);
      if (nameSpaced !== nameHyphenated) {
        keys.add(nameSpaced);
      }
      
      // Add common variations
      if (nameLower.includes('&')) {
        keys.add(nameLower.replace(/&/g, 'and').replace(/\s+/g, '-'));
        keys.add(nameLower.replace(/&/g, 'and').replace(/\s+/g, ' '));
      }
      
      // Add plural/singular variations for common words
      if (nameLower.endsWith('s') && nameLower.length > 1) {
        keys.add(nameLower.slice(0, -1));
        keys.add(nameHyphenated.slice(0, -1));
      } else if (!nameLower.endsWith('s')) {
        keys.add(nameLower + 's');
        keys.add(nameHyphenated + 's');
      }
      
      // For each key, add this category's slug
      keys.forEach(key => {
        if (!categorySlugMap.has(key)) {
          categorySlugMap.set(key, []);
        }
        if (!categorySlugMap.get(key).includes(slug)) {
          categorySlugMap.get(key).push(slug);
        }
      });
    });

    // Generate TypeScript code
    const output = `/**
 * AUTO-GENERATED CATEGORY MAPPING
 * Generated from WooCommerce API - DO NOT EDIT MANUALLY
 * Run: node scripts/generate-category-mapping.js
 * Last updated: ${new Date().toISOString()}
 */

export const categorySlugMap: Record<string, string[]> = {
${Array.from(categorySlugMap.entries())
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([key, slugs]) => {
    const primaryCat = allCategories.find(c => c.slug === slugs[0]);
    const count = primaryCat ? primaryCat.count : '?';
    const name = primaryCat ? primaryCat.name : 'Unknown';
    return `  '${key}': [${slugs.map(s => `'${s}'`).join(', ')}], // ${name} (${count} products)`;
  })
  .join('\n')}
};

// Category ID to Slug mapping for quick lookups
export const categoryIdToSlug: Record<number, string> = {
${Array.from(categoryIdMap.entries())
  .sort((a, b) => a[0] - b[0])
  .map(([id, info]) => `  ${id}: '${info.slug}', // ${info.name} (${info.count} products)`)
  .join('\n')}
};

// Category metadata
export const categoryMetadata: Record<string, { id: number; name: string; count: number; parent?: string }> = {
${allCategories
  .sort((a, b) => a.slug.localeCompare(b.slug))
  .map(cat => {
    const parent = cat.parent ? parentMap.get(cat.parent) : null;
    return `  '${cat.slug}': { id: ${cat.id}, name: '${cat.name.replace(/'/g, "\\'")}', count: ${cat.count}${parent ? `, parent: '${parent.slug}'` : ''} },`;
  })
  .join('\n')}
};
`;

    // Write to file
    const fs = await import('fs');
    fs.writeFileSync('src/data/woocommerce-categories.ts', output);
    
    console.log('✓ Generated category mapping file: src/data/woocommerce-categories.ts');
    console.log(`✓ Mapped ${categorySlugMap.size} category keys to ${allCategories.length} WooCommerce categories\n`);
    
    // Print summary
    console.log('=== CATEGORY SUMMARY ===');
    console.log(`Total categories: ${allCategories.length}`);
    console.log(`Root categories (no parent): ${allCategories.filter(c => !c.parent || c.parent === 0).length}`);
    console.log(`Child categories: ${allCategories.filter(c => c.parent && c.parent !== 0).length}`);
    console.log(`Total products across all categories: ${allCategories.reduce((sum, c) => sum + c.count, 0)}`);
    
  } catch (error) {
    console.error('Error generating category mapping:', error);
    process.exit(1);
  }
}

generateCategoryMapping();

