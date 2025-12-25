import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';

const reviews = [
  {
    id: 1,
    name: 'N.S',
    rating: 5,
    text: 'Best customer service I have seen in while they have top quality products and at great prices 100% recommend N.S Company Name',
  },
  {
    id: 2,
    name: 'M.R',
    rating: 5,
    text: 'Impressed with the range and support. Bought a smart TV and he was super helpful throughout the whole purchase process & after!',
  },
  {
    id: 3,
    name: 'D.',
    rating: 5,
    text: 'Fast service, great prices, quality products! I bought my gaming pc and all my gear from TechTitan and been a customer for more than 3 years 🔥',
  },
  {
    id: 4,
    name: 'A.A',
    rating: 5,
    text: 'Wide variety with the best price and quality',
  },
  {
    id: 5,
    name: 'H.S',
    rating: 5,
    text: 'Great products quality, Best customer service ever, All the tech you need for the best prices in town.',
  },
  {
    id: 6,
    name: 'D.Y',
    rating: 5,
    text: 'Authentic products and great after-sales service. A reliable store for all electronics!',
  },
];

const CustomerReviews = () => {
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <section className="py-12 bg-gradient-to-b from-primary/30 to-primary/10">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">What's Everyone Saying?</h2>
          <div className="flex items-center gap-2">
            <Quote className="h-6 w-6 text-accent" />
          </div>
        </div>
        
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          plugins={[plugin.current]}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {reviews.map((review) => (
              <CarouselItem key={review.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <div className="bg-primary/40 backdrop-blur-sm rounded-lg p-5 hover:bg-primary/50 transition-colors h-full">
                  {/* Quote Icon */}
                  <Quote className="h-6 w-6 text-accent/50 mb-3" />
                  
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  
                  {/* Review text */}
                  <p className="text-foreground text-sm leading-relaxed mb-4 min-h-[80px]">
                    "{review.text}"
                  </p>
                  
                  {/* Reviewer name */}
                  <p className="text-primary-foreground font-semibold text-sm">
                    — {review.name}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex items-center justify-center gap-4 mt-6">
            <CarouselPrevious className="static translate-y-0 bg-background/80 hover:bg-background border-primary/20" />
            <CarouselNext className="static translate-y-0 bg-background/80 hover:bg-background border-primary/20" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default CustomerReviews;
