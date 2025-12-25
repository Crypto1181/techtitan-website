import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { popularGames, preBuilds, sampleComponents, PCComponent } from '@/data/pcComponents';
import { Gamepad2, Monitor, Laptop, Zap, ArrowRight, Check, ChevronLeft, Cpu, CircuitBoard, HardDrive } from 'lucide-react';

interface PCFinderProps {
  onSelectBuild: (components: Record<string, PCComponent | null>) => void;
}

type Resolution = '1080p' | '1440p' | '4k';
type DeviceType = 'desktop' | 'laptop';
type Step = 'device' | 'games' | 'resolution' | 'results';

const PCFinder = ({ onSelectBuild }: PCFinderProps) => {
  const [step, setStep] = useState<Step>('device');
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
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

  const getRecommendedBuild = (tier: 'budget' | 'mainstream' | 'enthusiast') => {
    const build = preBuilds[tier];
    const components: Record<string, PCComponent | null> = {};
    
    build.components.forEach((compId) => {
      const component = sampleComponents.find((c) => c.id === compId);
      if (component) {
        components[component.category] = component;
      }
    });

    return { ...build, components };
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

  const stepLabels = ['Device', 'Games', 'Resolution', 'Results'];
  const currentStepIndex = ['device', 'games', 'resolution', 'results'].indexOf(step);

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
            {index < 3 && (
              <div
                className={`w-8 md:w-16 h-1 mx-1 rounded-full ${
                  index < currentStepIndex ? 'bg-accent' : 'bg-secondary'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Device Type */}
      {step === 'device' && (
        <div className="animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Select which games you enjoy playing</h2>
            <p className="text-muted-foreground">Select up to 4 games</p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto mb-8">
            <button
              onClick={() => setDeviceType('desktop')}
              className={`p-6 md:p-8 rounded-xl border-2 transition-all text-center ${
                deviceType === 'desktop' 
                  ? 'border-accent bg-accent/10 shadow-lg' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Monitor className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 text-primary" />
              <h3 className="font-bold text-lg md:text-xl">Desktop</h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Build a custom PC</p>
            </button>
            <button
              onClick={() => setDeviceType('laptop')}
              className={`p-6 md:p-8 rounded-xl border-2 transition-all text-center ${
                deviceType === 'laptop' 
                  ? 'border-accent bg-accent/10 shadow-lg' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Laptop className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 text-primary" />
              <h3 className="font-bold text-lg md:text-xl">Laptop</h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Portable gaming</p>
            </button>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white px-8"
              onClick={() => setStep('games')}
            >
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Games Selection */}
      {step === 'games' && (
        <div className="animate-fade-in">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('device')}
            className="mb-4"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>

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
                  <div className="aspect-[4/5] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Gamepad2 className="h-10 w-10 md:h-12 md:w-12 text-primary/50" />
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
