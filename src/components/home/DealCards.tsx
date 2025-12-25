import { dealCategories } from '@/data/categories';
import { ChevronRight } from 'lucide-react';

interface DealCardsProps {
  onCategoryClick?: (categoryId: string) => void;
}

const DealCards = ({ onCategoryClick }: DealCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {dealCategories.map((deal) => (
        <button
          key={deal.id}
          className="category-deal-card group text-left"
          onClick={() => onCategoryClick?.(deal.id)}
        >
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Up to</p>
            <p className="deal-percentage">
              {deal.discount}
              <span className="text-lg">%</span>
              <span className="text-sm font-normal text-muted-foreground ml-1">Off</span>
            </p>
            <p className="text-sm font-medium mt-2 text-foreground">{deal.name}</p>
          </div>
          <div className="h-24 md:h-32 bg-secondary/50 flex items-center justify-center overflow-hidden">
            <img
              src={deal.image}
              alt={deal.name}
              className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="p-2 flex items-center justify-end text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Shop Now</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </button>
      ))}
    </div>
  );
};

export default DealCards;