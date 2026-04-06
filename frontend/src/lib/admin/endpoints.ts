export const adminEndpoints = {
  doctors: {
    list: '/api/admin/doctors',
    details: (doctorId: string) => `/api/admin/doctors/${doctorId}`,
  },
  patients: {
    list: '/api/admin/patients',
    activate: (patientId: string) =>
      `/api/admin/patients/${patientId}/activate`,
    suspend: (patientId: string) => `/api/admin/patients/${patientId}/suspend`,
    unsuspend: (patientId: string) =>
      `/api/admin/patients/${patientId}/unsuspend`,
  },
  appointments: {
    list: '/api/appointments',
    details: (appointmentId: string) => `/api/appointments/${appointmentId}`,
    cancel: (appointmentId: string) =>
      `/api/appointments/${appointmentId}/cancel`,
  },
  verificationRequests: {
    details: (requestId: string) =>
      `/api/admin/doctor-verification-requests/${requestId}`,
    review: (requestId: string) =>
      `/api/admin/doctor-verification-requests/${requestId}`,
  },
  auditLogs: {
    list: '/api/admin/audit-logs',
  },
} as const;
