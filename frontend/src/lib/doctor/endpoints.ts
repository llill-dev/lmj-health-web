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
    accessRequestDetails: (
      doctorId: string,
      patientId: string,
      requestId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/access-requests/${requestId}/details`,
    medicalRecords: (doctorId: string, patientId: string) =>
      `/api/doctors/${doctorId}/patients/${patientId}/medical-records`,
    medicalRecordById: (
      doctorId: string,
      patientId: string,
      recordId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/medical-records/${recordId}`,
  },
  accessRequests: {
    list: '/api/access-requests',
    details: (requestId: string) => `/api/access-requests/${requestId}`,
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
  schedule: {
    get: (doctorId: string) => `/api/doctors/${doctorId}/schedule`,
    update: (doctorId: string) => `/api/doctors/${doctorId}/schedule`,
    updateSettings: (doctorId: string) => `/api/doctors/${doctorId}/schedule/settings`,
    addDay: (doctorId: string) => `/api/doctors/${doctorId}/schedule/day`,
    updateDay: (doctorId: string, day: string) => `/api/doctors/${doctorId}/schedule/day/${day}`,
    deleteDay: (doctorId: string, day: string) => `/api/doctors/${doctorId}/schedule/day/${day}`,
    addException: (doctorId: string) => `/api/doctors/${doctorId}/schedule/exception`,
    updateExceptions: (doctorId: string) => `/api/doctors/${doctorId}/schedule/exceptions`,
    deleteException: (doctorId: string, exceptionId: string) => `/api/doctors/${doctorId}/schedule/exception/${exceptionId}`,
    slots: (doctorId: string) => `/api/doctors/${doctorId}/slots`,
  },
  appointmentTypes: {
    available: (doctorId: string) => `/api/doctors/${doctorId}/appointment-types/available`,
    list: (doctorId: string) => `/api/doctors/${doctorId}/appointment-types`,
    create: (doctorId: string) => `/api/doctors/${doctorId}/appointment-types`,
    update: (doctorId: string, typeId: string) => `/api/doctors/${doctorId}/appointment-types/${typeId}`,
    delete: (doctorId: string, typeId: string) => `/api/doctors/${doctorId}/appointment-types/${typeId}`,
  },
} as const;
