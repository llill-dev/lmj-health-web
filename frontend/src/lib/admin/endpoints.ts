import type { MedicalOrderCatalogKind } from '@/lib/admin/types';

function orderCatalogSegment(kind: MedicalOrderCatalogKind): string {
  switch (kind) {
    case 'lab':
      return 'lab-tests';
    case 'imaging':
      return 'imaging';
    case 'procedure':
      return 'procedures';
    case 'referral':
      return 'referrals';
    default: {
      const _ex: never = kind;
      return _ex;
    }
  }
}

export const adminEndpoints = {
  doctors: {
    list: '/api/admin/doctors',
    details: (doctorId: string) => `/api/admin/doctors/${doctorId}`,
    analyticsDiagnosis: (doctorId: string) =>
      `/api/admin/doctors/${doctorId}/analytics/diagnosis`,
    analyticsSummary: (doctorId: string) =>
      `/api/admin/doctors/${doctorId}/analytics/summary`,
  },
  patients: {
    list: '/api/admin/patients',
    details: (patientId: string) => `/api/admin/patients/${patientId}`,
    activate: (patientId: string) =>
      `/api/admin/patients/${patientId}/activate`,
    suspend: (patientId: string) => `/api/admin/patients/${patientId}/suspend`,
    unsuspend: (patientId: string) =>
      `/api/admin/patients/${patientId}/unsuspend`,
    files: {
      list: (patientId: string) => `/api/patients/${patientId}/files`,
      download: (patientId: string, fileId: string) =>
        `/api/patients/${patientId}/files/${fileId}/download`,
    },
  },
  appointments: {
    list: '/api/appointments',
    details: (appointmentId: string) => `/api/appointments/${appointmentId}`,
    cancel: (appointmentId: string) =>
      `/api/appointments/${appointmentId}/cancel`,
  },
  verificationRequests: {
    list: '/api/admin/doctor-verification-requests',
    details: (requestId: string) =>
      `/api/admin/doctor-verification-requests/${requestId}`,
    review: (requestId: string) =>
      `/api/admin/doctor-verification-requests/${requestId}`,
  },
  secretaries: {
    list: '/api/admin/secretaries',
  },
  users: {
    offboard: (userId: string) => `/api/admin/users/${userId}/offboard`,
  },
  auditLogs: {
    list: '/api/admin/audit-logs',
  },
  complaints: {
    list: '/api/complaints',
    details: (complaintId: string) => `/api/complaints/${complaintId}`,
    updateStatus: (complaintId: string) =>
      `/api/complaints/${complaintId}/status`,
  },
  content: {
    list: '/api/admin/content',
    create: '/api/admin/content',
    details: (id: string) => `/api/admin/content/${id}`,
    update: (id: string) => `/api/admin/content/${id}`,
    submitReview: (id: string) => `/api/admin/content/${id}/submit-review`,
    approve: (id: string) => `/api/admin/content/${id}/approve`,
    reject: (id: string) => `/api/admin/content/${id}/reject`,
    publish: (id: string) => `/api/admin/content/${id}/publish`,
    archive: (id: string) => `/api/admin/content/${id}/archive`,
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
} as const;
