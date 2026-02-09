import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { useWooCommerceCategoryTree, type CategoryTreeItem } from '@/hooks/useWooCommerceCategoryTree';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect?: (categoryId: string) => void;
}

const CategorySidebar = ({ isOpen, onClose, onCategorySelect }: CategorySidebarProps) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryTreeItem | null>(null);
  const { categoryTree, loading } = useWooCommerceCategoryTree();

  const handleCategoryClick = (category: CategoryTreeItem) => {
    if (category.children && category.children.length > 0) {
      // If has subcategories, show them
      setSelectedCategory(category);
    } else {
      // Navigate directly if no subcategories
      onCategorySelect?.(category.slug);
      onClose();
    }
  };

  const handleSubcategoryClick = (subcategory: CategoryTreeItem) => {
    // Navigate to subcategory
    onCategorySelect?.(subcategory.slug);
    onClose();
  };

  const handleClearSelection = () => {
    setSelectedCategory(null);
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

        <ScrollArea className="h-[calc(100vh-60px)] lg:h-[calc(100vh-120px)] max-h-[800px]">
          <div className="py-2">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Loading categories...</div>
            ) : categoryTree.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No categories found</div>
            ) : selectedCategory ? (
              // Show selected category with subcategories
              <div>
                {/* Selected Category Header */}
                <div className="px-4 py-2 mb-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-md border border-border">
                    {selectedCategory.icon && (
                      <selectedCategory.icon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="flex-1 text-sm font-medium">{selectedCategory.name}</span>
                    <button
                      onClick={handleClearSelection}
                      className="p-1 hover:bg-background rounded transition-colors"
                      aria-label="Clear selection"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Subcategories List */}
                <div className="px-2">
                  {selectedCategory.children && selectedCategory.children.length > 0 ? (
                    selectedCategory.children.map((subcategory) => {
                      const SubIcon = subcategory.icon;
                      return (
                        <button
                          key={subcategory.slug}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors"
                          onClick={() => handleSubcategoryClick(subcategory)}
                        >
                          {SubIcon && <SubIcon className="h-4 w-4" />}
                          <span className="flex-1 text-left">{subcategory.name}</span>
                          {subcategory.count > 0 && (
                            <span className="text-xs text-muted-foreground">({subcategory.count})</span>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-2 text-sm text-muted-foreground">No subcategories</div>
                  )}
                </div>
              </div>
            ) : (
              // Show all root categories
              categoryTree.map((category) => {
                const Icon = category.icon;
                const hasChildren = category.children && category.children.length > 0;

                return (
                  <div key={category.id}>
                    <button
                      className="sidebar-category w-full"
                      onClick={() => handleCategoryClick(category)}
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="flex-1 text-left">{category.name}</span>
                      {hasChildren && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};

export default CategorySidebar;