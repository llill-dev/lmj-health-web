import { ApiError, del, get, patch, post, put } from "@/lib/api";
import { adminEndpoints } from "@/lib/admin/endpoints";
import type {
  AppointmentCancelResponse,
  AppointmentDetailsResponse,
  AdminAppointmentsListParams,
  AdminAppointmentsListResponse,
  AdminDoctorDetailsResponse,
  AdminDoctorsListParams,
  AdminDoctorsListResponse,
  AdminPatientAccountActionResponse,
  AdminPatientFilesListParams,
  AdminPatientFilesListResponse,
  AdminPatientFileDownloadUrlResponse,
  AdminPatientDetailsResponse,
  AdminPatientsListParams,
  AdminPatientsListResponse,
  AdminAccessRequestDetailsResponse,
  AdminAccessRequestsListResponse,
  AdminSecretariesListParams,
  AdminSecretariesListResponse,
  AdminDoctorRestoreRequestReviewResponse,
  AdminDoctorRestoreRequestsListResponse,
  AdminUserReboardResponse,
  AdminUsersListResponse,
  FacilitiesListParams,
  FacilitiesListResponse,
  CreateAdminUserBody,
  CreateAdminUserResponse,
  AdminUserOffboardResponse,
  AdminContentListParams,
  AdminContentListResponse,
  AdminContentDetailsResponse,
  CreateAdminContentBody,
  UpdateAdminContentBody,
  AdminContentMutationResponse,
  AdminContentReviewActionResponse,
  AdminContentTemplatesListResponse,
  AdminContentTemplatesListParams,
  CreateAdminContentTemplateBody,
  UpdateAdminContentTemplateBody,
  AdminContentTemplateMutationResponse,
  AdminNewsIngestBody,
  AdminNewsPendingListParams,
  AdminNewsPendingListResponse,
  AuditLogsListParams,
  AuditLogsListResponse,
  VerificationRequestReviewBody,
  VerificationRequestDetailsResponse,
  VerificationRequestReviewResponse,
  VerificationRequestSummary,
  VerificationRequestsListParams,
  VerificationRequestsListResponse,
  AdminComplaintsListParams,
  AdminComplaintsListResponse,
  AdminComplaintDetailsResponse,
  ComplaintStatusUpdateBody,
  ComplaintStatusUpdateResponse,
  ApiSuccessEnvelope,
  AdminMedicalOrderCatalogListParams,
  AdminMedicalOrderCatalogListResponse,
  AdminMedicalOrderCatalogDetailsResponse,
  AdminMedicalOrderCatalogMutationResponse,
  AdminMedicalOrderCatalogUpsertBody,
  MedicalOrderCatalogItem,
  MedicalOrderCatalogKind,
  AdminDoctorAnalyticsQuery,
  DoctorActivitySummaryResponse,
  DoctorDiagnosisAnalyticsResponse,
  AdminLookupsListParams,
  AdminLookupsListResponse,
  AdminLookupCreateBody,
  AdminLookupPatchBody,
  AdminLookupMutationResponse,
  FacilityDoctorsListParams,
  FacilityDoctorsListResponse,
  FacilityCreateResponse,
  FacilityDeleteResponse,
  FacilityResponse,
  FacilityStatusMutationResponse,
  FacilityUpdateResponse,
  CreateFacilityBody,
  UpdateFacilityBody,
  AdminContentTemplateDisableResponse,
  AdminLookupDeleteResponse,
  AdminNewsIngestResponse,
  DoctorProfileChangeRequestReviewResponse,
  CreateProviderBody,
  ServiceProviderCreateResponse,
  ServiceProviderStatusUpdateResponse,
  ServiceProviderUpdateResponse,
  UpdateProviderBody,
} from "@/lib/admin/types";

type AdminApiRecord = {
  [key: string]: unknown;
};

type VerificationRequestEnvelope =
  | VerificationRequestSummary
  | AdminApiRecord
  | null
  | undefined;

type AdminListEnvelope = AdminApiRecord & {
  doctors?: unknown;
  patients?: unknown;
  appointments?: unknown;
  complaints?: unknown;
  secretaries?: unknown;
  auditLogs?: unknown;
  items?: unknown;
  content?: unknown;
  contentItems?: unknown;
  data?: unknown;
  result?: unknown;
  page?: unknown;
  limit?: unknown;
  total?: unknown;
  results?: unknown;
  pageInfo?: unknown;
};

function asAdminRecord(value: unknown): AdminApiRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as AdminApiRecord)
    : null;
}

function readAdminNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function asAdminListEnvelope(value: unknown): AdminListEnvelope | null {
  const record = asAdminRecord(value);
  return record ? { ...record } : null;
}

function isAdminRecordArray(value: unknown): value is AdminApiRecord[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => entry && typeof entry === "object" && !Array.isArray(entry))
  );
}

function readAdminNamedValue(
  value: unknown,
  key: string,
): unknown {
  return asAdminRecord(value)?.[key];
}

function mapAdminRecordArray<T>(
  value: unknown,
  mapRecord: (record: AdminApiRecord) => T | null,
): T[] | undefined {
  if (!isAdminRecordArray(value)) return undefined;
  const items = value
    .map(mapRecord)
    .filter((item): item is T => item != null);
  return items.length > 0 ? items : undefined;
}

function readAdminDoctorRecord(
  record: AdminApiRecord,
): AdminDoctorsListResponse["doctors"][number] {
  return record as AdminDoctorsListResponse["doctors"][number];
}

function readAdminPatientRecord(
  record: AdminApiRecord,
): AdminPatientsListResponse["patients"][number] {
  return record as AdminPatientsListResponse["patients"][number];
}

function readAdminAppointmentRecord(
  record: AdminApiRecord,
): AdminAppointmentsListResponse["appointments"][number] {
  return record as AdminAppointmentsListResponse["appointments"][number];
}

function readAdminComplaintRecord(
  record: AdminApiRecord,
): AdminComplaintsListResponse["complaints"][number] {
  return record as AdminComplaintsListResponse["complaints"][number];
}

function readAdminSecretaryRecord(
  record: AdminApiRecord,
): AdminSecretariesListResponse["secretaries"][number] {
  return record as AdminSecretariesListResponse["secretaries"][number];
}

function readAuditLogRecord(
  record: AdminApiRecord,
): AuditLogsListResponse["auditLogs"][number] {
  return record as AuditLogsListResponse["auditLogs"][number];
}

function readAdminContentItemRecord(
  record: AdminApiRecord,
): NonNullable<AdminContentListResponse["items"]>[number] {
  return record as NonNullable<AdminContentListResponse["items"]>[number];
}

function readAdminPatientFileRecord(
  record: AdminApiRecord,
): AdminPatientFilesListResponse["items"][number] {
  return record as AdminPatientFilesListResponse["items"][number];
}

function readAdminAccessRequestRecord(
  record: AdminApiRecord,
): NonNullable<AdminAccessRequestsListResponse["requests"]>[number] {
  return record as NonNullable<AdminAccessRequestsListResponse["requests"]>[number];
}

function readAdminUserRecord(
  record: AdminApiRecord,
): AdminUsersListResponse["users"][number] {
  return record as AdminUsersListResponse["users"][number];
}

function readAdminRestoreRequestRecord(
  record: AdminApiRecord,
): NonNullable<AdminDoctorRestoreRequestsListResponse["restoreRequests"]>[number] {
  return record as NonNullable<AdminDoctorRestoreRequestsListResponse["restoreRequests"]>[number];
}

function readAdminAccessRequestDetailsRecord(
  value: unknown,
): NonNullable<AdminAccessRequestDetailsResponse["request"]> | undefined {
  const record = asAdminRecord(value);
  return record as NonNullable<AdminAccessRequestDetailsResponse["request"]> | undefined;
}

function readAdminDoctorsFromArray(
  value: unknown,
): AdminDoctorsListResponse["doctors"] | undefined {
  return mapAdminRecordArray(value, readAdminDoctorRecord);
}

function readAdminPatientsFromArray(
  value: unknown,
): AdminPatientsListResponse["patients"] | undefined {
  return mapAdminRecordArray(value, readAdminPatientRecord);
}

function readAdminAppointmentsFromArray(
  value: unknown,
): AdminAppointmentsListResponse["appointments"] | undefined {
  return mapAdminRecordArray(value, readAdminAppointmentRecord);
}

function readAdminComplaintsFromArray(
  value: unknown,
): AdminComplaintsListResponse["complaints"] | undefined {
  return mapAdminRecordArray(value, readAdminComplaintRecord);
}

function readAdminSecretariesFromArray(
  value: unknown,
): AdminSecretariesListResponse["secretaries"] | undefined {
  return mapAdminRecordArray(value, readAdminSecretaryRecord);
}

function readAuditLogsFromArray(
  value: unknown,
): AuditLogsListResponse["auditLogs"] | undefined {
  return mapAdminRecordArray(value, readAuditLogRecord);
}

function readAdminContentItemsFromArray(
  value: unknown,
): NonNullable<AdminContentListResponse["items"]> | undefined {
  return mapAdminRecordArray(value, readAdminContentItemRecord);
}

function readAdminPatientFilesFromArray(
  value: unknown,
): AdminPatientFilesListResponse["items"] | undefined {
  return mapAdminRecordArray(value, readAdminPatientFileRecord);
}

function readAdminAccessRequestsFromArray(
  value: unknown,
): NonNullable<AdminAccessRequestsListResponse["requests"]> | undefined {
  return mapAdminRecordArray(value, readAdminAccessRequestRecord);
}

function readAdminUsersFromArray(
  value: unknown,
): AdminUsersListResponse["users"] | undefined {
  return mapAdminRecordArray(value, readAdminUserRecord);
}

function readRestoreRequestsFromArray(
  value: unknown,
): NonNullable<AdminDoctorRestoreRequestsListResponse["restoreRequests"]> | undefined {
  return mapAdminRecordArray(value, readAdminRestoreRequestRecord);
}

function readMedicalOrderCatalogItems(
  value: unknown,
): MedicalOrderCatalogItem[] | undefined {
  return readAdminMappedArray(value, readMedicalOrderCatalogItem);
}

function readMedicalOrderCatalogItem(entry: unknown): MedicalOrderCatalogItem | null {
  const record = asAdminRecord(entry);
  if (!record) return null;

  const id = record._id ?? record.id;
  if (id == null) return null;

  const label =
    readLocalizedText(record.label) ??
    readLocalizedText(record.nameAr) ??
    readLocalizedText(record.nameEn) ??
    readLocalizedText(record.name) ??
    readLocalizedText(record.title);

  const parseBool = (value: unknown): boolean | undefined => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }
    return undefined;
  };

  const parseNumber = (value: unknown): number | undefined => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const n = Number(value);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  };

  const parseStringArray = (value: unknown): string[] | undefined => {
    if (!Array.isArray(value)) return undefined;
    const values = value
      .map((item) => readLocalizedText(item))
      .filter((item): item is string => Boolean(item));
    return values.length > 0 ? values : undefined;
  };

  return {
    _id: String(id),
    label: label ?? "—",
    code: readLocalizedText(record.code),
    shortCode: readLocalizedText(record.shortCode),
    nameAr: readLocalizedText(record.nameAr),
    nameEn: readLocalizedText(record.nameEn),
    category: readLocalizedText(record.category),
    synonyms: parseStringArray(record.synonyms),
    priorityLevel: readLocalizedText(record.priorityLevel),
    sortOrder: parseNumber(record.sortOrder),
    isActive: parseBool(record.isActive),
    isVisible: parseBool(record.isVisible),
    loincCode: readLocalizedText(record.loincCode),
    sampleType: readLocalizedText(record.sampleType),
    fastingRequired: parseBool(record.fastingRequired),
    resultType: readLocalizedText(record.resultType),
    modality: readLocalizedText(record.modality),
    bodyArea: readLocalizedText(record.bodyArea),
    supportsContrast: parseBool(record.supportsContrast),
    defaultPreparation: readLocalizedText(record.defaultPreparation),
    defaultAftercare: readLocalizedText(record.defaultAftercare),
    notes: readLocalizedText(record.notes),
  };
}

function readLocalizedText(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return (
      readLocalizedText(record.ar) ??
      readLocalizedText(record.en) ??
      readLocalizedText(record.name) ??
      readLocalizedText(record.title) ??
      readLocalizedText(record.value)
    );
  }
  return undefined;
}

function buildMedicalOrderCode(label: string): string {
  const normalized = label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || "ITEM";
}

function medicalOrderCategoryByKind(kind: MedicalOrderCatalogKind): string {
  if (kind === "lab") return "LAB";
  if (kind === "imaging") return "IMAGING";
  if (kind === "procedure") return "PROCEDURE";
  return "REFERRAL";
}

function buildMedicalOrderCreatePayload(body: AdminMedicalOrderCatalogUpsertBody) {
  const labelText = readLocalizedText(body.label);
  const nameAr = readLocalizedText(body.nameAr) ?? labelText ?? "Order item";
  const nameEn = readLocalizedText(body.nameEn) ?? labelText ?? nameAr;
  const code = readLocalizedText(body.code) ?? buildMedicalOrderCode(nameEn || nameAr);
  const shortCode = readLocalizedText(body.shortCode) ?? code.slice(0, 20);
  const category = readLocalizedText(body.category) ?? medicalOrderCategoryByKind(body.kind);

  return {
    code,
    shortCode,
    nameAr,
    nameEn,
    category,
    ...(Array.isArray(body.synonyms) && body.synonyms.length > 0
      ? { synonyms: body.synonyms.map((value) => value.trim()).filter(Boolean) }
      : {}),
    ...(body.priorityLevel ? { priorityLevel: body.priorityLevel } : {}),
    ...(typeof body.sortOrder === "number" ? { sortOrder: body.sortOrder } : {}),
    ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}),
    ...(typeof body.isVisible === "boolean" ? { isVisible: body.isVisible } : {}),
    ...(body.loincCode ? { loincCode: body.loincCode } : {}),
    ...(body.sampleType ? { sampleType: body.sampleType } : {}),
    ...(typeof body.fastingRequired === "boolean"
      ? { fastingRequired: body.fastingRequired }
      : {}),
    ...(body.resultType ? { resultType: body.resultType } : {}),
    ...(body.modality ? { modality: body.modality } : {}),
    ...(body.bodyArea ? { bodyArea: body.bodyArea } : {}),
    ...(typeof body.supportsContrast === "boolean"
      ? { supportsContrast: body.supportsContrast }
      : {}),
    ...(body.defaultPreparation ? { defaultPreparation: body.defaultPreparation } : {}),
    ...(body.defaultAftercare ? { defaultAftercare: body.defaultAftercare } : {}),
    ...(body.notes ? { notes: body.notes } : {}),
  };
}

function buildMedicalOrderUpdatePayload(body: Partial<AdminMedicalOrderCatalogUpsertBody>) {
  const payload: Record<string, unknown> = {};
  const labelText = readLocalizedText(body.label);
  const nameAr = readLocalizedText(body.nameAr);
  const nameEn = readLocalizedText(body.nameEn);
  const code = readLocalizedText(body.code);
  const shortCode = readLocalizedText(body.shortCode);
  const category = readLocalizedText(body.category);
  if (labelText) {
    payload.nameAr = labelText;
    payload.nameEn = labelText;
  }
  if (nameAr) payload.nameAr = nameAr;
  if (nameEn) payload.nameEn = nameEn;
  if (code) payload.code = code;
  if (shortCode) payload.shortCode = shortCode;
  if (category) payload.category = category;
  if (Array.isArray(body.synonyms)) {
    payload.synonyms = body.synonyms.map((value) => value.trim()).filter(Boolean);
  }
  if (body.priorityLevel) payload.priorityLevel = body.priorityLevel;
  if (typeof body.sortOrder === "number") payload.sortOrder = body.sortOrder;
  if (typeof body.isActive === "boolean") payload.isActive = body.isActive;
  if (typeof body.isVisible === "boolean") payload.isVisible = body.isVisible;
  if (body.loincCode) payload.loincCode = body.loincCode;
  if (body.sampleType) payload.sampleType = body.sampleType;
  if (typeof body.fastingRequired === "boolean") {
    payload.fastingRequired = body.fastingRequired;
  }
  if (body.resultType) payload.resultType = body.resultType;
  if (body.modality) payload.modality = body.modality;
  if (body.bodyArea) payload.bodyArea = body.bodyArea;
  if (typeof body.supportsContrast === "boolean") {
    payload.supportsContrast = body.supportsContrast;
  }
  if (body.defaultPreparation) payload.defaultPreparation = body.defaultPreparation;
  if (body.defaultAftercare) payload.defaultAftercare = body.defaultAftercare;
  if (body.notes) payload.notes = body.notes;
  return payload;
}

function readAdminMappedArray<T>(
  value: unknown,
  mapEntry: (value: unknown) => T | null,
): T[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map(mapEntry)
    .filter((item): item is T => item != null);
  return items.length > 0 ? items : undefined;
}

function readAdminListPageInfo(value: unknown): AdminApiRecord | undefined {
  return asAdminRecord(value) ?? undefined;
}

function readAdminNestedEnvelope(value: unknown): AdminListEnvelope | undefined {
  const record = asAdminListEnvelope(value);
  return (
    asAdminListEnvelope(record?.data) ??
    asAdminListEnvelope(record?.result) ??
    readAdminListPageInfo(record?.pageInfo)
  );
}

function readAdminCollectionValue<T>(
  value: unknown,
  fieldNames: string[],
  readArray: (value: unknown) => T[] | undefined,
): T[] | undefined {
  const record = asAdminListEnvelope(value);
  if (!record) return undefined;

  for (const fieldName of fieldNames) {
    const items = readArray(readAdminNamedValue(record, fieldName));
    if (items) return items;
  }

  return (
    readArray(record.items) ??
    readAdminCollectionValue(record.data, fieldNames, readArray) ??
    readAdminCollectionValue(record.result, fieldNames, readArray)
  );
}

function readAdminDoctors(value: unknown): AdminDoctorsListResponse["doctors"] | undefined {
  return readAdminCollectionValue(value, ["doctors"], readAdminDoctorsFromArray);
}

function readAdminPatients(value: unknown): AdminPatientsListResponse["patients"] | undefined {
  return readAdminCollectionValue(value, ["patients"], readAdminPatientsFromArray);
}

function readAdminAppointments(
  value: unknown,
): AdminAppointmentsListResponse["appointments"] | undefined {
  return readAdminCollectionValue(
    value,
    ["appointments"],
    readAdminAppointmentsFromArray,
  );
}

function readAdminComplaints(
  value: unknown,
): AdminComplaintsListResponse["complaints"] | undefined {
  return readAdminCollectionValue(
    value,
    ["complaints"],
    readAdminComplaintsFromArray,
  );
}

function readAdminSecretaries(
  value: unknown,
): AdminSecretariesListResponse["secretaries"] | undefined {
  return readAdminCollectionValue(
    value,
    ["secretaries"],
    readAdminSecretariesFromArray,
  );
}

function readAuditLogs(value: unknown): AuditLogsListResponse["auditLogs"] | undefined {
  return readAdminCollectionValue(value, ["auditLogs"], readAuditLogsFromArray);
}

function readAdminContentItems(
  value: unknown,
): NonNullable<AdminContentListResponse["items"]> | undefined {
  return readAdminCollectionValue(
    value,
    ["content", "contentItems"],
    readAdminContentItemsFromArray,
  );
}

function readAdminPatientFiles(
  value: unknown,
): AdminPatientFilesListResponse["items"] | undefined {
  return readAdminCollectionValue(value, [], readAdminPatientFilesFromArray);
}

function readAdminAccessRequests(
  value: unknown,
): NonNullable<AdminAccessRequestsListResponse["requests"]> | undefined {
  return readAdminCollectionValue(
    value,
    ["requests", "accessRequests"],
    readAdminAccessRequestsFromArray,
  );
}

function readAdminAccessRequest(
  value: unknown,
): NonNullable<AdminAccessRequestDetailsResponse["request"]> | undefined {
  const record = asAdminListEnvelope(value);
  if (!record) return undefined;

  const direct =
    readAdminAccessRequestDetailsRecord(readAdminNamedValue(record, "request")) ??
    readAdminAccessRequestDetailsRecord(readAdminNamedValue(record, "accessRequest")) ??
    readAdminAccessRequestDetailsRecord(record.item);
  if (direct) {
    return direct;
  }

  const nestedData = readAdminAccessRequestDetailsRecord(record.data);
  if (nestedData) {
    return readAdminAccessRequest(nestedData) ?? nestedData;
  }

  const nestedResult = readAdminAccessRequestDetailsRecord(record.result);
  if (nestedResult) {
    return readAdminAccessRequest(nestedResult) ?? nestedResult;
  }

  return undefined;
}

function readAdminUsers(
  value: unknown,
): AdminUsersListResponse["users"] | undefined {
  return readAdminCollectionValue(value, ["users"], readAdminUsersFromArray);
}

function readRestoreRequests(
  value: unknown,
): NonNullable<AdminDoctorRestoreRequestsListResponse["restoreRequests"]> | undefined {
  return (
    readAdminCollectionValue(
      value,
      ["restoreRequests"],
      readRestoreRequestsFromArray,
    ) ??
    readRestoreRequestsFromArray(asAdminListEnvelope(value)?.results)
  );
}

function normalizeAdminPatientFilesListResponse(
  response: AdminPatientFilesListResponse,
): AdminPatientFilesListResponse {
  const items = readAdminListOrEmpty(readAdminPatientFiles(response));
  const pageInfo = readAdminListPageInfo(response.pageInfo);

  return withAdminCollections(response, {
    items,
    pageInfo: buildAdminPageInfo(pageInfo, items.length) ?? response.pageInfo,
  });
}

function normalizeAdminAccessRequestsListResponse(
  response: AdminAccessRequestsListResponse,
): AdminAccessRequestsListResponse {
  const requests = readAdminListOrEmpty(readAdminAccessRequests(response));
  return withAdminCollections(withAdminPaging(response, requests.length), {
    requests,
    accessRequests: requests,
    items: requests,
  });
}

function normalizeAdminAccessRequestDetailsResponse(
  response: AdminAccessRequestDetailsResponse,
): AdminAccessRequestDetailsResponse {
  const request = readAdminAccessRequest(response);

  return request
    ? withAdminCollections(response, {
        request,
        accessRequest: request,
        item: request,
        data: request,
      })
    : response;
}

function normalizeVerificationRequestsListResponse(
  response: VerificationRequestsListResponse,
): VerificationRequestsListResponse {
  const requests = verificationRequestsFromListEnvelope(response);
  return withAdminCollections(withAdminPaging(response, requests.length), {
    requests,
  });
}

function normalizeAdminUsersListResponse(
  response: AdminUsersListResponse,
): AdminUsersListResponse {
  const users = readAdminListOrEmpty(readAdminUsers(response));
  return withAdminCollections(withAdminPaging(response, users.length), {
    users,
  });
}

function normalizeAdminDoctorRestoreRequestsListResponse(
  response: AdminDoctorRestoreRequestsListResponse,
): AdminDoctorRestoreRequestsListResponse {
  const restoreRequests = readAdminListOrEmpty(readRestoreRequests(response));
  return withAdminCollections(
    withAdminPaging(response, restoreRequests.length),
    {
      restoreRequests,
      items: restoreRequests,
    },
  );
}

function readPagedNumbers(
  response: AdminApiRecord,
  fallbackLength: number,
): Pick<
  AdminDoctorsListResponse,
  "page" | "limit" | "total" | "results"
> {
  const nested = readAdminNestedEnvelope(response);

  return {
    page: readAdminNumber(response.page) ?? readAdminNumber(nested?.page) ?? 1,
    limit:
      readAdminNumber(response.limit) ??
      readAdminNumber(nested?.limit) ??
      fallbackLength,
    total:
      readAdminNumber(response.total) ??
      readAdminNumber(nested?.total) ??
      fallbackLength,
    results:
      readAdminNumber(response.results) ??
      readAdminNumber(nested?.results) ??
      fallbackLength,
  };
}

function withAdminPaging<TResponse extends AdminApiRecord>(
  response: TResponse,
  fallbackLength: number,
): TResponse &
  Pick<AdminDoctorsListResponse, "page" | "limit" | "total" | "results"> {
  return {
    ...response,
    ...readPagedNumbers(response, fallbackLength),
  };
}

function withAdminCollection<
  TResponse extends AdminApiRecord,
  TKey extends keyof TResponse,
  TValue,
>(response: TResponse, key: TKey, value: TValue): TResponse {
  return {
    ...response,
    [key]: value,
  };
}

function withAdminCollections<TResponse extends AdminApiRecord>(
  response: TResponse,
  patch: Partial<TResponse>,
): TResponse {
  return {
    ...response,
    ...patch,
  };
}

function buildAdminPageInfo(
  pageInfo: AdminApiRecord | undefined,
  fallbackLength: number,
): AdminPatientFilesListResponse["pageInfo"] {
  if (!pageInfo) return undefined;
  return {
    page: readAdminNumber(pageInfo.page) ?? 1,
    limit: readAdminNumber(pageInfo.limit) ?? fallbackLength,
    total: readAdminNumber(pageInfo.total) ?? fallbackLength,
  };
}

function readAdminMessageFields(
  body: AdminApiRecord,
): Pick<FacilitiesListResponse, "message" | "messageKey"> {
  return {
    message: typeof body.message === "string" ? body.message : undefined,
    messageKey: typeof body.messageKey === "string" ? body.messageKey : undefined,
  };
}

function readAdminListOrEmpty<T>(value: T[] | undefined): T[] {
  return value ?? [];
}

function buildAdminPagedListResponse<TResponse extends AdminApiRecord>(
  response: TResponse,
  fallbackLength: number,
  patch: Partial<TResponse>,
): TResponse {
  return withAdminCollections(withAdminPaging(response, fallbackLength), patch);
}

function normalizeAdminDoctorsListResponse(
  response: AdminDoctorsListResponse,
): AdminDoctorsListResponse {
  const doctors = readAdminListOrEmpty(readAdminDoctors(response));
  return withAdminCollection(
    withAdminPaging(response, doctors.length),
    "doctors",
    doctors,
  );
}

function normalizeAdminPatientsListResponse(
  response: AdminPatientsListResponse,
): AdminPatientsListResponse {
  const patients = readAdminListOrEmpty(readAdminPatients(response));
  return withAdminCollection(
    withAdminPaging(response, patients.length),
    "patients",
    patients,
  );
}

function normalizeAdminAppointmentsListResponse(
  response: AdminAppointmentsListResponse,
): AdminAppointmentsListResponse {
  const appointments = readAdminListOrEmpty(readAdminAppointments(response));
  return withAdminCollection(
    withAdminPaging(response, appointments.length),
    "appointments",
    appointments,
  );
}

function normalizeAdminComplaintsListResponse(
  response: AdminComplaintsListResponse,
): AdminComplaintsListResponse {
  const complaints = readAdminListOrEmpty(readAdminComplaints(response));
  return withAdminCollection(
    withAdminPaging(response, complaints.length),
    "complaints",
    complaints,
  );
}

function normalizeAdminSecretariesListResponse(
  response: AdminSecretariesListResponse,
): AdminSecretariesListResponse {
  const secretaries = readAdminListOrEmpty(readAdminSecretaries(response));
  return withAdminCollection(
    withAdminPaging(response, secretaries.length),
    "secretaries",
    secretaries,
  );
}

function normalizeAuditLogsListResponse(
  response: AuditLogsListResponse,
): AuditLogsListResponse {
  const auditLogs = readAdminListOrEmpty(readAuditLogs(response));
  return withAdminCollection(
    withAdminPaging(response, auditLogs.length),
    "auditLogs",
    auditLogs,
  );
}

function normalizeAdminContentListResponse(
  response: AdminContentListResponse,
): AdminContentListResponse {
  const items = readAdminListOrEmpty(readAdminContentItems(response));
  return buildAdminPagedListResponse(response, items.length, {
    items,
    content: items,
    contentItems: items,
  });
}

function buildFacilitiesListResponse(
  body: AdminApiRecord,
  facilities: NonNullable<FacilitiesListResponse["facilities"]>,
  nested?: AdminApiRecord | null,
): FacilitiesListResponse {
  const items = readAdminFirstCollection(
    [body.items, nested?.items],
    readFacilityArray,
  );
  const paging = readPagedNumbers(
    {
      ...body,
      page: body.page ?? nested?.page,
      limit: body.limit ?? nested?.limit,
      total: body.total ?? nested?.total,
      results: body.results ?? nested?.results,
    },
    facilities.length,
  );
  return {
    ...readAdminMessageFields(body),
    ...paging,
    facilities,
    ...(items ? { items } : {}),
    ...(nested ? { data: nested } : {}),
  };
}

function readFacilitySummary(
  value: unknown,
): FacilityResponse["facility"] | undefined {
  const record = asAdminRecord(value);
  if (!record || typeof (record.id ?? record._id) !== "string") return undefined;
  return record as FacilityResponse["facility"];
}

function readFacilityRecordById(
  value: unknown,
) : FacilityResponse["facility"] | undefined {
  const record = asAdminRecord(value);
  return record && typeof (record.id ?? record._id) === "string"
    ? (record as FacilityResponse["facility"])
    : undefined;
}

function readFacilityDoctorsFacility(
  value: unknown,
): FacilityDoctorsListResponse["facility"] | undefined {
  const record = readFacilityRecordById(value);
  return record && typeof record.id === "string"
    ? (record as FacilityDoctorsListResponse["facility"])
    : undefined;
}

function readFacilityListItem(
  value: unknown,
): FacilitiesListResponse["facilities"][number] | null {
  return (readFacilityRecordById(value) as FacilitiesListResponse["facilities"][number] | undefined) ?? null;
}

function readFacilityDoctorListItem(
  value: unknown,
): FacilityDoctorsListResponse["doctors"][number] | null {
  return (asAdminRecord(value) as FacilityDoctorsListResponse["doctors"][number] | null);
}

function buildFacilityDoctorsListResponse(
  body: AdminApiRecord,
  doctors: NonNullable<FacilityDoctorsListResponse["doctors"]>,
  nested?: AdminApiRecord | null,
): FacilityDoctorsListResponse {
  const items = readAdminFirstCollection(
    [body.items, nested?.items],
    readFacilityDoctorArray,
  );
  const paging = readPagedNumbers(
    {
      ...body,
      page: body.page ?? nested?.page,
      limit: body.limit ?? nested?.limit,
      total: body.total ?? nested?.total,
      results: body.results ?? nested?.results,
    },
    doctors.length,
  );
  return {
    ...readAdminMessageFields(body),
    facility: readAdminPrimaryRecord(
      { facility: body.facility, data: nested },
      ["facility"],
      readFacilityRecordById,
    ) as FacilityDoctorsListResponse["facility"] | undefined,
    ...paging,
    doctors,
    ...(items ? { items } : {}),
    ...(nested ? { data: nested } : {}),
  };
}

function isVerificationRequestSummary(
  value: VerificationRequestEnvelope,
): value is VerificationRequestSummary {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = asAdminRecord(value);
  if (!record) return false;
  return (
    typeof (record._id ?? record.id) === "string" ||
    typeof record.status === "string" ||
    typeof record.doctorId === "string"
  );
}

function readFacilityArray(
  value: unknown,
): FacilitiesListResponse["facilities"] | undefined {
  return readAdminMappedArray(value, readFacilityListItem);
}

function readFacilityDoctorArray(
  value: unknown,
): FacilityDoctorsListResponse["doctors"] | undefined {
  return readAdminMappedArray(value, readFacilityDoctorListItem);
}

function readVerificationRequestArray(
  value: unknown,
): VerificationRequestSummary[] | undefined {
  return readAdminMappedArray(value, (entry) =>
    isVerificationRequestSummary(entry as VerificationRequestEnvelope)
      ? (entry as VerificationRequestSummary)
      : null,
  );
}

function readVerificationRequestEnvelopeChildren(
  value: unknown,
): VerificationRequestSummary[] | undefined {
  const envelope = asAdminRecord(value);
  if (!envelope) return undefined;
  return readAdminFirstCollection(
    [envelope.requests, envelope.items, envelope.data, envelope.results],
    readVerificationRequestArray,
  );
}

function readAdminFirstCollection<T>(
  sources: unknown[],
  readCollection: (value: unknown) => T[] | undefined,
): T[] | undefined {
  for (const source of sources) {
    const items = readCollection(source);
    if (items) return items;
  }
  return undefined;
}

function readAdminPrimaryRecord<TRecord>(
  value: unknown,
  fieldNames: string[],
  readRecord: (value: unknown) => TRecord | undefined,
): TRecord | undefined {
  const record = asAdminRecord(value);
  if (!record) return undefined;

  for (const fieldName of fieldNames) {
    const item = readRecord(readAdminNamedValue(record, fieldName));
    if (item) return item;
  }

  return (
    readRecord(record.item) ??
    readRecord(record.data) ??
    readAdminPrimaryRecord(record.data, fieldNames, readRecord) ??
    readRecord(record.result) ??
    readAdminPrimaryRecord(record.result, fieldNames, readRecord)
  );
}

function normalizeMedicalOrderCatalogList(
  raw: AdminMedicalOrderCatalogListResponse | AdminApiRecord,
): MedicalOrderCatalogItem[] {
  const body = asAdminRecord(raw) ?? {};
  const nested = asAdminRecord(body.data);
  return readAdminListOrEmpty(
    readAdminFirstCollection(
      [
        body.items,
        body.catalog,
        body.results,
        body.data,
        nested?.items,
        nested?.catalog,
        nested?.results,
      ],
      readMedicalOrderCatalogItems,
    ),
  );
}

function normalizeFacilitiesListResponse(
  raw: FacilitiesListResponse | AdminApiRecord,
): FacilitiesListResponse {
  const body = asAdminRecord(raw) ?? {};
  const nested = asAdminRecord(body.data);

  const facilities = readAdminListOrEmpty(
    readAdminFirstCollection(
      [body.facilities, body.items, nested?.facilities, nested?.items],
      readFacilityArray,
    ),
  );

  return buildFacilitiesListResponse(body, facilities, nested);
}

function normalizeFacilityResponse(raw: FacilityResponse): FacilityResponse {
  const facility = readAdminPrimaryRecord(
    raw,
    ["facility"],
    readFacilitySummary,
  ) as FacilityResponse["facility"] | undefined;

  return {
    ...raw,
    facility,
  };
}

function normalizeFacilityDoctorsListResponse(
  raw: FacilityDoctorsListResponse | AdminApiRecord,
): FacilityDoctorsListResponse {
  const body = asAdminRecord(raw) ?? {};
  const nested = asAdminRecord(body.data);

  const doctors = readAdminListOrEmpty(
    readAdminFirstCollection(
      [body.doctors, body.items, nested?.doctors, nested?.items],
      readFacilityDoctorArray,
    ),
  );

  return buildFacilityDoctorsListResponse(body, doctors, nested);
}

export function verificationRequestsFromListEnvelope(
  raw:
    | VerificationRequestsListResponse
    | AdminApiRecord
    | null
    | undefined,
): VerificationRequestSummary[] {
  if (!raw || typeof raw !== "object") return [];
  const o = asAdminRecord(raw) ?? {};
  const direct = readAdminFirstCollection(
    [o.requests, o.data, o.items, o.results],
    readVerificationRequestArray,
  );
  if (direct) return direct;

  const nested = readAdminFirstCollection(
    [o.requests, o.data, o.items, o.results],
    readVerificationRequestEnvelopeChildren,
  );
  if (nested) return nested;

  return [];
}

const DEV_MEDICAL_ORDER_PLACEHOLDERS: Record<
  MedicalOrderCatalogKind,
  MedicalOrderCatalogItem[]
> = {
  lab: [{ _id: "__dev_lab__", label: "complete blood count (CBC)" }],
  imaging: [],
  procedure: [],
  referral: [],
};

function unsupportedApiOperation(message: string): Promise<never> {
  return Promise.reject(new Error(message));
}

export const adminApi = {
  doctors: {
    list: (params: AdminDoctorsListParams = {}) => {
      const qs = new URLSearchParams();

      if (params.status) qs.set("status", params.status);
      if (params.search) qs.set("search", params.search);
      if (params.specialization)
        qs.set("specialization", params.specialization);
      if (params.city) qs.set("city", params.city);
      if (params.country) qs.set("country", params.country);
      if (params.from) qs.set("from", params.from);
      if (params.to) qs.set("to", params.to);
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));

      const endpoint = qs.toString()
        ? `${adminEndpoints.doctors.list}?${qs.toString()}`
        : adminEndpoints.doctors.list;

      return get<AdminDoctorsListResponse>(endpoint, { locale: "ar" }).then(
        normalizeAdminDoctorsListResponse,
      );
    },
    getById: (doctorId: string) =>
      get<AdminDoctorDetailsResponse>(
        adminEndpoints.doctors.details(doctorId),
        {
          locale: "ar",
        },
      ),
    analyticsDiagnosis: (
      doctorId: string,
      params: AdminDoctorAnalyticsQuery = {},
    ) => {
      const qs = new URLSearchParams();
      if (params.range) qs.set("range", params.range);
      if (params.from) qs.set("from", params.from);
      if (params.to) qs.set("to", params.to);
      const base = adminEndpoints.doctors.analyticsDiagnosis(doctorId);
      const url = qs.toString() ? `${base}?${qs.toString()}` : base;
      return get<DoctorDiagnosisAnalyticsResponse>(url, { locale: "ar" });
    },
    analyticsSummary: (
      doctorId: string,
      params: AdminDoctorAnalyticsQuery = {},
    ) => {
      const qs = new URLSearchParams();
      if (params.range) qs.set("range", params.range);
      if (params.from) qs.set("from", params.from);
      if (params.to) qs.set("to", params.to);
      const base = adminEndpoints.doctors.analyticsSummary(doctorId);
      const url = qs.toString() ? `${base}?${qs.toString()}` : base;
      return get<DoctorActivitySummaryResponse>(url, { locale: "ar" });
    },
  },
  patients: {
    list: (params: AdminPatientsListParams = {}) => {
      const qs = new URLSearchParams();

      if (params.account_status)
        qs.set("account_status", params.account_status);
      if (params.search) qs.set("search", params.search);
      if (typeof params.includeDeleted === "boolean")
        qs.set("includeDeleted", String(params.includeDeleted));
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));

      const endpoint = qs.toString()
        ? `${adminEndpoints.patients.list}?${qs.toString()}`
        : adminEndpoints.patients.list;

      return get<AdminPatientsListResponse>(endpoint, { locale: "ar" }).then(
        normalizeAdminPatientsListResponse,
      );
    },
    getById: async (patientId: string): Promise<AdminPatientDetailsResponse> => {
      const response = await adminApi.patients.list({
        search: patientId,
        includeDeleted: true,
        page: 1,
        limit: 100,
      });
      const patient =
        response.patients.find(
          (item) => item._id === patientId || item.publicId === patientId,
        ) ?? null;
      if (!patient) {
        throw new ApiError(
          404,
          "errors.notFound",
          {
            status: 404,
            messageKey: "errors.notFound",
            message: "Patient was not found.",
          },
          "Patient was not found.",
        );
      }
      return {
        messageKey: response.messageKey,
        message: response.message,
        patient,
      };
    },
    activate: (patientId: string) =>
      patch<AdminPatientAccountActionResponse>(
        adminEndpoints.patients.activate(patientId),
        undefined,
        { locale: "ar" },
      ),
    suspend: (patientId: string, reason?: string) =>
      patch<AdminPatientAccountActionResponse>(
        adminEndpoints.patients.suspend(patientId),
        reason ? { reason } : undefined,
        { locale: "ar" },
      ),
    unsuspend: (patientId: string) =>
      patch<AdminPatientAccountActionResponse>(
        adminEndpoints.patients.unsuspend(patientId),
        undefined,
        { locale: "ar" },
      ),
    files: {
      list: (patientId: string, params: AdminPatientFilesListParams = {}) => {
        const qs = new URLSearchParams();
        if (params.page) qs.set("page", String(params.page));
        if (params.limit) qs.set("limit", String(params.limit));
        if (typeof params.archived === "boolean")
          qs.set("archived", String(params.archived));
        if (params.search) qs.set("search", params.search);

        const base = adminEndpoints.patients.files.list(patientId);
        const endpoint = qs.toString() ? `${base}?${qs.toString()}` : base;

        return get<AdminPatientFilesListResponse>(endpoint, { locale: "ar" }).then(
          normalizeAdminPatientFilesListResponse,
        );
      },
      getDownloadUrl: (patientId: string, fileId: string) =>
        get<AdminPatientFileDownloadUrlResponse>(
          `${adminEndpoints.patients.files.download(patientId, fileId)}?mode=url`,
          { locale: "ar" },
        ),
    },
  },
  appointments: {
    list: (params: AdminAppointmentsListParams = {}) => {
      const qs = new URLSearchParams();

      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      if (params.status) qs.set("status", params.status);
      if (params.date) qs.set("date", params.date);

      const endpoint = qs.toString()
        ? `${adminEndpoints.appointments.list}?${qs.toString()}`
        : adminEndpoints.appointments.list;

        return get<AdminAppointmentsListResponse>(endpoint, { locale: "ar" }).then(
          normalizeAdminAppointmentsListResponse,
        );
    },
    getDetails: (appointmentId: string) =>
      get<AppointmentDetailsResponse>(
        adminEndpoints.appointments.details(appointmentId),
        {
          locale: "ar",
        },
      ),
    cancel: (appointmentId: string, reason: string) =>
      patch<AppointmentCancelResponse>(
        adminEndpoints.appointments.cancel(appointmentId),
        { reason },
        { locale: "ar" },
      ),
  },
  accessRequests: {
    list: (params: { page?: number; limit?: number; status?: string } = {}) => {
      const qs = new URLSearchParams();
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      if (params.status) qs.set("status", params.status);
      const endpoint = qs.toString()
        ? `${adminEndpoints.accessRequests.list}?${qs.toString()}`
        : adminEndpoints.accessRequests.list;
      return get<AdminAccessRequestsListResponse>(endpoint, { locale: "ar" }).then(
        normalizeAdminAccessRequestsListResponse,
      );
    },
    getById: (requestId: string) =>
      get<AdminAccessRequestDetailsResponse>(adminEndpoints.accessRequests.details(requestId), {
        locale: "ar",
      }).then(normalizeAdminAccessRequestDetailsResponse),
  },
  complaints: {
    list: (params: AdminComplaintsListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      if (params.status) qs.set("status", params.status);
      if (params.type) qs.set("type", params.type);
      if (params.patientId) qs.set("patientId", params.patientId);
      if (params.from) qs.set("from", params.from);
      if (params.to) qs.set("to", params.to);
      if (params.search) qs.set("search", params.search.trim());
      const endpoint = qs.toString()
        ? `${adminEndpoints.complaints.list}?${qs.toString()}`
        : adminEndpoints.complaints.list;
      return get<AdminComplaintsListResponse>(endpoint, { locale: "ar" }).then(
        normalizeAdminComplaintsListResponse,
      );
    },
    getById: (complaintId: string) =>
      get<AdminComplaintDetailsResponse>(
        adminEndpoints.complaints.details(complaintId),
        { locale: "ar" },
      ),
    updateStatus: (complaintId: string, body: ComplaintStatusUpdateBody) =>
      patch<ComplaintStatusUpdateResponse>(
        adminEndpoints.complaints.updateStatus(complaintId),
        body,
        { locale: "ar" },
      ),
  },
  verificationRequests: {
    list: (params: VerificationRequestsListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.status) qs.set("status", params.status);
      if (params.doctorId) qs.set("doctorId", params.doctorId);
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      const endpoint = qs.toString()
        ? `${adminEndpoints.verificationRequests.list}?${qs.toString()}`
        : adminEndpoints.verificationRequests.list;
      return get<VerificationRequestsListResponse>(endpoint, { locale: "ar" }).then(
        normalizeVerificationRequestsListResponse,
      );
    },
    review: (requestId: string, body: VerificationRequestReviewBody) =>
      patch<VerificationRequestReviewResponse>(
        adminEndpoints.verificationRequests.review(requestId),
        body,
        {
          locale: "ar",
        },
      ),
    getById: (requestId: string) =>
      get<VerificationRequestDetailsResponse>(
        adminEndpoints.verificationRequests.details(requestId),
        { locale: "ar" },
      ),
  },
  users: {
    list: () =>
      get<AdminUsersListResponse>(adminEndpoints.users.list, { locale: "ar" }).then(
        normalizeAdminUsersListResponse,
      ),
    create: (body: CreateAdminUserBody) =>
      post<CreateAdminUserResponse>(adminEndpoints.users.create, body, {
        locale: "ar",
      }),
    offboard: (userId: string, reason?: string) =>
      post<AdminUserOffboardResponse>(
        adminEndpoints.users.offboard(userId),
        { reason },
        { locale: "ar" },
      ),
    reboard: (userId: string) =>
      post<AdminUserReboardResponse>(
        adminEndpoints.users.reboard(userId),
        {},
        { locale: "ar" },
      ),
    doctorRestoreRequests: (params: {
      status?: string;
      search?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    }) => {
      const qs = new URLSearchParams();
      if (params.status) qs.set("status", params.status);
      if (params.search) qs.set("search", params.search);
      if (params.from) qs.set("from", params.from);
      if (params.to) qs.set("to", params.to);
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      const endpoint = qs.toString()
        ? `${adminEndpoints.users.doctorRestoreRequests}?${qs.toString()}`
        : adminEndpoints.users.doctorRestoreRequests;
      return get<AdminDoctorRestoreRequestsListResponse>(endpoint, {
        locale: "ar",
      }).then(normalizeAdminDoctorRestoreRequestsListResponse);
    },
    reviewRestoreRequest: (
      userId: string,
      body: {
        decision: "approved" | "rejected";
        reviewNote?: string;
      },
    ) =>
      post<AdminDoctorRestoreRequestReviewResponse>(
        adminEndpoints.users.reviewRestoreRequest(userId),
        body,
        { locale: "ar" },
      ),
  },
  secretaries: {
    list: (params: AdminSecretariesListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.search) qs.set("search", params.search);
      if (params.doctorId) qs.set("doctorId", params.doctorId);
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      const endpoint = qs.toString()
        ? `${adminEndpoints.secretaries.list}?${qs.toString()}`
        : adminEndpoints.secretaries.list;
      return get<AdminSecretariesListResponse>(endpoint, { locale: "ar" }).then(
        normalizeAdminSecretariesListResponse,
      );
    },
  },
  auditLogs: {
    list: (params: AuditLogsListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      if (params.search) qs.set("search", params.search);
      if (params.category) qs.set("category", params.category);
      if (params.outcome) qs.set("outcome", params.outcome);
      if (params.actorRole) qs.set("actorRole", params.actorRole);
      if (params.actorUserId) qs.set("actorUserId", params.actorUserId);
      if (params.action) qs.set("action", params.action);
      if (params.entityType) qs.set("entityType", params.entityType);
      if (params.entityId) qs.set("entityId", params.entityId);
      if (params.patientId) qs.set("patientId", params.patientId);
      if (params.targetUserId) qs.set("targetUserId", params.targetUserId);
      if (params.requestId) qs.set("requestId", params.requestId);
      if (params.ip) qs.set("ip", params.ip);
      if (params.from) qs.set("from", params.from);
      if (params.to) qs.set("to", params.to);
      const endpoint = qs.toString()
        ? `${adminEndpoints.auditLogs.list}?${qs.toString()}`
        : adminEndpoints.auditLogs.list;
      return get<AuditLogsListResponse>(endpoint, { locale: "ar" }).then(
        normalizeAuditLogsListResponse,
      );
    },
  },
  content: {
    list: (params: AdminContentListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.type) qs.set("type", params.type);
      if (params.status) qs.set("status", params.status);
      if (params.language) qs.set("language", params.language);
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      const endpoint = qs.toString()
        ? `${adminEndpoints.content.list}?${qs.toString()}`
        : adminEndpoints.content.list;
      return get<AdminContentListResponse>(endpoint, { locale: "ar" }).then(
        normalizeAdminContentListResponse,
      );
    },
    listMine: (params: AdminContentListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.type) qs.set("type", params.type);
      if (params.status) qs.set("status", params.status);
      if (params.language) qs.set("language", params.language);
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      const endpoint = qs.toString()
        ? `${adminEndpoints.content.mine}?${qs.toString()}`
        : adminEndpoints.content.mine;
      return get<AdminContentListResponse>(endpoint, { locale: "ar" }).then(
        normalizeAdminContentListResponse,
      );
    },
    getById: (id: string) =>
      get<AdminContentDetailsResponse>(adminEndpoints.content.details(id), {
        locale: "ar",
      }),
    create: (body: CreateAdminContentBody) =>
      post<AdminContentMutationResponse>(adminEndpoints.content.create, body, {
        locale: "ar",
      }),
    update: (id: string, body: UpdateAdminContentBody) =>
      patch<AdminContentMutationResponse>(
        adminEndpoints.content.update(id),
        body,
        { locale: "ar" },
      ),
    submitReview: (id: string, reviewNotes?: string) =>
      post<AdminContentReviewActionResponse>(
        adminEndpoints.content.submitReview(id),
        {
          reviewNotes:
            reviewNotes?.trim() || "تم إرسال المحتوى للمراجعة من لوحة الإدارة.",
        },
        {
        locale: "ar",
      },
      ),
    approve: (id: string) =>
      post<AdminContentReviewActionResponse>(adminEndpoints.content.approve(id), undefined, {
        locale: "ar",
      }),
    reject: (id: string, rejectionReason: string) =>
      post<AdminContentReviewActionResponse>(
        adminEndpoints.content.reject(id),
        rejectionReason ? { rejectionReason } : undefined,
        { locale: "ar" },
      ),
    publish: (id: string) =>
      post<AdminContentReviewActionResponse>(adminEndpoints.content.publish(id), undefined, {
        locale: "ar",
      }),
    archive: (id: string) =>
      post<AdminContentReviewActionResponse>(adminEndpoints.content.archive(id), undefined, {
        locale: "ar",
      }),
  },
  contentTemplates: {
    list: (params: AdminContentTemplatesListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.parentType) qs.set("parentType", params.parentType);
      if (typeof params.active === "boolean")
        qs.set("active", String(params.active));
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      const endpoint = qs.toString()
        ? `${adminEndpoints.contentTemplates.list}?${qs.toString()}`
        : adminEndpoints.contentTemplates.list;
      return get<AdminContentTemplatesListResponse>(endpoint, {
        locale: "ar",
      });
    },
    create: (body: CreateAdminContentTemplateBody) =>
      post<AdminContentTemplateMutationResponse>(
        adminEndpoints.contentTemplates.create,
        body,
        { locale: "ar" },
      ),
    update: (id: string, body: UpdateAdminContentTemplateBody) =>
      patch<AdminContentTemplateMutationResponse>(
        adminEndpoints.contentTemplates.update(id),
        body,
        { locale: "ar" },
      ),
    disable: (id: string, force = false) => {
      const endpoint = force
        ? `${adminEndpoints.contentTemplates.disable(id)}?force=true`
        : adminEndpoints.contentTemplates.disable(id);
      return post<AdminContentTemplateDisableResponse>(endpoint, undefined, {
        locale: "ar",
      });
    },
  },
  news: {
    ingest: (body: AdminNewsIngestBody) =>
      post<AdminNewsIngestResponse>(adminEndpoints.news.ingest, body, {
        locale: "ar",
      }),
    pending: (params: AdminNewsPendingListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      if (params.sourceUrl) qs.set("sourceUrl", params.sourceUrl);
      if (params.language) qs.set("language", params.language);
      if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
      if (params.dateTo) qs.set("dateTo", params.dateTo);
      const endpoint = qs.toString()
        ? `${adminEndpoints.news.pending}?${qs.toString()}`
        : adminEndpoints.news.pending;
      return get<AdminNewsPendingListResponse>(endpoint, { locale: "ar" });
    },
  },
  medicalOrderCatalog: {
    list: async (params: AdminMedicalOrderCatalogListParams) => {
      const qs = new URLSearchParams();
      if (params.search?.trim()) qs.set("search", params.search.trim());
      if (params.q?.trim()) qs.set("q", params.q.trim());
      if (params.category?.trim()) qs.set("category", params.category.trim());
      if (params.priorityLevel?.trim()) qs.set("priorityLevel", params.priorityLevel.trim());
      if (typeof params.isActive === "boolean") qs.set("isActive", String(params.isActive));
      if (typeof params.isVisible === "boolean") qs.set("isVisible", String(params.isVisible));
      if (typeof params.page === "number" && params.page > 0) qs.set("page", String(params.page));
      if (typeof params.limit === "number" && params.limit > 0) qs.set("limit", String(params.limit));
      if (params.sort?.trim()) qs.set("sort", params.sort.trim());
      const base = adminEndpoints.orderCatalog.collection(params.type);
      const endpoint = qs.toString() ? `${base}?${qs.toString()}` : base;
      try {
        const raw = await get<
          AdminMedicalOrderCatalogListResponse | AdminApiRecord
        >(endpoint, { locale: "ar" });
        return { items: normalizeMedicalOrderCatalogList(raw) };
      } catch (e) {
        if (
          import.meta.env.DEV &&
          e instanceof ApiError &&
          (e.status === 404 || e.status === 501)
        ) {
          return { items: DEV_MEDICAL_ORDER_PLACEHOLDERS[params.type] };
        }
        throw e;
      }
    },
    create: (body: AdminMedicalOrderCatalogUpsertBody) =>
      post<AdminMedicalOrderCatalogMutationResponse>(
        adminEndpoints.orderCatalog.collection(body.kind),
        buildMedicalOrderCreatePayload(body),
        { locale: "ar" },
      ),
    getById: (kind: MedicalOrderCatalogKind, id: string) =>
      get<AdminMedicalOrderCatalogDetailsResponse | AdminApiRecord>(
        adminEndpoints.orderCatalog.item(kind, id),
        { locale: "ar" },
      ).then((raw) => {
        const body = asAdminRecord(raw) ?? {};
        const nested = asAdminRecord(body.data);
        const item =
          readMedicalOrderCatalogItem(body.item) ??
          readMedicalOrderCatalogItem(body.data) ??
          readMedicalOrderCatalogItem(nested?.item) ??
          readMedicalOrderCatalogItem(body.result) ??
          null;
        return {
          ...(asAdminRecord(raw) ?? {}),
          item,
        } as AdminMedicalOrderCatalogDetailsResponse;
      }),
    update: (
      kind: MedicalOrderCatalogKind,
      id: string,
      body: Partial<AdminMedicalOrderCatalogUpsertBody>,
    ) =>
      patch<AdminMedicalOrderCatalogMutationResponse>(
        adminEndpoints.orderCatalog.item(kind, id),
        buildMedicalOrderUpdatePayload(body),
        { locale: "ar" },
      ),
    remove: (kind: MedicalOrderCatalogKind, id: string) =>
      unsupportedApiOperation(
        `DELETE ${adminEndpoints.orderCatalog.item(kind, id)} is not documented in API-3.`,
      ),
  },
  lookups: {
    list: (params: AdminLookupsListParams) => {
      const qs = new URLSearchParams();
      qs.set("category", params.category);
      if (params.includeInactive === true) qs.set("includeInactive", "true");
      if (params.langOnly === true) qs.set("langOnly", "true");
      const endpoint = `${adminEndpoints.lookups.list}?${qs.toString()}`;
      return get<AdminLookupsListResponse>(endpoint, { locale: "ar" });
    },
    create: (body: AdminLookupCreateBody) =>
      post<AdminLookupMutationResponse>(adminEndpoints.lookups.list, body, {
        locale: "ar",
      }),
    patch: (id: string, body: AdminLookupPatchBody) =>
      patch<AdminLookupMutationResponse>(
        adminEndpoints.lookups.detail(id),
        body,
        { locale: "ar" },
      ),
    remove: (id: string) =>
      del<AdminLookupDeleteResponse>(adminEndpoints.lookups.detail(id), {
        locale: "ar",
      }),
  },
  serviceProviders: {
    create: (body: CreateProviderBody) =>
      post<ServiceProviderCreateResponse>(
        adminEndpoints.serviceProviders.create,
        body,
        { locale: "ar" },
      ),
    update: (
      id: string,
      body: UpdateProviderBody & {
        name?: string;
        city?: string;
        country?: string;
        aliases?: string[];
      },
    ) =>
      put<ServiceProviderUpdateResponse>(
        adminEndpoints.serviceProviders.update(id),
        body,
        { locale: "ar" },
      ),
    updateStatus: (
      id: string,
      body: {
        status: string;
      },
    ) =>
      patch<ServiceProviderStatusUpdateResponse>(
        adminEndpoints.serviceProviders.updateStatus(id),
        body,
        { locale: "ar" },
      ),
  },
  facilities: {
    list: (params: FacilitiesListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      if (params.q) qs.set("q", params.q);
      if (params.name) qs.set("name", params.name);
      if (params.city) qs.set("city", params.city);
      if (params.facilityType) qs.set("facilityType", params.facilityType);
      if (params.status) qs.set("status", params.status);
      if (params.hasDoctors !== undefined)
        qs.set("hasDoctors", String(params.hasDoctors));
      if (params.ownerDoctorId !== undefined)
        qs.set("ownerDoctorId", params.ownerDoctorId);
      if (params.attribute) qs.set("attribute", params.attribute);
      if (params.sortBy) qs.set("sortBy", params.sortBy);
      if (params.sortOrder) qs.set("sortOrder", params.sortOrder);

      const endpoint = qs.toString()
        ? `${adminEndpoints.facilities.list}?${qs.toString()}`
        : adminEndpoints.facilities.list;

      return get<FacilitiesListResponse>(endpoint, {
        locale: "ar",
      }).then(normalizeFacilitiesListResponse);
    },
    getById: (id: string) =>
      get<FacilityResponse>(adminEndpoints.facilities.getById(id), {
        locale: "ar",
      }).then(normalizeFacilityResponse),
    listDoctors: (id: string, params: FacilityDoctorsListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      if (params.q) qs.set("q", params.q);
      if (params.name) qs.set("name", params.name);
      if (params.specialty) qs.set("specialty", params.specialty);
      if (params.status) qs.set("status", params.status);
      if (params.sortBy) qs.set("sortBy", params.sortBy);
      if (params.sortOrder) qs.set("sortOrder", params.sortOrder);

      const base = adminEndpoints.facilities.listDoctors(id);
      const endpoint = qs.toString() ? `${base}?${qs.toString()}` : base;

      return get<FacilityDoctorsListResponse>(endpoint, {
        locale: "ar",
      }).then(normalizeFacilityDoctorsListResponse);
    },
    updateStatus: (id: string, status: string) =>
      patch<FacilityStatusMutationResponse>(
        adminEndpoints.facilities.updateStatus(id),
        { status },
        { locale: "ar" },
      ),
    remove: (id: string) =>
      del<FacilityDeleteResponse>(
        adminEndpoints.facilities.delete(id),
        { locale: "ar" },
      ),
    create: (body: CreateFacilityBody) =>
      post<FacilityCreateResponse>(
        adminEndpoints.facilities.create,
        body,
        { locale: "ar" },
      ),
    update: (
      id: string,
      body: UpdateFacilityBody,
    ) =>
      put<FacilityUpdateResponse>(adminEndpoints.facilities.update(id), body, {
        locale: "ar",
      }),
  },
  doctorProfileChangeRequests: {
    review: (
      requestId: string,
      body: {
        decision: "approved" | "denied";
        adminNote?: string;
      },
    ) =>
      patch<DoctorProfileChangeRequestReviewResponse>(
        adminEndpoints.doctorProfileChangeRequests.review(requestId),
        body,
        {
          locale: "ar",
        },
      ),
  },
};
