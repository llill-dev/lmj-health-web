import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { get, post, put, patch, del } from "@/lib/api";
import { adminApi } from "@/lib/admin/client";
import { adminEndpoints } from "@/lib/admin/endpoints";
import {
  isAwaitingInitialQueryData,
  isAwaitingInitialQueryDataWithPlaceholder,
} from "@/lib/query/queryUi";
import type {
  FacilitiesListParams,
  FacilitiesListResponse,
  FacilityResponse,
  FacilitySummary,
  CreateFacilityBody,
  UpdateFacilityBody,
  FacilityActionBody,
  ServiceTypesListResponse,
  ServiceTypeResponse,
  CreateServiceTypeBody,
  UpdateServiceTypeBody,
  ServiceProvidersListResponse,
  CreateProviderBody,
  UpdateProviderBody,
  FacilityDoctorsListParams,
  FacilityDoctorsListResponse,
  FacilityDoctorSummary,
} from "@/lib/admin/types";

// ─────────────────────────────────────────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────────────────────────────────────────

export const SERVICES_KEYS = {
  allFacilities: ["admin", "facilities"] as const,
  facilities: (params: FacilitiesListParams) =>
    ["admin", "facilities", params] as const,
  facilityById: (id: string) => ["admin", "facility", id] as const,
  facilityDoctors: (id: string, params: FacilityDoctorsListParams) =>
    ["admin", "facility", id, "doctors", params] as const,
  serviceTypes: () => ["admin", "service-types"] as const,
  serviceProviders: (typeSlug?: string, cursor?: string) =>
    ["admin", "service-providers", typeSlug, cursor] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildQs(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (v === "" && k !== "ownerDoctorId") return;
    qs.set(k, String(v));
  });
  return qs.toString();
}

function normalizeFacilityPayload<T extends CreateFacilityBody | UpdateFacilityBody>(
  body: T,
): T {
  const attributes = Array.isArray(body.attributes)
    ? body.attributes
        .map((attr) => attr.trim())
        .filter(Boolean)
    : body.attributes;

  const ownerDoctorId =
    body.ownerDoctorId === ""
      ? ""
      : body.ownerDoctorId?.trim() || body.ownerDoctorId || undefined;

  return {
    ...body,
    attributes,
    ownerDoctorId,
  };
}

function normalizeFacilityRecord(
  facility: Partial<FacilitySummary> | null | undefined,
): FacilitySummary | null {
  if (!facility || typeof facility !== "object") return null;

  const id = facility.id ?? facility._id;
  const name = facility.name?.trim();
  const city = facility.city?.trim();
  const facilityType = facility.facilityType;
  const status = facility.status;

  if (!id || !name || !city || !facilityType || !status) return null;

  return {
    id,
    _id: facility._id ?? id,
    name,
    normalizedName: facility.normalizedName,
    facilityType,
    city,
    country: facility.country?.trim() || undefined,
    address: facility.address?.trim() || undefined,
    phone: facility.phone?.trim() || undefined,
    description: facility.description?.trim() || undefined,
    status,
    attributes: Array.isArray(facility.attributes)
      ? facility.attributes.map((attr) => attr.trim()).filter(Boolean)
      : [],
    ownerDoctorId: facility.ownerDoctorId ?? null,
    createdBy: facility.createdBy ?? null,
    updatedBy: facility.updatedBy ?? null,
    approvedBy: facility.approvedBy ?? null,
    approvedAt: facility.approvedAt ?? null,
    legacyProviderId: facility.legacyProviderId ?? null,
    doctorCount:
      typeof facility.doctorCount === "number" ? facility.doctorCount : 0,
    createdAt: facility.createdAt,
    updatedAt: facility.updatedAt,
  };
}

function normalizeFacilityDoctorRecord(
  doctor: Partial<FacilityDoctorSummary> | null | undefined,
): FacilityDoctorSummary | null {
  if (!doctor || typeof doctor !== "object") return null;
  const id = doctor.id ?? doctor._id;
  if (!id) return null;

  return {
    ...doctor,
    id,
    _id: doctor._id ?? id,
  };
}

function normalizeFacilitiesListResponse(
  response: FacilitiesListResponse,
): FacilitiesListResponse & { facilities: FacilitySummary[] } {
  const sourceItems =
    response.facilities ??
    response.items ??
    response.data?.facilities ??
    response.data?.items ??
    [];

  return {
    ...response,
    page: response.page ?? response.data?.page ?? 1,
    limit: response.limit ?? response.data?.limit ?? 10,
    total: response.total ?? response.data?.total ?? 0,
    results: response.results ?? response.data?.results ?? sourceItems.length,
    facilities: sourceItems
      .map((facility) => normalizeFacilityRecord(facility))
      .filter((facility): facility is FacilitySummary => Boolean(facility)),
  };
}

function normalizeFacilityResponse(
  response: FacilityResponse,
): FacilityResponse & { facility: FacilitySummary | null } {
  const responseData = response.data;
  const sourceFacility =
    response.facility ??
    (responseData &&
    typeof responseData === "object" &&
    "facility" in responseData
      ? responseData.facility
      : responseData);

  return {
    ...response,
    facility: normalizeFacilityRecord(
      sourceFacility as Partial<FacilitySummary> | null | undefined,
    ),
  };
}

function normalizeFacilityDoctorsResponse(
  response: FacilityDoctorsListResponse,
): FacilityDoctorsListResponse & { doctors: FacilityDoctorSummary[] } {
  const sourceDoctors =
    response.doctors ??
    response.items ??
    response.data?.doctors ??
    response.data?.items ??
    [];

  return {
    ...response,
    facility: response.facility ?? response.data?.facility,
    page: response.page ?? response.data?.page ?? 1,
    limit: response.limit ?? response.data?.limit ?? 10,
    total: response.total ?? response.data?.total ?? 0,
    results: response.results ?? response.data?.results ?? sourceDoctors.length,
    doctors: sourceDoctors
      .map((doctor) => normalizeFacilityDoctorRecord(doctor))
      .filter((doctor): doctor is FacilityDoctorSummary => Boolean(doctor)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Facilities
// ─────────────────────────────────────────────────────────────────────────────

export function useFacilitiesList(params: FacilitiesListParams = {}) {
  const qs = buildQs(params as Record<string, unknown>);
  const query = useQuery({
    queryKey: SERVICES_KEYS.facilities(params),
    queryFn: () =>
      get<FacilitiesListResponse>(
        `${adminEndpoints.facilities.list}${qs ? `?${qs}` : ""}`,
        { locale: "ar" },
      ).then(normalizeFacilitiesListResponse),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    isAwaitingData: isAwaitingInitialQueryDataWithPlaceholder(
      query.data,
      query.isError,
      undefined,
    ),
  };
}

export function useFacilityById(id: string, enabled = true) {
  return useQuery({
    queryKey: SERVICES_KEYS.facilityById(id),
    queryFn: () => adminApi.facilities.getById(id).then(normalizeFacilityResponse),
    enabled: !!id && enabled,
  });
}

export function useCreateFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFacilityBody) =>
      post<FacilityResponse>(
        adminEndpoints.facilities.create,
        normalizeFacilityPayload(body),
        {
          locale: "ar",
        },
      ).then(normalizeFacilityResponse),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.allFacilities });
    },
  });
}

export function useUpdateFacility(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateFacilityBody) =>
      put<FacilityResponse>(
        adminEndpoints.facilities.update(id),
        normalizeFacilityPayload(body),
        {
          locale: "ar",
        },
      ).then(normalizeFacilityResponse),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.allFacilities });
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.facilityById(id) });
    },
  });
}

export function useFacilityAction(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FacilityActionBody) =>
      patch<FacilityResponse>(adminEndpoints.facilities.action(id), body, {
        locale: "ar",
      }).then(normalizeFacilityResponse),
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
      adminApi.facilities.updateStatus(id, status).then(normalizeFacilityResponse),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.allFacilities });
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.facilityById(id) });
    },
  });
}

export function useDeleteFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminApi.facilities.remove(id).then(normalizeFacilityResponse),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.allFacilities });
      qc.removeQueries({ queryKey: SERVICES_KEYS.facilityById(id) });
    },
  });
}

export function useFacilityDoctors(
  facilityId: string,
  params: FacilityDoctorsListParams = {},
  enabled = true,
) {
  const query = useQuery({
    queryKey: SERVICES_KEYS.facilityDoctors(facilityId, params),
    queryFn: () =>
      adminApi.facilities
        .listDoctors(facilityId, params)
        .then(normalizeFacilityDoctorsResponse),
    enabled: Boolean(facilityId) && enabled,
    staleTime: 30_000,
  });

  return {
    ...query,
    doctors: query.data?.doctors ?? [],
    total: query.data?.total ?? 0,
    facility: query.data?.facility,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Types
// ─────────────────────────────────────────────────────────────────────────────

export function useServiceTypesList(active?: boolean) {
  const qs = active !== undefined ? `?active=${active}` : "";
  const query = useQuery({
    queryKey: [...SERVICES_KEYS.serviceTypes(), active],
    queryFn: () =>
      get<ServiceTypesListResponse>(
        `${adminEndpoints.serviceTypes.list}${qs}`,
        { locale: "ar" },
      ),
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useCreateServiceType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateServiceTypeBody) =>
      post<ServiceTypeResponse>(adminEndpoints.serviceTypes.create, body, {
        locale: "ar",
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
      put<ServiceTypeResponse>(adminEndpoints.serviceTypes.update(id), body, {
        locale: "ar",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.serviceTypes() });
    },
  });
}

/** تحديث نوع خدمة بأي `id` (مثلاً حوار تعديل ديناميكي) */
export function useMutateServiceType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateServiceTypeBody }) =>
      put<ServiceTypeResponse>(adminEndpoints.serviceTypes.update(id), body, {
        locale: "ar",
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: SERVICES_KEYS.serviceTypes() });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Providers
// ─────────────────────────────────────────────────────────────────────────────

export function useServiceProvidersList(typeSlug?: string, cursor?: string) {
  const qs = new URLSearchParams({ limit: "20" });
  if (typeSlug) qs.set("type", typeSlug);
  if (cursor) qs.set("cursor", cursor);

  return useQuery({
    queryKey: SERVICES_KEYS.serviceProviders(typeSlug, cursor),
    queryFn: () =>
      get<ServiceProvidersListResponse>(
        `${adminEndpoints.serviceProviders.list}?${qs.toString()}`,
        { locale: "ar" },
      ),
    enabled: !!typeSlug,
  });
}

export function useCreateProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProviderBody) =>
      adminApi.serviceProviders.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "service-providers"] });
    },
  });
}

export function useUpdateProvider(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProviderBody) =>
      adminApi.serviceProviders.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "service-providers"] });
    },
  });
}

export function useUpdateProviderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.serviceProviders.updateStatus(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "service-providers"] });
    },
  });
}
