import type { MedicalOrderCatalogKind } from "@/lib/admin/types";

function orderCatalogSegment(kind: MedicalOrderCatalogKind): string {
  switch (kind) {
    case "lab":
      return "lab-tests";
    case "imaging":
      return "imaging";
    case "procedure":
      return "procedures";
    case "referral":
      return "referrals";
    default: {
      const _ex: never = kind;
      return _ex;
    }
  }
}

export const adminEndpoints = {
  doctors: {
    list: "/api/admin/doctors",
    details: (doctorId: string) => `/api/admin/doctors/${doctorId}`,
    analyticsDiagnosis: (doctorId: string) =>
      `/api/admin/doctors/${doctorId}/analytics/diagnosis`,
    analyticsSummary: (doctorId: string) =>
      `/api/admin/doctors/${doctorId}/analytics/summary`,
  },
  patients: {
    list: "/api/admin/patients",
    details: (patientId: string) => `/api/admin/patients/${patientId}`,
    activate: (patientId: string) =>
      `/api/admin/patients/${patientId}/activate`,
    suspend: (patientId: string) => `/api/admin/patients/${patientId}/suspend`,
    unsuspend: (patientId: string) =>
      `/api/admin/patients/${patientId}/unsuspend`,
    files: {
      list: (patientId: string) => `/api/admin/patients/${patientId}/files`,
      download: (patientId: string, fileId: string) =>
        `/api/admin/patients/${patientId}/files/${fileId}/download`,
    },
  },
  appointments: {
    list: "/appointments",
    details: (appointmentId: string) => `/api/appointments/${appointmentId}`,
    cancel: (appointmentId: string) => `/appointments/${appointmentId}/cancel`,
  },
  accessRequests: {
    list: "/api/access-requests",
    details: (requestId: string) => `/api/access-requests/${requestId}`,
  },
  verificationRequests: {
    list: "/api/admin/doctor-verification-requests",
    details: (requestId: string) =>
      `/api/admin/doctor-verification-requests/${requestId}`,
    review: (requestId: string) =>
      `/api/admin/doctor-verification-requests/${requestId}`,
  },
  secretaries: {
    list: "/api/admin/secretaries",
  },
  users: {
    list: "/api/admin/users",
    create: "/api/admin/users",
    offboard: (userId: string) => `/api/admin/users/${userId}/offboard`,
    reboard: (userId: string) => `/api/admin/users/${userId}/reboard`,
    doctorRestoreRequests: "/api/admin/users/doctor-restore-requests",
    reviewRestoreRequest: (userId: string) =>
      `/api/admin/users/${userId}/restore-request/review`,
  },
  auditLogs: {
    list: "/api/admin/audit-logs",
  },
  complaints: {
    list: "/api/complaints",
    details: (complaintId: string) => `/api/complaints/${complaintId}`,
    updateStatus: (complaintId: string) =>
      `/api/complaints/${complaintId}/status`,
  },
  content: {
    list: "/api/admin/content",
    create: "/api/admin/content",
    mine: "/api/admin/content/mine",
    details: (id: string) => `/api/admin/content/${id}`,
    update: (id: string) => `/api/admin/content/${id}`,
    submitReview: (id: string) => `/api/admin/content/${id}/submit-review`,
    approve: (id: string) => `/api/admin/content/${id}/approve`,
    reject: (id: string) => `/api/admin/content/${id}/reject`,
    publish: (id: string) => `/api/admin/content/${id}/publish`,
    archive: (id: string) => `/api/admin/content/${id}/archive`,
  },
  contentTemplates: {
    list: "/api/admin/content-templates",
    create: "/api/admin/content-templates",
    update: (id: string) => `/api/admin/content-templates/${id}`,
    disable: (id: string) => `/api/admin/content-templates/${id}/disable`,
  },
  news: {
    ingest: "/api/admin/news/ingest",
    pending: "/api/admin/news/pending",
  },
  /**
   * كتالوج الطلبات الطبية — مسار لكل فئة (API-3: GET/POST /admin/order-catalog/lab-tests|imaging|procedures|…).
   */
  orderCatalog: {
    collection: (kind: MedicalOrderCatalogKind) =>
      `/api/admin/order-catalog/${orderCatalogSegment(kind)}`,
    item: (kind: MedicalOrderCatalogKind, id: string) =>
      `/api/admin/order-catalog/${orderCatalogSegment(kind)}/${id}`,
  },
  /** API-3.pdf — GET/POST/PATCH/DELETE /api/admin/lookups */
  lookups: {
    list: "/api/admin/lookups",
    detail: (id: string) => `/api/admin/lookups/${id}`,
  },

  facilities: {
    list: "/api/admin/facilities",
    create: "/api/admin/facilities",
    getById: (id: string) => `/api/admin/facilities/${id}`,
    update: (id: string) => `/api/admin/facilities/${id}`,
    action: (id: string) => `/api/admin/facilities/${id}`,
    updateStatus: (id: string) => `/api/admin/facilities/${id}/status`,
    delete: (id: string) => `/api/admin/facilities/${id}`,
    listDoctors: (id: string) => `/api/admin/facilities/${id}/doctors`,
  },
  serviceTypes: {
    list: "/api/service-types",
    listPublic: "/api/services/types",
    create: "/api/service-types",
    update: (id: string) => `/api/service-types/${id}`,
  },
  serviceProviders: {
    list: "/api/services",
    getById: (id: string) => `/api/admin/services/${id}`,
    create: "/api/admin/service-providers",
    update: (id: string) => `/api/admin/service-providers/${id}`,
    updateStatus: (id: string) => `/api/admin/service-providers/${id}/status`,
  },
} as const;
