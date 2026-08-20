import { lazyWithRetry } from "@/lib/routing/lazyWithRetry";

export const AdminDashboardPage = lazyWithRetry(
  () => import("@/pages/admin/dashboard/AdminDashboardPage"),
);
export const AdminDoctorsPage = lazyWithRetry(
  () => import("@/pages/admin/doctors/AdminDoctorsPage"),
);
export const AdminDoctorDetailsPage = lazyWithRetry(
  () => import("@/pages/admin/doctors/AdminDoctorDetailsPage"),
);
export const AdminPatientsPage = lazyWithRetry(
  () => import("@/pages/admin/patients/AdminPatientsPage"),
);
export const AdminUsersPage = lazyWithRetry(
  () => import("@/pages/admin/users/AdminUsersPage"),
);
export const AdminPatientDetailsPage = lazyWithRetry(
  () => import("@/pages/admin/patients/AdminPatientDetailsPage"),
);
export const AdminSecretariesPage = lazyWithRetry(
  () => import("@/pages/admin/secretaries/AdminSecretariesPage"),
);
export const AdminSecretaryDetailsPage = lazyWithRetry(
  () => import("@/pages/admin/secretaries/AdminSecretaryDetailsPage"),
);
export const AdminSecretaryAppointmentsPage = lazyWithRetry(
  () => import("@/pages/admin/secretaries/AdminSecretaryAppointmentsPage"),
);
export const AdminSecretaryAppointmentsManagementPage = lazyWithRetry(
  () =>
    import("@/pages/admin/secretaries/AdminSecretaryAppointmentsManagementPage"),
);
export const AdminMedicalContentPage = lazyWithRetry(
  () => import("@/pages/admin/medical-content/AdminMedicalContentPage"),
);
export const AdminMedicalNewsQueuePage = lazyWithRetry(
  () => import("@/pages/admin/medical-news/AdminMedicalNewsQueuePage"),
);
export const AdminContentTemplatesPage = lazyWithRetry(
  () => import("@/pages/admin/content-templates/AdminContentTemplatesPage"),
);
export const AdminServiceTypesPage = lazyWithRetry(
  () => import("@/pages/admin/service-types/AdminServiceTypesPage"),
);
export const AdminServiceProvidersPage = lazyWithRetry(
  () => import("@/pages/admin/service-providers/AdminServiceProvidersPage"),
);
export const AdminAppointmentsPage = lazyWithRetry(
  () => import("@/pages/admin/appointments/AdminAppointmentsPage"),
);
export const AdminAccessRequestsPage = lazyWithRetry(
  () => import("@/pages/admin/access-requests/AdminAccessRequestsPage"),
);
export const AdminMedicalFileOptionsPage = lazyWithRetry(
  () =>
    import("@/pages/admin/medical-file-options/AdminMedicalFileOptionsPage"),
);
export const AdminMedicalOrdersPage = lazyWithRetry(
  () => import("@/pages/admin/medical-orders/AdminMedicalOrdersPage"),
);
export const AdminVerificationRequestsPage = lazyWithRetry(
  () =>
    import("@/pages/admin/verification-requests/AdminVerificationRequestsPage"),
);
export const AdminVerificationRequestDetailsPage = lazyWithRetry(
  () =>
    import("@/pages/admin/verification-requests/AdminVerificationRequestDetailsPage"),
);
export const AdminSystemLogsPage = lazyWithRetry(
  () => import("@/pages/admin/system-logs/AdminSystemLogsPage"),
);
export const AdminSettingsPage = lazyWithRetry(
  () => import("@/pages/admin/settings/AdminSettingsPage"),
);
export const AdminNotificationsPage = lazyWithRetry(
  () => import("@/pages/admin/notifications/AdminNotificationsPage"),
);
export const AdminServicesPage = lazyWithRetry(
  () => import("@/pages/admin/services/AdminServicesPage"),
);
export const AdminAnalyticsPage = lazyWithRetry(
  () => import("@/pages/admin/analytics/AdminAnalyticsPage"),
);
export const AdminComplaintsPage = lazyWithRetry(
  () => import("@/pages/admin/complaints/AdminComplaintsPage"),
);
export const AdminComplaintDetailsPage = lazyWithRetry(
  () => import("@/pages/admin/complaints/AdminComplaintDetailsPage"),
);
export const AdminDoctorSpecializationsPage = lazyWithRetry(
  () =>
    import("@/pages/admin/doctor-specializations/AdminDoctorSpecializationsPage"),
);
export const AdminDoctorRestoreRequestsPage = lazyWithRetry(
  () =>
    import("@/pages/admin/doctor-restore-requests/AdminDoctorRestoreRequestsPage"),
);
export const AdminRestoreRequestDetailsPage = lazyWithRetry(
  () =>
    import("@/pages/admin/doctor-restore-requests/AdminRestoreRequestDetailsPage"),
);
export const AdminFacilitiesPage = lazyWithRetry(
  () => import("@/pages/admin/facilities/AdminFacilitiesPage"),
);
export const AdminDoctorProfileChangeRequestsPage = lazyWithRetry(
  () =>
    import("@/pages/admin/doctor-profile-change-requests/AdminDoctorProfileChangeRequestsPage"),
);
