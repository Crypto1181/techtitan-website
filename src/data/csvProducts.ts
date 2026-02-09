import { PCComponent, ComponentCategory } from './pcComponents';
import { parseCSVProducts } from '@/utils/csvParser';

// This will be populated by loading the CSV file
let csvProductsCache: Record<ComponentCategory, PCComponent[]> | null = null;

/**
 * Loads products from CSV file and caches them
 */
export const loadCSVProducts = async (): Promise<Record<ComponentCategory, PCComponent[]>> => {
  if (csvProductsCache) {
    return csvProductsCache;
  }
  
  try {
    const response = await fetch('/wc-product-export-26-12-2025-1766805512226.csv');
    const csvContent = await response.text();
    csvProductsCache = parseCSVProducts(csvContent);
    return csvProductsCache;
  } catch (error) {
    console.error('Error loading CSV products:', error);
    // Return empty categories if CSV fails to load
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
};

/**
 * Gets products for a specific category
 */
export const getCSVProductsByCategory = async (
  category: ComponentCategory
): Promise<PCComponent[]> => {
  const products = await loadCSVProducts();
  return products[category] || [];
};

/**
 * Gets all CSV products
 */
export const getAllCSVProducts = async (): Promise<PCComponent[]> => {
  const products = await loadCSVProducts();
  return Object.values(products).flat();
};

/**
 * Gets product count by category
 */
export const getCSVProductCounts = async (): Promise<Record<ComponentCategory, number>> => {
  const products = await loadCSVProducts();
  return {
    cpu: products.cpu.length,
    gpu: products.gpu.length,
    motherboard: products.motherboard.length,
    ram: products.ram.length,
    storage: products.storage.length,
    psu: products.psu.length,
    case: products.case.length,
    cooler: products.cooler.length,
    mouse: products.mouse.length,
    keyboard: products.keyboard.length,
    headset: products.headset.length,
  };
};

