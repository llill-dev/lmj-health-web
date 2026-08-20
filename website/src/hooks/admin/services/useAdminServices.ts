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
  CreateProviderBody,
  UpdateProviderBody,
  ManagedServiceProviderListParams,
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
  serviceProviders: (params: ManagedServiceProviderListParams = {}) =>
    ["admin", "service-providers", params] as const,
  serviceProviderById: (id: string) => ["admin", "service-provider", id] as const,
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

function normalizeFacilityAttribute(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeFacilityPayload<T extends CreateFacilityBody | UpdateFacilityBody>(
  body: T,
): T {
  const attributes = Array.isArray(body.attributes)
    ? body.attributes
        .map((attr) => normalizeFacilityAttribute(attr))
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

function normalizeServiceTypesResponse(
  response: ServiceTypesListResponse & {
    items?: ServiceTypesListResponse["serviceTypes"];
    data?: { serviceTypes?: ServiceTypesListResponse["serviceTypes"]; items?: ServiceTypesListResponse["serviceTypes"] };
  },
): ServiceTypesListResponse {
  return {
    ...response,
    serviceTypes:
      response.serviceTypes ??
      response.items ??
      response.data?.serviceTypes ??
      response.data?.items ??
      [],
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
    queryFn: () => adminApi.facilities.getById(id),
    enabled: !!id && enabled,
  });
}

export function useCreateFacility() {
  const qc = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
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
    meta: {
      skipGlobalError: true,
    },
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
    meta: {
      skipGlobalError: true,
    },
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
    meta: {
      skipGlobalError: true,
    },
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.facilities.updateStatus(id, status),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.allFacilities });
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.facilityById(id) });
    },
  });
}

export function useDeleteFacility() {
  const qc = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (id: string) => adminApi.facilities.remove(id),
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
      ).then((response) => normalizeServiceTypesResponse(response)),
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useServiceTypesPublicList() {
  const query = useQuery({
    queryKey: [...SERVICES_KEYS.serviceTypes(), "public"],
    queryFn: () =>
      get<ServiceTypesListResponse>(adminEndpoints.serviceTypes.listPublic, {
        locale: "ar",
      }).then((response) => normalizeServiceTypesResponse(response)),
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

// NOTE: an earlier version of this file JSON.stringify'd `fields` here, based on a
// misreading of the live OpenAPI spec's type annotation. The live backend's actual
// runtime behavior (confirmed via a 422 response: "القيمة يجب أن تكون مصفوفة." /
// "fields.forEach is not a function") proves the opposite — it expects `fields` as
// a real, structured array in the JSON body. Do not re-introduce stringification here.

export function useCreateServiceType() {
  const qc = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (body: CreateServiceTypeBody) =>
      post<ServiceTypeResponse>(
        adminEndpoints.serviceTypes.create,
        body,
        { locale: "ar" },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.serviceTypes() });
    },
  });
}

export function useUpdateServiceType(id: string) {
  const qc = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (body: UpdateServiceTypeBody) =>
      put<ServiceTypeResponse>(
        adminEndpoints.serviceTypes.update(id),
        body,
        { locale: "ar" },
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
    meta: {
      skipGlobalError: true,
    },
    mutationFn: ({ id, body }: { id: string; body: UpdateServiceTypeBody }) =>
      put<ServiceTypeResponse>(
        adminEndpoints.serviceTypes.update(id),
        body,
        { locale: "ar" },
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: SERVICES_KEYS.serviceTypes() });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Providers
// ─────────────────────────────────────────────────────────────────────────────

export function useServiceProvidersList(
  params: ManagedServiceProviderListParams = {},
) {
  const query = useQuery({
    queryKey: SERVICES_KEYS.serviceProviders(params),
    queryFn: () => adminApi.serviceProviders.list(params),
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

export function useServiceProvider(id: string, enabled = true) {
  return useQuery({
    queryKey: SERVICES_KEYS.serviceProviderById(id),
    queryFn: () => adminApi.serviceProviders.getById(id),
    enabled: !!id && enabled,
  });
}

export function useCreateProvider() {
  const qc = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
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
    meta: {
      skipGlobalError: true,
    },
    mutationFn: (body: UpdateProviderBody) =>
      adminApi.serviceProviders.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "service-providers"] });
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.serviceProviderById(id) });
    },
  });
}

export function useUpdateProviderStatus() {
  const qc = useQueryClient();
  return useMutation({
    meta: {
      skipGlobalError: true,
    },
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.serviceProviders.updateStatus(id, { status }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["admin", "service-providers"] });
      qc.invalidateQueries({ queryKey: SERVICES_KEYS.serviceProviderById(id) });
    },
  });
}
