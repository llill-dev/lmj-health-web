export type InternalDirectoryListParams = {
  search?: string;
  specialization?: string;
  city?: string;
  country?: string;
  consultationType?: 'online' | 'offline';
  minRating?: number;
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
};

export type InternalDirectoryDoctorUser = {
  fullName?: string;
  email?: string;
  phone?: string;
  photoUrl?: string | null;
};

export type InternalDirectoryDoctor = {
  _id: string;
  specialization?: string;
  consultationTypes?: Array<'online' | 'offline' | string>;
  consultationFee?: number | null;
  averageRating?: number | null;
  totalReviews?: number | null;
  approvalStatus?: string;
  locationCity?: string;
  locationCountry?: string;
  clinicAddress?: string;
  bio?: string;
  user?: InternalDirectoryDoctorUser;
  distanceMeters?: number | null;
};

export type InternalDirectoryListResponse = {
  page: number;
  limit: number;
  total: number;
  results?: number;
  doctors: InternalDirectoryDoctor[];
};
