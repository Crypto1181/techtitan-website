import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PCComponent, categories } from '@/data/pcComponents';
import { ShoppingCart, Save, Share2, Trash2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BuildSummaryProps {
  selectedComponents: Record<string, PCComponent | null>;
  onRemoveComponent: (category: string) => void;
}

const BuildSummary = ({ selectedComponents, onRemoveComponent }: BuildSummaryProps) => {
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  
  const totalPrice = Object.values(selectedComponents)
    .filter(Boolean)
    .reduce((sum, comp) => sum + (comp?.price || 0), 0);

  const selectedCount = Object.values(selectedComponents).filter(Boolean).length;
  const completionPercentage = (selectedCount / categories.length) * 100;

  const handleSaveBuild = () => {
    try {
      const buildData = {
        components: selectedComponents,
        totalPrice,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('savedBuild', JSON.stringify(buildData));
      setSaved(true);
      toast({
        title: "Build Saved",
        description: "Your build has been saved successfully!",
      });
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save build. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareBuild = async () => {
    try {
      const buildData = {
        components: Object.entries(selectedComponents)
          .filter(([_, comp]) => comp !== null)
          .map(([category, comp]) => ({
            category,
            id: comp!.id,
            name: comp!.name,
          })),
        totalPrice,
      };
      
      const shareUrl = `${window.location.origin}${window.location.pathname}?build=${encodeURIComponent(JSON.stringify(buildData))}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'My PC Build',
          text: `Check out my PC build: $${totalPrice.toFixed(2)}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Build link has been copied to clipboard!",
        });
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: "Error",
          description: "Failed to share build. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 sticky top-24 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Your Build</h2>
        <span className="text-sm text-muted-foreground">
          {selectedCount}/{categories.length} parts
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {completionPercentage === 100 ? '✓ Build complete!' : `${Math.round(completionPercentage)}% complete`}
        </p>
      </div>

      {/* Selected Components */}
      <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
        {categories.map((cat) => {
          const component = selectedComponents[cat.id];
          return (
            <div
              key={cat.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                component ? 'bg-secondary' : 'bg-muted/30 border border-dashed border-border'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-lg">{cat.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{cat.name}</p>
                  {component ? (
                    <p className="text-sm font-medium truncate">{component.name}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Not selected</p>
                  )}
                </div>
              </div>
              {component && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-accent">${component.price.toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveComponent(cat.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="border-t border-border pt-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Estimated Total</span>
          <span className="text-3xl font-bold text-primary">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          *Prices may vary. Cash on delivery.
        </p>
        <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded border border-border">
          <strong>Shipping Note:</strong> Standard shipping is $3 for small items. Large-volume items (gaming chairs, desks, etc.) are not included in the flat rate. Please contact us at checkout for a shipping quote based on your location.
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button className="w-full bg-accent hover:bg-accent/90" size="lg" disabled={selectedCount === 0}>
          <ShoppingCart className="h-5 w-5" />
          Add to Cart
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1" 
            disabled={selectedCount === 0 || saved}
            onClick={handleSaveBuild}
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? 'Saved!' : 'Save Build'}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1" 
            disabled={selectedCount === 0}
            onClick={handleShareBuild}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuildSummary;
