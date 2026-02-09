import { PCComponent, ComponentCategory } from '@/data/pcComponents';

export interface CSVProduct {
  ID: string;
  Type: string;
  SKU: string;
  Name: string;
  Published: string;
  'Is featured?': string;
  'Visibility in catalog': string;
  'Short description': string;
  Description: string;
  'Regular price': string;
  'Sale price': string;
  Categories: string;
  Tags: string;
  Images: string;
  'In stock?': string;
  Stock: string;
  [key: string]: string;
}

/**
 * Maps WooCommerce CSV categories to app categories
 */
const mapCategory = (csvCategory: string): ComponentCategory | null => {
  const categoryLower = csvCategory.toLowerCase().trim();
  
  // CPU / Processor
  if (categoryLower.includes('cpu') || 
      categoryLower.includes('processor') ||
      categoryLower.includes('intel') && categoryLower.includes('board')) {
    return 'cpu';
  }
  
  // GPU / Graphics Card
  if (categoryLower.includes('gpu') || 
      categoryLower.includes('graphic') || 
      categoryLower.includes('graphics card') ||
      categoryLower.includes('video card')) {
    return 'gpu';
  }
  
  // Motherboard
  if (categoryLower.includes('motherboard') || 
      categoryLower.includes('mainboard') ||
      categoryLower.includes('mobo') ||
      categoryLower === 'motherboards') {
    return 'motherboard';
  }
  
  // RAM / Memory
  if (categoryLower.includes('ram') || 
      categoryLower.includes('memory') || 
      categoryLower.includes('ddr')) {
    return 'ram';
  }
  
  // Storage (SSD, HDD, SATA, NVMe)
  if (categoryLower.includes('ssd') || 
      categoryLower.includes('hdd') || 
      categoryLower.includes('storage') || 
      categoryLower.includes('nvme') ||
      categoryLower.includes('hard drive') ||
      categoryLower === 'sata') {
    return 'storage';
  }
  
  // PSU / Power Supply
  if (categoryLower.includes('psu') || 
      categoryLower.includes('power supply') || 
      categoryLower.includes('power-supply') ||
      categoryLower.includes('backup power')) {
    return 'psu';
  }
  
  // Cooler (Coolers & Fans, Liquid Coolers, Cooling Fans)
  if (categoryLower.includes('cooler') || 
      categoryLower.includes('cooling') ||
      (categoryLower.includes('fan') && !categoryLower.includes('case'))) {
    return 'cooler';
  }
  
  // Case
  if (categoryLower.includes('case') || 
      categoryLower.includes('chassis') ||
      categoryLower.includes('tower')) {
    return 'case';
  }
  
  // Mouse
  if (categoryLower === 'mouse' || 
      categoryLower.includes('mice')) {
    return 'mouse';
  }
  
  // Keyboard
  if (categoryLower === 'keyboards' || 
      categoryLower.includes('keyboard')) {
    return 'keyboard';
  }
  
  // Headset (Headsets, Music Headsets, Earphones)
  if (categoryLower.includes('headset') || 
      categoryLower.includes('headphone') ||
      categoryLower.includes('earphone') ||
      categoryLower.includes('earbud') ||
      categoryLower === 'music headsets') {
    return 'headset';
  }
  
  // Laptops - must check before other categories to avoid false matches
  if (categoryLower.includes('laptop') && 
      !categoryLower.includes('bag') && 
      !categoryLower.includes('accessor') &&
      !categoryLower.includes('sleeve') &&
      !categoryLower.includes('case') &&
      !categoryLower.includes('backpack')) {
    // Laptops don't map to our PCComponent categories, but we can handle them
    // For now, return null and handle separately
    return null; // Will be handled by product name mapping
  }
  
  return null;
};

/**
 * Extracts brand from product name or tags
 */
const extractBrand = (name: string, tags: string = ''): string => {
  const brandKeywords = [
    'AMD', 'Intel', 'NVIDIA', 'ASUS', 'MSI', 'Gigabyte', 'EVGA', 
    'Corsair', 'Kingston', 'Samsung', 'Western Digital', 'Seagate',
    'Logitech', 'Razer', 'SteelSeries', 'HyperX', 'JBL', 'Sony',
    'Philips', 'Marshall', 'Apple', 'Samsung', 'LG', 'Acer',
    'HP', 'Dell', 'Lenovo', 'Toshiba', 'Crucial', 'G.Skill',
    'Thermaltake', 'Cooler Master', 'NZXT', 'Fractal Design',
    'be quiet!', 'Noctua', 'Arctic', 'Deepcool'
  ];
  
  const searchText = `${name} ${tags}`.toLowerCase();
  
  for (const brand of brandKeywords) {
    if (searchText.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  // Try to extract from name (first word if capitalized)
  const firstWord = name.split(' ')[0];
  if (firstWord && firstWord[0] === firstWord[0].toUpperCase() && firstWord.length > 2) {
    return firstWord;
  }
  
  return 'Unknown';
};

/**
 * Parses image URLs from CSV Images column
 */
const parseImages = (imagesString: string): string => {
  if (!imagesString) return '/placeholder.svg';
  
  // Images are typically separated by commas or newlines
  const imageUrls = imagesString.split(',').map(img => img.trim()).filter(Boolean);
  return imageUrls[0] || '/placeholder.svg';
};

/**
 * Extracts specs from description or attributes
 */
const extractSpecs = (description: string, attributes: string = ''): Record<string, string> => {
  const specs: Record<string, string> = {};
  
  // Common spec patterns
  const specPatterns = [
    { pattern: /(\d+)\s*GB/i, key: 'capacity' },
    { pattern: /(\d+)\s*MHz/i, key: 'frequency' },
    { pattern: /(\d+)\s*W/i, key: 'wattage' },
    { pattern: /(\d+)\s*TB/i, key: 'storage' },
    { pattern: /(\d+)\s*GB\s*GDDR/i, key: 'vram' },
    { pattern: /(\d+)\s*cores?/i, key: 'cores' },
    { pattern: /(\d+)\s*threads?/i, key: 'threads' },
  ];
  
  const searchText = `${description} ${attributes}`;
  
  for (const { pattern, key } of specPatterns) {
    const match = searchText.match(pattern);
    if (match && !specs[key]) {
      specs[key] = match[0];
    }
  }
  
  return specs;
};

/**
 * Converts CSV product to PCComponent
 */
export const csvToPCComponent = (csvProduct: CSVProduct): PCComponent | null => {
  // Skip if not published
  if (csvProduct.Published !== '1') {
    return null;
  }
  
  // Parse categories
  const categories = csvProduct.Categories?.split('>').map(c => c.trim()) || [];
  let category: ComponentCategory | null = null;
  
  // Try to find matching category
  for (const cat of categories) {
    const mapped = mapCategory(cat);
    if (mapped) {
      category = mapped;
      break;
    }
  }
  
  // If no category found, try mapping from product name
  if (!category) {
    category = mapCategory(csvProduct.Name) || 'cpu'; // Default to cpu if nothing matches
  }
  
  // Parse price
  const regularPrice = parseFloat(csvProduct['Regular price'] || '0');
  const salePrice = parseFloat(csvProduct['Sale price'] || '0');
  const price = salePrice > 0 ? salePrice : regularPrice;
  
  // Check stock
  const inStock = csvProduct['In stock?'] === '1' || 
                  (csvProduct.Stock && parseInt(csvProduct.Stock) > 0);
  
  // Extract brand
  const brand = extractBrand(csvProduct.Name, csvProduct.Tags);
  
  // Parse images
  const image = parseImages(csvProduct.Images);
  
  // Extract specs
  const specs = extractSpecs(csvProduct.Description || '', csvProduct['Attribute 1 value(s)'] || '');
  
  return {
    id: `csv-${csvProduct.ID}`,
    name: csvProduct.Name,
    brand,
    category,
    price,
    image,
    specs,
    inStock,
    compatibility: {},
  };
};

/**
 * Properly parses CSV line handling quoted fields with commas and newlines
 */
const parseCSVLine = (line: string, headers: string[]): Record<string, string> => {
  const row: Record<string, string> = {};
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    const nextChar = i + 1 < line.length ? line[i + 1] : '';
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
    i++;
  }
  
  // Add last field
  fields.push(currentField.trim());
  
  // Map fields to headers
  headers.forEach((header, index) => {
    row[header] = fields[index] || '';
  });
  
  return row;
};

/**
 * Parses CSV file content and returns organized products by category
 */
export const parseCSVProducts = (csvContent: string): Record<ComponentCategory, PCComponent[]> => {
  // Split by newlines but handle quoted fields that may contain newlines
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = i + 1 < csvContent.length ? csvContent[i + 1] : '';
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // Skip next quote
        continue;
      }
      inQuotes = !inQuotes;
      currentLine += char;
    } else if (char === '\n' && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  if (lines.length < 2) {
    return {
      cpu: [],
      gpu: [],
      motherboard: [],
      ram: [],
      storage: [],
      psu: [],
      case: [],
      cooler: [],
      mouse: [],
      keyboard: [],
      headset: [],
    };
  }
  
  // Parse headers - first get all headers by parsing first line
  const headerLine = lines[0];
  const headerFields: string[] = [];
  let currentHeader = '';
  let inQuotesHeader = false;
  
  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i];
    if (char === '"') {
      inQuotesHeader = !inQuotesHeader;
    } else if (char === ',' && !inQuotesHeader) {
      headerFields.push(currentHeader.trim().replace(/^"|"$/g, ''));
      currentHeader = '';
    } else {
      currentHeader += char;
    }
  }
  if (currentHeader) {
    headerFields.push(currentHeader.trim().replace(/^"|"$/g, ''));
  }
  
  const headers = headerFields;
  
  // Initialize products by category
  const productsByCategory: Record<ComponentCategory, PCComponent[]> = {
    cpu: [],
    gpu: [],
    motherboard: [],
    ram: [],
    storage: [],
    psu: [],
    case: [],
    cooler: [],
    mouse: [],
    keyboard: [],
    headset: [],
  };
  
  // Parse each product row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      const row = parseCSVLine(line, headers);
      const csvProduct: CSVProduct = row as any;
      
      // Convert to PCComponent
      const component = csvToPCComponent(csvProduct);
      
      if (component) {
        productsByCategory[component.category].push(component);
      }
    } catch (error) {
      console.warn(`Error parsing CSV line ${i}:`, error);
      continue;
    }
  }
  
  return productsByCategory;
};

