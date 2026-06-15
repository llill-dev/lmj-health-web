import type { FacilityType } from '@/lib/admin/types';

export type DoctorFacilityRecord = {
  id?: string;
  _id?: string;
  name: string;
  facilityType?: FacilityType | string;
  city: string;
  country?: string;
  address?: string;
  phone?: string;
  description?: string;
  status?: string;
  attributes?: string[];
  ownerDoctorId?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** POST/PUT /api/doctors/me/facility — Swagger validated body fields only. */
export type DoctorFacilityMutationBody = {
  name: string;
  city: string;
  facilityType: FacilityType;
  kind: FacilityType;
  country?: string;
  address?: string;
  phone?: string;
  description?: string;
  attributes?: string[];
};

/** Legacy doctor facility request (POST /api/facilities/requests). */
export type DoctorFacilityCreateRequestBody = {
  name: string;
  city: string;
  facilityType?: FacilityType;
  kind?: FacilityType;
  address?: string;
  phone?: string;
  description?: string;
  country?: string;
};

export type DoctorFacilityResponse = {
  messageKey?: string;
  message?: string;
  facility?: DoctorFacilityRecord;
  /** Swagger 201 may return `{ data: { id } }` or embed the full record. */
  data?: DoctorFacilityRecord | { id?: string; _id?: string };
  doctor?: Record<string, unknown>;
};

export type FacilityTypeOption = {
  key: string;
  translationKey: string;
  label: string;
};

export type FacilityTypesResponse = {
  messageKey?: string;
  types?: FacilityTypeOption[];
};
