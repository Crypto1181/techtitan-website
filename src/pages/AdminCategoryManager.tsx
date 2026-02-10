import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { backendApi } from '@/services/backendApi';
import MainHeader from '@/components/layout/MainHeader';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, GripVertical, Save } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  display_order: number;
  children?: Category[];
}

const SortableItem = ({ category, onViewChildren }: { category: Category; onViewChildren?: (cat: Category) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 mb-2 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <button {...attributes} {...listeners} className="cursor-grab hover:text-primary">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </button>
        <span className="font-medium">{category.name}</span>
      </div>
      
      <div className="flex items-center gap-2">
        {category.children && category.children.length > 0 && onViewChildren && (
          <Button variant="ghost" size="sm" onClick={() => onViewChildren(category)}>
            {category.children.length} Sub-categories <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

const AdminCategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<Category[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Use the tree endpoint to get hierarchy
      const response = await backendApi.get('/categories/tree');
      // Sort by display_order initially (backend should do this, but just in case)
      const sorted = sortCategoriesRecursive(response.data);
      setCategories(sorted);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const sortCategoriesRecursive = (cats: Category[]): Category[] => {
    return cats.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map(c => ({
      ...c,
      children: c.children ? sortCategoriesRecursive(c.children) : []
    }));
  };

  // Get current level categories based on navigation path
  const getCurrentLevelCategories = () => {
    if (currentPath.length === 0) {
      return categories;
    }
    const parent = currentPath[currentPath.length - 1];
    return parent.children || [];
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setHasChanges(true);
      
      if (currentPath.length === 0) {
        // Reordering root
        setCategories((items) => {
          const oldIndex = items.findIndex((i) => i.id === active.id);
          const newIndex = items.findIndex((i) => i.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      } else {
        // Reordering children - need to update the deep structure
        const parentId = currentPath[currentPath.length - 1].id;
        
        setCategories((prevCategories) => {
          const newCategories = JSON.parse(JSON.stringify(prevCategories)); // Deep clone
          
          // Helper to find and update parent
          const updateChildren = (list: Category[]) => {
            for (const item of list) {
              if (item.id === parentId) {
                const oldIndex = item.children!.findIndex((i) => i.id === active.id);
                const newIndex = item.children!.findIndex((i) => i.id === over.id);
                item.children = arrayMove(item.children!, oldIndex, newIndex);
                return true;
              }
              if (item.children && updateChildren(item.children)) return true;
            }
            return false;
          };
          
          updateChildren(newCategories);
          return newCategories;
        });

        // Also update current path references to reflect changes in UI immediately
        // (Actually, getCurrentLevelCategories derives from state, but we need to ensure currentPath objects are up to date if we rely on them. 
        // In this implementation, getCurrentLevelCategories looks up from 'categories' state if we reconstructed the path, 
        // OR we can just update the specific parent in currentPath. 
        // A simpler way: update the 'categories' state, and 'getCurrentLevelCategories' needs to be smart.
        // Wait, 'currentPath' holds references to the old objects. 
        // We should re-derive the current level list from the fresh 'categories' state.)
      }
    }
  };

  // Helper to find the current list from the fresh state based on path IDs
  const visibleCategories = (() => {
    let list = categories;
    for (const pathItem of currentPath) {
      const found = list.find(c => c.id === pathItem.id);
      if (found && found.children) {
        list = found.children;
      } else {
        return [];
      }
    }
    return list;
  })();

  const handleSaveOrder = async () => {
    try {
      // We need to send ALL categories with their new order index
      // Flatten the tree or just send the modified level?
      // The backend expects a flat list of { id, display_order }.
      // We should calculate display_order for ALL items in the current level (0-based index).
      
      const updates: { id: number; display_order: number }[] = [];
      
      const processLevel = (list: Category[]) => {
        list.forEach((cat, index) => {
          updates.push({ id: cat.id, display_order: index });
          if (cat.children) processLevel(cat.children);
        });
      };

      processLevel(categories);

      await backendApi.put('/categories/reorder', { categories: updates });
      toast.success('Category order saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Failed to save order');
    }
  };

  const handleNavigateDown = (category: Category) => {
    setCurrentPath([...currentPath, category]);
  };

  const handleNavigateUp = (index: number) => {
    if (index === -1) {
      setCurrentPath([]);
    } else {
      setCurrentPath(currentPath.slice(0, index + 1));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MainHeader />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Category Manager</h1>
              <p className="text-gray-500 mt-1">Drag and drop to rearrange categories</p>
            </div>
            
            {hasChanges && (
              <Button onClick={handleSaveOrder} className="bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            )}
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <button 
              onClick={() => handleNavigateUp(-1)}
              className={`hover:text-primary ${currentPath.length === 0 ? 'font-bold text-gray-900' : ''}`}
            >
              All Categories
            </button>
            {currentPath.map((cat, index) => (
              <div key={cat.id} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                <button 
                  onClick={() => handleNavigateUp(index)}
                  className={`hover:text-primary ${index === currentPath.length - 1 ? 'font-bold text-gray-900' : ''}`}
                >
                  {cat.name}
                </button>
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {currentPath.length === 0 ? 'Root Categories' : currentPath[currentPath.length - 1].name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : visibleCategories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No categories found in this level.</div>
              ) : (
                <DndContext 
                  sensors={sensors} 
                  collisionDetection={closestCenter} 
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={visibleCategories.map(c => c.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {visibleCategories.map((category) => (
                        <SortableItem 
                          key={category.id} 
                          category={category} 
                          onViewChildren={category.children && category.children.length > 0 ? handleNavigateDown : undefined}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminCategoryManager;
