export const adminEndpoints = {
  appointments: {
    list: '/api/appointments',
    details: (appointmentId: string) => `/api/appointments/${appointmentId}`,
    cancel: (appointmentId: string) => `/api/appointments/${appointmentId}/cancel`,
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

