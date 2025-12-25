import { useEffect, useState } from 'react';

const brands = [
  { name: 'Razer', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/40/Razer_snake_logo.svg/1200px-Razer_snake_logo.svg.png' },
  { name: 'Intel', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282006-2020%29.svg/1005px-Intel_logo_%282006-2020%29.svg.png' },
  { name: 'NVIDIA', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/NVIDIA_logo.svg/1280px-NVIDIA_logo.svg.png' },
  { name: 'Bose', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Bose_logo.svg/2560px-Bose_logo.svg.png' },
  { name: 'HyperX', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/HyperX_logo.svg/2560px-HyperX_logo.svg.png' },
  { name: 'AMD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/AMD_Logo.svg/2560px-AMD_Logo.svg.png' },
  { name: 'ASUS', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/ASUS_Logo.svg/2560px-ASUS_Logo.svg.png' },
  { name: 'MSI', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/MSI_Logo.svg/2560px-MSI_Logo.svg.png' },
];

const BrandsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleBrands = 5;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % brands.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getVisibleBrands = () => {
    const visible = [];
    for (let i = 0; i < visibleBrands; i++) {
      visible.push(brands[(currentIndex + i) % brands.length]);
    }
    return visible;
  };

  return (
    <section className="py-8 bg-gradient-to-b from-primary/20 to-primary/5">
      <div className="container">
        <h2 className="text-xl font-bold text-center mb-6">Top Brands We Carry</h2>
        <div className="relative overflow-hidden">
          <div className="flex items-center justify-between gap-8 px-8">
            <button 
              onClick={() => setCurrentIndex((prev) => (prev - 1 + brands.length) % brands.length)}
              className="absolute left-0 z-10 w-8 h-8 flex items-center justify-center bg-background/80 rounded-full shadow hover:bg-background transition-colors"
            >
              ‹
            </button>
            
            <div className="flex items-center justify-center gap-8 md:gap-12 flex-1 transition-all duration-500">
              {getVisibleBrands().map((brand, index) => (
                <div
                  key={`${brand.name}-${index}`}
                  className="flex-shrink-0 h-12 md:h-16 w-24 md:w-32 flex items-center justify-center grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all cursor-pointer"
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="text-xs md:text-sm font-bold text-primary flex items-center justify-center h-full">${brand.name}</div>`;
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={() => setCurrentIndex((prev) => (prev + 1) % brands.length)}
              className="absolute right-0 z-10 w-8 h-8 flex items-center justify-center bg-background/80 rounded-full shadow hover:bg-background transition-colors"
            >
              ›
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {brands.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandsCarousel;
