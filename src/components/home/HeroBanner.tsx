import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  bgColor: string;
  image?: string;
}

const banners: Banner[] = [
  {
    id: '1',
    title: 'Build Your Dream PC',
    subtitle: 'Use our PC Builder tool to customize your perfect gaming rig',
    cta: 'Start Building',
    bgColor: 'from-primary to-primary/80',
  },
  {
    id: '2',
    title: 'Hot Gaming Deals',
    subtitle: 'Up to 50% off on gaming peripherals and accessories',
    cta: 'Shop Now',
    bgColor: 'from-accent to-orange-600',
  },
  {
    id: '3',
    title: 'Latest Graphics Cards',
    subtitle: 'NVIDIA RTX 40 Series & AMD RX 7000 in stock',
    cta: 'View Collection',
    bgColor: 'from-green-600 to-emerald-600',
  },
];

interface HeroBannerProps {
  onCtaClick?: (bannerId: string) => void;
}

const HeroBanner = ({ onCtaClick }: HeroBannerProps) => {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const banner = banners[currentBanner];

  return (
    <div className="relative rounded-lg overflow-hidden">
      <div
        className={`bg-gradient-to-r ${banner.bgColor} text-white p-6 md:p-10 lg:p-12 min-h-[200px] md:min-h-[280px] flex flex-col justify-center transition-all duration-500`}
      >
        <div className="max-w-lg">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">
            {banner.title}
          </h2>
          <p className="text-sm md:text-lg text-white/90 mb-4 md:mb-6">
            {banner.subtitle}
          </p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-semibold"
            onClick={() => onCtaClick?.(banner.id)}
          >
            {banner.cta}
          </Button>
        </div>
      </div>

      {/* Navigation arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
        onClick={goToNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentBanner ? 'bg-white w-6' : 'bg-white/50'
            }`}
            onClick={() => setCurrentBanner(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;