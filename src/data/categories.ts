import { 
  Monitor, 
  Cpu, 
  HardDrive, 
  Laptop, 
  Gamepad2, 
  Headphones, 
  Keyboard, 
  Mouse, 
  Wifi, 
  Home, 
  Camera, 
  Watch, 
  Printer, 
  Speaker,
  Smartphone,
  Tablet,
  Cable,
  Battery,
  ShoppingBag,
  Tv,
  type LucideIcon
} from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  subcategories?: string[];
}

export const categories: Category[] = [
  {
    id: 'computer-parts',
    name: 'Computer Parts',
    icon: Cpu,
    subcategories: ['CPU', 'Graphic Cards', 'Motherboards', 'RAM', 'Power Supplies', 'Cases', 'Coolers & Fans', 'Storage Drives']
  },
  {
    id: 'laptops',
    name: 'Laptops & Desktops',
    icon: Laptop,
    subcategories: ['Gaming Laptops', 'Business Laptops', 'Desktops', 'iMac & Mac Mini']
  },
  {
    id: 'monitors',
    name: 'Monitors',
    icon: Monitor,
    subcategories: ['Gaming Monitors', 'Office Monitors', '4K Monitors', 'Curved Monitors']
  },
  {
    id: 'peripherals',
    name: 'Peripherals',
    icon: Keyboard,
    subcategories: ['Keyboards', 'Mouse', 'Mousepads', 'Headsets', 'Webcams', 'Microphones']
  },
  {
    id: 'gaming',
    name: 'Gaming & VR',
    icon: Gamepad2,
    subcategories: ['Gaming Chairs', 'Gaming Desks', 'Consoles', 'VR Headsets', 'Controllers']
  },
  {
    id: 'audio',
    name: 'Audio',
    icon: Headphones,
    subcategories: ['Earphones', 'Headsets', 'Speakers', 'Microphones']
  },
  {
    id: 'networking',
    name: 'Networking',
    icon: Wifi,
    subcategories: ['Routers', 'Mesh WiFi', 'Switches', 'WiFi Adapters', 'Repeaters']
  },
  {
    id: 'smart-home',
    name: 'Smart Home',
    icon: Home,
    subcategories: ['Projectors', 'Smart Plugs', 'Ring Doorbell', 'Digital Frames']
  },
  {
    id: 'cameras',
    name: 'Cameras',
    icon: Camera,
    subcategories: ['DSLR Cameras', 'Action Cameras', 'Instant Cameras', 'Webcams', 'Security Cameras']
  },
  {
    id: 'tablets',
    name: 'Tablets',
    icon: Tablet,
    subcategories: ['iPads', 'Android Tablets', 'Drawing Tablets', 'Kindle']
  },
  {
    id: 'wearables',
    name: 'Smart Watches',
    icon: Watch,
    subcategories: ['Apple Watch', 'Samsung Watch', 'Fitness Trackers']
  },
  {
    id: 'printers',
    name: 'Printers & POS',
    icon: Printer,
    subcategories: ['Ink Printers', 'Laser Printers', 'Thermal Printers', 'POS Systems', 'Scanners']
  },
  {
    id: 'cables',
    name: 'Cables & Adapters',
    icon: Cable,
    subcategories: ['Charging Cables', 'HDMI Cables', 'USB Hubs', 'Power Strips']
  },
  {
    id: 'power',
    name: 'Power & UPS',
    icon: Battery,
    subcategories: ['UPS', 'Power Banks', 'Batteries']
  },
  {
    id: 'storage',
    name: 'External Storage',
    icon: HardDrive,
    subcategories: ['External SSD', 'External HDD', 'USB Drives', 'Memory Cards']
  },
  {
    id: 'tv',
    name: 'TVs & Displays',
    icon: Tv,
    subcategories: ['Smart TVs', '4K TVs', 'TV Accessories', 'TV Brackets']
  },
];

export interface DealCategory {
  id: string;
  name: string;
  discount: number;
  image: string;
}

export const dealCategories: DealCategory[] = [
  { id: 'computer-parts', name: 'Computer Parts', discount: 72, image: '/placeholder.svg' },
  { id: 'laptops', name: 'Laptops', discount: 45, image: '/placeholder.svg' },
  { id: 'peripherals', name: 'Peripherals', discount: 66, image: '/placeholder.svg' },
  { id: 'gaming', name: 'Gaming', discount: 55, image: '/placeholder.svg' },
  { id: 'networking', name: 'Networking', discount: 40, image: '/placeholder.svg' },
  { id: 'audio', name: 'Audio', discount: 50, image: '/placeholder.svg' },
];