// WooCommerce API Types
export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: string;
  status: string;
  featured: boolean;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  manage_stock: boolean;
  stock_quantity: number | null;
  images: WooCommerceImage[];
  categories: WooCommerceCategory[];
  tags: WooCommerceTag[];
  attributes: WooCommerceAttribute[];
  meta_data: WooCommerceMetaData[];
}

export interface WooCommerceImage {
  id: number;
  src: string;
  name: string;
  alt: string;
  thumbnail: string;
}

export interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WooCommerceTag {
  id: number;
  name: string;
  slug: string;
}

export interface WooCommerceAttribute {
  id: number;
  name: string;
  options: string[];
}

export interface WooCommerceMetaData {
  id: number;
  key: string;
  value: any;
}

// Category mapping from WooCommerce to our app
export const categoryMapping: Record<string, string> = {
  'cpu': 'CPU',
  'processor': 'CPU',
  'gpu': 'Graphics Card',
  'graphics-card': 'Graphics Card',
  'video-card': 'Graphics Card',
  'motherboard': 'Motherboard',
  'mainboard': 'Motherboard',
  'ram': 'Memory',
  'memory': 'Memory',
  'storage': 'Storage',
  'ssd': 'Storage',
  'hdd': 'Storage',
  'psu': 'Power Supply',
  'power-supply': 'Power Supply',
  'cooler': 'CPU Cooler',
  'cpu-cooler': 'CPU Cooler',
  'air-cooler': 'CPU Cooler',
  'case': 'Case',
  'chassis': 'Case',
  'mouse': 'Mouse',
  'gaming-mouse': 'Mouse',
  'keyboard': 'Keyboard',
  'gaming-keyboard': 'Keyboard',
  'headset': 'Headset',
  'gaming-headset': 'Headset',
  'headphones': 'Headset',
};

