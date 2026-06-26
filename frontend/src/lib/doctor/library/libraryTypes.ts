export type DoctorLibraryItemType =
  | 'MEDICATION'
  | 'LAB'
  | 'IMAGING'
  | 'PROCEDURE';

export type DoctorLibraryItem = {
  _id: string;
  type?: DoctorLibraryItemType;
  label?: string;
  source?: string;
  catalogSection?: string;
  catalogItemId?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  data?: Record<string, unknown>;
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
  items?: DoctorLibraryItem[];
};

export type CreateDoctorLibraryItemBody = {
  type: DoctorLibraryItemType;
  label: string;
  source?: string;
  catalogSection?: string;
  catalogItemId?: string;
  data?: Record<string, unknown>;
  isFavorite?: boolean;
};

export type UpdateDoctorLibraryItemBody = Partial<CreateDoctorLibraryItemBody>;
