import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { popularGames, preBuilds, sampleComponents, PCComponent } from '@/data/pcComponents';
import { useWooCommerceProducts } from '@/hooks/useWooCommerceProducts';
import { useWooCommerceCategories } from '@/hooks/useWooCommerceCategories';
import { categorySlugMap } from '@/data/woocommerce-categories';
import { Gamepad2, Monitor, Zap, ArrowRight, Check, ChevronLeft, Cpu, CircuitBoard, HardDrive } from 'lucide-react';

interface PCFinderProps {
  onSelectBuild: (components: Record<string, PCComponent | null>) => void;
}

type Resolution = '1080p' | '1440p' | '4k';
type Step = 'games' | 'resolution' | 'results';

const PCFinder = ({ onSelectBuild }: PCFinderProps) => {
  const [step, setStep] = useState<Step>('games');
  const deviceType = 'desktop'; // Always desktop for PC Finder
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedResolution, setSelectedResolution] = useState<Resolution | null>(null);

  const toggleGame = (gameId: string) => {
    setSelectedGames((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : prev.length < 4
        ? [...prev, gameId]
        : prev
    );
  };

  // Fetch WooCommerce categories to map internal categories to WooCommerce category IDs
  const { getCategoryIdBySlug } = useWooCommerceCategories();

  // Map internal category to WooCommerce category slugs
  const internalToWooCommerceMap: Record<string, string[]> = {
    'cpu': ['cpu'],
    'gpu': ['graphic-cards'],
    'motherboard': ['motherboards'],
    'ram': ['ram', 'desktop-ram', 'notebook-ram'],
    'storage': ['storage-drives', 'internal-storage', 'external-storage'],
    'psu': ['backup-power'],
    'case': ['cases'],
    'cooler': ['coolers-fans', 'cooler'],
  };

  // Get WooCommerce category IDs for each internal category
  const getCategoryIds = (internalCategory: string): number[] => {
    const slugs = internalToWooCommerceMap[internalCategory] || [];
    const categoryIds: number[] = [];
    
    for (const slug of slugs) {
      const directSlugs = categorySlugMap[slug] || [slug];
      for (const wcSlug of directSlugs) {
        const id = getCategoryIdBySlug(wcSlug);
        if (id && !categoryIds.includes(id)) {
          categoryIds.push(id);
        }
      }
    }
    
    return categoryIds;
  };

  // Fetch products for each category separately to ensure we get all products
  // Use category filter for GPU to get graphics cards specifically
  const gpuCategoryIds = useMemo(() => {
    const ids = getCategoryIds('gpu');
    // Fallback to ID 118 if lookup fails
    return ids.length > 0 ? ids : [118];
  }, [getCategoryIdBySlug]);
  
  const { products: allProducts } = useWooCommerceProducts({
    fetchAll: true, // Fetch all products for PC Finder
    // For GPU, filter by category ID to get graphics cards
    category: gpuCategoryIds.length > 0 ? gpuCategoryIds : undefined,
  });

  // Combine WooCommerce products with sample data
  const allComponents = useMemo(() => {
    const combined = [...(allProducts || [])];
    sampleComponents.forEach(sample => {
      if (!combined.find(p => p.id === sample.id)) {
        combined.push(sample);
      }
    });
    return combined;
  }, [allProducts]);

  const getRecommendedBuild = (tier: 'budget' | 'mainstream' | 'enthusiast') => {
    const build = preBuilds[tier];
    const components: Record<string, PCComponent | null> = {};
    
    // Get products by category from real inventory
    const cpuProducts = allComponents.filter(c => c.category === 'cpu' && c.inStock).sort((a, b) => a.price - b.price);
    const gpuProducts = allComponents.filter(c => c.category === 'gpu' && c.inStock).sort((a, b) => a.price - b.price);
    const mbProducts = allComponents.filter(c => c.category === 'motherboard' && c.inStock).sort((a, b) => a.price - b.price);
    const ramProducts = allComponents.filter(c => c.category === 'ram' && c.inStock).sort((a, b) => a.price - b.price);
    const storageProducts = allComponents.filter(c => c.category === 'storage' && c.inStock).sort((a, b) => a.price - b.price);
    const psuProducts = allComponents.filter(c => c.category === 'psu' && c.inStock).sort((a, b) => a.price - b.price);
    const coolerProducts = allComponents.filter(c => c.category === 'cooler' && c.inStock).sort((a, b) => a.price - b.price);
    const caseProducts = allComponents.filter(c => c.category === 'case' && c.inStock).sort((a, b) => a.price - b.price);

    // Select products based on tier
    if (tier === 'budget') {
      components.cpu = cpuProducts[0] || null;
      components.gpu = gpuProducts[0] || null;
      components.motherboard = mbProducts[0] || null;
      components.ram = ramProducts[0] || null;
      components.storage = storageProducts[0] || null;
      components.psu = psuProducts[0] || null;
      components.cooler = coolerProducts[0] || null;
      components.case = caseProducts[0] || null;
    } else if (tier === 'mainstream') {
      const midIndex = (arr: PCComponent[]) => Math.floor(arr.length / 2);
      components.cpu = cpuProducts[midIndex(cpuProducts)] || cpuProducts[0] || null;
      components.gpu = gpuProducts[midIndex(gpuProducts)] || gpuProducts[0] || null;
      components.motherboard = mbProducts[midIndex(mbProducts)] || mbProducts[0] || null;
      components.ram = ramProducts[midIndex(ramProducts)] || ramProducts[0] || null;
      components.storage = storageProducts[midIndex(storageProducts)] || storageProducts[0] || null;
      components.psu = psuProducts[midIndex(psuProducts)] || psuProducts[0] || null;
      components.cooler = coolerProducts[midIndex(coolerProducts)] || coolerProducts[0] || null;
      components.case = caseProducts[midIndex(caseProducts)] || caseProducts[0] || null;
    } else {
      // Enthusiast - get higher-end products
      components.cpu = cpuProducts[cpuProducts.length - 1] || cpuProducts[0] || null;
      components.gpu = gpuProducts[gpuProducts.length - 1] || gpuProducts[0] || null;
      components.motherboard = mbProducts[mbProducts.length - 1] || mbProducts[0] || null;
      components.ram = ramProducts[ramProducts.length - 1] || ramProducts[0] || null;
      components.storage = storageProducts[storageProducts.length - 1] || storageProducts[0] || null;
      components.psu = psuProducts[psuProducts.length - 1] || psuProducts[0] || null;
      components.cooler = coolerProducts[coolerProducts.length - 1] || coolerProducts[0] || null;
      components.case = caseProducts[caseProducts.length - 1] || caseProducts[0] || null;
    }

    // Check compatibility and fix socket mismatches
    if (components.cpu && components.motherboard) {
      const cpuSocket = components.cpu.compatibility.socket;
      const mbSocket = components.motherboard.compatibility.socket;
      
      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
        // Find compatible motherboard
        const compatibleMB = mbProducts.find(mb => mb.compatibility.socket === cpuSocket);
        if (compatibleMB) {
          components.motherboard = compatibleMB;
        } else {
          // Or find compatible CPU
          const compatibleCPU = cpuProducts.find(cpu => cpu.compatibility.socket === mbSocket);
          if (compatibleCPU) {
            components.cpu = compatibleCPU;
          }
        }
      }
    }

    // Calculate total price
    const totalPrice = Object.values(components).reduce((sum, comp) => sum + (comp?.price || 0), 0);
    const priceRange = tier === 'budget' ? `$${Math.round(totalPrice * 0.8)} - $${Math.round(totalPrice * 1.2)}` :
                      tier === 'mainstream' ? `$${Math.round(totalPrice * 0.9)} - $${Math.round(totalPrice * 1.1)}` :
                      `$${Math.round(totalPrice)}+`;

    return { 
      ...build, 
      components,
      priceRange 
    };
  };

  const handleSelectBuild = (tier: 'budget' | 'mainstream' | 'enthusiast') => {
    const build = getRecommendedBuild(tier);
    onSelectBuild(build.components);
  };

  const resolutions = [
    { id: '1080p' as Resolution, name: '1080P', subtitle: 'Full HD', description: 'Great for competitive gaming', color: 'from-green-500 to-emerald-600' },
    { id: '1440p' as Resolution, name: '1440P', subtitle: 'QHD', description: 'Perfect balance', color: 'from-blue-500 to-indigo-600' },
    { id: '4k' as Resolution, name: '4K', subtitle: 'Ultra HD', description: 'Maximum fidelity', color: 'from-purple-500 to-pink-600' },
  ];

  const stepLabels = ['Games', 'Resolution', 'Results'];
  const currentStepIndex = ['games', 'resolution', 'results'].indexOf(step);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Banner - Newegg Style */}
      <div className="bg-gradient-to-r from-primary via-blue-600 to-primary text-white rounded-lg p-6 md:p-8 mb-8 text-center">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">GAMING PC FINDER</h1>
        <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto">
          Find the perfect gaming PC based on your favorite games and desired resolution. 
          We'll recommend the best build for your needs.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-center gap-2 mb-8 px-4">
        {stepLabels.map((label, index) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  index <= currentStepIndex
                    ? 'bg-accent text-white'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {index < currentStepIndex ? (
                  <Check className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-[10px] md:text-xs mt-1 text-muted-foreground">{label}</span>
            </div>
            {index < 2 && (
              <div
                className={`w-8 md:w-16 h-1 mx-1 rounded-full ${
                  index < currentStepIndex ? 'bg-accent' : 'bg-secondary'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Games Selection */}
      {step === 'games' && (
        <div className="animate-fade-in">

          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Select which games you enjoy playing</h2>
            <p className="text-muted-foreground text-sm">
              Select up to 4 games ({selectedGames.length}/4 selected)
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            {popularGames.map((game) => {
              const isSelected = selectedGames.includes(game.id);
              return (
                <button
                  key={game.id}
                  onClick={() => toggleGame(game.id)}
                  className={`relative rounded-lg overflow-hidden transition-all hover:scale-105 ${
                    isSelected ? 'ring-2 ring-accent shadow-lg' : ''
                  }`}
                >
                  <div className="aspect-[4/5] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative overflow-hidden">
                    {game.image && game.image !== '/placeholder.svg' ? (
                      <img 
                        src={game.image} 
                        alt={game.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Gamepad2 className="h-10 w-10 md:h-12 md:w-12 text-primary/50" />
                    )}
                  </div>
                  <div className={`absolute inset-0 flex items-end p-2 md:p-3 bg-gradient-to-t from-black/80 to-transparent ${
                    isSelected ? 'from-accent/90' : ''
                  }`}>
                    <span className="text-white text-xs md:text-sm font-medium">{game.name}</span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-accent rounded-full p-1">
                      <Check className="h-3 w-3 md:h-4 md:w-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setStep('device')}
            >
              Reset
            </Button>
            <Button
              className="bg-accent hover:bg-accent/90 text-white px-8"
              onClick={() => setStep('resolution')}
              disabled={selectedGames.length === 0}
            >
              View Results
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Resolution */}
      {step === 'resolution' && (
        <div className="animate-fade-in">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('games')}
            className="mb-4"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>

          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2">What resolution do you want to game at?</h2>
            <p className="text-muted-foreground text-sm">Select your target display resolution</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto mb-8">
            {resolutions.map((res) => {
              const isSelected = selectedResolution === res.id;
              return (
                <button
                  key={res.id}
                  onClick={() => setSelectedResolution(res.id)}
                  className={`p-6 rounded-xl border-2 transition-all text-center ${
                    isSelected 
                      ? 'border-accent bg-accent/10 shadow-lg scale-105' 
                      : 'border-border hover:border-primary/50 hover:scale-102'
                  }`}
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${res.color} flex items-center justify-center`}>
                    <Monitor className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-2xl mb-1">{res.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{res.subtitle}</p>
                  <p className="text-xs text-muted-foreground">{res.description}</p>
                  {isSelected && (
                    <div className="mt-3">
                      <Check className="h-5 w-5 text-accent mx-auto" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Button
              className="bg-accent hover:bg-accent/90 text-white px-8"
              size="lg"
              onClick={() => setStep('results')}
              disabled={!selectedResolution}
            >
              Find My PC
              <Zap className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 'results' && (
        <div className="animate-fade-in">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('resolution')}
            className="mb-4"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>

          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Recommended Gaming PCs</h2>
            <p className="text-muted-foreground text-sm">
              Based on your games and {selectedResolution} resolution target
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {(['budget', 'mainstream', 'enthusiast'] as const).map((tier, index) => {
              const build = getRecommendedBuild(tier);
              const totalPrice = Object.values(build.components)
                .filter(Boolean)
                .reduce((sum, comp) => sum + (comp?.price || 0), 0);
              
              const isRecommended = tier === 'mainstream';

              return (
                <div
                  key={tier}
                  className={`relative bg-card border rounded-xl overflow-hidden transition-all hover:shadow-xl ${
                    isRecommended ? 'border-accent ring-2 ring-accent/30 md:scale-105' : 'border-border'
                  }`}
                >
                  {isRecommended && (
                    <div className="bg-accent text-white text-center py-2 text-sm font-bold">
                      RECOMMENDED
                    </div>
                  )}

                  <div className="p-5 md:p-6">
                    <h3 className="font-bold text-xl md:text-2xl mb-1 capitalize">{build.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{build.description}</p>

                    {/* Specs Preview */}
                    <div className="space-y-3 mb-6">
                      {build.components.cpu && (
                        <div className="flex items-center gap-3 text-sm">
                          <Cpu className="h-4 w-4 text-primary" />
                          <span className="truncate">{build.components.cpu.name}</span>
                        </div>
                      )}
                      {build.components.gpu && (
                        <div className="flex items-center gap-3 text-sm">
                          <Monitor className="h-4 w-4 text-primary" />
                          <span className="truncate">{build.components.gpu.name}</span>
                        </div>
                      )}
                      {build.components.ram && (
                        <div className="flex items-center gap-3 text-sm">
                          <CircuitBoard className="h-4 w-4 text-primary" />
                          <span className="truncate">{build.components.ram.name}</span>
                        </div>
                      )}
                      {build.components.storage && (
                        <div className="flex items-center gap-3 text-sm">
                          <HardDrive className="h-4 w-4 text-primary" />
                          <span className="truncate">{build.components.storage.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-muted-foreground text-xs">Target FPS</p>
                        <p className="font-bold text-accent">{build.targetFps}</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-muted-foreground text-xs">Price Range</p>
                        <p className="font-bold">{build.priceRange}</p>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="text-center mb-4">
                      <p className="text-xs text-muted-foreground">Starting at</p>
                      <p className="text-2xl md:text-3xl font-bold text-accent">
                        ${totalPrice.toFixed(2)}
                      </p>
                    </div>

                    <Button
                      className={`w-full ${
                        isRecommended 
                          ? 'bg-accent hover:bg-accent/90 text-white' 
                          : 'bg-primary hover:bg-primary/90'
                      }`}
                      onClick={() => handleSelectBuild(tier)}
                    >
                      Customize This Build
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PCFinder;
