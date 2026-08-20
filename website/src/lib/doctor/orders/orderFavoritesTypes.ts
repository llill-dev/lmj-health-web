export type OrderCatalogSection = 'LAB' | 'IMAGING' | 'PROCEDURE';

export type OrderFavoriteRecord = {
  _id: string;
  catalogSection?: OrderCatalogSection;
  catalogItemId?: string;
  createdAt?: string;
};

export type CreateOrderFavoriteBody = {
  catalogSection: OrderCatalogSection;
  catalogItemId: string;
};

export type OrderFavoritesListResponse = {
  messageKey?: string;
  message?: string;
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  favorites?: OrderFavoriteRecord[];
};

export type OrderFavoriteMutationResponse = {
  messageKey?: string;
  message?: string;
  favorite?: OrderFavoriteRecord;
};
