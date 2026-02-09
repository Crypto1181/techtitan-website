# CSV Products Integration

## Overview
The CSV product export has been integrated into the application. Products from `wc-product-export-26-12-2025-1766805512226.csv` are now parsed and organized by category.

## Files Created

### 1. `src/utils/csvParser.ts`
- **Purpose**: Parses CSV file and converts WooCommerce products to PCComponent format
- **Key Functions**:
  - `csvToPCComponent()`: Converts a single CSV row to PCComponent
  - `parseCSVProducts()`: Parses entire CSV file and organizes by category
  - `mapCategory()`: Maps WooCommerce categories to app categories
  - `extractBrand()`: Extracts brand from product name/tags
  - `extractSpecs()`: Extracts specifications from description

### 2. `src/data/csvProducts.ts`
- **Purpose**: Provides functions to load and access CSV products
- **Key Functions**:
  - `loadCSVProducts()`: Loads and caches CSV products
  - `getCSVProductsByCategory()`: Gets products for a specific category
  - `getAllCSVProducts()`: Gets all products
  - `getCSVProductCounts()`: Gets product count per category

### 3. `src/hooks/useCSVProducts.ts`
- **Purpose**: React hook to use CSV products in components
- **Usage**:
  ```tsx
  // Get all products
  const { products, loading, error, productCounts } = useCSVProducts({ fetchAll: true });
  
  // Get products by category
  const { products } = useCSVProducts({ category: 'gpu' });
  ```

## Category Mapping

The CSV categories are mapped to app categories as follows:

| CSV Category | App Category |
|-------------|-------------|
| CPU, Processor, Intel Board | `cpu` |
| Graphic Cards, GPU, Graphics Card | `gpu` |
| Motherboards | `motherboard` |
| RAM, Memory, DDR | `ram` |
| SSD, HDD, SATA, Storage | `storage` |
| PSU, Power Supply, Backup Power | `psu` |
| Coolers & Fans, Liquid Coolers, Cooling Fans | `cooler` |
| Cases, Chassis, Tower | `case` |
| Mouse | `mouse` |
| Keyboards | `keyboard` |
| Headsets, Music Headsets, Earphones | `headset` |

## CSV File Location

The CSV file is located at:
- **Source**: `wc-product-export-26-12-2025-1766805512226.csv` (root)
- **Public**: `public/wc-product-export-26-12-2025-1766805512226.csv` (for browser access)

## Product Organization

Products are automatically organized into these categories:
- **CPU**: Processors
- **GPU**: Graphics cards
- **Motherboard**: Motherboards
- **RAM**: Memory modules
- **Storage**: SSDs, HDDs
- **PSU**: Power supplies
- **Case**: PC cases
- **Cooler**: CPU coolers and fans
- **Mouse**: Gaming mice
- **Keyboard**: Keyboards
- **Headset**: Headsets and headphones

## Usage Example

```tsx
import { useCSVProducts } from '@/hooks/useCSVProducts';

function MyComponent() {
  const { products, loading, productCounts } = useCSVProducts({ fetchAll: true });
  
  if (loading) return <div>Loading products...</div>;
  
  return (
    <div>
      <h2>Product Counts</h2>
      <ul>
        {Object.entries(productCounts).map(([category, count]) => (
          <li key={category}>{category}: {count} products</li>
        ))}
      </ul>
      
      <h2>All Products ({products.length})</h2>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>Brand: {product.brand}</p>
          <p>Category: {product.category}</p>
          <p>Price: ${product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

## Integration with Existing Components

You can integrate CSV products into existing components:

1. **ComponentSelector**: Replace sample data with CSV products
2. **ProductCarousel**: Use CSV products for carousels
3. **CompareProducts**: Use CSV products for comparison
4. **Products Page**: Display CSV products with pagination

## Notes

- Products are cached after first load for performance
- Only published products (Published = 1) are included
- Products are automatically categorized based on CSV categories and product names
- Brand extraction attempts to identify brands from product names and tags
- Images are parsed from the Images column
- Stock status is determined from "In stock?" and Stock columns

