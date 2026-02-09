import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Zap, Cpu, CircuitBoard, Monitor, MemoryStick, HardDrive, 
  Disc, Fan, Plus, Minus, RotateCcw, ShoppingCart
} from 'lucide-react';

interface ComponentPower {
  cpu: { brand: string; series: string; wattage: number } | null;
  motherboard: string | null;
  gpu: { chipset: string; series: string; wattage: number; quantity: number }[];
  ram: { type: string; quantity: number };
  ssd: { type: string; quantity: number }[];
  hdd: { type: string; quantity: number }[];
  opticalDrive: number;
  pciCards: number;
  fans: number;
}

const cpuData = {
  AMD: {
    'Ryzen 9 9950X': 170,
    'Ryzen 9 7950X': 170,
    'Ryzen 9 7900X': 170,
    'Ryzen 7 7800X3D': 120,
    'Ryzen 7 7700X': 105,
    'Ryzen 5 7600X': 105,
  },
  Intel: {
    'Core i9-14900K': 253,
    'Core i9-13900K': 253,
    'Core i7-14700K': 253,
    'Core i7-13700K': 253,
    'Core i5-14600K': 181,
    'Core i5-13600K': 181,
  },
};

const gpuData = {
  NVIDIA: {
    'RTX 4090': 450,
    'RTX 4080 Super': 320,
    'RTX 4080': 320,
    'RTX 4070 Ti Super': 285,
    'RTX 4070 Ti': 285,
    'RTX 4070 Super': 220,
    'RTX 4070': 200,
    'RTX 4060 Ti': 160,
    'RTX 4060': 115,
  },
  AMD: {
    'RX 7900 XTX': 355,
    'RX 7900 XT': 315,
    'RX 7900 GRE': 260,
    'RX 7800 XT': 263,
    'RX 7700 XT': 245,
    'RX 7600 XT': 190,
    'RX 7600': 165,
  },
  Intel: {
    'Arc A770': 225,
    'Arc A750': 225,
    'Arc A580': 185,
  },
};

const motherboardPower: Record<string, number> = {
  'ATX': 80,
  'E-ATX': 100,
  'Micro ATX': 60,
  'Mini-ITX': 40,
};

const ramPower: Record<string, number> = {
  '8GB DDR4': 3,
  '16GB DDR4': 5,
  '32GB DDR4': 8,
  '8GB DDR5': 4,
  '16GB DDR5': 6,
  '32GB DDR5': 10,
  '64GB DDR5': 15,
};

const PSUCalculator = () => {
  const [components, setComponents] = useState<ComponentPower>({
    cpu: null,
    motherboard: null,
    gpu: [{ chipset: '', series: '', wattage: 0, quantity: 1 }],
    ram: { type: '', quantity: 1 },
    ssd: [{ type: 'SATA', quantity: 1 }],
    hdd: [{ type: '7200 RPM', quantity: 0 }],
    opticalDrive: 0,
    pciCards: 0,
    fans: 3,
  });

  const [cpuBrand, setCpuBrand] = useState<string>('');
  const [gpuChipset, setGpuChipset] = useState<string>('');

  const calculatedWattage = useMemo(() => {
    let total = 0;

    // CPU
    if (components.cpu) {
      total += components.cpu.wattage;
    }

    // Motherboard
    if (components.motherboard) {
      total += motherboardPower[components.motherboard] || 0;
    }

    // GPU
    components.gpu.forEach(gpu => {
      total += gpu.wattage * gpu.quantity;
    });

    // RAM
    if (components.ram.type) {
      total += (ramPower[components.ram.type] || 0) * components.ram.quantity;
    }

    // Storage
    components.ssd.forEach(ssd => {
      total += 5 * ssd.quantity; // ~5W per SSD
    });
    components.hdd.forEach(hdd => {
      total += 10 * hdd.quantity; // ~10W per HDD
    });

    // Other components
    total += components.opticalDrive * 25; // ~25W per optical drive
    total += components.pciCards * 50; // ~50W per PCI card
    total += components.fans * 5; // ~5W per fan

    // Add 20% headroom
    return Math.ceil(total * 1.2);
  }, [components]);

  const recommendedPSU = useMemo(() => {
    if (calculatedWattage <= 450) return 550;
    if (calculatedWattage <= 550) return 650;
    if (calculatedWattage <= 650) return 750;
    if (calculatedWattage <= 750) return 850;
    if (calculatedWattage <= 900) return 1000;
    return 1200;
  }, [calculatedWattage]);

  const handleCpuChange = (brand: string, series: string) => {
    const wattage = cpuData[brand as keyof typeof cpuData]?.[series as keyof (typeof cpuData)['AMD']] || 0;
    setComponents(prev => ({
      ...prev,
      cpu: { brand, series, wattage }
    }));
  };

  const handleGpuChange = (index: number, chipset: string, series: string) => {
    const wattage = gpuData[chipset as keyof typeof gpuData]?.[series as keyof (typeof gpuData)['NVIDIA']] || 0;
    setComponents(prev => ({
      ...prev,
      gpu: prev.gpu.map((g, i) => i === index ? { ...g, chipset, series, wattage } : g)
    }));
  };

  const handleReset = () => {
    setComponents({
      cpu: null,
      motherboard: null,
      gpu: [{ chipset: '', series: '', wattage: 0, quantity: 1 }],
      ram: { type: '', quantity: 1 },
      ssd: [{ type: 'SATA', quantity: 1 }],
      hdd: [{ type: '7200 RPM', quantity: 0 }],
      opticalDrive: 0,
      pciCards: 0,
      fans: 3,
    });
    setCpuBrand('');
    setGpuChipset('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white rounded-lg p-6 md:p-8 mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-white/20">
            <Zap className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold mb-2" style={{ fontStyle: 'italic' }}>
          POWER SUPPLY CALCULATOR
        </h1>
        <p className="text-white/90 text-sm md:text-base max-w-2xl mx-auto">
          Enter your system components below, and our online PSU calculator will determine 
          the required watts and amps for your PC build.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Component Selection */}
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CircuitBoard className="h-5 w-5 text-primary" />
              CHOOSE YOUR COMPONENTS
            </h2>

            <div className="space-y-6">
              {/* CPU */}
              <div className="grid md:grid-cols-2 gap-4 pb-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Cpu className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">CENTRAL PROCESSING UNIT (CPU)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={cpuBrand} onValueChange={(v) => { setCpuBrand(v); setComponents(p => ({ ...p, cpu: null })); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AMD">AMD</SelectItem>
                      <SelectItem value="Intel">Intel</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={components.cpu?.series || ''} 
                    onValueChange={(v) => handleCpuChange(cpuBrand, v)}
                    disabled={!cpuBrand}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Series" />
                    </SelectTrigger>
                    <SelectContent>
                      {cpuBrand && Object.keys(cpuData[cpuBrand as keyof typeof cpuData] || {}).map(series => (
                        <SelectItem key={series} value={series}>{series}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Motherboard */}
              <div className="grid md:grid-cols-2 gap-4 pb-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-lg">
                    <CircuitBoard className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">MOTHERBOARD</span>
                </div>
                <Select 
                  value={components.motherboard || ''} 
                  onValueChange={(v) => setComponents(p => ({ ...p, motherboard: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Motherboard" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(motherboardPower).map(mb => (
                      <SelectItem key={mb} value={mb}>{mb}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* GPU */}
              <div className="grid md:grid-cols-2 gap-4 pb-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Monitor className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">GRAPHICS PROCESSING UNIT (GPU)</span>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={gpuChipset} onValueChange={setGpuChipset}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Chipset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NVIDIA">NVIDIA</SelectItem>
                        <SelectItem value="AMD">AMD</SelectItem>
                        <SelectItem value="Intel">Intel</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={components.gpu[0]?.series || ''} 
                      onValueChange={(v) => handleGpuChange(0, gpuChipset, v)}
                      disabled={!gpuChipset}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Series" />
                      </SelectTrigger>
                      <SelectContent>
                        {gpuChipset && Object.keys(gpuData[gpuChipset as keyof typeof gpuData] || {}).map(series => (
                          <SelectItem key={series} value={series}>{series}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* RAM */}
              <div className="grid md:grid-cols-2 gap-4 pb-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-lg">
                    <MemoryStick className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">RANDOM ACCESS MEMORY (RAM)</span>
                </div>
                <div className="flex gap-2">
                  <Select 
                    value={components.ram.type} 
                    onValueChange={(v) => setComponents(p => ({ ...p, ram: { ...p.ram, type: v } }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select Your Memory" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(ramPower).map(ram => (
                        <SelectItem key={ram} value={ram}>{ram}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1 border rounded-md px-2">
                    <span className="text-sm">×</span>
                    <Select 
                      value={String(components.ram.quantity)} 
                      onValueChange={(v) => setComponents(p => ({ ...p, ram: { ...p.ram, quantity: Number(v) } }))}
                    >
                      <SelectTrigger className="border-0 w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 4, 8].map(n => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* SSD */}
              <div className="grid md:grid-cols-2 gap-4 pb-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-lg">
                    <HardDrive className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">SOLID STATE DRIVE (SSD)</span>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="NVMe">
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NVMe">NVMe SSD</SelectItem>
                      <SelectItem value="SATA">SATA SSD</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1 border rounded-md px-2">
                    <span className="text-sm">×</span>
                    <Select 
                      value={String(components.ssd[0]?.quantity || 1)} 
                      onValueChange={(v) => setComponents(p => ({ ...p, ssd: [{ type: 'NVMe', quantity: Number(v) }] }))}
                    >
                      <SelectTrigger className="border-0 w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map(n => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Fans */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Fan className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">CASE FANS</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setComponents(p => ({ ...p, fans: Math.max(0, p.fans - 1) }))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{components.fans}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setComponents(p => ({ ...p, fans: p.fans + 1 }))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-lg p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Suggested PSU Wattage
            </h3>

            <div className="text-center py-6 mb-6 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl">
              <p className="text-5xl md:text-6xl font-bold text-accent">
                {recommendedPSU}
              </p>
              <p className="text-xl text-muted-foreground">Watts</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Load:</span>
                <span className="font-medium">{calculatedWattage}W</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recommended PSU:</span>
                <span className="font-medium text-accent">{recommendedPSU}W</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Efficiency Rating:</span>
                <span className="font-medium">80+ Gold</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full bg-accent hover:bg-accent/90 text-white"
                onClick={() => window.location.href = '/products?category=power-supply'}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                SHOP PSUs
              </Button>
              <Button variant="outline" className="w-full" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                RESET
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              * Includes 20% headroom for efficiency and future upgrades
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PSUCalculator;
