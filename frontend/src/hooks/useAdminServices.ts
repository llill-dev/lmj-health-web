import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { get, post, put, patch, del } from '@/lib/base';
import { servicesEndpoints } from '@/lib/admin/services/endpoints';
import type {
  FacilitiesListParams,
  FacilitiesListResponse,
  FacilityResponse,
  CreateFacilityBody,
  UpdateFacilityBody,
  ServiceTypesListResponse,
  ServiceTypeResponse,
  CreateServiceTypeBody,
  UpdateServiceTypeBody,
  ServiceProvidersListResponse,
  CreateProviderBody,
  UpdateProviderBody,
} from '@/lib/admin/services/types';

// ─────────────────────────────────────────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────────────────────────────────────────

export const SERVICES_KEYS = {
  allFacilities: ['admin', 'facilities'] as const,
  facilities: (params: FacilitiesListParams) =>
    ['admin', 'facilities', params] as const,
  facilityById: (id: string) => ['admin', 'facility', id] as const,
  serviceTypes: () => ['admin', 'service-types'] as const,
  serviceProviders: (typeSlug?: string, cursor?: string) =>
    ['admin', 'service-providers', typeSlug, cursor] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildQs(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  return qs.toString();
}

// ─────────────────────────────────────────────────────────────────────────────
// Facilities
// ─────────────────────────────────────────────────────────────────────────────

export function useFacilitiesList(params: FacilitiesListParams = {}) {
  const qs = buildQs(params as Record<string, unknown>);
  return useQuery({
    queryKey: SERVICES_KEYS.facilities(params),
    queryFn: () =>
      get<FacilitiesListResponse>(
        `${servicesEndpoints.facilities.list}${qs ? `?${qs}` : ''}`,
        { locale: 'ar' },
      ),
    placeholderData: keepPreviousData,
  });
}

export function useFacilityById(id: string, enabled = true) {
  return useQuery({
    queryKey: SERVICES_KEYS.facilityById(id),
    queryFn: () =>
      get<FacilityResponse>(servicesEndpoints.facilities.getById(id), {
        locale: 'ar',
      }),
    enabled: !!id && enabled,
  });
}

export function useCreateFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFacilityBody) =>
      post<FacilityResponse>(servicesEndpoints.facilities.create, body, {
        locale: 'ar',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.allFacilities });
    },
  });
}

export function useUpdateFacility(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateFacilityBody) =>
      put<FacilityResponse>(servicesEndpoints.facilities.update(id), body, {
        locale: 'ar',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.allFacilities });
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.facilityById(id) });
    },
  });
}

export function useUpdateFacilityStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      patch<FacilityResponse>(
        servicesEndpoints.facilities.updateStatus(id),
        { status },
        { locale: 'ar' },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.allFacilities });
    },
  });
}

export function useDeleteFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      del<FacilityResponse>(servicesEndpoints.facilities.delete(id), {
        locale: 'ar',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.allFacilities });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Types
// ─────────────────────────────────────────────────────────────────────────────

export function useServiceTypesList(active?: boolean) {
  const qs = active !== undefined ? `?active=${active}` : '';
  return useQuery({
    queryKey: [...SERVICES_KEYS.serviceTypes(), active],
    queryFn: () =>
      get<ServiceTypesListResponse>(
        `${servicesEndpoints.serviceTypes.list}${qs}`,
        { locale: 'ar' },
      ),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateServiceType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateServiceTypeBody) =>
      post<ServiceTypeResponse>(servicesEndpoints.serviceTypes.create, body, {
        locale: 'ar',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.serviceTypes() });
    },
  });
}

export function useUpdateServiceType(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateServiceTypeBody) =>
      put<ServiceTypeResponse>(
        servicesEndpoints.serviceTypes.update(id),
        body,
        { locale: 'ar' },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.serviceTypes() });
    },
  });
}

/** تحديث نوع خدمة بأي `id` (مثلاً حوار تعديل ديناميكي) */
export function useMutateServiceType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateServiceTypeBody;
    }) =>
      put<ServiceTypeResponse>(
        servicesEndpoints.serviceTypes.update(id),
        body,
        { locale: 'ar' },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: SERVICES_KEYS.serviceTypes() });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Providers
// ─────────────────────────────────────────────────────────────────────────────

export function useServiceProvidersList(typeSlug?: string, cursor?: string) {
  const qs = new URLSearchParams({ limit: '20' });
  if (typeSlug) qs.set('type', typeSlug);
  if (cursor) qs.set('cursor', cursor);

  return useQuery({
    queryKey: SERVICES_KEYS.serviceProviders(typeSlug, cursor),
    queryFn: () =>
      get<ServiceProvidersListResponse>(
        `${servicesEndpoints.serviceProviders.list}?${qs.toString()}`,
        { locale: 'ar' },
      ),
    enabled: !!typeSlug,
  });
}

export function useCreateProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProviderBody) =>
      post(servicesEndpoints.serviceProviders.create, body, { locale: 'ar' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'service-providers'] });
    },
  });
}

export function useUpdateProvider(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProviderBody) =>
      put(servicesEndpoints.serviceProviders.update(id), body, {
        locale: 'ar',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'service-providers'] });
    },
  });
}

export function useUpdateProviderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      patch(
        servicesEndpoints.serviceProviders.updateStatus(id),
        { status },
        { locale: 'ar' },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'service-providers'] });
    },
  });
}
