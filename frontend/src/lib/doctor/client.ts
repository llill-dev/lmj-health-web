import {
  get,
  patch,
  post,
  put,
  del,
  apiRequestResult,
  apiMultipart,
} from "@/lib/api";
import type {
  EncounterDocumentLinkBody,
  EncounterDocumentLinkResponse,
  EncounterDocumentShareBody,
  EncounterDocumentShareResponse,
  EncounterDocumentsListResponse,
} from "@/lib/doctor/encounters/encounterDocumentsTypes";
import { doctorEndpoints } from "@/lib/doctor/endpoints";
import { toAppointmentTypeApiBody } from "@/lib/doctor/appointments/appointmentTypeApiBodies";
import type {
  InternalDirectoryListParams,
  InternalDirectoryListResponse,
} from "@/lib/doctor/directory/doctorDirectoryTypes";
import type {
  EncounterClinicalListParams,
  EncounterOrdersListResponse,
} from "@/lib/doctor/encounters/encounterClinicalTypes";
import type {
  CreateEncounterPrescriptionBody,
  EncounterPrescriptionFinalizeResponse,
  EncounterPrescriptionItemMutationResponse,
  EncounterPrescriptionPreviewResponse,
  EncounterPrescriptionResponse,
  EncounterPrescriptionsListResponse,
  PrescriptionItemBody,
  UpdateEncounterPrescriptionBody,
} from "@/lib/doctor/prescriptions/prescriptionTypes";
import type {
  AppendDoctorOrderResultsBody,
  AppendDoctorOrderResultsResponse,
  CancelDoctorOrderBody,
  DoctorOrderDetailsResponse,
  DoctorOrderMutationResponse,
  DoctorOrdersListParams,
  DoctorOrdersListResponse,
  UpdateDoctorOrderStatusBody,
} from "@/lib/doctor/orders/doctorOrderTypes";
import {
  normalizeDoctorOrderFromApi,
  normalizeDoctorOrdersListResponse,
} from "@/lib/doctor/orders/map-doctor-orders-api";
import type {
  CreateEncounterOrderBody,
  CreateImagingOrderBody,
  EncounterOrderFinalizeResponse,
  EncounterOrderItemMutationResponse,
  EncounterOrderPreviewResponse,
  EncounterOrderResponse,
  ImagingOrderItemBody,
  OrderCatalogListResponse,
  UpdateEncounterOrderBody,
  UpdateImagingOrderBody,
} from "@/lib/doctor/encounters/encounterOrderTypes";
import { readAuthUser } from "@/lib/cookies";
import type {
  CreateTemporaryPatientBody,
  CreateTemporaryPatientResponse,
  DoctorAppointmentDetailsResponse,
  DoctorAppointmentFile,
  DoctorAppointmentListParams,
  DoctorAppointmentMutationResponse,
  DoctorAppointmentStatus,
  DoctorAppointmentSummary,
  DoctorAppointmentsListResponse,
  DoctorBookAppointmentBody,
  DoctorCancelAppointmentBody,
  DoctorCompleteAppointmentBody,
  DoctorNoShowAppointmentBody,
  DoctorPatientAccessRequestBody,
  DoctorAccessRequestDetailsResponse,
  DoctorAccessRequestListParams,
  DoctorAccessRequestsListResponse,
  DoctorPatientAccessRequestResponse,
  DoctorPatientLinkResponse,
  DoctorCreateMedicalRecordBody,
  DoctorPatientFullProfileResponse,
  DoctorMedicalRecordDetailsResponse,
  DoctorMedicalRecordsListResponse,
  DoctorPatientPublicProfileResponse,
  DoctorPatientFilesListResponse,
  DoctorPatientFileDetailsResponse,
  DoctorFileDownloadUrlResponse,
  DoctorPatientFileDeleteResponse,
  DoctorCreateEncounterBody,
  DoctorUpdateEncounterBody,
  DoctorEncountersListParams,
  DoctorPatientEncountersListParams,
  DoctorPatientEncountersListResponse,
  DoctorEncounterDetailsResponse,
  DoctorCloseEncounterResponse,
  DoctorPatientsListParams,
  DoctorPatientsListResponse,
  DoctorUpdateMedicalRecordBody,
  DoctorRescheduleAppointmentBody,
  DoctorScheduleResponse,
  DoctorUpdateScheduleBody,
  DoctorUpdateScheduleSettingsBody,
  DoctorAddDayBody,
  DoctorUpdateDayBody,
  DoctorAddExceptionBody,
  DoctorUpdateExceptionsBody,
  ScheduleDayKey,
  ScheduleDayTemplate,
  ScheduleException,
  DoctorAppointmentTypesResponse,
  DoctorAppointmentFilesListResponse,
  DoctorAppointmentFileDetailsResponse,
  DoctorAppointmentFileUploadResponse,
  DoctorAppointmentFileDeleteResponse,
  CreateAppointmentTypeBody,
  UpdateAppointmentTypeBody,
  AppointmentTypeMutationResponse,
  DoctorSlotsQueryParams,
  DoctorAllSlotsResponse,
  DoctorFreeSlotsResponse,
  DoctorBookedSlotsResponse,
  AddDoctorPatientMedicationBody,
  AddDoctorPatientMedicationResponse,
} from "@/lib/doctor/types";
import type {
  CreateDoctorLibraryItemBody,
  DoctorLibraryListResponse,
  DoctorLibraryRecentResponse,
  UpdateDoctorLibraryItemBody,
} from "@/lib/doctor/library/libraryTypes";
import type {
  CreateDoctorTemplateBody,
  DoctorTemplatesListResponse,
  UpdateDoctorTemplateBody,
} from "@/lib/doctor/templates/templateTypes";
import type {
  CreateOrderFavoriteBody,
  OrderFavoritesListResponse,
} from "@/lib/doctor/orders/orderFavoritesTypes";

function buildPatientsListQuery(params: DoctorPatientsListParams): string {
  const qs = new URLSearchParams();
  if (params.name?.trim()) qs.set("name", params.name.trim());
  if (params.search?.trim()) qs.set("search", params.search.trim());
  if (params.diagnosis?.trim()) qs.set("diagnosis", params.diagnosis.trim());
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.account_status && params.account_status !== "all") {
    qs.set("account_status", params.account_status);
  }
  return qs.toString();
}

function buildAccessRequestsListQuery(
  params: DoctorAccessRequestListParams = {},
): string {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.patientId) qs.set("patientId", params.patientId);
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  return qs.toString();
}

function buildEncounterClinicalListQuery(
  params: EncounterClinicalListParams = {},
): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.status?.trim()) search.set("status", params.status.trim());
  const query = search.toString();
  return query ? `?${query}` : "";
}

function buildPatientEncountersListQuery(
  params: DoctorPatientEncountersListParams = {},
): string {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
  if (params.dateTo) qs.set("dateTo", params.dateTo);
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  return qs.toString();
}

function buildDoctorEncountersListQuery(
  params: DoctorEncountersListParams = {},
): string {
  const qs = new URLSearchParams();
  if (params.patientId) qs.set("patientId", params.patientId);
  if (params.status) qs.set("status", params.status);
  if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
  if (params.dateTo) qs.set("dateTo", params.dateTo);
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  return qs.toString();
}

export const doctorEncountersQueryKeys = {
  all: ["doctor", "encounters"] as const,
  lists: () => [...doctorEncountersQueryKeys.all, "list"] as const,
  list: (doctorId: string, params: DoctorEncountersListParams = {}) =>
    [...doctorEncountersQueryKeys.lists(), doctorId, params] as const,
};

export const doctorPatientsQueryKeys = {
  all: ["doctor", "patients"] as const,
  lists: () => [...doctorPatientsQueryKeys.all, "list"] as const,
  list: (params: DoctorPatientsListParams) =>
    [...doctorPatientsQueryKeys.lists(), params] as const,
  publicProfile: (patientId: string) =>
    [...doctorPatientsQueryKeys.all, "public", patientId] as const,
  fullProfile: (doctorId: string, patientId: string) =>
    [...doctorPatientsQueryKeys.all, "profile", doctorId, patientId] as const,
  medicalRecords: (doctorId: string, patientId: string) =>
    [
      ...doctorPatientsQueryKeys.all,
      "medical-records",
      doctorId,
      patientId,
    ] as const,
  medicalRecord: (doctorId: string, patientId: string, recordId: string) =>
    [
      ...doctorPatientsQueryKeys.medicalRecords(doctorId, patientId),
      recordId,
    ] as const,
  encounters: (
    doctorId: string,
    patientId: string,
    params: DoctorPatientEncountersListParams = {},
  ) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounters",
      doctorId,
      patientId,
      params,
    ] as const,
  encounterDetail: (doctorId: string, patientId: string, encounterId: string) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounter-detail",
      doctorId,
      patientId,
      encounterId,
    ] as const,
  encounterSummary: (
    doctorId: string,
    patientId: string,
    encounterId: string,
  ) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounter-summary",
      doctorId,
      patientId,
      encounterId,
    ] as const,
  encounterPrescription: (
    doctorId: string,
    patientId: string,
    encounterId: string,
  ) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounter-prescription",
      doctorId,
      patientId,
      encounterId,
    ] as const,
  encounterRadiologyOrder: (
    doctorId: string,
    patientId: string,
    encounterId: string,
  ) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounter-radiology-order",
      doctorId,
      patientId,
      encounterId,
    ] as const,
  encounterLabOrder: (
    doctorId: string,
    patientId: string,
    encounterId: string,
  ) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounter-lab-order",
      doctorId,
      patientId,
      encounterId,
    ] as const,
  encounterProcedureOrder: (
    doctorId: string,
    patientId: string,
    encounterId: string,
  ) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounter-procedure-order",
      doctorId,
      patientId,
      encounterId,
    ] as const,
  encounterReferralOrder: (
    doctorId: string,
    patientId: string,
    encounterId: string,
  ) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounter-referral-order",
      doctorId,
      patientId,
      encounterId,
    ] as const,
  encounterWorkspace: (
    doctorId: string,
    patientId: string,
    encounterId: string,
  ) =>
    [
      ...doctorPatientsQueryKeys.all,
      "encounter-workspace",
      doctorId,
      patientId,
      encounterId,
    ] as const,
  imagingCatalog: (search?: string) =>
    [...doctorPatientsQueryKeys.all, "imaging-catalog", search ?? ""] as const,
  labCatalog: (search?: string) =>
    [...doctorPatientsQueryKeys.all, "lab-catalog", search ?? ""] as const,
  procedureCatalog: (search?: string) =>
    [
      ...doctorPatientsQueryKeys.all,
      "procedure-catalog",
      search ?? "",
    ] as const,
  files: (patientId: string) =>
    [...doctorPatientsQueryKeys.all, "files", patientId] as const,
  file: (patientId: string, fileId: string) =>
    [...doctorPatientsQueryKeys.files(patientId), fileId] as const,
};

export const doctorClinicalQueryKeys = {
  all: ["doctor", "clinical"] as const,
  orderFavorites: (section?: string) =>
    [
      ...doctorClinicalQueryKeys.all,
      "order-favorites",
      section ?? "all",
    ] as const,
  libraryItems: (params: Record<string, unknown>) =>
    [...doctorClinicalQueryKeys.all, "library-items", params] as const,
  libraryRecent: () =>
    [...doctorClinicalQueryKeys.all, "library-recent"] as const,
  templates: (params: Record<string, unknown>) =>
    [...doctorClinicalQueryKeys.all, "templates", params] as const,
};

function buildDoctorOrdersListQuery(params: DoctorOrdersListParams = {}) {
  const qs = new URLSearchParams();
  if (params.patientId) qs.set("patientId", params.patientId);
  if (params.orderType) qs.set("orderType", params.orderType);
  if (params.category) qs.set("category", params.category);
  if (params.type) qs.set("type", params.type);
  if (params.status) qs.set("status", params.status);
  if (params.statusCode) qs.set("statusCode", params.statusCode);
  if (params.q?.trim()) qs.set("q", params.q.trim());
  if (params.search?.trim()) qs.set("search", params.search.trim());
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.sort) qs.set("sort", params.sort);
  return qs.toString();
}

export const doctorOrdersQueryKeys = {
  all: ["doctor", "orders"] as const,
  list: (params: DoctorOrdersListParams = {}) =>
    [...doctorOrdersQueryKeys.all, "list", params] as const,
  detail: (orderId: string) =>
    [...doctorOrdersQueryKeys.all, "detail", orderId] as const,
};

export const doctorAccessRequestsQueryKeys = {
  all: ["doctor", "access-requests"] as const,
  list: (params: DoctorAccessRequestListParams = {}) =>
    [...doctorAccessRequestsQueryKeys.all, "list", params] as const,
  detail: (requestId: string) =>
    [...doctorAccessRequestsQueryKeys.all, "detail", requestId] as const,
  approvedPayload: (doctorId: string, patientId: string, requestId: string) =>
    [
      ...doctorAccessRequestsQueryKeys.all,
      "approved-payload",
      doctorId,
      patientId,
      requestId,
    ] as const,
};

// NOTE: Exported via doctorApi.patients below (admin-like shape)

// ─────────────────────────────────────────────────────────────────────────────
// Doctor — Appointments
// ─────────────────────────────────────────────────────────────────────────────

export const doctorAppointmentsQueryKeys = {
  all: ["doctor", "appointments"] as const,
  lists: () => [...doctorAppointmentsQueryKeys.all, "list"] as const,
  list: (params: DoctorAppointmentListParams) =>
    [...doctorAppointmentsQueryKeys.lists(), params] as const,
  details: () => [...doctorAppointmentsQueryKeys.all, "detail"] as const,
  detail: (appointmentId: string) =>
    [...doctorAppointmentsQueryKeys.details(), appointmentId] as const,
  files: (appointmentId: string) =>
    [...doctorAppointmentsQueryKeys.all, "files", appointmentId] as const,
  file: (appointmentId: string, fileId: string) =>
    [...doctorAppointmentsQueryKeys.files(appointmentId), fileId] as const,
};

function buildAppointmentsListQuery(
  params: DoctorAppointmentListParams,
): string {
  const qs = new URLSearchParams();

  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.status) qs.set("status", params.status);
  if (params.date) qs.set("date", params.date);
  if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
  if (params.dateTo) qs.set("dateTo", params.dateTo);

  const query = qs.toString();
  return query
    ? `${doctorEndpoints.appointments.list}?${query}`
    : doctorEndpoints.appointments.list;
}

function pickPatientName(summary: DoctorAppointmentSummary): string {
  return summary.patient?.userId?.fullName ?? summary.patient?.publicId ?? "—";
}

function pickPatientInitial(summary: DoctorAppointmentSummary): string {
  const source = pickPatientName(summary).trim();
  return source ? source.charAt(0).toUpperCase() : "—";
}

function deriveDate(summary: DoctorAppointmentSummary): string {
  if (summary.date) return summary.date.slice(0, 10);
  if (summary.startDateTime) return summary.startDateTime.slice(0, 10);
  return "";
}

function deriveTime(summary: DoctorAppointmentSummary): string {
  if (summary.startTime) return summary.startTime;
  if (summary.startDateTime) return summary.startDateTime.slice(11, 16);
  return "";
}

export const doctorAppointmentsApi = {
  list: async (params: DoctorAppointmentListParams = {}) => {
    return get<DoctorAppointmentsListResponse>(
      buildAppointmentsListQuery(params),
      {
        locale: "ar",
      },
    );
  },
  getById: async (appointmentId: string) => {
    return get<DoctorAppointmentDetailsResponse>(
      doctorEndpoints.appointments.details(appointmentId),
      { locale: "ar" },
    );
  },
  book: async (body: DoctorBookAppointmentBody) => {
    return post<DoctorAppointmentMutationResponse>(
      doctorEndpoints.appointments.book,
      body,
      {
        locale: "ar",
      },
    );
  },
  cancel: async (appointmentId: string, body: DoctorCancelAppointmentBody) => {
    return patch<DoctorAppointmentMutationResponse>(
      doctorEndpoints.appointments.cancel(appointmentId),
      body,
      { locale: "ar" },
    );
  },
  reschedule: (appointmentId: string, body: DoctorRescheduleAppointmentBody) =>
    patch<DoctorAppointmentMutationResponse>(
      doctorEndpoints.appointments.reschedule(appointmentId),
      body,
      { locale: "ar" },
    ),
  complete: async (
    appointmentId: string,
    body: DoctorCompleteAppointmentBody,
  ) => {
    return patch<DoctorAppointmentMutationResponse>(
      doctorEndpoints.appointments.complete(appointmentId),
      body,
      { locale: "ar" },
    );
  },
  markNoShow: (appointmentId: string, body: DoctorNoShowAppointmentBody) =>
    patch<DoctorAppointmentMutationResponse>(
      doctorEndpoints.appointments.noShow(appointmentId),
      body,
      { locale: "ar" },
    ),
  listFiles: (appointmentId: string) =>
    get<DoctorAppointmentFilesListResponse>(
      doctorEndpoints.appointments.files.list(appointmentId),
      { locale: "ar" },
    ),
  getFile: (appointmentId: string, fileId: string) =>
    get<DoctorAppointmentFileDetailsResponse>(
      doctorEndpoints.appointments.files.detail(appointmentId, fileId),
      { locale: "ar" },
    ),
  getFileDownloadUrl: (appointmentId: string, fileId: string) =>
    get<DoctorFileDownloadUrlResponse>(
      `${doctorEndpoints.appointments.files.download(appointmentId, fileId)}?mode=url`,
      { locale: "ar" },
    ),
  uploadFile: (
    appointmentId: string,
    file: File,
    note?: string,
    tags?: string[],
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (note?.trim()) formData.append("note", note.trim());
    if (tags && tags.length > 0) formData.append("tags", JSON.stringify(tags));
    return apiMultipart<DoctorAppointmentFileUploadResponse>(
      doctorEndpoints.appointments.files.upload(appointmentId),
      formData,
      { locale: "ar" },
    );
  },
  unlinkFile: (appointmentId: string, fileId: string) =>
    del<DoctorAppointmentFileDeleteResponse>(
      doctorEndpoints.appointments.files.unlink(appointmentId, fileId),
      { locale: "ar" },
    ),
};

// ─────────────────────────────────────────────────────────────────────────────
// Doctor — Schedule API (real backend endpoints)
// ─────────────────────────────────────────────────────────────────────────────

export const doctorScheduleQueryKeys = {
  all: ["doctor", "schedule"] as const,
  detail: (doctorId: string) =>
    [...doctorScheduleQueryKeys.all, doctorId] as const,
  slots: (doctorId: string, date: string) =>
    [...doctorScheduleQueryKeys.all, "slots", doctorId, date] as const,
};

// Helper to get doctorId from auth
function getDoctorIdFromAuth(): string {
  const authUser = readAuthUser();
  const doctorId = authUser?.actorIds?.doctorId;

  if (!doctorId) {
    throw new Error("Doctor ID not found in auth. Please login as a doctor.");
  }

  return doctorId;
}

const doctorScheduleApi = {
  // GET /doctors/:doctorId/schedule
  get: async (): Promise<DoctorScheduleResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return get<DoctorScheduleResponse>(doctorEndpoints.schedule.get(doctorId), {
      locale: "ar",
    });
  },

  // PUT /doctors/:doctorId/schedule (full replacement)
  update: async (
    body: DoctorUpdateScheduleBody,
  ): Promise<DoctorScheduleResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return put<DoctorScheduleResponse>(
      doctorEndpoints.schedule.update(doctorId),
      body,
      { locale: "ar" },
    );
  },

  // PATCH /doctors/:doctorId/schedule/settings
  updateSettings: async (
    body: DoctorUpdateScheduleSettingsBody,
  ): Promise<{ message?: string }> => {
    const doctorId = getDoctorIdFromAuth();
    return patch<{ message?: string }>(
      doctorEndpoints.schedule.updateSettings(doctorId),
      body,
      { locale: "ar" },
    );
  },

  // POST /doctors/:doctorId/schedule/day
  addDay: async (body: DoctorAddDayBody): Promise<{ message?: string }> => {
    const doctorId = getDoctorIdFromAuth();
    return post<{ message?: string }>(
      doctorEndpoints.schedule.addDay(doctorId),
      body,
      { locale: "ar" },
    );
  },

  // PATCH /doctors/:doctorId/schedule/day/:day
  updateDay: async (
    day: ScheduleDayKey,
    body: DoctorUpdateDayBody,
  ): Promise<{ message?: string }> => {
    const doctorId = getDoctorIdFromAuth();
    return patch<{ message?: string }>(
      doctorEndpoints.schedule.updateDay(doctorId, day),
      body,
      { locale: "ar" },
    );
  },

  // DELETE /doctors/:doctorId/schedule/day/:day
  deleteDay: async (day: ScheduleDayKey): Promise<{ message?: string }> => {
    const doctorId = getDoctorIdFromAuth();
    return del<{ message?: string }>(
      doctorEndpoints.schedule.deleteDay(doctorId, day),
      { locale: "ar" },
    );
  },

  // POST /doctors/:doctorId/schedule/exception
  addException: async (
    body: DoctorAddExceptionBody,
  ): Promise<{ message?: string }> => {
    const doctorId = getDoctorIdFromAuth();
    return post<{ message?: string }>(
      doctorEndpoints.schedule.addException(doctorId),
      body,
      { locale: "ar" },
    );
  },

  // PATCH /doctors/:doctorId/schedule/exceptions
  updateExceptions: async (
    body: DoctorUpdateExceptionsBody,
  ): Promise<{ message?: string }> => {
    const doctorId = getDoctorIdFromAuth();
    return patch<{ message?: string }>(
      doctorEndpoints.schedule.updateExceptions(doctorId),
      body,
      { locale: "ar" },
    );
  },

  // DELETE /doctors/:doctorId/schedule/exception/:exceptionId
  deleteException: async (
    exceptionId: string,
  ): Promise<{ message?: string }> => {
    const doctorId = getDoctorIdFromAuth();
    return del<{ message?: string }>(
      doctorEndpoints.schedule.deleteException(doctorId, exceptionId),
      { locale: "ar" },
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Doctor — Appointment Types
// ─────────────────────────────────────────────────────────────────────────────

export const doctorAppointmentTypesQueryKeys = {
  all: ["doctor", "appointmentTypes"] as const,
  available: (doctorId: string) =>
    [...doctorAppointmentTypesQueryKeys.all, "available", doctorId] as const,
  list: (doctorId: string) =>
    [...doctorAppointmentTypesQueryKeys.all, "list", doctorId] as const,
};

const doctorAppointmentTypesApi = {
  // GET /doctors/:doctorId/appointment-types/available
  getAvailableTypes: async (
    doctorId?: string,
  ): Promise<DoctorAppointmentTypesResponse> => {
    const actualDoctorId = doctorId || getDoctorIdFromAuth();
    return get<DoctorAppointmentTypesResponse>(
      doctorEndpoints.appointmentTypes.available(actualDoctorId),
      { locale: "ar" },
    );
  },

  // GET /doctors/:doctorId/appointment-types
  listTypes: async (
    doctorId?: string,
  ): Promise<DoctorAppointmentTypesResponse> => {
    const actualDoctorId = doctorId || getDoctorIdFromAuth();
    return get<DoctorAppointmentTypesResponse>(
      doctorEndpoints.appointmentTypes.list(actualDoctorId),
      { locale: "ar" },
    );
  },

  // POST /doctors/:doctorId/appointment-types
  createType: async (
    body: CreateAppointmentTypeBody,
  ): Promise<AppointmentTypeMutationResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return post<AppointmentTypeMutationResponse>(
      doctorEndpoints.appointmentTypes.create(doctorId),
      toAppointmentTypeApiBody(body),
      { locale: "ar" },
    );
  },

  // PUT /doctors/:doctorId/appointment-types/:typeId
  updateType: async (
    typeId: string,
    body: UpdateAppointmentTypeBody,
  ): Promise<AppointmentTypeMutationResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return put<AppointmentTypeMutationResponse>(
      doctorEndpoints.appointmentTypes.update(doctorId, typeId),
      toAppointmentTypeApiBody(body),
      { locale: "ar" },
    );
  },

  // DELETE /doctors/:doctorId/appointment-types/:typeId
  deleteType: async (typeId: string): Promise<{ message?: string }> => {
    const doctorId = getDoctorIdFromAuth();
    return del<{ message?: string }>(
      doctorEndpoints.appointmentTypes.delete(doctorId, typeId),
      { locale: "ar" },
    );
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Doctor — Slots (Preview)
// ─────────────────────────────────────────────────────────────────────────────

export const doctorSlotsQueryKeys = {
  all: ["doctor", "slots"] as const,
  byDate: (doctorId: string, date: string, type?: "free" | "booked" | "all") =>
    [...doctorSlotsQueryKeys.all, doctorId, date, type || "free"] as const,
};

const doctorSlotsApi = {
  // GET /doctors/:doctorId/slots?date=...&type=free|booked|all
  // Returns different response shapes based on type parameter
  getSlots: async (
    params: DoctorSlotsQueryParams & { doctorId?: string },
  ): Promise<
    DoctorFreeSlotsResponse | DoctorBookedSlotsResponse | DoctorAllSlotsResponse
  > => {
    const actualDoctorId = params.doctorId || getDoctorIdFromAuth();
    const qs = new URLSearchParams();
    qs.set("date", params.date);
    if (params.type) qs.set("type", params.type);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));

    const endpoint = `${doctorEndpoints.schedule.slots(actualDoctorId)}?${qs.toString()}`;

    // Cast to DoctorAllSlotsResponse as it's the most comprehensive type
    // that includes optional fields from all response types
    return get<DoctorAllSlotsResponse>(endpoint, { locale: "ar" });
  },
};

export const doctorApi = {
  patients: {
    list: (params: DoctorPatientsListParams = {}) => {
      const query = buildPatientsListQuery(params);
      const base = doctorEndpoints.patients.list;
      const endpoint = query ? `${base}?${query}` : base;
      return get<DoctorPatientsListResponse>(endpoint, { locale: "ar" });
    },
    createTemporary: (body: CreateTemporaryPatientBody) =>
      post<CreateTemporaryPatientResponse>(
        doctorEndpoints.patients.temp,
        body,
        {
          locale: "ar",
        },
      ),
    getPublicProfile: (patientId: string) =>
      get<DoctorPatientPublicProfileResponse>(
        doctorEndpoints.patients.publicProfile(patientId),
        { locale: "ar" },
      ),
    getFullProfileResult: (doctorId: string, patientId: string) =>
      apiRequestResult<DoctorPatientFullProfileResponse>(
        doctorEndpoints.patients.fullProfile(doctorId, patientId),
        {
          method: "GET",
          locale: "ar",
          expectedStatuses: [403, 404],
        },
      ),
    requestAccess: (
      doctorId: string,
      patientId: string,
      body: DoctorPatientAccessRequestBody,
    ) =>
      post<DoctorPatientAccessRequestResponse>(
        doctorEndpoints.patients.accessRequests(doctorId, patientId),
        body,
        { locale: "ar" },
      ),
    linkPatient: (doctorId: string, patientId: string) =>
      post<DoctorPatientLinkResponse>(
        doctorEndpoints.patients.link(doctorId, patientId),
        {},
        { locale: "ar" },
      ),
    listMedicalRecords: (doctorId: string, patientId: string) =>
      get<DoctorMedicalRecordsListResponse>(
        doctorEndpoints.patients.medicalRecords(doctorId, patientId),
        { locale: "ar" },
      ),
    getMedicalRecord: (doctorId: string, patientId: string, recordId: string) =>
      get<DoctorMedicalRecordDetailsResponse>(
        doctorEndpoints.patients.medicalRecordById(
          doctorId,
          patientId,
          recordId,
        ),
        { locale: "ar" },
      ),
    createMedicalRecord: (
      doctorId: string,
      patientId: string,
      body: DoctorCreateMedicalRecordBody,
    ) =>
      post<DoctorMedicalRecordDetailsResponse>(
        doctorEndpoints.patients.medicalRecords(doctorId, patientId),
        body,
        { locale: "ar" },
      ),
    updateMedicalRecord: (
      doctorId: string,
      patientId: string,
      recordId: string,
      body: DoctorUpdateMedicalRecordBody,
    ) =>
      patch<DoctorMedicalRecordDetailsResponse>(
        doctorEndpoints.patients.medicalRecordById(
          doctorId,
          patientId,
          recordId,
        ),
        body,
        { locale: "ar" },
      ),
    addPatientMedication: (
      doctorId: string,
      patientId: string,
      body: AddDoctorPatientMedicationBody,
    ) =>
      post<AddDoctorPatientMedicationResponse>(
        doctorEndpoints.patients.medications(doctorId, patientId),
        body,
        { locale: "ar" },
      ),
    listEncounters: (
      doctorId: string,
      patientId: string,
      params: DoctorPatientEncountersListParams = {},
    ) => {
      const query = buildPatientEncountersListQuery(params);
      const base = doctorEndpoints.patients.encounters(doctorId, patientId);
      const endpoint = query ? `${base}?${query}` : base;
      return get<DoctorPatientEncountersListResponse>(endpoint, {
        locale: "ar",
      });
    },
    createEncounter: (
      doctorId: string,
      patientId: string,
      body: DoctorCreateEncounterBody,
    ) =>
      post<DoctorEncounterDetailsResponse>(
        doctorEndpoints.patients.encounters(doctorId, patientId),
        body,
        { locale: "ar" },
      ),
    getEncounter: (doctorId: string, patientId: string, encounterId: string) =>
      get<DoctorEncounterDetailsResponse>(
        doctorEndpoints.patients.encounterById(
          doctorId,
          patientId,
          encounterId,
        ),
        { locale: "ar" },
      ),
    updateEncounter: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      body: DoctorUpdateEncounterBody,
    ) =>
      patch<DoctorEncounterDetailsResponse>(
        doctorEndpoints.patients.encounterById(
          doctorId,
          patientId,
          encounterId,
        ),
        body,
        { locale: "ar" },
      ),
    closeEncounter: (
      doctorId: string,
      patientId: string,
      encounterId: string,
    ) =>
      post<DoctorCloseEncounterResponse>(
        doctorEndpoints.patients.closeEncounter(
          doctorId,
          patientId,
          encounterId,
        ),
        {},
        { locale: "ar" },
      ),
    listEncounterPrescriptions: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      params: EncounterClinicalListParams = {},
    ) => {
      const query = buildEncounterClinicalListQuery(params);
      const base = doctorEndpoints.patients.encounterPrescriptions(
        doctorId,
        patientId,
        encounterId,
      );
      return get<EncounterPrescriptionsListResponse>(`${base}${query}`, {
        locale: "ar",
      });
    },
    listEncounterOrders: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      params: EncounterClinicalListParams = {},
    ) => {
      const query = buildEncounterClinicalListQuery(params);
      const base = doctorEndpoints.patients.encounterOrders(
        doctorId,
        patientId,
        encounterId,
      );
      return get<EncounterOrdersListResponse>(`${base}${query}`, {
        locale: "ar",
      });
    },
    createEncounterImagingOrder: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      body: CreateEncounterOrderBody = {},
    ) =>
      post<EncounterOrderResponse>(
        doctorEndpoints.patients.encounterOrdersImaging(
          doctorId,
          patientId,
          encounterId,
        ),
        body,
        { locale: "ar" },
      ),
    createEncounterLabOrder: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      body: CreateEncounterOrderBody = {},
    ) =>
      post<EncounterOrderResponse>(
        doctorEndpoints.patients.encounterOrdersLab(
          doctorId,
          patientId,
          encounterId,
        ),
        body,
        { locale: "ar" },
      ),
    createEncounterProcedureOrder: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      body: CreateEncounterOrderBody = {},
    ) =>
      post<EncounterOrderResponse>(
        doctorEndpoints.patients.encounterOrdersProcedures(
          doctorId,
          patientId,
          encounterId,
        ),
        body,
        { locale: "ar" },
      ),
    createEncounterReferralOrder: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      body: {
        specialty?: string;
        reason?: string;
        referralType?: string;
        referredDoctorName?: string;
        institution?: string;
        clinicalSummary?: string;
        questionsToColleague?: string;
        notes?: string;
        urgency?: string;
        priority?: string;
      },
    ) =>
      post<EncounterOrderResponse>(
        doctorEndpoints.patients.encounterOrdersReferrals(
          doctorId,
          patientId,
          encounterId,
        ),
        body,
        { locale: "ar" },
      ),
    getEncounterOrder: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
    ) =>
      get<EncounterOrderResponse>(
        doctorEndpoints.patients.encounterOrderById(
          doctorId,
          patientId,
          encounterId,
          orderId,
        ),
        { locale: "ar" },
      ),
    updateEncounterOrder: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
      body: UpdateEncounterOrderBody,
    ) =>
      patch<EncounterOrderResponse>(
        doctorEndpoints.patients.encounterOrderById(
          doctorId,
          patientId,
          encounterId,
          orderId,
        ),
        body,
        { locale: "ar" },
      ),
    addEncounterOrderItem: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
      body: ImagingOrderItemBody,
    ) =>
      post<EncounterOrderItemMutationResponse>(
        doctorEndpoints.patients.encounterOrderItems(
          doctorId,
          patientId,
          encounterId,
          orderId,
        ),
        body,
        { locale: "ar" },
      ),
    updateEncounterOrderItem: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
      itemId: string,
      body: ImagingOrderItemBody,
    ) =>
      patch<EncounterOrderItemMutationResponse>(
        doctorEndpoints.patients.encounterOrderItemById(
          doctorId,
          patientId,
          encounterId,
          orderId,
          itemId,
        ),
        body,
        { locale: "ar" },
      ),
    deleteEncounterOrderItem: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
      itemId: string,
    ) =>
      del<EncounterOrderItemMutationResponse>(
        doctorEndpoints.patients.encounterOrderItemById(
          doctorId,
          patientId,
          encounterId,
          orderId,
          itemId,
        ),
        { locale: "ar" },
      ),
    finalizeEncounterOrder: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
      body: { note?: string } = {},
    ) =>
      post<EncounterOrderFinalizeResponse>(
        doctorEndpoints.patients.encounterOrderFinalize(
          doctorId,
          patientId,
          encounterId,
          orderId,
        ),
        body,
        { locale: "ar" },
      ),
    getEncounterOrderPreview: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
    ) =>
      get<EncounterOrderPreviewResponse>(
        doctorEndpoints.patients.encounterOrderPreview(
          doctorId,
          patientId,
          encounterId,
          orderId,
        ),
        { locale: "ar" },
      ),
    listImagingCatalog: (
      params: { q?: string; page?: number; limit?: number } = {},
    ) => {
      const search = new URLSearchParams();
      if (params.q?.trim()) search.set("q", params.q.trim());
      if (params.page) search.set("page", String(params.page));
      if (params.limit) search.set("limit", String(params.limit));
      const query = search.toString();
      const base = doctorEndpoints.orderCatalogImaging;
      return get<OrderCatalogListResponse>(query ? `${base}?${query}` : base, {
        locale: "ar",
      });
    },
    listLabCatalog: (
      params: { q?: string; page?: number; limit?: number } = {},
    ) => {
      const search = new URLSearchParams();
      if (params.q?.trim()) search.set("q", params.q.trim());
      if (params.page) search.set("page", String(params.page));
      if (params.limit) search.set("limit", String(params.limit));
      const query = search.toString();
      const base = doctorEndpoints.patients.orderCatalogLab;
      return get<OrderCatalogListResponse>(query ? `${base}?${query}` : base, {
        locale: "ar",
      });
    },
    listProcedureCatalog: (
      params: { q?: string; page?: number; limit?: number } = {},
    ) => {
      const search = new URLSearchParams();
      if (params.q?.trim()) search.set("q", params.q.trim());
      if (params.page) search.set("page", String(params.page));
      if (params.limit) search.set("limit", String(params.limit));
      const query = search.toString();
      const base = doctorEndpoints.patients.orderCatalogProcedures;
      return get<OrderCatalogListResponse>(query ? `${base}?${query}` : base, {
        locale: "ar",
      });
    },
    createEncounterPrescription: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      body: CreateEncounterPrescriptionBody = {},
    ) =>
      post<EncounterPrescriptionResponse>(
        doctorEndpoints.patients.encounterPrescriptions(
          doctorId,
          patientId,
          encounterId,
        ),
        body,
        { locale: "ar" },
      ),
    getEncounterPrescription: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
    ) =>
      get<EncounterPrescriptionResponse>(
        doctorEndpoints.patients.encounterPrescriptionById(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
        ),
        { locale: "ar" },
      ),
    updateEncounterPrescription: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
      body: UpdateEncounterPrescriptionBody,
    ) =>
      patch<EncounterPrescriptionResponse>(
        doctorEndpoints.patients.encounterPrescriptionById(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
        ),
        body,
        { locale: "ar" },
      ),
    addEncounterPrescriptionItem: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
      body: PrescriptionItemBody,
    ) =>
      post<EncounterPrescriptionItemMutationResponse>(
        doctorEndpoints.patients.encounterPrescriptionItems(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
        ),
        body,
        { locale: "ar" },
      ),
    updateEncounterPrescriptionItem: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
      itemId: string,
      body: PrescriptionItemBody,
    ) =>
      patch<EncounterPrescriptionItemMutationResponse>(
        doctorEndpoints.patients.encounterPrescriptionItemById(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
          itemId,
        ),
        body,
        { locale: "ar" },
      ),
    deleteEncounterPrescriptionItem: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
      itemId: string,
    ) =>
      del<EncounterPrescriptionItemMutationResponse>(
        doctorEndpoints.patients.encounterPrescriptionItemById(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
          itemId,
        ),
        { locale: "ar" },
      ),
    duplicateEncounterPrescriptionItem: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
      itemId: string,
    ) =>
      post<EncounterPrescriptionItemMutationResponse>(
        doctorEndpoints.patients.encounterPrescriptionItemDuplicate(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
          itemId,
        ),
        {},
        { locale: "ar" },
      ),
    finalizeEncounterPrescription: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
    ) =>
      post<EncounterPrescriptionFinalizeResponse>(
        doctorEndpoints.patients.encounterPrescriptionFinalize(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
        ),
        {},
        { locale: "ar" },
      ),
    getEncounterPrescriptionPreview: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
    ) =>
      get<EncounterPrescriptionPreviewResponse>(
        doctorEndpoints.patients.encounterPrescriptionPreview(
          doctorId,
          patientId,
          encounterId,
          prescriptionId,
        ),
        { locale: "ar" },
      ),
    listEncounterDocuments: (
      doctorId: string,
      patientId: string,
      encounterId: string,
    ) =>
      get<EncounterDocumentsListResponse>(
        doctorEndpoints.patients.encounterDocuments(
          doctorId,
          patientId,
          encounterId,
        ),
        { locale: "ar" },
      ),
    linkEncounterDocument: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      body: EncounterDocumentLinkBody,
    ) =>
      post<EncounterDocumentLinkResponse>(
        doctorEndpoints.patients.encounterDocumentLink(
          doctorId,
          patientId,
          encounterId,
        ),
        body,
        { locale: "ar" },
      ),
    shareEncounterDocument: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      documentId: string,
      body: EncounterDocumentShareBody = {},
    ) =>
      post<EncounterDocumentShareResponse>(
        doctorEndpoints.patients.encounterDocumentShare(
          doctorId,
          patientId,
          encounterId,
          documentId,
        ),
        body,
        { locale: "ar" },
      ),
    listFiles: (patientId: string) =>
      get<DoctorPatientFilesListResponse>(
        doctorEndpoints.patients.files.list(patientId),
        { locale: "ar" },
      ),
    getFile: (patientId: string, fileId: string) =>
      get<DoctorPatientFileDetailsResponse>(
        doctorEndpoints.patients.files.detail(patientId, fileId),
        { locale: "ar" },
      ),
    getFileDownloadUrl: (doctorId: string, patientId: string, fileId: string) =>
      get<DoctorFileDownloadUrlResponse>(
        doctorEndpoints.patients.files.doctorDownloadUrl(
          doctorId,
          patientId,
          fileId,
        ),
        { locale: "ar" },
      ),
    uploadFile: (
      patientId: string,
      file: File,
      note?: string,
      tags?: string[],
    ) => {
      const formData = new FormData();
      formData.append("file", file);
      if (note?.trim()) formData.append("note", note.trim());
      if (tags && tags.length > 0)
        formData.append("tags", JSON.stringify(tags));
      return apiMultipart<DoctorPatientFileDetailsResponse>(
        doctorEndpoints.patients.files.upload(patientId),
        formData,
        { locale: "ar" },
      );
    },
    deleteFile: (patientId: string, fileId: string) =>
      del<DoctorPatientFileDeleteResponse>(
        doctorEndpoints.patients.files.remove(patientId, fileId),
        { locale: "ar" },
      ),
    getAccessRequestApprovedPayload: (
      doctorId: string,
      patientId: string,
      requestId: string,
    ) =>
      apiRequestResult<DoctorPatientFullProfileResponse>(
        doctorEndpoints.patients.accessRequestDetails(
          doctorId,
          patientId,
          requestId,
        ),
        {
          method: "GET",
          locale: "ar",
          expectedStatuses: [403, 404],
        },
      ),
  },
  encounters: {
    list: (doctorId: string, params: DoctorEncountersListParams = {}) => {
      const query = buildDoctorEncountersListQuery(params);
      const base = doctorEndpoints.encounters.list(doctorId);
      const endpoint = query ? `${base}?${query}` : base;
      return get<DoctorPatientEncountersListResponse>(endpoint, {
        locale: "ar",
      });
    },
  },
  accessRequests: {
    list: (params: DoctorAccessRequestListParams = {}) => {
      const query = buildAccessRequestsListQuery(params);
      const base = doctorEndpoints.accessRequests.list;
      const endpoint = query ? `${base}?${query}` : base;
      return get<DoctorAccessRequestsListResponse>(endpoint, {
        locale: "ar",
      });
    },
    getById: (requestId: string) =>
      get<DoctorAccessRequestDetailsResponse>(
        doctorEndpoints.accessRequests.details(requestId),
        { locale: "ar" },
      ),
  },
  appointments: doctorAppointmentsApi,
  schedule: doctorScheduleApi,
  slots: doctorSlotsApi,
  appointmentTypes: doctorAppointmentTypesApi,
  orders: {
    list: async (params: DoctorOrdersListParams = {}) => {
      const query = buildDoctorOrdersListQuery(params);
      const base = doctorEndpoints.orders.list;
      const endpoint = query ? `${base}?${query}` : base;
      const response = await get<DoctorOrdersListResponse>(endpoint, {
        locale: "ar",
      });
      return {
        ...response,
        orders: normalizeDoctorOrdersListResponse(response),
      };
    },
    getById: async (orderId: string) => {
      const response = await get<DoctorOrderDetailsResponse>(
        doctorEndpoints.orders.byId(orderId),
        { locale: "ar" },
      );
      const order = normalizeDoctorOrderFromApi(response.order);
      if (!order) {
        throw new Error("errors.orders.notFound");
      }
      return { ...response, order };
    },
    updateStatus: (orderId: string, body: UpdateDoctorOrderStatusBody) =>
      patch<DoctorOrderMutationResponse>(
        doctorEndpoints.orders.status(orderId),
        body,
        { locale: "ar" },
      ),
    cancel: (orderId: string, body: CancelDoctorOrderBody = {}) =>
      patch<DoctorOrderMutationResponse>(
        doctorEndpoints.orders.cancel(orderId),
        body,
        { locale: "ar" },
      ),
    createLab: (body: CreateEncounterOrderBody) =>
      post<EncounterOrderResponse>(doctorEndpoints.orders.createLab, body, {
        locale: "ar",
      }),
    createImaging: (body: CreateEncounterOrderBody) =>
      post<EncounterOrderResponse>(doctorEndpoints.orders.createImaging, body, {
        locale: "ar",
      }),
    createProcedure: (body: CreateEncounterOrderBody) =>
      post<EncounterOrderResponse>(
        doctorEndpoints.orders.createProcedures,
        body,
        { locale: "ar" },
      ),
    createCompat: (body: CreateEncounterOrderBody) =>
      post<EncounterOrderResponse>(doctorEndpoints.orders.create, body, {
        locale: "ar",
      }),
    appendResults: (orderId: string, body: AppendDoctorOrderResultsBody) =>
      post<AppendDoctorOrderResultsResponse>(
        doctorEndpoints.orders.results(orderId),
        body,
        { locale: "ar" },
      ),
    createReferral: (body: Record<string, unknown>) =>
      post<EncounterOrderResponse>(
        doctorEndpoints.orders.createReferrals,
        body,
        {
          locale: "ar",
        },
      ),
  },
  orderFavorites: {
    list: (
      params: { catalogSection?: string; page?: number; limit?: number } = {},
    ) => {
      const qs = new URLSearchParams();
      if (params.catalogSection)
        qs.set("catalogSection", params.catalogSection);
      if (params.page != null) qs.set("page", String(params.page));
      if (params.limit != null) qs.set("limit", String(params.limit));
      const query = qs.toString();
      const path = query
        ? `${doctorEndpoints.orderFavorites.list}?${query}`
        : doctorEndpoints.orderFavorites.list;
      return get<OrderFavoritesListResponse>(path, { locale: "ar" });
    },
    create: (body: CreateOrderFavoriteBody) =>
      post<{ favorite?: { _id?: string }; message?: string }>(
        doctorEndpoints.orderFavorites.create,
        body,
        { locale: "ar" },
      ),
    remove: (favoriteId: string) =>
      del<{ message?: string }>(
        doctorEndpoints.orderFavorites.delete(favoriteId),
        {
          locale: "ar",
        },
      ),
  },
  library: {
    recent: (limit = 10) =>
      get<DoctorLibraryRecentResponse>(
        `${doctorEndpoints.library.recent}?limit=${limit}`,
        { locale: "ar" },
      ),
    list: (
      params: {
        page?: number;
        limit?: number;
        type?: string;
        favorite?: boolean;
        includeArchived?: boolean;
        search?: string;
      } = {},
    ) => {
      const qs = new URLSearchParams();
      if (params.page != null) qs.set("page", String(params.page));
      if (params.limit != null) qs.set("limit", String(params.limit));
      if (params.type) qs.set("type", params.type);
      if (params.favorite) qs.set("favorite", "true");
      if (params.includeArchived) qs.set("includeArchived", "true");
      if (params.search?.trim()) qs.set("search", params.search.trim());
      const query = qs.toString();
      const path = query
        ? `${doctorEndpoints.library.items}?${query}`
        : doctorEndpoints.library.items;
      return get<DoctorLibraryListResponse>(path, { locale: "ar" });
    },
    create: (body: CreateDoctorLibraryItemBody) =>
      post<{
        item?: DoctorLibraryListResponse["items"] extends
          | (infer T)[]
          | undefined
          ? T
          : never;
        message?: string;
      }>(doctorEndpoints.library.items, body, { locale: "ar" }),
    update: (itemId: string, body: UpdateDoctorLibraryItemBody) =>
      patch<{
        item?: DoctorLibraryListResponse["items"] extends
          | (infer T)[]
          | undefined
          ? T
          : never;
        message?: string;
      }>(doctorEndpoints.library.itemById(itemId), body, { locale: "ar" }),
    delete: (itemId: string) =>
      del<{ itemId?: string; message?: string }>(
        doctorEndpoints.library.itemById(itemId),
        { locale: "ar" },
      ),
    setFavorite: (itemId: string, isFavorite: boolean) =>
      patch<{ itemId?: string; isFavorite?: boolean; message?: string }>(
        doctorEndpoints.library.itemFavorite(itemId),
        { isFavorite },
        { locale: "ar" },
      ),
  },
  templates: {
    list: (
      params: {
        page?: number;
        limit?: number;
        type?: string;
        includeArchived?: boolean;
        search?: string;
      } = {},
    ) => {
      const qs = new URLSearchParams();
      if (params.page != null) qs.set("page", String(params.page));
      if (params.limit != null) qs.set("limit", String(params.limit));
      if (params.type) qs.set("type", params.type);
      if (params.includeArchived) qs.set("includeArchived", "true");
      if (params.search?.trim()) qs.set("search", params.search.trim());
      const query = qs.toString();
      const path = query
        ? `${doctorEndpoints.templates.list}?${query}`
        : doctorEndpoints.templates.list;
      return get<DoctorTemplatesListResponse>(path, { locale: "ar" });
    },
    create: (body: CreateDoctorTemplateBody) =>
      post<{
        template?: DoctorTemplatesListResponse["templates"] extends
          | (infer T)[]
          | undefined
          ? T
          : never;
        message?: string;
      }>(doctorEndpoints.templates.list, body, { locale: "ar" }),
    update: (templateId: string, body: UpdateDoctorTemplateBody) =>
      patch<{
        template?: DoctorTemplatesListResponse["templates"] extends
          | (infer T)[]
          | undefined
          ? T
          : never;
        message?: string;
      }>(doctorEndpoints.templates.byId(templateId), body, { locale: "ar" }),
    delete: (templateId: string) =>
      del<{ templateId?: string; message?: string }>(
        doctorEndpoints.templates.byId(templateId),
        { locale: "ar" },
      ),
    apply: (templateId: string) =>
      post<
        import("@/lib/doctor/templates/templateTypes").DoctorTemplateApplyResponse
      >(doctorEndpoints.templates.apply(templateId), {}, { locale: "ar" }),
  },
  internalDirectory: {
    list: (params: InternalDirectoryListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.search?.trim()) qs.set("search", params.search.trim());
      if (params.specialization?.trim()) {
        qs.set("specialization", params.specialization.trim());
      }
      if (params.city?.trim()) qs.set("city", params.city.trim());
      if (params.country?.trim()) qs.set("country", params.country.trim());
      if (params.consultationType) {
        qs.set("consultationType", params.consultationType);
      }
      if (params.minRating != null) {
        qs.set("minRating", String(params.minRating));
      }
      if (params.page != null) qs.set("page", String(params.page));
      if (params.limit != null) qs.set("limit", String(params.limit));
      if (params.lat != null) qs.set("lat", String(params.lat));
      if (params.lng != null) qs.set("lng", String(params.lng));
      if (params.radiusKm != null) qs.set("radiusKm", String(params.radiusKm));

      const query = qs.toString();
      const path = query
        ? `${doctorEndpoints.internalDirectory}?${query}`
        : doctorEndpoints.internalDirectory;

      return get<InternalDirectoryListResponse>(path, { locale: "ar" });
    },
  },
} as const;
