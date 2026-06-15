import type { FacilityType } from '@/lib/admin/types';

export type FacilitiesSuggestParams = {
  q?: string;
  city?: string;
  facilityType?: FacilityType | string;
  kind?: FacilityType | string;
  limit?: number;
};

export type SuggestFacilityRecord = {
  id?: string;
  _id?: string;
  name: string;
  facilityType?: FacilityType | string;
  city?: string;
  country?: string;
  address?: string;
  phone?: string;
  description?: string;
  status?: string;
  attributes?: string[];
  doctorCount?: number;
};

export type FacilitiesSuggestResponse = {
  messageKey?: string;
  message?: string;
  results?: number;
  facilities?: SuggestFacilityRecord[];
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
