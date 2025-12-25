import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { categories } from '@/data/categories';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect?: (categoryId: string) => void;
}

const CategorySidebar = ({ isOpen, onClose, onCategorySelect }: CategorySidebarProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  const handleSubcategoryClick = (categoryId: string, subcategory: string) => {
    onCategorySelect?.(categoryId);
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-full lg:h-auto
          w-72 lg:w-64 bg-card border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          z-50 lg:z-0
        `}
      >
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-lg">Categories</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block p-4 border-b border-border bg-primary text-primary-foreground">
          <h2 className="font-semibold">All Categories</h2>
        </div>

        <ScrollArea className="h-[calc(100vh-60px)] lg:h-[500px]">
          <div className="py-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategory === category.id;

              return (
                <div key={category.id}>
                  <button
                    className="sidebar-category w-full"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="flex-1 text-left">{category.name}</span>
                    {category.subcategories && (
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Subcategories */}
                  {isExpanded && category.subcategories && (
                    <div className="bg-secondary/50 py-1">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub}
                          className="w-full text-left pl-12 pr-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                          onClick={() => handleSubcategoryClick(category.id, sub)}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};

export default CategorySidebar;