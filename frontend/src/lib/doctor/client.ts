import { get, patch, post, put, del, apiRequestResult, apiMultipart } from "@/lib/api";
import {
  api,
  type Appointment as MockAppointment,
  type Appointment as UiAppointment,
  type WorkSchedule as MockWorkSchedule,
} from "@/lib/api_mock";
import { doctorEndpoints } from "./endpoints";
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
  DoctorCreateMedicalRecordBody,
  DoctorPatientFullProfileResponse,
  DoctorMedicalRecordDetailsResponse,
  DoctorMedicalRecordsListResponse,
  DoctorPatientPublicProfileResponse,
  DoctorPatientFilesListResponse,
  DoctorPatientFileDetailsResponse,
  DoctorFileDownloadUrlResponse,
  DoctorPatientFileDeleteResponse,
  DoctorPatientEncountersListParams,
  DoctorPatientEncountersListResponse,
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
} from "./types";

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
    [...doctorPatientsQueryKeys.all, "medical-records", doctorId, patientId] as const,
  medicalRecord: (doctorId: string, patientId: string, recordId: string) =>
    [...doctorPatientsQueryKeys.medicalRecords(doctorId, patientId), recordId] as const,
  encounters: (
    doctorId: string,
    patientId: string,
    params: DoctorPatientEncountersListParams = {},
  ) => [...doctorPatientsQueryKeys.all, "encounters", doctorId, patientId, params] as const,
  files: (patientId: string) =>
    [...doctorPatientsQueryKeys.all, "files", patientId] as const,
  file: (patientId: string, fileId: string) =>
    [...doctorPatientsQueryKeys.files(patientId), fileId] as const,
};

export const doctorAccessRequestsQueryKeys = {
  all: ["doctor", "access-requests"] as const,
  list: (params: DoctorAccessRequestListParams = {}) =>
    [...doctorAccessRequestsQueryKeys.all, "list", params] as const,
  detail: (requestId: string) =>
    [...doctorAccessRequestsQueryKeys.all, "detail", requestId] as const,
  approvedPayload: (doctorId: string, patientId: string, requestId: string) =>
    [...doctorAccessRequestsQueryKeys.all, "approved-payload", doctorId, patientId, requestId] as const,
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

const UI_ONLY = import.meta.env.VITE_UI_ONLY === "true";

function buildAppointmentsListQuery(
  params: DoctorAppointmentListParams,
): string {
  const qs = new URLSearchParams();

  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.status) qs.set("status", params.status);
  if (params.date) qs.set("date", params.date);

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

function normalizeStatus(
  status: DoctorAppointmentStatus,
): UiAppointment["status"] {
  switch (status) {
    case "rescheduled":
      return "scheduled";
    case "no-show":
      return "cancelled";
    default:
      return status;
  }
}

function summarizeMockAppointment(
  appointment: MockAppointment,
): DoctorAppointmentSummary {
  return {
    _id: appointment.id,
    doctor: { _id: "mock-doctor", userId: { fullName: "Doctor" } },
    patient: {
      _id: appointment.patientId,
      userId: { fullName: appointment.patientName },
    },
    status:
      appointment.status === "scheduled" ||
      appointment.status === "completed" ||
      appointment.status === "cancelled"
        ? appointment.status
        : "scheduled",
    date: appointment.date,
    startTime: appointment.time,
    endTime: appointment.time,
    notes: appointment.notes,
    priceSnapshot: appointment.price ?? null,
  };
}

function mapMockStatus(
  status?: DoctorAppointmentStatus,
): MockAppointment["status"] | undefined {
  if (!status) return undefined;
  if (status === "rescheduled") return "scheduled";
  if (status === "no-show") return "cancelled";
  return status;
}

export function normalizeDoctorAppointmentToUi(
  summary: DoctorAppointmentSummary,
  files: DoctorAppointmentFile[] = [],
): UiAppointment {
  const patientName = pickPatientName(summary);
  const appointmentFiles = files.map((file) => ({
    name: file.originalName ?? "Attachment",
    date: (file.linkedAt ?? "").slice(0, 10),
    url: undefined,
  }));

  return {
    id: summary._id,
    patientId: summary.patient?._id ?? "",
    patientName,
    patientInitials: pickPatientInitial(summary),
    patientPhone: undefined,
    date: deriveDate(summary),
    time: deriveTime(summary),
    duration: 30,
    type: "clinic",
    status: normalizeStatus(summary.status),
    notes: summary.notes,
    price: summary.priceSnapshot ?? undefined,
    appointmentFiles,
  };
}

export const doctorAppointmentsApi = {
  list: async (params: DoctorAppointmentListParams = {}) => {
    if (UI_ONLY) {
      const response = await api.getAppointments(
        params.page ?? 1,
        params.limit ?? 10,
        params.date,
        mapMockStatus(params.status),
      );
      return {
        messageKey: "success.ok",
        message: "Request completed successfully.",
        page: response.page,
        limit: response.limit,
        total: response.total,
        results: response.data.length,
        appointments: response.data.map(summarizeMockAppointment),
      } satisfies DoctorAppointmentsListResponse;
    }

    return get<DoctorAppointmentsListResponse>(
      buildAppointmentsListQuery(params),
      {
        locale: "ar",
      },
    );
  },
  getById: async (appointmentId: string) => {
    if (UI_ONLY) {
      const response = await api.getAppointmentById(appointmentId);
      return {
        messageKey: "success.ok",
        message: "Request completed successfully.",
        appointment: summarizeMockAppointment(response.data),
        files: (response.data.appointmentFiles ?? []).map((file, index) => ({
          _id: `${appointmentId}-file-${index}`,
          id: `${appointmentId}-file-${index}`,
          appointmentId,
          originalName: file.name,
          linkedAt: file.date,
          isArchived: false,
        })),
      } satisfies DoctorAppointmentDetailsResponse;
    }

    return get<DoctorAppointmentDetailsResponse>(
      doctorEndpoints.appointments.details(appointmentId),
      { locale: "ar" },
    );
  },
  book: async (body: DoctorBookAppointmentBody) => {
    if (UI_ONLY) {
      const created = await api.createAppointment({
        patientId: body.patientId ?? "mock-patient",
        patientName: "مريض",
        patientInitials: "م",
        date: body.date,
        time: body.startTime,
        duration: 30,
        type: "clinic",
        status: "scheduled",
        notes: body.notes,
      });
      return {
        message: "Appointment booked successfully.",
        appointment: summarizeMockAppointment(created.data),
      } satisfies DoctorAppointmentMutationResponse;
    }

    return post<DoctorAppointmentMutationResponse>(
      doctorEndpoints.appointments.book,
      body,
      {
        locale: "ar",
      },
    );
  },
  cancel: async (appointmentId: string, body: DoctorCancelAppointmentBody) => {
    if (UI_ONLY) {
      await api.cancelAppointment(appointmentId);
      const appointment = await api.getAppointmentById(appointmentId);
      return {
        message: body.reason
          ? "Appointment cancelled successfully."
          : "Appointment cancelled successfully.",
        appointment: {
          ...summarizeMockAppointment(appointment.data),
          status: "cancelled",
          cancelReason: body.reason,
        },
      } satisfies DoctorAppointmentMutationResponse;
    }

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
    if (UI_ONLY) {
      await api.completeAppointment(appointmentId);
      const appointment = await api.getAppointmentById(appointmentId);
      return {
        message: "Appointment marked as completed.",
        appointment: {
          ...summarizeMockAppointment(appointment.data),
          status: "completed",
          notes: body.notes,
        },
      } satisfies DoctorAppointmentMutationResponse;
    }

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
  uploadFile: (appointmentId: string, file: File, note?: string, tags?: string[]) => {
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
    if (UI_ONLY) {
      // Convert mock data to API format
      const mockResponse = await api.getWorkSchedule();
      const mockData = mockResponse.data;

      // Convert mock format to real API format
      const availableTimes: ScheduleDayTemplate[] = Object.entries(
        mockData.weekly,
      )
        .filter(([_, day]) => day.enabled)
        .map(([dayKey, day]) => ({
          day: (dayKey.charAt(0).toUpperCase() +
            dayKey.slice(1)) as ScheduleDayKey,
          slots: [{ startTime: day.from, endTime: day.to }],
        }));

      const exceptions: ScheduleException[] = mockData.exceptions.map((ex) => ({
        _id: ex.id,
        date: ex.date,
        slots: [],
        note: ex.title,
      }));

      return {
        message: "Schedule retrieved successfully.",
        availableTimes,
        exceptions,
        slotSettings: {
          duration: parseInt(mockData.settings.appointmentDuration),
          gap: 5, // default
        },
      };
    }

    const doctorId = getDoctorIdFromAuth();
    return get<DoctorScheduleResponse>(doctorEndpoints.schedule.get(doctorId), {
      locale: "ar",
    });
  },

  // PUT /doctors/:doctorId/schedule (full replacement)
  update: async (
    body: DoctorUpdateScheduleBody,
  ): Promise<DoctorScheduleResponse> => {
    if (UI_ONLY) {
      // Convert API format to mock format for storage
      const mockBody: MockWorkSchedule = {
        settings: {
          appointmentDuration: "30",
          breakStart: "",
          breakEnd: "",
        },
        weekly: {
          sunday: { enabled: false, from: "", to: "" },
          monday: { enabled: false, from: "", to: "" },
          tuesday: { enabled: false, from: "", to: "" },
          wednesday: { enabled: false, from: "", to: "" },
          thursday: { enabled: false, from: "", to: "" },
          friday: { enabled: false, from: "", to: "" },
          saturday: { enabled: false, from: "", to: "" },
        },
        exceptions: [],
      };

      // Convert availableTimes to weekly
      body.availableTimes.forEach((dayTemplate) => {
        const dayKey =
          dayTemplate.day.toLowerCase() as keyof typeof mockBody.weekly;
        if (dayTemplate.slots.length > 0) {
          mockBody.weekly[dayKey] = {
            enabled: true,
            from: dayTemplate.slots[0].startTime,
            to: dayTemplate.slots[0].endTime,
          };
        }
      });

      await api.updateWorkSchedule(mockBody);
      return {
        message: "Schedule updated successfully.",
        availableTimes: body.availableTimes,
        exceptions: body.exceptions,
        slotSettings: { duration: 30, gap: 5 },
      };
    }

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
      body,
      { locale: "ar" },
    );
  },

  // PATCH /doctors/:doctorId/appointment-types/:typeId
  updateType: async (
    typeId: string,
    body: UpdateAppointmentTypeBody,
  ): Promise<AppointmentTypeMutationResponse> => {
    const doctorId = getDoctorIdFromAuth();
    return patch<AppointmentTypeMutationResponse>(
      doctorEndpoints.appointmentTypes.update(doctorId, typeId),
      body,
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
    listMedicalRecords: (doctorId: string, patientId: string) =>
      get<DoctorMedicalRecordsListResponse>(
        doctorEndpoints.patients.medicalRecords(doctorId, patientId),
        { locale: "ar" },
      ),
    getMedicalRecord: (
      doctorId: string,
      patientId: string,
      recordId: string,
    ) =>
      get<DoctorMedicalRecordDetailsResponse>(
        doctorEndpoints.patients.medicalRecordById(doctorId, patientId, recordId),
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
        doctorEndpoints.patients.medicalRecordById(doctorId, patientId, recordId),
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
      return get<DoctorPatientEncountersListResponse>(endpoint, { locale: "ar" });
    },
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
        doctorEndpoints.patients.files.doctorDownloadUrl(doctorId, patientId, fileId),
        { locale: "ar" },
      ),
    uploadFile: (patientId: string, file: File, note?: string, tags?: string[]) => {
      const formData = new FormData();
      formData.append("file", file);
      if (note?.trim()) formData.append("note", note.trim());
      if (tags && tags.length > 0) formData.append("tags", JSON.stringify(tags));
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
} as const;
