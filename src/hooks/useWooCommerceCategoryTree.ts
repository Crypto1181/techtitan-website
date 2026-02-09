/**
 * Hook to fetch and display category tree from backend
 * Shows categories with parent-child relationships
 */

import { useState, useEffect } from 'react';
import { fetchCategoryTree } from '@/services/backendApi';
import { 
  Monitor, Cpu, HardDrive, Laptop, Gamepad2, Headphones, Keyboard, Mouse,
  Wifi, Home, Camera, Watch, Printer, Speaker, Tablet, Cable, Battery, Tv,
  ShoppingBag,
  type LucideIcon
} from 'lucide-react';

export interface CategoryTreeItem {
  id: string;
  name: string;
  slug: string;
  icon: LucideIcon;
  count: number;
  children?: CategoryTreeItem[];
}

// Map WooCommerce category slugs to icons
const getIconForCategory = (slug: string, name: string): LucideIcon => {
  const slugLower = slug.toLowerCase();
  const nameLower = name.toLowerCase();
  
  if (slugLower.includes('cpu') || nameLower.includes('cpu') || nameLower.includes('processor')) return Cpu;
  if (slugLower.includes('gpu') || slugLower.includes('graphic') || nameLower.includes('graphic')) return Cpu;
  if (slugLower.includes('motherboard') || nameLower.includes('motherboard')) return Cpu;
  if (slugLower.includes('ram') || nameLower.includes('ram') || nameLower.includes('memory')) return HardDrive;
  if (slugLower.includes('storage') || slugLower.includes('ssd') || slugLower.includes('hdd') || slugLower.includes('nvme')) return HardDrive;
  if (slugLower.includes('laptop') || slugLower.includes('desktop') || nameLower.includes('laptop')) return Laptop;
  if (slugLower.includes('monitor') || nameLower.includes('monitor')) return Monitor;
  if (slugLower.includes('keyboard') || nameLower.includes('keyboard')) return Keyboard;
  if (slugLower.includes('mouse') || nameLower.includes('mouse')) return Mouse;
  if (slugLower.includes('headset') || slugLower.includes('headphone') || nameLower.includes('headset')) return Headphones;
  if (slugLower.includes('speaker') || nameLower.includes('speaker')) return Speaker;
  if (slugLower.includes('gaming') || nameLower.includes('gaming')) return Gamepad2;
  if (slugLower.includes('network') || slugLower.includes('wifi') || slugLower.includes('router')) return Wifi;
  if (slugLower.includes('smart-home') || slugLower.includes('smart home') || nameLower.includes('smart home')) return Home;
  if (slugLower.includes('camera') || nameLower.includes('camera')) return Camera;
  if (slugLower.includes('watch') || nameLower.includes('watch')) return Watch;
  if (slugLower.includes('tablet') || nameLower.includes('tablet')) return Tablet;
  if (slugLower.includes('printer') || nameLower.includes('printer')) return Printer;
  if (slugLower.includes('cable') || slugLower.includes('adapter') || nameLower.includes('cable')) return Cable;
  if (slugLower.includes('power') || slugLower.includes('ups') || slugLower.includes('battery')) return Battery;
  if (slugLower.includes('tv') || nameLower.includes('tv')) return Tv;
  
  return ShoppingBag;
};

export const useWooCommerceCategoryTree = () => {
  const [categoryTree, setCategoryTree] = useState<CategoryTreeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadCategoryTree = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch category tree from backend
        const tree = await fetchCategoryTree();
        
        // Transform backend tree to frontend format
        const transformCategory = (cat: any): CategoryTreeItem => {
          // Decode HTML entities in category names
          const decodedName = (cat.name || '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

          return {
            id: cat.woo_commerce_id?.toString() || cat.id?.toString() || '',
            name: decodedName,
            slug: cat.slug || '',
            icon: getIconForCategory(cat.slug || '', cat.name || ''),
            count: cat.count || 0,
            children: cat.children && cat.children.length > 0
              ? cat.children.map(transformCategory)
              : undefined,
          };
        };

        const transformed = tree
          .filter(cat => (cat.count || 0) > 0) // Only show categories with products
          .map(transformCategory);

        // Sort categories
        const categoryOrder = [
          'laptops', 'laptop', 'consoles', 'console', 'peripherals', 'peripheral',
          'computer-parts', 'computer parts', 'cables-converters', 'cables & converters',
          'multimedia', 'network', 'printers-pos', 'printers & pos', 'cameras', 'camera',
          'smart-home', 'smart home', 'smart-watches', 'smart watches',
          'power-banks', 'power banks', 'tablets', 'tablet', 'cosmetics',
          'home-appliances', 'home appliances', 'miscellaneous',
        ];

        const getSortPriority = (name: string, slug: string): number => {
          const searchStr = `${name.toLowerCase()} ${slug.toLowerCase()}`;
          for (let i = 0; i < categoryOrder.length; i++) {
            if (searchStr.includes(categoryOrder[i])) {
              return i;
            }
          }
          return 999;
        };

        const sortCategories = (cats: CategoryTreeItem[]) => {
          cats.sort((a, b) => {
            const priorityA = getSortPriority(a.name, a.slug);
            const priorityB = getSortPriority(b.name, b.slug);
            if (priorityA !== priorityB) return priorityA - priorityB;
            if (b.count !== a.count) return b.count - a.count;
            return a.name.localeCompare(b.name);
          });
          cats.forEach(cat => {
            if (cat.children) sortCategories(cat.children);
          });
        };

        sortCategories(transformed);
        setCategoryTree(transformed);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch category tree'));
        console.error('Error loading category tree:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryTree();
  }, []);

  return {
    categoryTree,
    loading,
    error,
  };
};

