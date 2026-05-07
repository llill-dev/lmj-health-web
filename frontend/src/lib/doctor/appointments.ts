import { get, patch, post } from '@/lib/base';
import { api, type Appointment as MockAppointment, type Appointment as UiAppointment } from '@/lib/api/api';

export type DoctorAppointmentStatus =
  | 'scheduled'
  | 'rescheduled'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type DoctorAppointmentListParams = {
  page?: number;
  limit?: number;
  status?: DoctorAppointmentStatus;
  date?: string;
};

export type DoctorAppointmentSummary = {
  _id: string;
  doctor?: {
    _id: string;
    specialization?: string;
    userId?: { _id?: string; fullName?: string };
  };
  patient?: {
    _id: string;
    publicId?: string;
    userId?: { _id?: string; fullName?: string };
  };
  status: DoctorAppointmentStatus;
  date?: string;
  startTime?: string;
  startDateTime?: string;
  endTime?: string;
  notes?: string;
  appointmentType?: string | null;
  appointmentTypeNameSnapshot?: string | null;
  priceSnapshot?: number | null;
  priceVisibleToPatientSnapshot?: boolean;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  rescheduledAt?: string;
  rescheduledBy?: string;
  rescheduleReason?: string;
  completedAt?: string;
  noShowAt?: string;
};

export type DoctorAppointmentFile = {
  _id: string;
  id?: string;
  appointmentLinkId?: string;
  appointmentId?: string;
  patientId?: string;
  originalName?: string;
  mimeType?: string;
  sizeBytes?: number;
  linkedAt?: string;
  linkedByRole?: string;
  linkedByUserId?: string;
  isArchived?: boolean;
};

export type DoctorAppointmentDetailsResponse = {
  messageKey?: string;
  message?: string;
  appointment: DoctorAppointmentSummary;
  files?: DoctorAppointmentFile[];
};

export type DoctorAppointmentsListResponse = {
  messageKey?: string;
  message?: string;
  page: number;
  limit: number;
  total: number;
  results: number;
  appointments: DoctorAppointmentSummary[];
};

export type DoctorBookAppointmentBody = {
  doctorId: string;
  patientId?: string;
  date: string;
  startTime: string;
  appointmentTypeId?: string;
  notes?: string;
};

export type DoctorAppointmentMutationResponse = {
  messageKey?: string;
  message?: string;
  appointment: DoctorAppointmentSummary;
};

export type DoctorCancelAppointmentBody = {
  reason: string;
};

export type DoctorRescheduleAppointmentBody = {
  date: string;
  startTime: string;
  appointmentTypeId?: string;
  reason?: string;
};

export type DoctorCompleteAppointmentBody = {
  notes: string;
};

export type DoctorNoShowAppointmentBody = {
  reason: string;
};

export const doctorAppointmentsQueryKeys = {
  all: ['doctor', 'appointments'] as const,
  lists: () => [...doctorAppointmentsQueryKeys.all, 'list'] as const,
  list: (params: DoctorAppointmentListParams) =>
    [...doctorAppointmentsQueryKeys.lists(), params] as const,
  details: () => [...doctorAppointmentsQueryKeys.all, 'detail'] as const,
  detail: (appointmentId: string) =>
    [...doctorAppointmentsQueryKeys.details(), appointmentId] as const,
};

const UI_ONLY = import.meta.env.VITE_UI_ONLY === 'true';

function buildAppointmentsQuery(params: DoctorAppointmentListParams): string {
  const qs = new URLSearchParams();

  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.status) qs.set('status', params.status);
  if (params.date) qs.set('date', params.date);

  const query = qs.toString();
  return query ? `/api/appointments?${query}` : '/api/appointments';
}

function pickPatientName(summary: DoctorAppointmentSummary): string {
  return (
    summary.patient?.userId?.fullName ??
    summary.patient?.publicId ??
    '—'
  );
}

function pickPatientInitial(summary: DoctorAppointmentSummary): string {
  const source = pickPatientName(summary).trim();
  return source ? source.charAt(0).toUpperCase() : '—';
}

function deriveDate(summary: DoctorAppointmentSummary): string {
  if (summary.date) return summary.date.slice(0, 10);
  if (summary.startDateTime) return summary.startDateTime.slice(0, 10);
  return '';
}

function deriveTime(summary: DoctorAppointmentSummary): string {
  if (summary.startTime) return summary.startTime;
  if (summary.startDateTime) return summary.startDateTime.slice(11, 16);
  return '';
}

function normalizeStatus(
  status: DoctorAppointmentStatus,
): UiAppointment['status'] {
  switch (status) {
    case 'rescheduled':
      return 'scheduled';
    case 'no-show':
      return 'cancelled';
    default:
      return status;
  }
}

function summarizeMockAppointment(
  appointment: MockAppointment,
): DoctorAppointmentSummary {
  return {
    _id: appointment.id,
    doctor: {
      _id: 'mock-doctor',
      userId: { fullName: 'Doctor' },
    },
    patient: {
      _id: appointment.patientId,
      userId: { fullName: appointment.patientName },
    },
    status:
      appointment.status === 'scheduled' ||
      appointment.status === 'completed' ||
      appointment.status === 'cancelled'
        ? appointment.status
        : 'scheduled',
    date: appointment.date,
    startTime: appointment.time,
    endTime: appointment.time,
    notes: appointment.notes,
    priceSnapshot: appointment.price ?? null,
  };
}

function mapMockStatus(
  status?: DoctorAppointmentStatus,
): MockAppointment['status'] | undefined {
  if (!status) return undefined;
  if (status === 'rescheduled') return 'scheduled';
  if (status === 'no-show') return 'cancelled';
  return status;
}

export function normalizeDoctorAppointmentToUi(
  summary: DoctorAppointmentSummary,
  files: DoctorAppointmentFile[] = [],
): UiAppointment {
  const patientName = pickPatientName(summary);
  const appointmentFiles = files.map((file) => ({
    name: file.originalName ?? 'Attachment',
    date: (file.linkedAt ?? '').slice(0, 10),
    url: undefined,
  }));

  return {
    id: summary._id,
    patientId: summary.patient?._id ?? '',
    patientName,
    patientInitials: pickPatientInitial(summary),
    patientPhone: undefined,
    date: deriveDate(summary),
    time: deriveTime(summary),
    duration: 30,
    type: 'clinic',
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
        messageKey: 'success.ok',
        message: 'Request completed successfully.',
        page: response.page,
        limit: response.limit,
        total: response.total,
        results: response.data.length,
        appointments: response.data.map(summarizeMockAppointment),
      };
    }

    return get<DoctorAppointmentsListResponse>(buildAppointmentsQuery(params), {
      locale: 'ar',
    });
  },
  getById: async (appointmentId: string) => {
    if (UI_ONLY) {
      const response = await api.getAppointmentById(appointmentId);
      return {
        messageKey: 'success.ok',
        message: 'Request completed successfully.',
        appointment: summarizeMockAppointment(response.data),
        files: (response.data.appointmentFiles ?? []).map((file, index) => ({
          _id: `${appointmentId}-file-${index}`,
          id: `${appointmentId}-file-${index}`,
          appointmentId,
          originalName: file.name,
          linkedAt: file.date,
          isArchived: false,
        })),
      };
    }

    return get<DoctorAppointmentDetailsResponse>(`/api/appointments/${appointmentId}`, {
      locale: 'ar',
    });
  },
  book: async (body: DoctorBookAppointmentBody) => {
    if (UI_ONLY) {
      const created = await api.createAppointment({
        patientId: body.patientId ?? 'mock-patient',
        patientName: 'مريض',
        patientInitials: 'م',
        date: body.date,
        time: body.startTime,
        duration: 30,
        type: 'clinic',
        status: 'scheduled',
        notes: body.notes,
      });
      return {
        message: 'Appointment booked successfully.',
        appointment: summarizeMockAppointment(created.data),
      };
    }

    return post<DoctorAppointmentMutationResponse>('/api/appointments/book', body, {
      locale: 'ar',
    });
  },
  cancel: async (appointmentId: string, body: DoctorCancelAppointmentBody) => {
    if (UI_ONLY) {
      await api.cancelAppointment(appointmentId);
      const appointment = await api.getAppointmentById(appointmentId);
      return {
        message: body.reason ? 'Appointment cancelled successfully.' : 'Appointment cancelled successfully.',
        appointment: {
          ...summarizeMockAppointment(appointment.data),
          status: 'cancelled',
          cancelReason: body.reason,
        },
      };
    }

    return patch<DoctorAppointmentMutationResponse>(
      `/api/appointments/${appointmentId}/cancel`,
      body,
      { locale: 'ar' },
    );
  },
  reschedule: (appointmentId: string, body: DoctorRescheduleAppointmentBody) =>
    patch<DoctorAppointmentMutationResponse>(
      `/api/appointments/${appointmentId}/reschedule`,
      body,
      { locale: 'ar' },
    ),
  complete: async (appointmentId: string, body: DoctorCompleteAppointmentBody) => {
    if (UI_ONLY) {
      await api.completeAppointment(appointmentId);
      const appointment = await api.getAppointmentById(appointmentId);
      return {
        message: 'Appointment marked as completed.',
        appointment: {
          ...summarizeMockAppointment(appointment.data),
          status: 'completed',
          notes: body.notes,
        },
      };
    }

    return patch<DoctorAppointmentMutationResponse>(
      `/api/appointments/${appointmentId}/complete`,
      body,
      { locale: 'ar' },
    );
  },
  markNoShow: (appointmentId: string, body: DoctorNoShowAppointmentBody) =>
    patch<DoctorAppointmentMutationResponse>(
      `/api/appointments/${appointmentId}/no-show`,
      body,
      { locale: 'ar' },
    ),
};
