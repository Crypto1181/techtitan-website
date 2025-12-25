import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PCComponent, sampleComponents, categories, ComponentCategory } from '@/data/pcComponents';
import { 
  Search, Check, AlertCircle, ChevronDown, ChevronUp, Plus, 
  Cpu, CircuitBoard, HardDrive, MemoryStick, Zap, Fan, Monitor, Box
} from 'lucide-react';

interface ComponentSelectorProps {
  selectedComponents: Record<string, PCComponent | null>;
  onSelectComponent: (category: string, component: PCComponent) => void;
  activeCategory: ComponentCategory | null;
  onCategoryChange: (category: ComponentCategory | null) => void;
}

const categoryIcons: Record<string, any> = {
  cpu: Cpu,
  motherboard: CircuitBoard,
  gpu: Monitor,
  ram: MemoryStick,
  storage: HardDrive,
  psu: Zap,
  cooler: Fan,
  case: Box,
};

const ComponentSelector = ({
  selectedComponents,
  onSelectComponent,
  activeCategory,
  onCategoryChange,
}: ComponentSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSpecs, setExpandedSpecs] = useState<string | null>(null);

  const filteredComponents = sampleComponents.filter((comp) => {
    const matchesCategory = !activeCategory || comp.category === activeCategory;
    const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const checkCompatibility = (component: PCComponent): { compatible: boolean; reason?: string } => {
    const cpu = selectedComponents['cpu'];
    const motherboard = selectedComponents['motherboard'];
    const psu = selectedComponents['psu'];

    if (component.category === 'motherboard' && cpu) {
      if (component.compatibility.socket !== cpu.compatibility.socket) {
        return { compatible: false, reason: `Socket mismatch (${component.compatibility.socket} vs ${cpu.compatibility.socket})` };
      }
    }

    if (component.category === 'cpu' && motherboard) {
      if (component.compatibility.socket !== motherboard.compatibility.socket) {
        return { compatible: false, reason: `Socket mismatch (${component.compatibility.socket} vs ${motherboard.compatibility.socket})` };
      }
    }

    if (component.category === 'ram' && motherboard) {
      if (component.compatibility.ramType !== motherboard.compatibility.ramType) {
        return { compatible: false, reason: `RAM type mismatch (${component.compatibility.ramType} vs ${motherboard.compatibility.ramType})` };
      }
    }

    if (component.category === 'gpu' && psu) {
      const gpuWattage = component.compatibility.wattage || 0;
      const psuWattage = psu.compatibility.wattage || 0;
      if (gpuWattage > psuWattage * 0.6) {
        return { compatible: false, reason: `PSU may be underpowered for this GPU` };
      }
    }

    return { compatible: true };
  };

  return (
    <div className="space-y-6">
      {/* Header like Newegg */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg p-6 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">SELECT YOUR CUSTOM PC COMPONENTS</h2>
        <p className="text-white/80 text-sm md:text-base">
          Choose parts below - we'll check compatibility automatically
        </p>
      </div>

      {/* Category Selection - Newegg Style Grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
        {categories.map((cat) => {
          const isSelected = selectedComponents[cat.id];
          const isActive = activeCategory === cat.id;
          const IconComponent = categoryIcons[cat.id] || Box;

          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(isActive ? null : cat.id)}
              className={`relative flex flex-col items-center p-3 md:p-4 rounded-lg border-2 transition-all ${
                isActive 
                  ? 'border-accent bg-accent/10 shadow-md' 
                  : 'border-border hover:border-primary/50 bg-card hover:bg-secondary/50'
              }`}
            >
              <div className={`p-2 md:p-3 rounded-full mb-2 ${
                isActive ? 'bg-accent text-white' : 'bg-secondary text-muted-foreground'
              }`}>
                <IconComponent className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <span className="text-[10px] md:text-xs font-medium text-center leading-tight">
                {cat.name}
              </span>
              {isSelected && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by component name or brand..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Active Category Label */}
      {activeCategory && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {categories.find(c => c.id === activeCategory)?.name} Options
          </h3>
          <Button variant="ghost" size="sm" onClick={() => onCategoryChange(null)}>
            Show All
          </Button>
        </div>
      )}

      {/* Components List - Newegg Style Table */}
      <div className="space-y-3">
        {filteredComponents.map((component) => {
          const isSelected = selectedComponents[component.category]?.id === component.id;
          const compatibility = checkCompatibility(component);
          const categoryInfo = categories.find(c => c.id === component.category);
          const IconComponent = categoryIcons[component.category] || Box;

          return (
            <div
              key={component.id}
              className={`bg-card border rounded-lg p-4 transition-all hover:shadow-md ${
                isSelected ? 'border-accent ring-2 ring-accent/30' : 'border-border'
              } ${!compatibility.compatible ? 'border-destructive/50 bg-destructive/5' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* Icon/Image */}
                <div className={`p-3 rounded-lg flex-shrink-0 ${
                  isSelected ? 'bg-accent/20' : 'bg-secondary'
                }`}>
                  <IconComponent className={`h-8 w-8 ${isSelected ? 'text-accent' : 'text-muted-foreground'}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                          {categoryInfo?.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{component.brand}</span>
                      </div>
                      <h3 className="font-semibold text-base md:text-lg leading-tight">
                        {component.name}
                      </h3>
                    </div>

                    {/* Price & Button - Desktop */}
                    <div className="hidden md:flex items-center gap-4">
                      <span className="text-xl font-bold text-accent">${component.price.toFixed(2)}</span>
                      <Button
                        variant={isSelected ? 'secondary' : 'default'}
                        onClick={() => onSelectComponent(component.category, component)}
                        disabled={!component.inStock}
                        className={!isSelected ? 'bg-accent hover:bg-accent/90' : ''}
                      >
                        {isSelected ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Selected
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Status Row */}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {component.inStock ? (
                      <span className="text-xs text-green-600 font-medium">✓ In Stock</span>
                    ) : (
                      <span className="text-xs text-destructive font-medium">✗ Out of Stock</span>
                    )}
                    
                    {!compatibility.compatible && (
                      <span className="flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {compatibility.reason}
                      </span>
                    )}
                  </div>

                  {/* Specs Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs text-primary p-0 h-auto"
                    onClick={() => setExpandedSpecs(expandedSpecs === component.id ? null : component.id)}
                  >
                    {expandedSpecs === component.id ? 'Hide' : 'View'} Specifications
                    {expandedSpecs === component.id ? (
                      <ChevronUp className="ml-1 h-3 w-3" />
                    ) : (
                      <ChevronDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>

                  {/* Expanded Specs */}
                  {expandedSpecs === component.id && (
                    <div className="mt-3 p-3 rounded-lg bg-secondary/50 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs animate-fade-in">
                      {Object.entries(component.specs).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-muted-foreground capitalize">{key}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Price & Button - Mobile */}
                  <div className="flex md:hidden items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-lg font-bold text-accent">${component.price.toFixed(2)}</span>
                    <Button
                      size="sm"
                      variant={isSelected ? 'secondary' : 'default'}
                      onClick={() => onSelectComponent(component.category, component)}
                      disabled={!component.inStock}
                      className={!isSelected ? 'bg-accent hover:bg-accent/90' : ''}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredComponents.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg border">
          <p className="text-muted-foreground">No components found matching your criteria.</p>
          <Button variant="link" onClick={() => { setSearchQuery(''); onCategoryChange(null); }}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ComponentSelector;
