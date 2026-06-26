import type { CatalogOrderCategory } from '@/components/doctor/encounters/orders/encounter-order-config';
import type { OrderCatalogSection } from '@/lib/doctor/orders/orderFavoritesTypes';

export function orderCategoryToCatalogSection(
  category: CatalogOrderCategory,
): OrderCatalogSection {
  switch (category) {
    case 'lab':
      return 'LAB';
    case 'radiology':
      return 'IMAGING';
    case 'procedure':
      return 'PROCEDURE';
  }
}
