export type DoctorLibraryItemType =
  | 'MEDICATION'
  | 'LAB'
  | 'IMAGING'
  | 'PROCEDURE';

export type DoctorLibraryItemPayload = {
  [key: string]: unknown;
};

export type DoctorLibraryItem = {
  _id: string;
  type?: DoctorLibraryItemType;
  label?: string;
  source?: string;
  catalogSection?: string;
  catalogItemId?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  data?: DoctorLibraryItemPayload;
  updatedAt?: string;
  createdAt?: string;
};

export type DoctorLibraryListResponse = {
  page?: number;
  limit?: number;
  total?: number;
  results?: number;
  items?: DoctorLibraryItem[];
};

export type DoctorLibraryRecentResponse = {
  messageKey?: string;
  message?: string;
  items?: DoctorLibraryItem[];
};

export type CreateDoctorLibraryItemBody = {
  type: DoctorLibraryItemType;
  label: string;
  source?: string;
  catalogSection?: string;
  catalogItemId?: string;
  data?: DoctorLibraryItemPayload;
  isFavorite?: boolean;
};

export type UpdateDoctorLibraryItemBody = Partial<CreateDoctorLibraryItemBody>;

export type DoctorLibraryItemMutationResponse = {
  messageKey?: string;
  message?: string;
  item?: DoctorLibraryItem;
};

export type DoctorLibraryItemDeleteResponse = {
  messageKey?: string;
  message?: string;
  itemId?: string;
};

export type DoctorLibraryItemFavoriteResponse = {
  messageKey?: string;
  message?: string;
  itemId?: string;
  isFavorite?: boolean;
};
