import type { FacilityType } from '@/lib/admin/types';

export type DoctorFacilityRecord = {
  id?: string;
  _id?: string;
  facilityProviderId?: string;
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

/**
 * POST/PUT /api/doctors/me/facility — Swagger-validated body fields.
 * The route validation (src/routes/doctor.js) lists BOTH `facilityType` and
 * legacy `kind`; we send both (equal) since `kind` is the canonical schema field.
 */
export type DoctorFacilityMutationBody = {
  name: string;
  city: string;
  facilityType: FacilityType;
  kind: FacilityType;
  country: string;
  address: string;
  phone: string;
  description: string;
  attributes: string[];
};

export type DoctorFacilityAssignBody = {
  facilityId: string | null;
  facilityProviderId?: string | null;
};

export type DoctorFacilitySuggestRequestBody = {
  name: string;
  city: string;
  facilityType?: FacilityType;
  address?: string;
  phone?: string;
  description?: string;
};

export type DoctorFacilityDoctorPayload = {
  _id?: string;
  id?: string;
  facility?: DoctorFacilityRecord;
};

export type DoctorFacilityResponse = {
  messageKey?: string;
  message?: string;
  facility?: DoctorFacilityRecord;
  /** Swagger 201 may return `{ data: { id } }` or embed the full record. */
  data?: DoctorFacilityRecord | { id?: string; _id?: string };
  doctor?: DoctorFacilityDoctorPayload;
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

export type DoctorFacilitySuggestRequestResponse = {
  messageKey?: string;
  message?: string;
  request?: {
    _id?: string;
    id?: string;
    status?: string;
    facilityId?: string | null;
    facilityProviderId?: string | null;
    createdAt?: string;
  };
  data?: {
    _id?: string;
    id?: string;
    status?: string;
    facilityId?: string | null;
    facilityProviderId?: string | null;
  };
};
