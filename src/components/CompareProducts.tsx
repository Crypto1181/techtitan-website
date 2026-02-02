import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sampleComponents, categories, PCComponent, ComponentCategory } from '@/data/pcComponents';
import { Plus, X, Check, Minus, ArrowRight, Search } from 'lucide-react';
import { useWooCommerceProducts } from '@/hooks/useWooCommerceProducts';
import { useWooCommerceCategories } from '@/hooks/useWooCommerceCategories';
import { categorySlugMap } from '@/data/woocommerce-categories';

const CompareProducts = () => {
  const navigate = useNavigate();
  const [compareList, setCompareList] = useState<PCComponent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory>('gpu');
  const [showSelector, setShowSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch WooCommerce categories to map internal categories to WooCommerce category IDs
  const { getCategoryIdBySlug, loading: loadingCategories, categories: wooCommerceCategories } = useWooCommerceCategories();

  // Map internal category to WooCommerce category slugs (same as ComponentSelector)
  const internalToWooCommerceMap: Record<ComponentCategory, string[]> = {
    'cpu': ['cpu'],
    'gpu': ['graphic-cards'],
    'motherboard': ['motherboards'],
    'ram': ['ram', 'desktop-ram', 'notebook-ram'],
    'storage': ['storage-drives', 'internal-storage'],
    'psu': ['backup-power'], // WooCommerce uses "backup-power" not "power-supplies"
    'case': ['cases'],
    'cooler': ['coolers-fans', 'cooler'],
    'monitor': ['monitors'],
    'mouse': ['mouse'],
    'keyboard': ['keyboards'],
    'headset': ['headsets'],
  };

  // Get WooCommerce category IDs for the selected category
  const wooCommerceCategoryIds = useMemo(() => {
    // Don't try to get category IDs until categories are loaded
    if (loadingCategories) return undefined;
    
    const slugs = internalToWooCommerceMap[selectedCategory] || [];
    const categoryIds: number[] = [];
    
    console.log(`🔍 Looking up category IDs for: ${selectedCategory}, slugs: ${slugs.join(', ')}`);
    
    for (const slug of slugs) {
      const directSlugs = categorySlugMap[slug] || [slug];
      console.log(`  Checking slug "${slug}" → direct slugs: ${directSlugs.join(', ')}`);
      
      for (const wcSlug of directSlugs) {
        const id = getCategoryIdBySlug(wcSlug);
        if (id) {
          // Verify this is actually the right category by checking the slug
          const category = wooCommerceCategories.find(cat => cat.id === id);
          if (category) {
            const categorySlug = category.slug?.toLowerCase() || '';
            const expectedSlug = wcSlug.toLowerCase();
            
            // Only add if slug matches (to avoid wrong category IDs)
            if (categorySlug === expectedSlug || categorySlug.includes(expectedSlug) || expectedSlug.includes(categorySlug)) {
              console.log(`  ✓ Found category ID ${id} for slug "${wcSlug}" (verified: ${category.name}, slug: ${category.slug})`);
              if (!categoryIds.includes(id)) {
          categoryIds.push(id);
        }
            } else {
              console.warn(`  ⚠️ Category ID ${id} found but slug mismatch: expected "${expectedSlug}", got "${categorySlug}" (name: ${category.name})`);
            }
          } else {
            console.warn(`  ⚠️ Category ID ${id} not found in categories list`);
          }
        } else {
          console.warn(`  ⚠️ No category ID found for slug "${wcSlug}"`);
        }
      }
    }
    
    console.log(`✅ Final category IDs for ${selectedCategory}: [${categoryIds.join(', ')}]`);
    
    return categoryIds.length > 0 ? categoryIds : undefined;
  }, [selectedCategory, getCategoryIdBySlug, loadingCategories, wooCommerceCategories]);

  // Fetch WooCommerce products filtered by category IDs
  // IMPORTANT: Don't use pc_component_category when we have category IDs - backend ignores it anyway
  // Use fallback category ID for graphics cards if lookup fails
  const shouldFetchProducts = !loadingCategories && selectedCategory;
  
  // For graphics cards, use fallback ID 118 if lookup fails
  const finalCategoryIds = useMemo(() => {
    if (wooCommerceCategoryIds && wooCommerceCategoryIds.length > 0) {
      return wooCommerceCategoryIds;
    }
    // Fallback for known categories
    if (selectedCategory === 'gpu') {
      return [118]; // Graphics cards category ID
    }
    return undefined;
  }, [wooCommerceCategoryIds, selectedCategory]);
  
  const { products: wooCommerceProducts, loading: loadingProducts } = useWooCommerceProducts(
    shouldFetchProducts
      ? { 
          category: finalCategoryIds, // Use category IDs (with fallback for GPU)
          // Don't send pc_component_category when we have category IDs
          per_page: 100
        }
      : { per_page: 0 } // Skip fetching until categories are loaded
  );
  
  // Debug: Log what we're fetching
  if (shouldFetchProducts) {
    console.log(`📦 Fetching products for ${selectedCategory}:`, {
      categoryIds: wooCommerceCategoryIds,
      pc_component_category: selectedCategory,
      loading: loadingProducts
    });
  }

  // Combine WooCommerce products with sample data (fallback)
  // Only show sample products if no category is selected AND we're loading
  // If a category is selected, wait for the correct WooCommerce products
  const allProducts = useMemo(() => {
    // If we have WooCommerce products (from either category ID or pc_component_category filter), use them
    if (wooCommerceProducts.length > 0) {
      return [...wooCommerceProducts];
    }
    
    // If we're loading and have a category selected, don't show samples (wait for real products)
    if (loadingProducts && selectedCategory) {
      return [];
    }
    
    // If we have category IDs but no products yet and still loading, wait
    if (wooCommerceCategoryIds && loadingProducts) {
      return [];
    }
    
    // If no category selected or categories still loading, show samples while loading
    if (loadingProducts && !selectedCategory) {
      return [...sampleComponents];
    }
    
    // If we have a category selected but no products and not loading, something went wrong
    // Still return empty to avoid showing wrong products
    if (selectedCategory && !loadingProducts && wooCommerceProducts.length === 0) {
      console.warn(`⚠️ No products found for category: ${selectedCategory}`);
      return [];
    }
    
    // Combine WooCommerce products with samples (only if no category selected)
    const combined = [...wooCommerceProducts];
    if (!selectedCategory) {
    sampleComponents.forEach(sample => {
      if (!combined.find(p => p.id === sample.id)) {
        combined.push(sample);
      }
    });
    }
    return combined;
  }, [wooCommerceProducts, loadingProducts, wooCommerceCategoryIds, loadingCategories, selectedCategory]);

  // Filter products by category and search query
  // Now filter by both the mapped category AND WooCommerce category IDs to ensure accuracy
  const categoryComponents = useMemo(() => {
    console.log(`🔍 Filtering products for category: ${selectedCategory}`);
    console.log(`  Total products available: ${allProducts.length}`);
    console.log(`  Products by category:`, allProducts.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    
    let filtered = allProducts.filter(c => {
      // First check if product category matches
      const categoryMatch = c.category === selectedCategory;
      
      if (!categoryMatch) {
        return false;
      }
      
      // Also verify it's in the correct WooCommerce category if we have category IDs
      if (wooCommerceCategoryIds && categoryMatch) {
        // Products from WooCommerce should already be filtered by category in the API call
        // But we double-check here for sample products
        return categoryMatch;
      }
      
      return categoryMatch;
    });
    
    console.log(`  Filtered products for ${selectedCategory}: ${filtered.length}`);
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        Object.values(product.specs).some(spec => 
          String(spec).toLowerCase().includes(query)
        )
      );
    }
    
    return filtered;
  }, [allProducts, selectedCategory, searchQuery, wooCommerceCategoryIds]);

  const addToCompare = (component: PCComponent) => {
    if (compareList.length < 4 && !compareList.find(c => c.id === component.id)) {
      setCompareList([...compareList, component]);
    }
  };

  const removeFromCompare = (componentId: string) => {
    setCompareList(compareList.filter(c => c.id !== componentId));
  };

  // Category-specific important specifications
  const getCategoryPrioritySpecs = (category: ComponentCategory): string[] => {
    const categorySpecs: Record<ComponentCategory, string[]> = {
      'cpu': [
        'cores', 'threads', 'base clock', 'boost clock', 'tdp', 'socket', 'lithography', 
        'cache', 'l3 cache', 'l2 cache', 'architecture', 'generation', 'series'
      ],
      'gpu': [
        'vram', 'memory', 'gddr', 'core clock', 'boost clock', 'memory clock', 'tdp', 
        'power consumption', 'cuda cores', 'stream processors', 'ray tracing', 
        'dlss', 'interface', 'pcie', 'display port', 'hdmi'
      ],
      'motherboard': [
        'chipset', 'socket', 'form factor', 'ram slots', 'max ram', 'ram type', 'ddr',
        'pcie slots', 'm.2 slots', 'sata ports', 'usb ports', 'audio', 'wifi', 
        'bluetooth', 'lan', 'network'
      ],
      'ram': [
        'capacity', 'speed', 'frequency', 'mhz', 'latency', 'cl', 'timing', 'type', 
        'ddr4', 'ddr5', 'voltage', 'form factor', 'heat spreader', 'rgb'
      ],
      'storage': [
        'capacity', 'type', 'nvme', 'ssd', 'hdd', 'read speed', 'write speed', 
        'readspeed', 'writespeed', 'interface', 'form factor', 'm.2', 'sata', 
        'endurance', 'tbw', 'warranty'
      ],
      'psu': [
        'wattage', 'power', 'efficiency', '80+', 'modular', 'semi-modular', 
        'fully modular', 'certification', 'rails', 'connectors', 'pcie', 'sata',
        'warranty', 'fan size', 'noise'
      ],
      'cooler': [
        'type', 'air', 'liquid', 'aio', 'radiator', 'fan size', 'fans', 'rpm',
        'noise', 'tdp', 'socket', 'compatibility', 'height', 'dimensions',
        'pump speed', 'rgb'
      ],
      'case': [
        'form factor', 'size', 'dimensions', 'gpu clearance', 'cpu cooler height',
        'fan support', 'radiator support', 'drive bays', 'expansion slots',
        'material', 'side panel', 'usb ports', 'rgb', 'cable management'
      ],
      'monitor': [
        'screen size', 'resolution', 'refresh rate', 'hz', 'response time', 'ms',
        'panel type', 'ips', 'va', 'tn', 'curved', 'aspect ratio', 'brightness',
        'contrast', 'color gamut', 'hdr', 'connectivity', 'hdmi', 'displayport',
        'usb', 'vesa mount', 'stand adjustment'
      ],
      'mouse': [
        'dpi', 'sensor', 'polling rate', 'hz', 'wireless', 'battery', 'weight',
        'g', 'buttons', 'rgb', 'connectivity', 'usb', 'bluetooth', 'software',
        'grip style', 'hand orientation'
      ],
      'keyboard': [
        'switches', 'mechanical', 'membrane', 'layout', 'tkl', 'full', 'rgb',
        'connectivity', 'wireless', 'bluetooth', 'usb', 'battery', 'keycaps',
        'backlight', 'programmable keys', 'wrist rest'
      ],
      'headset': [
        'drivers', 'mm', 'frequency', 'hz', 'microphone', 'wireless', 'battery',
        'connectivity', 'bluetooth', 'usb', 'noise cancellation', 'surround sound',
        'comfort', 'weight', 'cable length', 'compatibility'
      ],
    };
    
    return categorySpecs[category] || [];
  };

  const getAllSpecs = () => {
    const allSpecs = new Set<string>();
    const adminFields = ['_wp_', '_wc_', '_jetpack_', '_yoast_', '_elementor_', 'page_template', 'product_group_id', 'facebook_commerce', 'hide', 'hidden', 'admin', 'editor', 'template', 'wp_page_template', 'wcsob_hide', 'jetpack_editor', 'facebook_commerce_fields', 'product_group', 'description', 'short_description', 'fb product item id', 'fb visibility', 'facebook'];
    
    // Get the category from the first product in compare list (all should be same category)
    const category = compareList.length > 0 ? compareList[0].category : selectedCategory;
    const categoryPrioritySpecs = getCategoryPrioritySpecs(category);
    
    // Debug: Log products and their specs
    if (compareList.length > 0) {
      console.log('🔍 Comparing products:', compareList.map(c => ({ 
        name: c.name, 
        category: c.category,
        specsCount: Object.keys(c.specs).length, 
        allSpecKeys: Object.keys(c.specs),
        sampleSpecs: Object.entries(c.specs).slice(0, 10).map(([k, v]) => `${k}: ${v}`)
      })));
    }
    
    compareList.forEach(comp => {
      Object.keys(comp.specs).forEach(key => {
        const keyLower = key.toLowerCase();
        const value = comp.specs[key];
        
        // Skip if value is empty or just whitespace
        if (!value || String(value).trim().length === 0) {
          return;
        }
        
        // Skip admin fields (but be less aggressive)
        const isAdminField = adminFields.some(field => {
          const fieldLower = field.toLowerCase();
          return keyLower === fieldLower || keyLower.includes(fieldLower) || fieldLower.includes(keyLower);
        });
        if (isAdminField) {
          return;
        }
        
        // Skip HTML-only fields (but allow short HTML snippets that might be formatted text)
        const valueStr = String(value).trim();
        if (valueStr.startsWith('<') && valueStr.endsWith('>') && valueStr.length < 50) {
          // Only skip if it's a very short HTML tag, not formatted text
          if (!valueStr.includes(' ') || valueStr.match(/^<[^>]+>$/)) {
            return;
          }
        }
        
        // Skip very long values (likely HTML or full descriptions) - but increase threshold
        if (String(value).length > 1000) {
          return;
        }
        
        // Skip "Specification" key if it's the same as product name (common issue)
        if (keyLower === 'specification' && String(value).trim() === comp.name.trim()) {
          return;
        }
        
        // Skip if the key is "name" or similar and value matches product name
        if ((keyLower === 'name' || keyLower === 'product name' || keyLower === 'title') && 
            String(value).trim().toLowerCase() === comp.name.trim().toLowerCase()) {
          return;
        }
        
        // Skip common non-spec fields
        if (['id', 'sku', 'slug', 'permalink', 'date', 'modified', 'status', 'featured', 'catalog_visibility', 'type'].includes(keyLower)) {
          return;
        }
        
        allSpecs.add(key);
      });
    });
    
    // Sort specs: category-specific priority specs first, then alphabetically
    const specArray = Array.from(allSpecs);
    specArray.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      // Check if either matches a category-specific priority spec
      const aPriority = categoryPrioritySpecs.findIndex(p => {
        const pLower = p.toLowerCase();
        return aLower.includes(pLower) || pLower.includes(aLower);
      });
      const bPriority = categoryPrioritySpecs.findIndex(p => {
        const pLower = p.toLowerCase();
        return bLower.includes(pLower) || pLower.includes(bLower);
      });
      
      // Category-specific priority specs come first
      if (aPriority >= 0 && bPriority >= 0) {
        return aPriority - bPriority;
      } else if (aPriority >= 0) {
        return -1;
      } else if (bPriority >= 0) {
        return 1;
      }
      
      // Then sort alphabetically
      return a.localeCompare(b);
    });
    
    console.log(`📊 Found ${specArray.length} specs to compare for category: ${category}`, specArray.slice(0, 10));
    
    return specArray;
  };

  const handleAddToBuild = (component: PCComponent) => {
    // Navigate to PC Builder with the component pre-selected
    navigate('/', { 
      state: { 
        activeTab: 'builder',
        preSelectComponent: {
          category: component.category,
          component: component
        }
      } 
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold mb-2">Compare Products</h2>
        <p className="text-muted-foreground">
          Select up to 4 products to compare side by side
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery(''); // Clear search when changing category
                setCompareList([]);
              }}
            className="font-display"
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Compare Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Existing Selections */}
        {compareList.map((component, index) => (
          <div
            key={component.id}
            className="glass-card p-4 relative animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => removeFromCompare(component.id)}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-secondary/30 flex items-center justify-center overflow-hidden">
              {component.image ? (
                <img
                  src={component.image}
                  alt={component.name}
                  className="max-w-full max-h-full object-contain p-1"
                />
              ) : (
                <span className="text-2xl">
                  {categories.find(c => c.id === component.category)?.icon}
                </span>
              )}
            </div>

            <p className="text-xs text-primary font-medium text-center">{component.brand}</p>
            <h3 className="font-display text-sm font-bold text-center line-clamp-2 h-10">
              {component.name}
            </h3>
            <p className="price-tag text-center mt-2">${component.price.toFixed(2)}</p>
          </div>
        ))}

        {/* Add Slot */}
        {compareList.length < 4 && (
          <button
            onClick={() => {
              setSearchQuery(''); // Clear search when opening selector
              setShowSelector(true);
            }}
            className="glass-card p-4 border-dashed border-2 border-border hover:border-primary transition-all flex flex-col items-center justify-center min-h-[180px]"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Add Product</p>
          </button>
        )}
      </div>

      {/* Product Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display text-xl font-bold">
                Select {categories.find(c => c.id === selectedCategory)?.name}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowSelector(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products by name, brand, or specs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchQuery && (
                <p className="text-xs text-muted-foreground mt-2">
                  {categoryComponents.length} product{categoryComponents.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {loadingCategories || (loadingProducts && categoryComponents.length === 0) ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading products...</p>
                </div>
              ) : !loadingCategories && !loadingProducts && categoryComponents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No products found matching your search' : 'No products available in this category'}
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-3">
                  {categoryComponents.map((component) => {
                  const isAdded = compareList.find(c => c.id === component.id);
                  return (
                    <button
                      key={component.id}
                      onClick={() => {
                        if (!isAdded) {
                          addToCompare(component);
                          setShowSelector(false);
                        }
                      }}
                      disabled={!!isAdded}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-all text-left ${
                        isAdded
                          ? 'bg-primary/10 border border-primary'
                          : 'bg-secondary/50 hover:bg-secondary'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-lg bg-secondary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {component.image ? (
                          <img
                            src={component.image}
                            alt={component.name}
                            className="max-w-full max-h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-2xl">
                            {categories.find(c => c.id === component.category)?.icon}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-primary font-medium">{component.brand}</p>
                        <p className="font-medium line-clamp-2">{component.name}</p>
                        {Object.keys(component.specs).length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {Object.entries(component.specs).slice(0, 2).map(([key, value]) => `${key}: ${value}`).join(' • ')}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="price-tag">${component.price.toFixed(2)}</p>
                        {isAdded && (
                          <span className="text-xs text-primary">Added</span>
                        )}
                      </div>
                    </button>
                  );
                })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {compareList.length >= 2 && (
        <div className="glass-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left font-display text-sm text-muted-foreground w-40">
                    Specification
                  </th>
                  {compareList.map((comp) => (
                    <th key={comp.id} className="p-4 text-center font-display">
                      <span className="text-sm font-medium line-clamp-1">{comp.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price Row */}
                <tr className="border-b border-border/50 bg-secondary/30">
                  <td className="p-4 font-medium">Price</td>
                  {compareList.map((comp) => (
                    <td key={comp.id} className="p-4 text-center">
                      <span className="price-tag text-lg">${comp.price.toFixed(2)}</span>
                    </td>
                  ))}
                </tr>

                {/* Stock Row */}
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium">Availability</td>
                  {compareList.map((comp) => (
                    <td key={comp.id} className="p-4 text-center">
                      {comp.inStock ? (
                        <span className="inline-flex items-center gap-1 text-accent text-sm">
                          <Check className="h-4 w-4" />
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-destructive text-sm">
                          <Minus className="h-4 w-4" />
                          Out of Stock
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Spec Rows */}
                {getAllSpecs().length > 0 ? (
                  getAllSpecs().map((spec) => {
                    // Format spec name for better readability
                    const formatSpecName = (name: string): string => {
                      return name
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())
                        .replace(/\b(Hz|MHz|GHz|GB|TB|W|V|A|DPI|RGB|USB|HDMI|DP|PCIe|M\.2|SATA|NVMe|SSD|HDD|DDR4|DDR5|ATX|TKL|IPS|VA|TN|HDR|CL|TDP|AIO)\b/gi, match => match.toUpperCase())
                        .replace(/\s+/g, ' ')
                        .trim();
                    };

                    return (
                  <tr key={spec} className="border-b border-border/50">
                        <td className="p-4 font-medium whitespace-nowrap align-top">{formatSpecName(spec)}</td>
                    {compareList.map((comp) => (
                      <td key={comp.id} className="p-4 text-center align-top">
                            <span className="text-sm break-words inline-block max-w-[200px]">
                              {comp.specs[spec] ? String(comp.specs[spec]) : '-'}
                            </span>
                      </td>
                    ))}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={compareList.length + 1} className="p-8 text-center text-muted-foreground">
                      <p className="mb-2">No specifications available for these products.</p>
                      <p className="text-sm">Specifications will appear here when product data includes detailed specs.</p>
                    </td>
                  </tr>
                )}

                {/* Action Row */}
                <tr>
                  <td className="p-4 font-medium">Actions</td>
                  {compareList.map((comp) => (
                    <td key={comp.id} className="p-4 text-center">
                      <Button 
                        variant="default" 
                        size="sm" 
                        disabled={!comp.inStock}
                        onClick={() => handleAddToBuild(comp)}
                        className="bg-accent hover:bg-accent/90 text-white"
                      >
                        Add to Build
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {compareList.length < 2 && (
        <div className="text-center py-12 glass-card">
          <p className="text-muted-foreground">
            Select at least 2 products to see comparison
          </p>
        </div>
      )}
    </div>
  );
};

export default CompareProducts;
