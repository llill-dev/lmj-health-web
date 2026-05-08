/**
 * Doctor-facing API paths (authenticated doctor role).
 * Patient listing uses `/api/doctors/patients` per backend contract.
 */
export const doctorEndpoints = {
  patients: {
    list: '/api/doctors/patients',
    temp: '/api/doctors/patients/temp',
    publicProfile: (patientId: string) =>
      `/api/doctors/patients/${patientId}/public`,
    fullProfile: (doctorId: string, patientId: string) =>
      `/api/doctors/${doctorId}/patients/${patientId}`,
    accessRequests: (doctorId: string, patientId: string) =>
      `/api/doctors/${doctorId}/patients/${patientId}/access-requests`,
  },
  appointments: {
    list: '/api/appointments',
    details: (appointmentId: string) => `/api/appointments/${appointmentId}`,
    book: '/api/appointments/book',
    cancel: (appointmentId: string) => `/api/appointments/${appointmentId}/cancel`,
    reschedule: (appointmentId: string) =>
      `/api/appointments/${appointmentId}/reschedule`,
    complete: (appointmentId: string) =>
      `/api/appointments/${appointmentId}/complete`,
    noShow: (appointmentId: string) => `/api/appointments/${appointmentId}/no-show`,
  },
} as const;
