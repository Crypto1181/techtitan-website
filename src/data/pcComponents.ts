export type ComponentCategory = 
  | 'cpu'
  | 'gpu'
  | 'motherboard'
  | 'ram'
  | 'storage'
  | 'psu'
  | 'case'
  | 'cooler'
  | 'mouse'
  | 'keyboard'
  | 'headset';

export interface PCComponent {
  id: string;
  name: string;
  brand: string;
  category: ComponentCategory;
  price: number;
  image: string;
  specs: Record<string, string>;
  inStock: boolean;
  compatibility: {
    socket?: string;
    ramType?: string;
    formFactor?: string;
    wattage?: number;
  };
}

export interface CategoryInfo {
  id: ComponentCategory;
  name: string;
  icon: string;
  description: string;
}

export const categories: CategoryInfo[] = [
  { id: 'cpu', name: 'CPU', icon: '🔲', description: 'Processor' },
  { id: 'motherboard', name: 'Motherboard', icon: '📟', description: 'Main Board' },
  { id: 'gpu', name: 'Graphics Card', icon: '🎮', description: 'GPU' },
  { id: 'ram', name: 'Memory', icon: '💾', description: 'RAM' },
  { id: 'storage', name: 'Storage', icon: '💿', description: 'SSD/HDD' },
  { id: 'psu', name: 'Power Supply', icon: '⚡', description: 'PSU' },
  { id: 'cooler', name: 'CPU Cooler', icon: '❄️', description: 'Cooling' },
  { id: 'case', name: 'Case', icon: '🖥️', description: 'Chassis' },
  { id: 'mouse', name: 'Mouse', icon: '🖱️', description: 'Gaming Mouse' },
  { id: 'keyboard', name: 'Keyboard', icon: '⌨️', description: 'Gaming Keyboard' },
  { id: 'headset', name: 'Headset', icon: '🎧', description: 'Gaming Headset' },
];

export const sampleComponents: PCComponent[] = [
  // CPUs
  {
    id: 'cpu-1',
    name: 'AMD Ryzen 9 7950X',
    brand: 'AMD',
    category: 'cpu',
    price: 549.99,
    image: '/placeholder.svg',
    specs: { cores: '16', threads: '32', baseClock: '4.5 GHz', boostClock: '5.7 GHz', tdp: '170W' },
    inStock: true,
    compatibility: { socket: 'AM5' }
  },
  {
    id: 'cpu-2',
    name: 'Intel Core i9-14900K',
    brand: 'Intel',
    category: 'cpu',
    price: 589.99,
    image: '/placeholder.svg',
    specs: { cores: '24', threads: '32', baseClock: '3.2 GHz', boostClock: '6.0 GHz', tdp: '125W' },
    inStock: true,
    compatibility: { socket: 'LGA1700' }
  },
  {
    id: 'cpu-3',
    name: 'AMD Ryzen 7 7800X3D',
    brand: 'AMD',
    category: 'cpu',
    price: 449.99,
    image: '/placeholder.svg',
    specs: { cores: '8', threads: '16', baseClock: '4.2 GHz', boostClock: '5.0 GHz', tdp: '120W' },
    inStock: true,
    compatibility: { socket: 'AM5' }
  },
  {
    id: 'cpu-4',
    name: 'Intel Core i7-14700K',
    brand: 'Intel',
    category: 'cpu',
    price: 409.99,
    image: '/placeholder.svg',
    specs: { cores: '20', threads: '28', baseClock: '3.4 GHz', boostClock: '5.6 GHz', tdp: '125W' },
    inStock: false,
    compatibility: { socket: 'LGA1700' }
  },

  // GPUs
  {
    id: 'gpu-1',
    name: 'NVIDIA GeForce RTX 4090',
    brand: 'NVIDIA',
    category: 'gpu',
    price: 1599.99,
    image: '/placeholder.svg',
    specs: { vram: '24GB GDDR6X', coreClock: '2.52 GHz', tdp: '450W' },
    inStock: true,
    compatibility: { wattage: 450 }
  },
  {
    id: 'gpu-2',
    name: 'AMD Radeon RX 7900 XTX',
    brand: 'AMD',
    category: 'gpu',
    price: 949.99,
    image: '/placeholder.svg',
    specs: { vram: '24GB GDDR6', coreClock: '2.5 GHz', tdp: '355W' },
    inStock: true,
    compatibility: { wattage: 355 }
  },
  {
    id: 'gpu-3',
    name: 'NVIDIA GeForce RTX 4070 Ti Super',
    brand: 'NVIDIA',
    category: 'gpu',
    price: 799.99,
    image: '/placeholder.svg',
    specs: { vram: '16GB GDDR6X', coreClock: '2.61 GHz', tdp: '285W' },
    inStock: true,
    compatibility: { wattage: 285 }
  },

  // Motherboards
  {
    id: 'mb-1',
    name: 'ASUS ROG Crosshair X670E Hero',
    brand: 'ASUS',
    category: 'motherboard',
    price: 699.99,
    image: '/placeholder.svg',
    specs: { chipset: 'X670E', formFactor: 'ATX', ramSlots: '4', maxRam: '128GB' },
    inStock: true,
    compatibility: { socket: 'AM5', ramType: 'DDR5', formFactor: 'ATX' }
  },
  {
    id: 'mb-2',
    name: 'MSI MEG Z790 ACE',
    brand: 'MSI',
    category: 'motherboard',
    price: 599.99,
    image: '/placeholder.svg',
    specs: { chipset: 'Z790', formFactor: 'ATX', ramSlots: '4', maxRam: '192GB' },
    inStock: true,
    compatibility: { socket: 'LGA1700', ramType: 'DDR5', formFactor: 'ATX' }
  },

  // RAM
  {
    id: 'ram-1',
    name: 'G.Skill Trident Z5 RGB 32GB',
    brand: 'G.Skill',
    category: 'ram',
    price: 159.99,
    image: '/placeholder.svg',
    specs: { capacity: '32GB (2x16GB)', speed: '6000MHz', latency: 'CL36', type: 'DDR5' },
    inStock: true,
    compatibility: { ramType: 'DDR5' }
  },
  {
    id: 'ram-2',
    name: 'Corsair Dominator Platinum RGB 64GB',
    brand: 'Corsair',
    category: 'ram',
    price: 299.99,
    image: '/placeholder.svg',
    specs: { capacity: '64GB (2x32GB)', speed: '5600MHz', latency: 'CL36', type: 'DDR5' },
    inStock: true,
    compatibility: { ramType: 'DDR5' }
  },

  // Storage
  {
    id: 'storage-1',
    name: 'Samsung 990 Pro 2TB',
    brand: 'Samsung',
    category: 'storage',
    price: 179.99,
    image: '/placeholder.svg',
    specs: { capacity: '2TB', type: 'NVMe SSD', readSpeed: '7450 MB/s', writeSpeed: '6900 MB/s' },
    inStock: true,
    compatibility: {}
  },
  {
    id: 'storage-2',
    name: 'WD Black SN850X 1TB',
    brand: 'Western Digital',
    category: 'storage',
    price: 89.99,
    image: '/placeholder.svg',
    specs: { capacity: '1TB', type: 'NVMe SSD', readSpeed: '7300 MB/s', writeSpeed: '6300 MB/s' },
    inStock: true,
    compatibility: {}
  },

  // PSU
  {
    id: 'psu-1',
    name: 'Corsair RM1000x',
    brand: 'Corsair',
    category: 'psu',
    price: 189.99,
    image: '/placeholder.svg',
    specs: { wattage: '1000W', efficiency: '80+ Gold', modular: 'Fully Modular' },
    inStock: true,
    compatibility: { wattage: 1000 }
  },
  {
    id: 'psu-2',
    name: 'EVGA SuperNOVA 850 G7',
    brand: 'EVGA',
    category: 'psu',
    price: 149.99,
    image: '/placeholder.svg',
    specs: { wattage: '850W', efficiency: '80+ Gold', modular: 'Fully Modular' },
    inStock: true,
    compatibility: { wattage: 850 }
  },

  // Coolers
  {
    id: 'cooler-1',
    name: 'NZXT Kraken X73 RGB',
    brand: 'NZXT',
    category: 'cooler',
    price: 199.99,
    image: '/placeholder.svg',
    specs: { type: 'AIO Liquid', radiator: '360mm', fans: '3x 120mm' },
    inStock: true,
    compatibility: { socket: 'AM5' }
  },
  {
    id: 'cooler-2',
    name: 'Noctua NH-D15',
    brand: 'Noctua',
    category: 'cooler',
    price: 109.99,
    image: '/placeholder.svg',
    specs: { type: 'Air', height: '165mm', fans: '2x 140mm' },
    inStock: true,
    compatibility: { socket: 'AM5' }
  },

  // Cases
  {
    id: 'case-1',
    name: 'Lian Li O11 Dynamic EVO',
    brand: 'Lian Li',
    category: 'case',
    price: 169.99,
    image: '/placeholder.svg',
    specs: { formFactor: 'Mid Tower', material: 'Aluminum/Glass', gpuClearance: '420mm' },
    inStock: true,
    compatibility: { formFactor: 'ATX' }
  },
  {
    id: 'case-2',
    name: 'Corsair 5000D Airflow',
    brand: 'Corsair',
    category: 'case',
    price: 174.99,
    image: '/placeholder.svg',
    specs: { formFactor: 'Mid Tower', material: 'Steel/Glass', gpuClearance: '400mm' },
    inStock: true,
    compatibility: { formFactor: 'ATX' }
  },

  // Mouse
  {
    id: 'mouse-1',
    name: 'Razer DeathAdder V3 Pro',
    brand: 'Razer',
    category: 'mouse',
    price: 149.99,
    image: '/placeholder.svg',
    specs: { dpi: '30000', sensor: 'Focus Pro 30K', wireless: 'Yes', battery: '90 hours' },
    inStock: true,
    compatibility: {}
  },
  {
    id: 'mouse-2',
    name: 'Logitech G Pro X Superlight 2',
    brand: 'Logitech',
    category: 'mouse',
    price: 159.99,
    image: '/placeholder.svg',
    specs: { dpi: '32000', sensor: 'Hero 2', wireless: 'Yes', weight: '60g' },
    inStock: true,
    compatibility: {}
  },

  // Keyboard
  {
    id: 'keyboard-1',
    name: 'Corsair K70 RGB TKL',
    brand: 'Corsair',
    category: 'keyboard',
    price: 149.99,
    image: '/placeholder.svg',
    specs: { switches: 'Cherry MX Red', layout: 'TKL', rgb: 'Yes', connectivity: 'USB' },
    inStock: true,
    compatibility: {}
  },
  {
    id: 'keyboard-2',
    name: 'Razer BlackWidow V4 Pro',
    brand: 'Razer',
    category: 'keyboard',
    price: 229.99,
    image: '/placeholder.svg',
    specs: { switches: 'Razer Green', layout: 'Full', rgb: 'Yes', connectivity: 'USB/Wireless' },
    inStock: true,
    compatibility: {}
  },

  // Headset
  {
    id: 'headset-1',
    name: 'SteelSeries Arctis Nova Pro',
    brand: 'SteelSeries',
    category: 'headset',
    price: 349.99,
    image: '/placeholder.svg',
    specs: { drivers: '40mm', frequency: '10-40000 Hz', microphone: 'Retractable', wireless: 'Yes' },
    inStock: true,
    compatibility: {}
  },
  {
    id: 'headset-2',
    name: 'HyperX Cloud Alpha Wireless',
    brand: 'HyperX',
    category: 'headset',
    price: 199.99,
    image: '/placeholder.svg',
    specs: { drivers: '50mm', frequency: '15-25000 Hz', microphone: 'Detachable', battery: '300 hours' },
    inStock: true,
    compatibility: {}
  },
];

export const preBuilds = {
  budget: {
    name: 'Budget Gaming',
    description: 'Great for 1080p gaming',
    targetFps: '60+ FPS @ 1080p',
    priceRange: '$800 - $1000',
    components: ['cpu-3', 'gpu-3', 'mb-1', 'ram-1', 'storage-2', 'psu-2', 'cooler-2', 'case-2']
  },
  mainstream: {
    name: 'Mainstream Gaming',
    description: 'Perfect for 1440p gaming',
    targetFps: '100+ FPS @ 1440p',
    priceRange: '$1500 - $2000',
    components: ['cpu-2', 'gpu-2', 'mb-2', 'ram-1', 'storage-1', 'psu-1', 'cooler-1', 'case-1']
  },
  enthusiast: {
    name: 'Enthusiast',
    description: 'Ultimate 4K gaming experience',
    targetFps: '60+ FPS @ 4K Ultra',
    priceRange: '$3000+',
    components: ['cpu-1', 'gpu-1', 'mb-1', 'ram-2', 'storage-1', 'psu-1', 'cooler-1', 'case-1']
  }
};

export const popularGames = [
  { id: 'cyberpunk', name: 'Cyberpunk 2077', image: '/placeholder.svg' },
  { id: 'cod', name: 'Call of Duty: MW3', image: '/placeholder.svg' },
  { id: 'fortnite', name: 'Fortnite', image: '/placeholder.svg' },
  { id: 'valorant', name: 'Valorant', image: '/placeholder.svg' },
  { id: 'gta', name: 'GTA V', image: '/placeholder.svg' },
  { id: 'minecraft', name: 'Minecraft', image: '/placeholder.svg' },
  { id: 'eldenring', name: 'Elden Ring', image: '/placeholder.svg' },
  { id: 'starfield', name: 'Starfield', image: '/placeholder.svg' },
];
