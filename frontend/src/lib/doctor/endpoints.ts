/**
 * Doctor-facing API paths (authenticated doctor role).
 * Patient listing uses `/api/doctors/patients` per backend contract.
 */
export const doctorEndpoints = {
  patients: {
    list: "/api/doctors/patients",
    temp: "/api/doctors/patients/temp",
    publicProfile: (patientId: string) =>
      `/api/doctors/patients/${patientId}/public`,
    fullProfile: (doctorId: string, patientId: string) =>
      `/api/doctors/${doctorId}/patients/${patientId}`,
    link: (doctorId: string, patientId: string) =>
      `/api/doctors/${doctorId}/patients/${patientId}/link`,
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
    encounters: (doctorId: string, patientId: string) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters`,
    encounterById: (doctorId: string, patientId: string, encounterId: string) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}`,
    closeEncounter: (
      doctorId: string,
      patientId: string,
      encounterId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/close`,
    encounterPrescriptions: (
      doctorId: string,
      patientId: string,
      encounterId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/prescriptions`,
    encounterPrescriptionById: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/prescriptions/${prescriptionId}`,
    encounterPrescriptionItems: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/prescriptions/${prescriptionId}/items`,
    encounterPrescriptionItemById: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
      itemId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/prescriptions/${prescriptionId}/items/${itemId}`,
    encounterPrescriptionItemDuplicate: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
      itemId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/prescriptions/${prescriptionId}/items/${itemId}/duplicate`,
    encounterPrescriptionFinalize: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/prescriptions/${prescriptionId}/finalize`,
    encounterPrescriptionPreview: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      prescriptionId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/prescriptions/${prescriptionId}/preview`,
    encounterOrders: (
      doctorId: string,
      patientId: string,
      encounterId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/orders`,
    encounterOrdersImaging: (
      doctorId: string,
      patientId: string,
      encounterId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/orders/imaging`,
    encounterOrdersLab: (
      doctorId: string,
      patientId: string,
      encounterId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/orders/lab`,
    encounterOrdersProcedures: (
      doctorId: string,
      patientId: string,
      encounterId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/orders/procedures`,
    encounterOrdersReferrals: (
      doctorId: string,
      patientId: string,
      encounterId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/orders/referrals`,
    orderCatalogLab: '/api/doctors/order-catalog/lab-tests',
    orderCatalogProcedures: '/api/doctors/order-catalog/procedures',
    encounterOrderById: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/orders/${orderId}`,
    encounterOrderItems: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/orders/${orderId}/items`,
    encounterOrderItemById: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
      itemId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/orders/${orderId}/items/${itemId}`,
    encounterOrderFinalize: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/orders/${orderId}/finalize`,
    encounterOrderPreview: (
      doctorId: string,
      patientId: string,
      encounterId: string,
      orderId: string,
    ) =>
      `/api/doctors/${doctorId}/patients/${patientId}/encounters/${encounterId}/orders/${orderId}/preview`,
    files: {
      list: (patientId: string) => `/api/patients/${patientId}/files`,
      upload: (patientId: string) => `/api/patients/${patientId}/files/upload`,
      detail: (patientId: string, fileId: string) =>
        `/api/patients/${patientId}/files/${fileId}`,
      download: (patientId: string, fileId: string) =>
        `/api/patients/${patientId}/files/${fileId}/download`,
      doctorDownloadUrl: (
        doctorId: string,
        patientId: string,
        fileId: string,
      ) =>
        `/api/doctors/${doctorId}/patients/${patientId}/files/${fileId}/download-url`,
      remove: (patientId: string, fileId: string) =>
        `/api/patients/${patientId}/files/${fileId}`,
    },
  },
  accessRequests: {
    list: "/api/access-requests",
    details: (requestId: string) => `/api/access-requests/${requestId}`,
  },
  appointments: {
    list: "/api/appointments",
    details: (appointmentId: string) => `/api/appointments/${appointmentId}`,
    book: "/api/appointments/book",
    cancel: (appointmentId: string) =>
      `/api/appointments/${appointmentId}/cancel`,
    reschedule: (appointmentId: string) =>
      `/api/appointments/${appointmentId}/reschedule`,
    complete: (appointmentId: string) =>
      `/api/appointments/${appointmentId}/complete`,
    noShow: (appointmentId: string) =>
      `/api/appointments/${appointmentId}/no-show`,
    files: {
      list: (appointmentId: string) =>
        `/api/appointments/${appointmentId}/files`,
      upload: (appointmentId: string) =>
        `/api/appointments/${appointmentId}/files`,
      detail: (appointmentId: string, fileId: string) =>
        `/api/appointments/${appointmentId}/files/${fileId}`,
      download: (appointmentId: string, fileId: string) =>
        `/api/appointments/${appointmentId}/files/${fileId}/download`,
      unlink: (appointmentId: string, fileId: string) =>
        `/api/appointments/${appointmentId}/files/${fileId}`,
    },
  },
  schedule: {
    get: (doctorId: string) => `/api/doctors/${doctorId}/schedule`,
    update: (doctorId: string) => `/api/doctors/${doctorId}/schedule`,
    updateSettings: (doctorId: string) =>
      `/api/doctors/${doctorId}/schedule/settings`,
    addDay: (doctorId: string) => `/api/doctors/${doctorId}/schedule/day`,
    updateDay: (doctorId: string, day: string) =>
      `/api/doctors/${doctorId}/schedule/day/${day}`,
    deleteDay: (doctorId: string, day: string) =>
      `/api/doctors/${doctorId}/schedule/day/${day}`,
    addException: (doctorId: string) =>
      `/api/doctors/${doctorId}/schedule/exception`,
    updateExceptions: (doctorId: string) =>
      `/api/doctors/${doctorId}/schedule/exceptions`,
    deleteException: (doctorId: string, exceptionId: string) =>
      `/api/doctors/${doctorId}/schedule/exception/${exceptionId}`,
    slots: (doctorId: string) => `/api/doctors/${doctorId}/slots`,
  },
  appointmentTypes: {
    available: (doctorId: string) =>
      `/api/doctors/${doctorId}/appointment-types/available`,
    list: (doctorId: string) => `/api/doctors/${doctorId}/appointment-types`,
    create: (doctorId: string) => `/api/doctors/${doctorId}/appointment-types`,
    update: (doctorId: string, typeId: string) =>
      `/api/doctors/${doctorId}/appointment-types/${typeId}`,
    delete: (doctorId: string, typeId: string) =>
      `/api/doctors/${doctorId}/appointment-types/${typeId}`,
  },
  orderCatalogImaging: '/api/doctors/order-catalog/imaging',
  orders: {
    list: '/api/doctors/orders',
    create: '/api/doctors/orders',
    createLab: '/api/doctors/orders/lab',
    createImaging: '/api/doctors/orders/imaging',
    createProcedures: '/api/doctors/orders/procedures',
    createReferrals: '/api/doctors/orders/referrals',
    byId: (orderId: string) => `/api/doctors/orders/${orderId}`,
    cancel: (orderId: string) => `/api/doctors/orders/${orderId}/cancel`,
    status: (orderId: string) => `/api/doctors/orders/${orderId}/status`,
  },
  documents: {
    generate: '/api/documents/generate',
  },
  /** GET — internal staff directory (doctor / secretary). API-3 */
  internalDirectory: '/api/doctors/internal/directory',
} as const;
