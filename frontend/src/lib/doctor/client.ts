import { get, patch, post, apiRequestResult } from "@/lib/api";
import {
  api,
  type Appointment as MockAppointment,
  type Appointment as UiAppointment,
} from "@/lib/api_mock";
import { doctorEndpoints } from "./endpoints";
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
  DoctorPatientAccessRequestResponse,
  DoctorPatientFullProfileResponse,
  DoctorPatientPublicProfileResponse,
  DoctorPatientsListParams,
  DoctorPatientsListResponse,
  DoctorRescheduleAppointmentBody,
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

export const doctorPatientsQueryKeys = {
  all: ["doctor", "patients"] as const,
  lists: () => [...doctorPatientsQueryKeys.all, "list"] as const,
  list: (params: DoctorPatientsListParams) =>
    [...doctorPatientsQueryKeys.lists(), params] as const,
  publicProfile: (patientId: string) =>
    [...doctorPatientsQueryKeys.all, "public", patientId] as const,
  fullProfile: (doctorId: string, patientId: string) =>
    [...doctorPatientsQueryKeys.all, "profile", doctorId, patientId] as const,
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
  },
  appointments: doctorAppointmentsApi,
} as const;
