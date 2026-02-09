/**
 * Script to fetch ALL WooCommerce categories and create a complete mapping
 * This will help us fix all category issues at once
 * Uses Node.js built-in fetch (Node 18+)
 */

const WOOCOMMERCE_BASE_URL = 'https://techtitanlb.com/wp-json/wc/v3';
const CONSUMER_KEY = 'ck_483ec3eded8f44b515a0ad930c4c1c9bfa3bd334';
const CONSUMER_SECRET = 'cs_e6d57c833bfa11e3bc54772193dd193acc037950';

const authHeader = 'Basic ' + Buffer.from(CONSUMER_KEY + ':' + CONSUMER_SECRET).toString('base64');

async function fetchAllCategories() {
  try {
    console.log('Fetching all WooCommerce categories...\n');
    
    const response = await fetch(`${WOOCOMMERCE_BASE_URL}/products/categories?per_page=100`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const categories = await response.json();
    
    console.log(`Found ${categories.length} total categories\n`);
    console.log('='.repeat(80));
    console.log('COMPLETE CATEGORY LIST WITH MAPPINGS');
    console.log('='.repeat(80));
    console.log('\n');
    
    // Group by parent
    const rootCategories = categories.filter(c => !c.parent || c.parent === 0);
    const childCategories = categories.filter(c => c.parent && c.parent !== 0);
    
    // Create parent lookup
    const parentMap = new Map();
    categories.forEach(cat => {
      parentMap.set(cat.id, cat);
    });
    
    console.log('ROOT CATEGORIES (No Parent):');
    console.log('-'.repeat(80));
    rootCategories.forEach(cat => {
      const children = childCategories.filter(c => c.parent === cat.id);
      console.log(`ID: ${cat.id.toString().padEnd(6)} | Slug: "${cat.slug}" | Name: "${cat.name}" | Count: ${cat.count}`);
      if (children.length > 0) {
        children.forEach(child => {
          console.log(`  └─ ID: ${child.id.toString().padEnd(4)} | Slug: "${child.slug}" | Name: "${child.name}" | Count: ${child.count}`);
        });
      }
    });
    
    console.log('\n');
    console.log('ALL CATEGORIES (Flat List for Mapping):');
    console.log('-'.repeat(80));
    categories.forEach(cat => {
      const parent = cat.parent ? parentMap.get(cat.parent) : null;
      const parentInfo = parent ? ` | Parent: "${parent.name}" (${parent.slug})` : '';
      console.log(`ID: ${cat.id.toString().padEnd(6)} | Slug: "${cat.slug}" | Name: "${cat.name}" | Count: ${cat.count}${parentInfo}`);
    });
    
    console.log('\n');
    console.log('='.repeat(80));
    console.log('CATEGORY MAPPING SUGGESTIONS');
    console.log('='.repeat(80));
    console.log('\n');
    console.log('// Add these to categorySlugMap in Products.tsx:');
    console.log('const categorySlugMap: Record<string, string[]> = {');
    
    // Generate mapping suggestions
    categories.forEach(cat => {
      const slug = cat.slug;
      const name = cat.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
      const nameWithSpace = cat.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
      
      // Only suggest if slug is different from name
      if (slug !== name && slug !== nameWithSpace) {
        console.log(`  '${name}': ['${slug}'], // ${cat.name} (${cat.count} products)`);
        if (nameWithSpace !== name) {
          console.log(`  '${nameWithSpace}': ['${slug}'], // ${cat.name} (space variation)`);
        }
      }
    });
    
    console.log('};');
    
    console.log('\n');
    console.log('='.repeat(80));
    console.log('STORAGE-RELATED CATEGORIES (for external ssd fix):');
    console.log('='.repeat(80));
    const storageCategories = categories.filter(cat => 
      cat.slug.includes('storage') || 
      cat.slug.includes('ssd') || 
      cat.slug.includes('hdd') || 
      cat.slug.includes('nvme') ||
      cat.name.toLowerCase().includes('storage') ||
      cat.name.toLowerCase().includes('ssd') ||
      cat.name.toLowerCase().includes('hdd')
    );
    storageCategories.forEach(cat => {
      const parent = cat.parent ? parentMap.get(cat.parent) : null;
      console.log(`ID: ${cat.id} | Slug: "${cat.slug}" | Name: "${cat.name}" | Count: ${cat.count}${parent ? ` | Parent: ${parent.name}` : ''}`);
    });
    
    console.log('\n');
    console.log('='.repeat(80));
    console.log('RAM CATEGORIES:');
    console.log('='.repeat(80));
    const ramCategories = categories.filter(cat => 
      cat.slug.includes('ram') || 
      cat.name.toLowerCase().includes('ram') || 
      cat.name.toLowerCase().includes('memory')
    );
    ramCategories.forEach(cat => {
      const parent = cat.parent ? parentMap.get(cat.parent) : null;
      console.log(`ID: ${cat.id} | Slug: "${cat.slug}" | Name: "${cat.name}" | Count: ${cat.count}${parent ? ` | Parent: ${parent.name} (ID: ${parent.id})` : ''}`);
    });
    
    console.log('\n');
    console.log('='.repeat(80));
    console.log('TV CATEGORIES:');
    console.log('='.repeat(80));
    const tvCategories = categories.filter(cat => 
      cat.slug.includes('tv') || 
      cat.name.toLowerCase().includes('tv')
    );
    if (tvCategories.length > 0) {
      tvCategories.forEach(cat => {
        const parent = cat.parent ? parentMap.get(cat.parent) : null;
        console.log(`ID: ${cat.id} | Slug: "${cat.slug}" | Name: "${cat.name}" | Count: ${cat.count}${parent ? ` | Parent: ${parent.name} (ID: ${parent.id})` : ''}`);
      });
    } else {
      console.log('No TV categories found');
    }
    
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

fetchAllCategories();

