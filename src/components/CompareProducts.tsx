import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { sampleComponents, categories, PCComponent, ComponentCategory } from '@/data/pcComponents';
import { Plus, X, Check, Minus, ArrowRight } from 'lucide-react';

const CompareProducts = () => {
  const [compareList, setCompareList] = useState<PCComponent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory>('gpu');
  const [showSelector, setShowSelector] = useState(false);

  const categoryComponents = sampleComponents.filter(c => c.category === selectedCategory);

  const addToCompare = (component: PCComponent) => {
    if (compareList.length < 4 && !compareList.find(c => c.id === component.id)) {
      setCompareList([...compareList, component]);
    }
  };

  const removeFromCompare = (componentId: string) => {
    setCompareList(compareList.filter(c => c.id !== componentId));
  };

  const getAllSpecs = () => {
    const allSpecs = new Set<string>();
    compareList.forEach(comp => {
      Object.keys(comp.specs).forEach(key => allSpecs.add(key));
    });
    return Array.from(allSpecs);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold mb-2">Compare Products</h2>
        <p className="text-muted-foreground">
          Select up to 4 products to compare side by side
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory(cat.id);
              setCompareList([]);
            }}
            className="font-display"
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Compare Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Existing Selections */}
        {compareList.map((component, index) => (
          <div
            key={component.id}
            className="glass-card p-4 relative animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => removeFromCompare(component.id)}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-secondary flex items-center justify-center">
              <span className="text-2xl">
                {categories.find(c => c.id === component.category)?.icon}
              </span>
            </div>

            <p className="text-xs text-primary font-medium text-center">{component.brand}</p>
            <h3 className="font-display text-sm font-bold text-center line-clamp-2 h-10">
              {component.name}
            </h3>
            <p className="price-tag text-center mt-2">${component.price.toFixed(2)}</p>
          </div>
        ))}

        {/* Add Slot */}
        {compareList.length < 4 && (
          <button
            onClick={() => setShowSelector(true)}
            className="glass-card p-4 border-dashed border-2 border-border hover:border-primary transition-all flex flex-col items-center justify-center min-h-[180px]"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Add Product</p>
          </button>
        )}
      </div>

      {/* Product Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display text-xl font-bold">
                Select {categories.find(c => c.id === selectedCategory)?.name}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowSelector(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-3">
                {categoryComponents.map((component) => {
                  const isAdded = compareList.find(c => c.id === component.id);
                  return (
                    <button
                      key={component.id}
                      onClick={() => {
                        if (!isAdded) {
                          addToCompare(component);
                          setShowSelector(false);
                        }
                      }}
                      disabled={!!isAdded}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-all text-left ${
                        isAdded
                          ? 'bg-primary/10 border border-primary'
                          : 'bg-secondary/50 hover:bg-secondary'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-card flex items-center justify-center">
                        <span className="text-xl">
                          {categories.find(c => c.id === component.category)?.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-primary font-medium">{component.brand}</p>
                        <p className="font-medium truncate">{component.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="price-tag">${component.price.toFixed(2)}</p>
                        {isAdded && (
                          <span className="text-xs text-primary">Added</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {compareList.length >= 2 && (
        <div className="glass-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left font-display text-sm text-muted-foreground w-40">
                    Specification
                  </th>
                  {compareList.map((comp) => (
                    <th key={comp.id} className="p-4 text-center font-display">
                      <span className="text-sm font-medium line-clamp-1">{comp.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price Row */}
                <tr className="border-b border-border/50 bg-secondary/30">
                  <td className="p-4 font-medium">Price</td>
                  {compareList.map((comp) => (
                    <td key={comp.id} className="p-4 text-center">
                      <span className="price-tag text-lg">${comp.price.toFixed(2)}</span>
                    </td>
                  ))}
                </tr>

                {/* Stock Row */}
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium">Availability</td>
                  {compareList.map((comp) => (
                    <td key={comp.id} className="p-4 text-center">
                      {comp.inStock ? (
                        <span className="inline-flex items-center gap-1 text-accent text-sm">
                          <Check className="h-4 w-4" />
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-destructive text-sm">
                          <Minus className="h-4 w-4" />
                          Out of Stock
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Spec Rows */}
                {getAllSpecs().map((spec) => (
                  <tr key={spec} className="border-b border-border/50">
                    <td className="p-4 font-medium capitalize">{spec}</td>
                    {compareList.map((comp) => (
                      <td key={comp.id} className="p-4 text-center">
                        {comp.specs[spec] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Action Row */}
                <tr>
                  <td className="p-4"></td>
                  {compareList.map((comp) => (
                    <td key={comp.id} className="p-4 text-center">
                      <Button variant="glow" size="sm" disabled={!comp.inStock}>
                        Add to Build
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {compareList.length < 2 && (
        <div className="text-center py-12 glass-card">
          <p className="text-muted-foreground">
            Select at least 2 products to see comparison
          </p>
        </div>
      )}
    </div>
  );
};

export default CompareProducts;
