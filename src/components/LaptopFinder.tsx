import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Laptop, Home, Gamepad2, Briefcase, Video, GraduationCap,
  Sparkles, Feather, Battery, Fingerprint, Keyboard, Camera,
  Check, Search, Star, ShoppingCart
} from 'lucide-react';

type UsageType = 'home' | 'gaming' | 'work' | 'content' | 'education';

interface LaptopResult {
  id: string;
  name: string;
  brand: string;
  price: number;
  specs: {
    processor: string;
    ram: string;
    storage: string;
    display: string;
    battery: string;
  };
  features: string[];
  rating: number;
  image: string;
}

const sampleLaptops: LaptopResult[] = [
  {
    id: 'laptop-1',
    name: 'ASUS ROG Strix G16',
    brand: 'ASUS',
    price: 1499.99,
    specs: { processor: 'Intel Core i9-13980HX', ram: '16GB DDR5', storage: '1TB SSD', display: '16" QHD 240Hz', battery: '90Wh' },
    features: ['gaming', 'backlit', 'webcam'],
    rating: 4.5,
    image: '/placeholder.svg'
  },
  {
    id: 'laptop-2',
    name: 'MacBook Pro 14"',
    brand: 'Apple',
    price: 1999.99,
    specs: { processor: 'Apple M3 Pro', ram: '18GB Unified', storage: '512GB SSD', display: '14.2" Liquid Retina XDR', battery: '17hrs' },
    features: ['content', 'thin', 'battery', 'webcam'],
    rating: 4.8,
    image: '/placeholder.svg'
  },
  {
    id: 'laptop-3',
    name: 'Dell XPS 15',
    brand: 'Dell',
    price: 1299.99,
    specs: { processor: 'Intel Core i7-13700H', ram: '16GB DDR5', storage: '512GB SSD', display: '15.6" OLED 3.5K', battery: '86Wh' },
    features: ['work', 'thin', 'touchscreen', 'webcam'],
    rating: 4.6,
    image: '/placeholder.svg'
  },
  {
    id: 'laptop-4',
    name: 'Lenovo ThinkPad X1 Carbon',
    brand: 'Lenovo',
    price: 1449.99,
    specs: { processor: 'Intel Core i7-1365U', ram: '16GB LPDDR5', storage: '512GB SSD', display: '14" 2.8K OLED', battery: '57Wh' },
    features: ['work', 'thin', 'battery', 'backlit'],
    rating: 4.7,
    image: '/placeholder.svg'
  },
  {
    id: 'laptop-5',
    name: 'HP Pavilion 15',
    brand: 'HP',
    price: 649.99,
    specs: { processor: 'AMD Ryzen 5 7530U', ram: '8GB DDR4', storage: '256GB SSD', display: '15.6" FHD IPS', battery: '41Wh' },
    features: ['home', 'webcam', 'backlit'],
    rating: 4.2,
    image: '/placeholder.svg'
  },
  {
    id: 'laptop-6',
    name: 'Acer Nitro 5',
    brand: 'Acer',
    price: 899.99,
    specs: { processor: 'Intel Core i5-12500H', ram: '16GB DDR4', storage: '512GB SSD', display: '15.6" FHD 144Hz', battery: '57Wh' },
    features: ['gaming', 'backlit'],
    rating: 4.3,
    image: '/placeholder.svg'
  },
];

const LaptopFinder = () => {
  const [selectedUsage, setSelectedUsage] = useState<UsageType | null>(null);
  const [budgetRange, setBudgetRange] = useState<number[]>([0, 3000]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const usageTypes = [
    { id: 'home' as UsageType, name: 'Home / Personal', icon: Home, description: 'Everyday tasks, browsing, streaming' },
    { id: 'gaming' as UsageType, name: 'Gaming', icon: Gamepad2, description: 'High performance gaming' },
    { id: 'work' as UsageType, name: 'Work / Business', icon: Briefcase, description: 'Productivity and office tasks' },
    { id: 'content' as UsageType, name: 'Content Creation', icon: Video, description: 'Video editing, design, streaming' },
    { id: 'education' as UsageType, name: 'Education', icon: GraduationCap, description: 'Students and learning' },
  ];

  const features = [
    { id: 'new', name: 'Newly Added', icon: Sparkles },
    { id: 'thin', name: 'Thin & Light', icon: Feather },
    { id: 'battery', name: '8+ Hrs Battery', icon: Battery },
    { id: 'touchscreen', name: 'Touchscreen', icon: Fingerprint },
    { id: 'backlit', name: 'Backlit Keyboard', icon: Keyboard },
    { id: 'webcam', name: 'Webcam', icon: Camera },
  ];

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    );
  };

  const filteredLaptops = sampleLaptops.filter(laptop => {
    const inBudget = laptop.price >= budgetRange[0] && laptop.price <= budgetRange[1];
    const matchesUsage = !selectedUsage || laptop.features.includes(selectedUsage);
    const matchesFeatures = selectedFeatures.length === 0 || 
      selectedFeatures.some(f => laptop.features.includes(f));
    return inBudget && matchesUsage && matchesFeatures;
  });

  const handleApply = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedUsage(null);
    setBudgetRange([0, 3000]);
    setSelectedFeatures([]);
    setShowResults(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white rounded-lg p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10"></div>
        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-white/20">
              <Laptop className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">LAPTOP FINDER</h1>
          <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
            Use our Laptop Finder to find the perfect laptop for your needs. 
            Filter by usage, budget, and features to find the best match.
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-card border rounded-lg p-6 mb-8">
        {/* Usage Type */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">What will you mainly be using your laptop for?</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {usageTypes.map((usage) => {
              const isSelected = selectedUsage === usage.id;
              return (
                <button
                  key={usage.id}
                  onClick={() => setSelectedUsage(isSelected ? null : usage.id)}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? 'border-accent bg-accent/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <usage.icon className={`h-6 w-6 mb-2 ${isSelected ? 'text-accent' : 'text-muted-foreground'}`} />
                  <span className="text-xs md:text-sm font-medium text-center">{usage.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget Slider */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">What is your budget for the laptop?</h2>
            <div className="flex gap-2 text-sm">
              <span className="px-3 py-1 bg-secondary rounded">${budgetRange[0]}</span>
              <span className="text-muted-foreground">to</span>
              <span className="px-3 py-1 bg-secondary rounded">${budgetRange[1]}</span>
            </div>
          </div>
          <div className="px-2">
            <Slider
              value={budgetRange}
              onValueChange={setBudgetRange}
              max={3000}
              min={0}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>$0</span>
              <span>$3,000+</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Which features do you want in your laptop?</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {features.map((feature) => {
              const isSelected = selectedFeatures.includes(feature.id);
              return (
                <button
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? 'border-accent bg-accent/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <feature.icon className={`h-4 w-4 ${isSelected ? 'text-accent' : 'text-muted-foreground'}`} />
                  <span className="text-xs md:text-sm font-medium">{feature.name}</span>
                  {isSelected && <Check className="h-3 w-3 text-accent ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button className="bg-accent hover:bg-accent/90 text-white px-8" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </div>

      {/* Results Section */}
      {showResults && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Results ({filteredLaptops.length} laptops found)</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <span>Sort by: Featured</span>
            </div>
          </div>

          {filteredLaptops.length === 0 ? (
            <div className="text-center py-12 bg-card border rounded-lg">
              <Laptop className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No laptops match your criteria.</p>
              <Button variant="link" onClick={handleReset}>Clear filters</Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredLaptops.map((laptop) => (
                <div key={laptop.id} className="bg-card border rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Image */}
                    <div className="w-full md:w-48 h-32 md:h-36 bg-secondary/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Laptop className="h-16 w-16 text-muted-foreground" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-primary font-medium mb-1">{laptop.brand}</p>
                          <h3 className="font-bold text-lg mb-2">{laptop.name}</h3>
                          
                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < Math.floor(laptop.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="text-sm text-muted-foreground ml-1">({laptop.rating})</span>
                          </div>

                          {/* Specs */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            <div><span className="text-muted-foreground">CPU:</span> {laptop.specs.processor}</div>
                            <div><span className="text-muted-foreground">RAM:</span> {laptop.specs.ram}</div>
                            <div><span className="text-muted-foreground">Storage:</span> {laptop.specs.storage}</div>
                            <div><span className="text-muted-foreground">Display:</span> {laptop.specs.display}</div>
                            <div><span className="text-muted-foreground">Battery:</span> {laptop.specs.battery}</div>
                          </div>
                        </div>

                        {/* Price & CTA - Desktop */}
                        <div className="hidden md:block text-right">
                          <p className="text-2xl font-bold text-accent">${laptop.price.toFixed(2)}</p>
                          <Button className="mt-3 bg-accent hover:bg-accent/90 text-white">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>

                      {/* Price & CTA - Mobile */}
                      <div className="flex md:hidden items-center justify-between mt-4 pt-4 border-t">
                        <p className="text-xl font-bold text-accent">${laptop.price.toFixed(2)}</p>
                        <Button size="sm" className="bg-accent hover:bg-accent/90 text-white">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LaptopFinder;
