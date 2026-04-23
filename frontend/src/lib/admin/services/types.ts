import type { ApiSuccessEnvelope } from '@/lib/admin/types';

// ─────────────────────────────────────────────────────────────────────────────
// Facilities
// ─────────────────────────────────────────────────────────────────────────────

export type FacilityType =
  | 'hospital'
  | 'clinic'
  | 'polyclinic'
  | 'medical_center'
  | 'laboratory'
  | 'imaging_center'
  | 'pharmacy'
  | 'rehabilitation_center'
  | 'dialysis_center'
  | 'emergency_center'
  | 'other';

export type FacilityStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'DELETED';

export type FacilitySummary = {
  id: string;
  _id?: string;
  name: string;
  facilityType: FacilityType;
  city: string;
  country?: string;
  address?: string;
  phone?: string;
  description?: string;
  status: FacilityStatus;
  attributes: string[];
  ownerDoctorId?: string;
  doctorCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export type FacilitiesListParams = {
  page?: number;
  limit?: number;
  q?: string;
  facilityType?: FacilityType;
  status?: FacilityStatus;
  city?: string;
  hasDoctors?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'city' | 'doctorCount';
  sortOrder?: 'asc' | 'desc';
};

export type FacilitiesListResponse = ApiSuccessEnvelope & {
  page: number;
  limit: number;
  total: number;
  results: number;
  facilities: FacilitySummary[];
};

export type CreateFacilityBody = {
  name: string;
  facilityType: FacilityType;
  city: string;
  country?: string;
  address?: string;
  phone?: string;
  description?: string;
  status?: FacilityStatus;
  attributes?: string[];
  ownerDoctorId?: string;
};

export type UpdateFacilityBody = Partial<CreateFacilityBody>;

export type FacilityResponse = ApiSuccessEnvelope & {
  facility: FacilitySummary;
};

// ─────────────────────────────────────────────────────────────────────────────
// Service Types (dynamic schema-as-data)
// ─────────────────────────────────────────────────────────────────────────────

export type ServiceTypeField = {
  key: string;
  label: string | { en: string; ar: string };
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  isPublic?: boolean;
};

export type ServiceType = {
  _id: string;
  name: string | { en: string; ar: string };
  slug: string;
  description?: string | { en: string; ar: string };
  schemaVersion: number;
  isActive: boolean;
  fields: ServiceTypeField[];
};

/** Helper: extract display string from bilingual or plain string field */
export function resolveLabel(
  val: string | { en: string; ar: string } | undefined,
  lang: 'ar' | 'en' = 'ar',
): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[lang] || val.en || '';
}

export type ServiceTypesListResponse = {
  serviceTypes: ServiceType[];
};

export type CreateServiceTypeBody = {
  name: { en: string; ar: string };
  slug: string;
  description?: { en: string; ar: string };
  fields: ServiceTypeField[];
};

export type UpdateServiceTypeBody = Partial<CreateServiceTypeBody> & {
  /** مذكور في API-3 لـ PUT /service-types/:id */
  isActive?: boolean;
};

export type ServiceTypeResponse = {
  serviceType: ServiceType;
};

// ─────────────────────────────────────────────────────────────────────────────
// Service Providers
// ─────────────────────────────────────────────────────────────────────────────

export type ProviderStatus = 'active' | 'inactive' | 'draft';

export type ServiceProvider = {
  _id: string;
  id?: string;
  serviceType:
    | string
    | { id: string; slug: string; name: string | { en: string; ar: string } };
  status: ProviderStatus;
  schemaVersionAtWrite?: number;
  data: Record<string, unknown>;
  createdAt?: string;
};

export type ServiceProvidersListResponse = {
  items: ServiceProvider[];
  limit: number;
  nextCursor: string | null;
};

export type CreateProviderBody = {
  serviceType: string;
  status?: ProviderStatus;
  data: Record<string, unknown>;
};

export type UpdateProviderBody = {
  data?: Record<string, unknown>;
  status?: ProviderStatus;
};
