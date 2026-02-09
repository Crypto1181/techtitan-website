import { useState, useEffect } from 'react';
import { fetchProducts, fetchAllProducts, type FetchProductsParams } from '@/services/backendApi';
import type { WooCommerceProduct } from '@/types/woocommerce';
import type { PCComponent, ComponentCategory } from '@/data/pcComponents';
import { categoryMapping } from '@/types/woocommerce';

interface UseWooCommerceProductsReturn {
  products: PCComponent[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  totalProducts?: number;
}

interface UseWooCommerceProductsOptions extends FetchProductsParams {
  fetchAll?: boolean; // If true, fetch all products with pagination
  useLive?: boolean; // If true, fetch directly from WooCommerce (bypassing database cache)
}

// Map WooCommerce product to PCComponent
// skipLaptopCoolerFilter: If true, don't filter out laptop coolers (useful when viewing cooler category)
const mapWooCommerceToPCComponent = (wcProduct: WooCommerceProduct, skipLaptopCoolerFilter: boolean = false): PCComponent | null => {
  // Skip if product is not published (but allow all purchasable statuses - we'll handle that in UI)
  if (wcProduct.status !== 'publish') {
    return null;
  }
  // Don't filter by purchasable - show all published products
  // The UI will handle disabling "Add to Cart" for non-purchasable products

  // Determine category - prioritize backend pc_component_category if available
  // This ensures products from the backend with correct category are not filtered out
  let category: ComponentCategory | null = null;

  // First, check if backend provided pc_component_category (most reliable)
  const backendCategory = (wcProduct as any)._pc_component_category;
  if (backendCategory && typeof backendCategory === 'string') {
    const validCategories: ComponentCategory[] = ['cpu', 'gpu', 'ram', 'storage', 'motherboard', 'psu', 'cooler', 'case', 'monitor', 'mouse', 'keyboard', 'headset'];
    if (validCategories.includes(backendCategory as ComponentCategory)) {
      category = backendCategory as ComponentCategory;
      // Don't log every product to avoid console spam - only log if debugging
      // console.log(`✓ Using backend category for ${wcProduct.name}: ${category}`);
    }
  }

  // If no backend category, determine from WooCommerce categories
  // Check ALL categories, not just the first one, to find the most specific match
  if (!category) {
    // Map WooCommerce category slugs to our internal categories
    // Based on ACTUAL WooCommerce categories from the API
    const categorySlugMap: Record<string, ComponentCategory> = {
      // Computer Parts - using ACTUAL WooCommerce slugs
      'cpu': 'cpu', // Actual slug is "cpu" (singular), not "cpus"
      'processors': 'cpu',
      'processor': 'cpu',
      'motherboards': 'motherboard',
      'motherboard': 'motherboard',
      'mainboard': 'motherboard',
      'graphic-cards': 'gpu',
      'graphic cards': 'gpu',
      'gpu': 'gpu',
      'gpus': 'gpu',
      'video-card': 'gpu',
      'video cards': 'gpu',
      'desktop-ram': 'ram', // No "ram" category, only desktop-ram and notebook-ram
      'notebook-ram': 'ram',
      'ram': 'ram', // Fallback
      'rams': 'ram',
      'memory': 'ram',
      'storage-drives': 'storage', // Main storage category (209 products)
      'internal-storage': 'storage', // Child of storage-drives (129 products)
      'external-storage': 'storage', // Child of storage-drives (73 products)
      'internal storage': 'storage',
      'external storage': 'storage',
      'nvme': 'storage',
      'nvme-m-2': 'storage',
      'nvme m.2': 'storage',
      'm.2': 'storage',
      'hdd': 'storage',
      'ssd': 'storage',
      'sata': 'storage',
      'storage': 'storage', // Fallback
      'backup-power': 'psu', // No "power-supplies" category, use "backup-power"
      'backup power': 'psu',
      'power-supplies': 'psu', // Fallback for search
      'power supplies': 'psu',
      'power-supply': 'psu',
      'power supply': 'psu',
      'psu': 'psu',
      'ups': 'psu',
      'cases': 'case',
      'case': 'case',
      'chassis': 'case',
      'coolers-fans': 'cooler',
      'coolers & fans': 'cooler',
      'cooler': 'cooler',
      'liquid-coolers': 'cooler',
      'air-cooler': 'cooler',
      'cooling-fans': 'cooler',
      'monitors': 'monitor',
      'monitor': 'monitor',
      'display': 'monitor',
      'mouse': 'mouse', // Actual slug is "mouse", not "mouses"
      'mouses': 'mouse', // Fallback
      'mice': 'mouse',
      'keyboards': 'keyboard',
      'keyboard': 'keyboard',
      'headsets': 'headset',
      'headset': 'headset',
      'headphones': 'headset',
      'headphone': 'headset',
      'gaming-headsets': 'headset',
      'music-headsets': 'headset',
    };

    // First, check all categories for exact slug matches (most reliable)
    // Prioritize more specific categories first
    const sortedCategories = [...wcProduct.categories].sort((a, b) => {
      // Prioritize categories that are more specific (longer slugs/names)
      return (b.slug?.length || 0) - (a.slug?.length || 0);
    });

    for (const wcCategory of sortedCategories) {
      const slug = wcCategory.slug?.toLowerCase() || '';
      const name = wcCategory.name?.toLowerCase() || '';

      // Check exact slug match first (highest priority)
      if (categorySlugMap[slug]) {
        category = categorySlugMap[slug];
        break; // Use first exact match
      }

      // Check if slug contains any of our category keys (secondary priority)
      // But prioritize more specific matches
      let bestMatch: { key: string; category: ComponentCategory; specificity: number } | null = null;

      for (const [key, mappedCategory] of Object.entries(categorySlugMap)) {
        if (slug.includes(key) || name.includes(key)) {
          const specificity = key.length; // Longer keys are more specific
          if (!bestMatch || specificity > bestMatch.specificity) {
            bestMatch = { key, category: mappedCategory, specificity };
          }
        }
      }

      if (bestMatch) {
        category = bestMatch.category;
        break;
      }
    }

    // If no category found from WooCommerce categories, try product name/description as fallback
    if (!category) {
      const nameLower = wcProduct.name.toLowerCase();
      const descLower = (wcProduct.description || '').toLowerCase();
      const searchText = `${nameLower} ${descLower}`;

      // Only use fallback for very specific matches to avoid mis-categorization
      if (searchText.includes('motherboard') || searchText.includes('mainboard')) {
        category = 'motherboard';
      } else if (searchText.includes('cpu') || searchText.includes('processor') || searchText.includes('intel core') || searchText.includes('amd ryzen')) {
        category = 'cpu';
      } else if (searchText.includes('gpu') || searchText.includes('graphics card') || searchText.includes('video card') || searchText.includes('rtx') || searchText.includes('gtx')) {
        category = 'gpu';
      } else if (searchText.includes('ram') || searchText.includes('ddr4') || searchText.includes('ddr5') || searchText.includes('memory')) {
        category = 'ram';
      } else if (searchText.includes('ssd') || searchText.includes('nvme') || searchText.includes('m.2') || searchText.includes('storage drive')) {
        category = 'storage';
      } else if (searchText.includes('power supply') || searchText.includes('psu') || searchText.includes('watt')) {
        category = 'psu';
      } else if (searchText.includes('case') && !searchText.includes('phone case')) {
        category = 'case';
      } else if (searchText.includes('cooler') && !searchText.includes('case')) {
        category = 'cooler';
      } else if (searchText.includes('monitor') || searchText.includes('display')) {
        category = 'monitor';
      } else if (searchText.includes('mouse')) {
        category = 'mouse';
      } else if (searchText.includes('keyboard')) {
        category = 'keyboard';
      } else if (searchText.includes('headset') || searchText.includes('headphone')) {
        category = 'headset';
      }
    }
  }

  // Final fallback - default to cpu if still no category
  if (!category) {
    category = 'cpu';
  }

  // Filter cooler category to show LAPTOP COOLERS only
  // Filter out CPU coolers, AIO coolers, liquid coolers - these are not laptop accessories
  if (category === 'cooler') {
    const nameLower = wcProduct.name.toLowerCase();
    const descLower = (wcProduct.description || '').toLowerCase();
    const searchText = `${nameLower} ${descLower}`;
    const categoryNames = wcProduct.categories.map(c => c.name?.toLowerCase() || '').join(' ');
    const categorySlugs = wcProduct.categories.map(c => c.slug?.toLowerCase() || '').join(' ');
    const allText = `${searchText} ${categoryNames} ${categorySlugs}`.toLowerCase();

    // Check if it's a CPU cooler (filter these OUT - not laptop accessories!)
    const isCPUCooler =
      allText.includes('cpu cooler') ||
      allText.includes('cpu cooling') ||
      allText.includes('aio') ||
      allText.includes('liquid cooler') ||
      allText.includes('air cooler') ||
      allText.includes('tower cooler') ||
      allText.includes('radiator') ||
      allText.includes('water cool') ||
      allText.match(/\b(lga\d+|am\d+|socket)\b/i) || // CPU socket compatibility
      (allText.includes('cooler') && allText.includes('master')) || // CoolerMaster CPU coolers
      (allText.includes('thermaltake') && !allText.includes('laptop')) || // Thermaltake CPU coolers
      allText.includes('nzxt') || // NZXT makes CPU coolers
      allText.includes('corsair') && allText.includes('hydro'); // Corsair Hydro series

    // Check if it's a standalone case fan (also filter out)
    const isCaseFan =
      allText.includes('case fan') ||
      allText.includes('case cooling') ||
      (allText.includes('fan') && (
        allText.includes('triple pack') ||
        allText.includes('dual pack') ||
        allText.includes('single pack') ||
        (allText.match(/\b(120|140|180|200|220)mm\b/) &&
          !allText.includes('laptop') &&
          !allText.includes('notebook'))
      ));

    if (isCPUCooler && !skipLaptopCoolerFilter) {
      console.log(`🚫 Excluding CPU cooler from Cooler category: "${wcProduct.name}" (ID: ${wcProduct.id})`);
      return null;
    }

    if (isCaseFan && !skipLaptopCoolerFilter) {
      console.log(`🚫 Excluding case fan from Cooler category: "${wcProduct.name}" (ID: ${wcProduct.id})`);
      return null;
    }
  }


  // Extract brand from tags or categories
  let brand = 'Unknown';
  const brandTag = wcProduct.tags.find(tag =>
    ['asus', 'msi', 'gigabyte', 'evga', 'corsair', 'nvidia', 'amd', 'intel', 'samsung', 'kingston', 'logitech', 'razer', 'steelseries', 'hyperx'].includes(tag.slug.toLowerCase())
  );
  if (brandTag) {
    brand = brandTag.name;
  } else if (wcProduct.categories.length > 0) {
    // Try to extract brand from category name
    const categoryName = wcProduct.categories[0].name;
    const brandMatch = categoryName.match(/(\w+)/);
    if (brandMatch) {
      brand = brandMatch[1];
    }
  }

  // Extract specs from description or meta data
  const specs: Record<string, string> = {};
  const compatibility: { socket?: string; ramType?: string; formFactor?: string; wattage?: number } = {};

  // Admin fields to exclude from specs
  const adminFields = ['_wp_', '_wc_', '_jetpack_', '_yoast_', '_elementor_', 'page_template', 'product_group_id', 'facebook_commerce', 'hide', 'hidden', 'admin', 'editor', 'template', 'wp_page_template', 'wcsob_hide', 'jetpack_editor', 'facebook_commerce_fields', 'product_group', 'description', 'short_description'];

  // Try to extract from meta_data
  wcProduct.meta_data.forEach(meta => {
    if (meta.key && meta.value) {
      const key = meta.key.toLowerCase();
      const value = String(meta.value);

      // Skip admin fields and HTML-only fields
      const isAdminField = adminFields.some(field => key.includes(field.toLowerCase()));
      const isHtmlOnly = value.trim().startsWith('<') && value.trim().endsWith('>');

      if (isAdminField || isHtmlOnly || !value.trim()) {
        return;
      }

      // Extract compatibility info
      if (key.includes('socket') && (key.includes('cpu') || key.includes('processor'))) {
        compatibility.socket = value;
      } else if (key.includes('ram') && (key.includes('type') || key.includes('ddr'))) {
        compatibility.ramType = value.includes('ddr4') ? 'DDR4' : value.includes('ddr5') ? 'DDR5' : value;
      } else if (key.includes('form') && key.includes('factor')) {
        compatibility.formFactor = value;
      } else if (key.includes('wattage') || key.includes('power') || key.includes('watt')) {
        const wattage = parseFloat(value);
        if (!isNaN(wattage)) {
          compatibility.wattage = wattage;
        }
      }

      // Add to specs (use original key, not lowercase)
      specs[meta.key] = value;
    }
  });

  // Also try to extract common specs from attributes
  if (wcProduct.attributes && Array.isArray(wcProduct.attributes)) {
    wcProduct.attributes.forEach(attr => {
      if (attr.name && attr.options && attr.options.length > 0) {
        const key = attr.name.toLowerCase();
        const value = Array.isArray(attr.options) ? attr.options.join(', ') : String(attr.options);

        // Skip if already in specs or is admin field
        if (!specs[attr.name] && !adminFields.some(field => key.includes(field.toLowerCase()))) {
          specs[attr.name] = value;
        }
      }
    });
  }

  // Also try to extract from product name/description
  const nameLower = wcProduct.name.toLowerCase();
  const descLower = (wcProduct.description || '').toLowerCase();
  const productSearchText = `${nameLower} ${descLower}`;

  // Extract socket from name/description
  if (!compatibility.socket) {
    if (productSearchText.includes('am5') || productSearchText.includes('am5 socket')) {
      compatibility.socket = 'AM5';
    } else if (productSearchText.includes('am4') || productSearchText.includes('am4 socket')) {
      compatibility.socket = 'AM4';
    } else if (productSearchText.includes('lga1700') || productSearchText.includes('lga 1700')) {
      compatibility.socket = 'LGA1700';
    } else if (productSearchText.includes('lga1200') || productSearchText.includes('lga 1200')) {
      compatibility.socket = 'LGA1200';
    } else if (productSearchText.includes('lga1151') || productSearchText.includes('lga 1151')) {
      compatibility.socket = 'LGA1151';
    }
  }

  // Extract RAM type
  if (!compatibility.ramType) {
    if (productSearchText.includes('ddr5')) {
      compatibility.ramType = 'DDR5';
    } else if (productSearchText.includes('ddr4')) {
      compatibility.ramType = 'DDR4';
    }
  }

  // Extract form factor
  if (!compatibility.formFactor) {
    if (productSearchText.includes('atx')) {
      compatibility.formFactor = 'ATX';
    } else if (productSearchText.includes('micro atx') || productSearchText.includes('matx')) {
      compatibility.formFactor = 'Micro ATX';
    } else if (productSearchText.includes('mini itx')) {
      compatibility.formFactor = 'Mini-ITX';
    }
  }

  // Extract wattage for PSU
  if (category === 'psu' && !compatibility.wattage) {
    const wattageMatch = productSearchText.match(/(\d+)\s*w/i);
    if (wattageMatch) {
      compatibility.wattage = parseInt(wattageMatch[1], 10);
    }
  }

  // Extract common specs from product name/description (especially for monitors, GPUs, etc.)
  // Monitor specs
  if (category === 'monitor') {
    // Screen size (e.g., 27", 24", 34")
    if (!specs['Screen Size']) {
      const sizeMatch = productSearchText.match(/(\d+(?:\.\d+)?)\s*["']/i);
      if (sizeMatch) {
        specs['Screen Size'] = `${sizeMatch[1]}"`;
      }
    }

    // Refresh rate (e.g., 165Hz, 100Hz, 144Hz)
    if (!specs['Refresh Rate']) {
      const refreshMatch = productSearchText.match(/(\d+)\s*hz/i);
      if (refreshMatch) {
        specs['Refresh Rate'] = `${refreshMatch[1]}Hz`;
      }
    }

    // Resolution (e.g., QHD, FHD, 4K, 1920x1080)
    if (!specs['Resolution']) {
      if (productSearchText.includes('4k') || productSearchText.includes('3840x2160') || productSearchText.includes('uhd')) {
        specs['Resolution'] = '4K UHD (3840x2160)';
      } else if (productSearchText.includes('qhd') || productSearchText.includes('2560x1440') || productSearchText.includes('1440p')) {
        specs['Resolution'] = 'QHD (2560x1440)';
      } else if (productSearchText.includes('fhd') || productSearchText.includes('1920x1080') || productSearchText.includes('1080p')) {
        specs['Resolution'] = 'FHD (1920x1080)';
      } else {
        const resMatch = productSearchText.match(/(\d+)\s*x\s*(\d+)/i);
        if (resMatch) {
          specs['Resolution'] = `${resMatch[1]}x${resMatch[2]}`;
        }
      }
    }

    // Panel type (IPS, VA, TN)
    if (!specs['Panel Type']) {
      if (productSearchText.includes('ips')) {
        specs['Panel Type'] = 'IPS';
      } else if (productSearchText.includes('va')) {
        specs['Panel Type'] = 'VA';
      } else if (productSearchText.includes('tn')) {
        specs['Panel Type'] = 'TN';
      }
    }

    // Response time (e.g., 5ms, 1ms)
    if (!specs['Response Time']) {
      const responseMatch = productSearchText.match(/(\d+(?:\.\d+)?)\s*ms/i);
      if (responseMatch) {
        specs['Response Time'] = `${responseMatch[1]}ms`;
      }
    }

    // Curved
    if (!specs['Curved']) {
      if (productSearchText.includes('curved')) {
        specs['Curved'] = 'Yes';
      }
    }
  }

  // GPU specs
  if (category === 'gpu') {
    // VRAM (e.g., 12GB GDDR7, 16GB GDDR6X)
    if (!specs['VRAM'] && !specs['Memory']) {
      const vramMatch = productSearchText.match(/(\d+)\s*gb\s*(?:gddr\d+|gddr\s*\d+)?/i);
      if (vramMatch) {
        const gddrMatch = productSearchText.match(/gddr\s*(\d+)/i);
        const gddrType = gddrMatch ? ` GDDR${gddrMatch[1]}` : '';
        specs['VRAM'] = `${vramMatch[1]}GB${gddrType}`;
      }
    }

    // Memory Type (GDDR6, GDDR6X, GDDR7, etc.)
    if (!specs['Memory Type']) {
      const gddrMatch = productSearchText.match(/gddr\s*(\d+[x]?)/i);
      if (gddrMatch) {
        specs['Memory Type'] = `GDDR${gddrMatch[1]}`;
      }
    }

    // Model (e.g., RTX 5070, RTX 4070)
    if (!specs['Model']) {
      const modelMatch = productSearchText.match(/(rtx|gtx|rx)\s*(\d+)/i);
      if (modelMatch) {
        specs['Model'] = `${modelMatch[1].toUpperCase()} ${modelMatch[2]}`;
      }
    }

    // Core Clock (e.g., 1920 MHz, 1.92 GHz)
    if (!specs['Core Clock']) {
      const coreClockMatch = productSearchText.match(/core\s*clock[:\s]*(\d+(?:\.\d+)?)\s*(mhz|ghz)/i);
      if (coreClockMatch) {
        const value = parseFloat(coreClockMatch[1]);
        const unit = coreClockMatch[2].toLowerCase();
        if (unit === 'ghz') {
          specs['Core Clock'] = `${value} GHz`;
        } else {
          specs['Core Clock'] = `${value} MHz`;
        }
      }
    }

    // Boost Clock (e.g., 2535 MHz, 2.535 GHz)
    if (!specs['Boost Clock']) {
      const boostClockMatch = productSearchText.match(/boost\s*clock[:\s]*(\d+(?:\.\d+)?)\s*(mhz|ghz)/i);
      if (boostClockMatch) {
        const value = parseFloat(boostClockMatch[1]);
        const unit = boostClockMatch[2].toLowerCase();
        if (unit === 'ghz') {
          specs['Boost Clock'] = `${value} GHz`;
        } else {
          specs['Boost Clock'] = `${value} MHz`;
        }
      }
    }

    // Memory Clock (e.g., 21 Gbps, 20000 MHz)
    if (!specs['Memory Clock']) {
      const memClockMatch = productSearchText.match(/memory\s*clock[:\s]*(\d+(?:\.\d+)?)\s*(gbps|mhz)/i);
      if (memClockMatch) {
        specs['Memory Clock'] = `${memClockMatch[1]} ${memClockMatch[2].toUpperCase()}`;
      }
    }

    // TDP / Power Consumption (e.g., 250W, 300W)
    if (!specs['TDP'] && !specs['Power Consumption']) {
      const tdpMatch = productSearchText.match(/(?:tdp|power)[:\s]*(\d+)\s*w/i);
      if (tdpMatch) {
        specs['TDP'] = `${tdpMatch[1]}W`;
      }
    }

    // Interface (PCIe 4.0, PCIe 5.0, etc.)
    if (!specs['Interface']) {
      const pcieMatch = productSearchText.match(/pcie\s*(\d+\.\d+)/i);
      if (pcieMatch) {
        specs['Interface'] = `PCIe ${pcieMatch[1]}`;
      } else if (productSearchText.includes('pcie')) {
        specs['Interface'] = 'PCIe';
      }
    }

    // CUDA Cores / Stream Processors
    if (!specs['CUDA Cores'] && !specs['Stream Processors']) {
      const cudaMatch = productSearchText.match(/(\d+)\s*cuda\s*cores?/i);
      if (cudaMatch) {
        specs['CUDA Cores'] = cudaMatch[1];
      } else {
        const streamMatch = productSearchText.match(/(\d+)\s*stream\s*processors?/i);
        if (streamMatch) {
          specs['Stream Processors'] = streamMatch[1];
        }
      }
    }

    // Ray Tracing / DLSS
    if (!specs['Ray Tracing']) {
      if (productSearchText.includes('ray tracing') || productSearchText.includes('rtx')) {
        specs['Ray Tracing'] = 'Yes';
      }
    }

    if (!specs['DLSS']) {
      if (productSearchText.includes('dlss')) {
        specs['DLSS'] = 'Yes';
      }
    }
  }

  // CPU specs
  if (category === 'cpu') {
    // Cores
    if (!specs['Cores']) {
      const coresMatch = productSearchText.match(/(\d+)\s*cores?/i);
      if (coresMatch) {
        specs['Cores'] = coresMatch[1];
      }
    }

    // Threads
    if (!specs['Threads']) {
      const threadsMatch = productSearchText.match(/(\d+)\s*threads?/i);
      if (threadsMatch) {
        specs['Threads'] = threadsMatch[1];
      }
    }

    // Clock speed
    if (!specs['Base Clock']) {
      const baseClockMatch = productSearchText.match(/(\d+(?:\.\d+)?)\s*ghz/i);
      if (baseClockMatch) {
        specs['Base Clock'] = `${baseClockMatch[1]} GHz`;
      }
    }

    // Boost Clock
    if (!specs['Boost Clock']) {
      const boostClockMatch = productSearchText.match(/boost[:\s]*(\d+(?:\.\d+)?)\s*ghz/i);
      if (boostClockMatch) {
        specs['Boost Clock'] = `${boostClockMatch[1]} GHz`;
      }
    }

    // Cache (L3 Cache)
    if (!specs['L3 Cache'] && !specs['Cache']) {
      const cacheMatch = productSearchText.match(/(\d+)\s*mb\s*(?:l3\s*)?cache/i);
      if (cacheMatch) {
        specs['L3 Cache'] = `${cacheMatch[1]}MB`;
      }
    }

    // TDP
    if (!specs['TDP']) {
      const tdpMatch = productSearchText.match(/tdp[:\s]*(\d+)\s*w/i);
      if (tdpMatch) {
        specs['TDP'] = `${tdpMatch[1]}W`;
      }
    }

    // Architecture / Generation
    if (!specs['Architecture']) {
      if (productSearchText.includes('zen 4') || productSearchText.includes('zen4')) {
        specs['Architecture'] = 'Zen 4';
      } else if (productSearchText.includes('zen 3') || productSearchText.includes('zen3')) {
        specs['Architecture'] = 'Zen 3';
      } else if (productSearchText.includes('raptor lake') || productSearchText.includes('13th gen')) {
        specs['Architecture'] = 'Raptor Lake';
      } else if (productSearchText.includes('alder lake') || productSearchText.includes('12th gen')) {
        specs['Architecture'] = 'Alder Lake';
      }
    }
  }

  // Motherboard specs
  if (category === 'motherboard') {
    // Chipset (e.g., B650, X670, Z790, B760)
    if (!specs['Chipset']) {
      const chipsetMatch = productSearchText.match(/([xzbh]\d{3}|[xzbh]\d{2})/i);
      if (chipsetMatch) {
        specs['Chipset'] = chipsetMatch[1].toUpperCase();
      }
    }

    // Socket (already extracted in compatibility, but add to specs too)
    if (!specs['Socket'] && compatibility.socket) {
      specs['Socket'] = compatibility.socket;
    }

    // Form Factor (already extracted in compatibility, but add to specs too)
    if (!specs['Form Factor'] && compatibility.formFactor) {
      specs['Form Factor'] = compatibility.formFactor;
    }

    // RAM Slots
    if (!specs['RAM Slots']) {
      const slotsMatch = productSearchText.match(/(\d+)\s*(?:ram|memory|dimm)\s*slots?/i);
      if (slotsMatch) {
        specs['RAM Slots'] = slotsMatch[1];
      }
    }

    // Max RAM
    if (!specs['Max RAM']) {
      const maxRamMatch = productSearchText.match(/max[:\s]*(?:ram|memory)[:\s]*(\d+)\s*gb/i);
      if (maxRamMatch) {
        specs['Max RAM'] = `${maxRamMatch[1]}GB`;
      }
    }

    // RAM Type (DDR4, DDR5)
    if (!specs['RAM Type'] && compatibility.ramType) {
      specs['RAM Type'] = compatibility.ramType;
    }

    // PCIe Slots
    if (!specs['PCIe Slots']) {
      const pcieSlotsMatch = productSearchText.match(/(\d+)\s*pcie\s*(?:x16|x8|x4)?\s*slots?/i);
      if (pcieSlotsMatch) {
        specs['PCIe Slots'] = pcieSlotsMatch[1];
      }
    }

    // M.2 Slots
    if (!specs['M.2 Slots']) {
      const m2SlotsMatch = productSearchText.match(/(\d+)\s*m\.?2\s*slots?/i);
      if (m2SlotsMatch) {
        specs['M.2 Slots'] = m2SlotsMatch[1];
      }
    }

    // SATA Ports
    if (!specs['SATA Ports']) {
      const sataMatch = productSearchText.match(/(\d+)\s*sata\s*ports?/i);
      if (sataMatch) {
        specs['SATA Ports'] = sataMatch[1];
      }
    }

    // USB Ports
    if (!specs['USB Ports']) {
      const usbMatch = productSearchText.match(/(\d+)\s*usb\s*ports?/i);
      if (usbMatch) {
        specs['USB Ports'] = usbMatch[1];
      }
    }

    // WiFi
    if (!specs['WiFi']) {
      if (productSearchText.includes('wifi') || productSearchText.includes('wireless')) {
        specs['WiFi'] = 'Yes';
      }
    }

    // Bluetooth
    if (!specs['Bluetooth']) {
      if (productSearchText.includes('bluetooth')) {
        specs['Bluetooth'] = 'Yes';
      }
    }
  }

  // RAM specs
  if (category === 'ram') {
    // Capacity (e.g., 16GB, 32GB)
    if (!specs['Capacity']) {
      const capacityMatch = productSearchText.match(/(\d+)\s*gb/i);
      if (capacityMatch) {
        specs['Capacity'] = `${capacityMatch[1]}GB`;
      }
    }

    // Speed / Frequency (e.g., 3200MHz, 3600MHz, 6000MHz)
    if (!specs['Speed'] && !specs['Frequency']) {
      const speedMatch = productSearchText.match(/(\d+)\s*mhz/i);
      if (speedMatch) {
        specs['Speed'] = `${speedMatch[1]}MHz`;
      }
    }

    // Type (DDR4, DDR5)
    if (!specs['Type']) {
      if (productSearchText.includes('ddr5')) {
        specs['Type'] = 'DDR5';
      } else if (productSearchText.includes('ddr4')) {
        specs['Type'] = 'DDR4';
      } else if (productSearchText.includes('ddr3')) {
        specs['Type'] = 'DDR3';
      }
    }

    // Latency / CAS Latency (e.g., CL16, CL18, CL32)
    if (!specs['Latency'] && !specs['CAS Latency']) {
      const clMatch = productSearchText.match(/cl\s*(\d+)/i);
      if (clMatch) {
        specs['CAS Latency'] = `CL${clMatch[1]}`;
      } else {
        const latencyMatch = productSearchText.match(/(\d+)\s*-?\s*(\d+)\s*-?\s*(\d+)\s*-?\s*(\d+)/);
        if (latencyMatch) {
          specs['Timings'] = `${latencyMatch[1]}-${latencyMatch[2]}-${latencyMatch[3]}-${latencyMatch[4]}`;
        }
      }
    }

    // Voltage (e.g., 1.35V, 1.2V)
    if (!specs['Voltage']) {
      const voltageMatch = productSearchText.match(/(\d+\.\d+)\s*v/i);
      if (voltageMatch) {
        specs['Voltage'] = `${voltageMatch[1]}V`;
      }
    }

    // Form Factor (DIMM, SODIMM)
    if (!specs['Form Factor']) {
      if (productSearchText.includes('sodimm') || productSearchText.includes('laptop')) {
        specs['Form Factor'] = 'SODIMM';
      } else if (productSearchText.includes('dimm') || productSearchText.includes('desktop')) {
        specs['Form Factor'] = 'DIMM';
      }
    }

    // Kit Type (Single, Dual, Quad)
    if (!specs['Kit Type']) {
      if (productSearchText.includes('dual') || productSearchText.includes('2x') || productSearchText.includes('2 pack')) {
        specs['Kit Type'] = 'Dual Channel';
      } else if (productSearchText.includes('quad') || productSearchText.includes('4x') || productSearchText.includes('4 pack')) {
        specs['Kit Type'] = 'Quad Channel';
      } else if (productSearchText.includes('single') || productSearchText.includes('1x')) {
        specs['Kit Type'] = 'Single';
      }
    }

    // RGB
    if (!specs['RGB']) {
      if (productSearchText.includes('rgb') || productSearchText.includes('led')) {
        specs['RGB'] = 'Yes';
      }
    }
  }

  // Storage specs
  if (category === 'storage') {
    // Capacity (e.g., 500GB, 1TB, 2TB)
    if (!specs['Capacity']) {
      const capacityMatch = productSearchText.match(/(\d+)\s*(gb|tb)/i);
      if (capacityMatch) {
        specs['Capacity'] = `${capacityMatch[1]}${capacityMatch[2].toUpperCase()}`;
      }
    }

    // Type (NVMe SSD, SATA SSD, HDD)
    if (!specs['Type']) {
      if (productSearchText.includes('nvme') || productSearchText.includes('m.2')) {
        specs['Type'] = 'NVMe SSD';
      } else if (productSearchText.includes('ssd')) {
        specs['Type'] = 'SSD';
      } else if (productSearchText.includes('hdd') || productSearchText.includes('hard drive')) {
        specs['Type'] = 'HDD';
      }
    }

    // Form Factor (M.2, 2.5", 3.5")
    if (!specs['Form Factor']) {
      if (productSearchText.includes('m.2') || productSearchText.includes('m2')) {
        specs['Form Factor'] = 'M.2';
      } else if (productSearchText.includes('2.5"') || productSearchText.includes('2.5 inch')) {
        specs['Form Factor'] = '2.5"';
      } else if (productSearchText.includes('3.5"') || productSearchText.includes('3.5 inch')) {
        specs['Form Factor'] = '3.5"';
      }
    }

    // Interface (PCIe 4.0, PCIe 3.0, SATA III)
    if (!specs['Interface']) {
      if (productSearchText.includes('pcie 4.0') || productSearchText.includes('pcie4') || productSearchText.includes('gen4')) {
        specs['Interface'] = 'PCIe 4.0';
      } else if (productSearchText.includes('pcie 3.0') || productSearchText.includes('pcie3') || productSearchText.includes('gen3')) {
        specs['Interface'] = 'PCIe 3.0';
      } else if (productSearchText.includes('sata') || productSearchText.includes('sata iii') || productSearchText.includes('sata 3')) {
        specs['Interface'] = 'SATA III';
      }
    }

    // Read Speed (e.g., 7000 MB/s, 3500 MB/s)
    if (!specs['Read Speed']) {
      const readSpeedMatch = productSearchText.match(/read[:\s]*(?:speed|speed:)?[:\s]*(\d+(?:,\d+)?)\s*(?:mb\/s|mbps)/i);
      if (readSpeedMatch) {
        specs['Read Speed'] = `${readSpeedMatch[1].replace(/,/g, '')} MB/s`;
      }
    }

    // Write Speed (e.g., 6000 MB/s, 3000 MB/s)
    if (!specs['Write Speed']) {
      const writeSpeedMatch = productSearchText.match(/write[:\s]*(?:speed|speed:)?[:\s]*(\d+(?:,\d+)?)\s*(?:mb\/s|mbps)/i);
      if (writeSpeedMatch) {
        specs['Write Speed'] = `${writeSpeedMatch[1].replace(/,/g, '')} MB/s`;
      }
    }

    // Endurance / TBW (Terabytes Written)
    if (!specs['Endurance'] && !specs['TBW']) {
      const tbwMatch = productSearchText.match(/(\d+)\s*tbw/i);
      if (tbwMatch) {
        specs['TBW'] = `${tbwMatch[1]} TBW`;
      }
    }

    // NAND Type (TLC, QLC, MLC)
    if (!specs['NAND Type']) {
      if (productSearchText.includes('tlc')) {
        specs['NAND Type'] = 'TLC';
      } else if (productSearchText.includes('qlc')) {
        specs['NAND Type'] = 'QLC';
      } else if (productSearchText.includes('mlc')) {
        specs['NAND Type'] = 'MLC';
      }
    }
  }

  // Motherboard specs
  if (category === 'motherboard') {
    // Chipset (e.g., X670E, Z790, B650)
    if (!specs['Chipset']) {
      const chipsetMatch = productSearchText.match(/\b([xz]?\d{3,4}[a-z]?[e]?)\b/i);
      if (chipsetMatch && !chipsetMatch[1].match(/^\d{4}$/)) { // Exclude pure 4-digit numbers
        specs['Chipset'] = chipsetMatch[1].toUpperCase();
      }
    }

    // Socket (e.g., AM5, AM4, LGA1700)
    if (!specs['Socket']) {
      if (productSearchText.includes('am5')) {
        specs['Socket'] = 'AM5';
      } else if (productSearchText.includes('am4')) {
        specs['Socket'] = 'AM4';
      } else if (productSearchText.includes('lga1700') || productSearchText.includes('lga 1700')) {
        specs['Socket'] = 'LGA1700';
      } else if (productSearchText.includes('lga1200') || productSearchText.includes('lga 1200')) {
        specs['Socket'] = 'LGA1200';
      } else if (productSearchText.includes('lga1151') || productSearchText.includes('lga 1151')) {
        specs['Socket'] = 'LGA1151';
      }
    }

    // Form Factor
    if (!specs['Form Factor']) {
      if (productSearchText.includes('mini itx') || productSearchText.includes('mini-itx')) {
        specs['Form Factor'] = 'Mini-ITX';
      } else if (productSearchText.includes('micro atx') || productSearchText.includes('matx') || productSearchText.includes('m-atx')) {
        specs['Form Factor'] = 'Micro ATX';
      } else if (productSearchText.includes('atx')) {
        specs['Form Factor'] = 'ATX';
      } else if (productSearchText.includes('e-atx') || productSearchText.includes('extended atx')) {
        specs['Form Factor'] = 'E-ATX';
      }
    }

    // RAM Type
    if (!specs['RAM Type']) {
      if (productSearchText.includes('ddr5')) {
        specs['RAM Type'] = 'DDR5';
      } else if (productSearchText.includes('ddr4')) {
        specs['RAM Type'] = 'DDR4';
      }
    }

    // WiFi
    if (!specs['WiFi']) {
      if (productSearchText.includes('wifi') || productSearchText.includes('wireless')) {
        specs['WiFi'] = 'Yes';
      }
    }

    // Bluetooth
    if (!specs['Bluetooth']) {
      if (productSearchText.includes('bluetooth') || productSearchText.includes('bt')) {
        specs['Bluetooth'] = 'Yes';
      }
    }
  }

  // PSU specs
  if (category === 'psu') {
    // Wattage
    if (!specs['Wattage']) {
      const wattageMatch = productSearchText.match(/(\d+)\s*w/i);
      if (wattageMatch) {
        specs['Wattage'] = `${wattageMatch[1]}W`;
      }
    }

    // Efficiency/Certification
    if (!specs['Efficiency']) {
      if (productSearchText.includes('80+ titanium') || productSearchText.includes('titanium')) {
        specs['Efficiency'] = '80+ Titanium';
      } else if (productSearchText.includes('80+ platinum') || productSearchText.includes('platinum')) {
        specs['Efficiency'] = '80+ Platinum';
      } else if (productSearchText.includes('80+ gold') || productSearchText.includes('gold')) {
        specs['Efficiency'] = '80+ Gold';
      } else if (productSearchText.includes('80+ bronze') || productSearchText.includes('bronze')) {
        specs['Efficiency'] = '80+ Bronze';
      } else if (productSearchText.includes('80+')) {
        specs['Efficiency'] = '80+';
      }
    }

    // Modular
    if (!specs['Modular']) {
      if (productSearchText.includes('fully modular')) {
        specs['Modular'] = 'Fully Modular';
      } else if (productSearchText.includes('semi-modular') || productSearchText.includes('semi modular')) {
        specs['Modular'] = 'Semi-Modular';
      } else if (productSearchText.includes('modular')) {
        specs['Modular'] = 'Modular';
      }
    }
  }

  // Cooler specs
  if (category === 'cooler') {
    // Type
    if (!specs['Type']) {
      if (productSearchText.includes('aio') || productSearchText.includes('all-in-one') || productSearchText.includes('liquid cooler')) {
        specs['Type'] = 'AIO Liquid';
      } else if (productSearchText.includes('air cooler') || productSearchText.includes('air cooling')) {
        specs['Type'] = 'Air';
      } else if (productSearchText.includes('liquid') || productSearchText.includes('water')) {
        specs['Type'] = 'Liquid';
      }
    }

    // Radiator size (e.g., 360mm, 240mm)
    if (!specs['Radiator Size']) {
      const radMatch = productSearchText.match(/(\d+)\s*mm/i);
      if (radMatch && (productSearchText.includes('radiator') || productSearchText.includes('aio'))) {
        specs['Radiator Size'] = `${radMatch[1]}mm`;
      }
    }

    // Fan size
    if (!specs['Fan Size']) {
      const fanSizeMatch = productSearchText.match(/(\d+)\s*mm/i);
      if (fanSizeMatch && productSearchText.includes('fan')) {
        specs['Fan Size'] = `${fanSizeMatch[1]}mm`;
      }
    }
  }

  // Case specs
  if (category === 'case') {
    // Form Factor
    if (!specs['Form Factor']) {
      if (productSearchText.includes('full tower') || productSearchText.includes('full-tower')) {
        specs['Form Factor'] = 'Full Tower';
      } else if (productSearchText.includes('mid tower') || productSearchText.includes('mid-tower')) {
        specs['Form Factor'] = 'Mid Tower';
      } else if (productSearchText.includes('mini tower') || productSearchText.includes('mini-itx')) {
        specs['Form Factor'] = 'Mini Tower';
      }
    }

    // Side Panel
    if (!specs['Side Panel']) {
      if (productSearchText.includes('tempered glass') || productSearchText.includes('glass')) {
        specs['Side Panel'] = 'Tempered Glass';
      } else if (productSearchText.includes('acrylic')) {
        specs['Side Panel'] = 'Acrylic';
      }
    }
  }

  // Mouse specs
  if (category === 'mouse') {
    // DPI
    if (!specs['DPI']) {
      const dpiMatch = productSearchText.match(/(\d+)\s*dpi/i);
      if (dpiMatch) {
        specs['DPI'] = dpiMatch[1];
      }
    }

    // Wireless
    if (!specs['Wireless']) {
      if (productSearchText.includes('wireless') || productSearchText.includes('wifi')) {
        specs['Wireless'] = 'Yes';
      } else if (productSearchText.includes('wired')) {
        specs['Wireless'] = 'No';
      }
    }

    // Weight
    if (!specs['Weight']) {
      const weightMatch = productSearchText.match(/(\d+)\s*g\b/i);
      if (weightMatch) {
        specs['Weight'] = `${weightMatch[1]}g`;
      }
    }

    // Sensor
    if (!specs['Sensor']) {
      if (productSearchText.includes('hero') || productSearchText.includes('hero sensor')) {
        specs['Sensor'] = 'Hero';
      } else if (productSearchText.includes('pixart')) {
        specs['Sensor'] = 'PixArt';
      } else if (productSearchText.includes('optical')) {
        specs['Sensor'] = 'Optical';
      } else if (productSearchText.includes('laser')) {
        specs['Sensor'] = 'Laser';
      }
    }

    // Polling Rate (e.g., 1000Hz, 8000Hz)
    if (!specs['Polling Rate']) {
      const pollingMatch = productSearchText.match(/(\d+)\s*hz/i);
      if (pollingMatch && parseInt(pollingMatch[1]) >= 125) {
        specs['Polling Rate'] = `${pollingMatch[1]}Hz`;
      }
    }

    // Buttons
    if (!specs['Buttons']) {
      const buttonsMatch = productSearchText.match(/(\d+)\s*buttons?/i);
      if (buttonsMatch) {
        specs['Buttons'] = buttonsMatch[1];
      }
    }

    // Connectivity
    if (!specs['Connectivity']) {
      if (productSearchText.includes('bluetooth')) {
        specs['Connectivity'] = 'Bluetooth';
      } else if (productSearchText.includes('usb')) {
        specs['Connectivity'] = 'USB';
      } else if (productSearchText.includes('wireless')) {
        specs['Connectivity'] = 'Wireless';
      }
    }

    // Battery Life (for wireless mice)
    if (!specs['Battery Life'] && specs['Wireless'] === 'Yes') {
      const batteryMatch = productSearchText.match(/(\d+)\s*hours?/i);
      if (batteryMatch) {
        specs['Battery Life'] = `${batteryMatch[1]} hours`;
      }
    }
  }

  // Keyboard specs
  if (category === 'keyboard') {
    // Switches
    if (!specs['Switches']) {
      if (productSearchText.includes('cherry mx')) {
        const switchTypeMatch = productSearchText.match(/cherry mx\s*(\w+)/i);
        specs['Switches'] = switchTypeMatch ? `Cherry MX ${switchTypeMatch[1]}` : 'Cherry MX';
      } else if (productSearchText.includes('razer')) {
        const switchTypeMatch = productSearchText.match(/razer\s*(\w+)/i);
        specs['Switches'] = switchTypeMatch ? `Razer ${switchTypeMatch[1]}` : 'Razer';
      } else if (productSearchText.includes('mechanical')) {
        specs['Switches'] = 'Mechanical';
      } else if (productSearchText.includes('membrane')) {
        specs['Switches'] = 'Membrane';
      }
    }

    // Layout
    if (!specs['Layout']) {
      if (productSearchText.includes('tkl') || productSearchText.includes('tenkeyless')) {
        specs['Layout'] = 'TKL';
      } else if (productSearchText.includes('full size') || productSearchText.includes('full-size')) {
        specs['Layout'] = 'Full';
      } else if (productSearchText.includes('60%') || productSearchText.includes('60 percent')) {
        specs['Layout'] = '60%';
      }
    }

    // Wireless
    if (!specs['Wireless']) {
      if (productSearchText.includes('wireless') || productSearchText.includes('bluetooth')) {
        specs['Wireless'] = 'Yes';
      }
    }

    // RGB
    if (!specs['RGB']) {
      if (productSearchText.includes('rgb') || productSearchText.includes('rgb lighting')) {
        specs['RGB'] = 'Yes';
      }
    }

    // Battery Life (for wireless keyboards)
    if (!specs['Battery Life'] && specs['Wireless'] === 'Yes') {
      const batteryMatch = productSearchText.match(/(\d+)\s*hours?/i);
      if (batteryMatch) {
        specs['Battery Life'] = `${batteryMatch[1]} hours`;
      }
    }

    // Connectivity
    if (!specs['Connectivity']) {
      if (productSearchText.includes('bluetooth')) {
        specs['Connectivity'] = 'Bluetooth';
      } else if (productSearchText.includes('usb')) {
        specs['Connectivity'] = 'USB';
      } else if (productSearchText.includes('wireless')) {
        specs['Connectivity'] = 'Wireless';
      }
    }

    // Backlight
    if (!specs['Backlight']) {
      if (productSearchText.includes('backlight') || productSearchText.includes('backlit')) {
        specs['Backlight'] = 'Yes';
      }
    }
  }

  // Headset specs
  if (category === 'headset') {
    // Drivers
    if (!specs['Drivers']) {
      const driverMatch = productSearchText.match(/(\d+)\s*mm/i);
      if (driverMatch && (productSearchText.includes('driver') || productSearchText.includes('mm'))) {
        specs['Drivers'] = `${driverMatch[1]}mm`;
      }
    }

    // Wireless
    if (!specs['Wireless']) {
      if (productSearchText.includes('wireless') || productSearchText.includes('bluetooth')) {
        specs['Wireless'] = 'Yes';
      } else if (productSearchText.includes('wired')) {
        specs['Wireless'] = 'No';
      }
    }

    // Microphone
    if (!specs['Microphone']) {
      if (productSearchText.includes('detachable mic') || productSearchText.includes('detachable microphone')) {
        specs['Microphone'] = 'Detachable';
      } else if (productSearchText.includes('retractable mic') || productSearchText.includes('retractable microphone')) {
        specs['Microphone'] = 'Retractable';
      } else if (productSearchText.includes('mic') || productSearchText.includes('microphone')) {
        specs['Microphone'] = 'Yes';
      }
    }

    // Noise Cancellation
    if (!specs['Noise Cancellation']) {
      if (productSearchText.includes('noise cancelling') || productSearchText.includes('noise cancellation') || productSearchText.includes('anc')) {
        specs['Noise Cancellation'] = 'Yes';
      }
    }

    // Surround Sound
    if (!specs['Surround Sound']) {
      if (productSearchText.includes('surround') || productSearchText.includes('7.1') || productSearchText.includes('5.1')) {
        specs['Surround Sound'] = 'Yes';
      }
    }

    // Frequency Response (e.g., 20Hz-20kHz)
    if (!specs['Frequency Response']) {
      const freqMatch = productSearchText.match(/(\d+)\s*hz[-\s]*(\d+)\s*hz/i);
      if (freqMatch) {
        specs['Frequency Response'] = `${freqMatch[1]}Hz - ${freqMatch[2]}Hz`;
      }
    }

    // Impedance (e.g., 32 ohms, 50 ohms)
    if (!specs['Impedance']) {
      const impedanceMatch = productSearchText.match(/(\d+)\s*ohms?/i);
      if (impedanceMatch) {
        specs['Impedance'] = `${impedanceMatch[1]}Ω`;
      }
    }

    // Battery Life (for wireless headsets)
    if (!specs['Battery Life'] && specs['Wireless'] === 'Yes') {
      const batteryMatch = productSearchText.match(/(\d+)\s*hours?/i);
      if (batteryMatch) {
        specs['Battery Life'] = `${batteryMatch[1]} hours`;
      }
    }

    // Connectivity (USB, 3.5mm, Bluetooth)
    if (!specs['Connectivity']) {
      if (productSearchText.includes('usb')) {
        specs['Connectivity'] = 'USB';
      } else if (productSearchText.includes('3.5mm') || productSearchText.includes('jack')) {
        specs['Connectivity'] = '3.5mm';
      } else if (productSearchText.includes('bluetooth')) {
        specs['Connectivity'] = 'Bluetooth';
      }
    }

    // Weight
    if (!specs['Weight']) {
      const weightMatch = productSearchText.match(/(\d+)\s*g\b/i);
      if (weightMatch) {
        specs['Weight'] = `${weightMatch[1]}g`;
      }
    }
  }

  // Get main image
  const image = wcProduct.images[0]?.src || wcProduct.images[0]?.thumbnail || '';

  // Get all images for gallery
  const images = wcProduct.images.map(img => img.src || img.thumbnail).filter(Boolean);

  // Parse price
  const price = parseFloat(wcProduct.price || wcProduct.regular_price || '0');

  // Check stock status
  const inStock = wcProduct.stock_status === 'instock' ||
    (wcProduct.manage_stock && (wcProduct.stock_quantity || 0) > 0);

  // Fallback: If very few specs were extracted, try to extract basic info from product name
  // This ensures we always have at least some specs to display
  if (Object.keys(specs).length < 2) {
    const nameLower = wcProduct.name.toLowerCase();
    
    // Extract any numbers that might be specs (capacity, speed, etc.)
    const numberMatches = wcProduct.name.match(/(\d+)\s*(gb|tb|mhz|ghz|w|hz|dpi|mm|inch|"|')/gi);
    if (numberMatches && numberMatches.length > 0) {
      // Add as a general "Key Features" spec
      if (!specs['Key Features']) {
        specs['Key Features'] = numberMatches.slice(0, 3).join(', ');
      }
    }
    
    // Extract brand if not already in specs
    if (brand !== 'Unknown' && !specs['Brand']) {
      specs['Brand'] = brand;
    }
  }

  // Debug: Log extracted specs for products with few specs
  if (Object.keys(specs).length < 3 && category) {
    console.log(`📋 Extracted specs for ${wcProduct.name} (${category}):`, {
      totalSpecs: Object.keys(specs).length,
      specKeys: Object.keys(specs),
      sampleSpecs: Object.entries(specs).slice(0, 5)
    });
  }

  return {
    id: wcProduct.id.toString(),
    name: wcProduct.name,
    brand,
    category,
    price,
    image,
    images: images.length > 0 ? images : undefined,
    specs,
    inStock,
    compatibility,
  };
};

// Cache for products to avoid refetching
const productCache = new Map<string, { products: PCComponent[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (reduced to ensure freshness)
const LOCAL_STORAGE_PREFIX = 'techtitan-products-cache-v2-';
const MAX_LOCAL_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB max

const getCacheKey = (params: UseWooCommerceProductsOptions): string => {
  return JSON.stringify(params || {});
};

// Get cached products from memory first, then localStorage
const getCachedProducts = (key: string): PCComponent[] | null => {
  // Try memory cache first (faster)
  const cached = productCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.products;
  }

  // Try localStorage as fallback
  try {
    const storageKey = LOCAL_STORAGE_PREFIX + btoa(key).replace(/[+/=]/g, '').substring(0, 50);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_DURATION) {
        // Restore to memory cache
        productCache.set(key, parsed);
        return parsed.products;
      } else {
        // Expired, remove from localStorage
        localStorage.removeItem(storageKey);
      }
    }
  } catch (error) {
    // localStorage might be full or disabled, ignore
    console.warn('Error reading from localStorage cache:', error);
  }

  return null;
};

// Set cached products to both memory and localStorage
const setCachedProducts = (key: string, products: PCComponent[]) => {
  const cacheData = { products, timestamp: Date.now() };

  // Store in memory cache (always)
  productCache.set(key, cacheData);

  // Store in localStorage (with size limit check)
  try {
    const storageKey = LOCAL_STORAGE_PREFIX + btoa(key).replace(/[+/=]/g, '').substring(0, 50);
    const dataString = JSON.stringify(cacheData);

    // Check if adding this would exceed size limit
    let currentSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const itemKey = localStorage.key(i);
      if (itemKey?.startsWith(LOCAL_STORAGE_PREFIX)) {
        currentSize += (localStorage.getItem(itemKey)?.length || 0);
      }
    }

    if (currentSize + dataString.length < MAX_LOCAL_STORAGE_SIZE) {
      localStorage.setItem(storageKey, dataString);
    } else {
      // Clear old cache entries if approaching limit
      const entries: Array<{ key: string; timestamp: number }> = [];
      for (let i = 0; i < localStorage.length; i++) {
        const itemKey = localStorage.key(i);
        if (itemKey?.startsWith(LOCAL_STORAGE_PREFIX)) {
          try {
            const item = localStorage.getItem(itemKey);
            if (item) {
              const parsed = JSON.parse(item);
              entries.push({ key: itemKey, timestamp: parsed.timestamp || 0 });
            }
          } catch (e) {
            // Invalid entry, remove it
            localStorage.removeItem(itemKey!);
          }
        }
      }

      // Remove oldest 20% of entries
      entries.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = Math.floor(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        localStorage.removeItem(entries[i].key);
      }

      // Try again
      try {
        localStorage.setItem(storageKey, dataString);
      } catch (e) {
        // Still too large, skip localStorage caching for this entry
        console.warn('Skipping localStorage cache due to size limit');
      }
    }
  } catch (error) {
    // localStorage might be full or disabled, ignore
    console.warn('Error writing to localStorage cache:', error);
  }
};

export const useWooCommerceProducts = (
  params?: UseWooCommerceProductsOptions
): UseWooCommerceProductsReturn => {
  const [products, setProducts] = useState<PCComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | undefined>(undefined);

  const actualParams = params || {};
  const { fetchAll = false, ...fetchParams } = actualParams;

  const loadProducts = async () => {
    // Skip if per_page is 0 (signal to skip fetching)
    if (actualParams.per_page === 0) {
      setLoading(false);
      setProducts([]);
      return;
    }

    const cacheKey = getCacheKey(actualParams);
    const cached = getCachedProducts(cacheKey);

    // If category or search is specified, don't use cache - always fetch fresh
    // This prevents showing wrong products when category/search changes
    const hasCategoryOrSearch = fetchParams.category || fetchParams.search;
    const shouldUseCache = cached && !hasCategoryOrSearch;

    if (shouldUseCache) {
      setProducts(cached);
      setTotalProducts(cached.length);
      setLoading(false);
      // Still fetch in background to update cache
      setLoading(true);
    } else {
      setLoading(true);
      // Clear products immediately when category/search changes to avoid showing wrong data
      if (hasCategoryOrSearch) {
        setProducts([]);
      }
    }

    setError(null);

    try {
      // Use fetchAllProducts if fetchAll is true, otherwise use regular fetchProducts
      let result;
      if (fetchAll) {
        const allProducts = await fetchAllProducts(fetchParams);
        // For search queries, we don't know the true total (WooCommerce does OR search)
        // So we use the fetched count, but note it may be limited
        result = {
          products: allProducts,
          totalProducts: allProducts.length,
          // Note: If search was used, totalProducts represents fetched count, not true total
        };
      } else {
        result = await fetchProducts(fetchParams);
      }

      console.log(`📥 Received ${result.products.length} products from WooCommerce API`);

      // Check if we're filtering by a specific category
      // If so, skip the laptop cooler filter for that category
      const categoryParam = Array.isArray(fetchParams.category)
        ? fetchParams.category[0]
        : fetchParams.category;
      const isViewingCoolerCategory = categoryParam && (
        String(categoryParam).toLowerCase().includes('cooler')
      );

      const mappedProducts = result.products
        .map((wcProduct, index) => {
          // Skip laptop cooler filter if viewing cooler category OR if product has cooler category
          const hasCoolerCategory = wcProduct.categories?.some(cat =>
            cat.slug?.toLowerCase().includes('cooler') ||
            cat.name?.toLowerCase().includes('cooler')
          );
          const skipFilter = isViewingCoolerCategory || hasCoolerCategory || false;
          const mapped = mapWooCommerceToPCComponent(wcProduct, skipFilter);
          if (!mapped) {
            console.warn(`⚠️ Product ${index + 1} filtered out:`, {
              name: wcProduct.name,
              status: wcProduct.status,
              purchasable: wcProduct.purchasable,
              categories: wcProduct.categories?.map(c => `${c.slug} (${c.name})`).join(', '),
              pc_component_category: (wcProduct as any)._pc_component_category || 'not set',
            });
          } else {
            // Log successful mapping for debugging
            if (index < 3) { // Only log first 3 to avoid spam
              console.log(`✓ Mapped product ${index + 1}: ${mapped.name} → category: ${mapped.category}`);
            }
          }
          return mapped;
        })
        .filter((p): p is PCComponent => p !== null);

      console.log(`✅ Mapped ${mappedProducts.length} products (${result.products.length - mappedProducts.length} filtered out)`);
      if (mappedProducts.length > 0) {
        console.log(`   Sample product: ${mappedProducts[0].name} (category: ${mappedProducts[0].category})`);
      }

      // Cache the results
      setCachedProducts(cacheKey, mappedProducts);

      setProducts(mappedProducts);
      // Use totalProducts from API if available, otherwise use mapped products count
      setTotalProducts(result.totalProducts !== undefined ? result.totalProducts : mappedProducts.length);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      console.error('Error loading WooCommerce products:', err);
      // Don't show cached data on error if category/search was specified
      if (hasCategoryOrSearch) {
        setProducts([]);
      } else if (cached) {
        // Only use cache on error if no category/search was specified
        setProducts(cached);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(actualParams)]);

  return {
    products,
    loading,
    error,
    refetch: loadProducts,
    totalProducts,
  };
};

