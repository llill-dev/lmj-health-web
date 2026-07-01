import { lazy } from "react";

export const AdminDashboardPage = lazy(
  () => import("@/pages/admin/dashboard/AdminDashboardPage"),
);
export const AdminDoctorsPage = lazy(
  () => import("@/pages/admin/doctors/AdminDoctorsPage"),
);
export const AdminDoctorDetailsPage = lazy(
  () => import("@/pages/admin/doctors/AdminDoctorDetailsPage"),
);
export const AdminPatientsPage = lazy(
  () => import("@/pages/admin/patients/AdminPatientsPage"),
);
export const AdminUsersPage = lazy(
  () => import("@/pages/admin/users/AdminUsersPage"),
);
export const AdminPatientDetailsPage = lazy(
  () => import("@/pages/admin/patients/AdminPatientDetailsPage"),
);
export const AdminSecretariesPage = lazy(
  () => import("@/pages/admin/secretaries/AdminSecretariesPage"),
);
export const AdminSecretaryDetailsPage = lazy(
  () => import("@/pages/admin/secretaries/AdminSecretaryDetailsPage"),
);
export const AdminSecretaryAppointmentsPage = lazy(
  () => import("@/pages/admin/secretaries/AdminSecretaryAppointmentsPage"),
);
export const AdminSecretaryAppointmentsManagementPage = lazy(
  () =>
    import("@/pages/admin/secretaries/AdminSecretaryAppointmentsManagementPage"),
);
export const AdminMedicalContentPage = lazy(
  () => import("@/pages/admin/medical-content/AdminMedicalContentPage"),
);
export const AdminMedicalNewsQueuePage = lazy(
  () => import("@/pages/admin/medical-news/AdminMedicalNewsQueuePage"),
);
export const AdminContentTemplatesPage = lazy(
  () => import("@/pages/admin/content-templates/AdminContentTemplatesPage"),
);
export const AdminServiceTypesPage = lazy(
  () => import("@/pages/admin/service-types/AdminServiceTypesPage"),
);
export const AdminServiceProvidersPage = lazy(
  () => import("@/pages/admin/service-providers/AdminServiceProvidersPage"),
);
export const AdminAppointmentsPage = lazy(
  () => import("@/pages/admin/appointments/AdminAppointmentsPage"),
);
export const AdminAccessRequestsPage = lazy(
  () => import("@/pages/admin/access-requests/AdminAccessRequestsPage"),
);
export const AdminMedicalFileOptionsPage = lazy(
  () =>
    import("@/pages/admin/medical-file-options/AdminMedicalFileOptionsPage"),
);
export const AdminMedicalOrdersPage = lazy(
  () => import("@/pages/admin/medical-orders/AdminMedicalOrdersPage"),
);
export const AdminVerificationRequestsPage = lazy(
  () =>
    import("@/pages/admin/verification-requests/AdminVerificationRequestsPage"),
);
export const AdminVerificationRequestDetailsPage = lazy(
  () =>
    import("@/pages/admin/verification-requests/AdminVerificationRequestDetailsPage"),
);
export const AdminSystemLogsPage = lazy(
  () => import("@/pages/admin/system-logs/AdminSystemLogsPage"),
);
export const AdminSettingsPage = lazy(
  () => import("@/pages/admin/settings/AdminSettingsPage"),
);
export const AdminNotificationsPage = lazy(
  () => import("@/pages/admin/notifications/AdminNotificationsPage"),
);
export const AdminServicesPage = lazy(
  () => import("@/pages/admin/services/AdminServicesPage"),
);
export const AdminAnalyticsPage = lazy(
  () => import("@/pages/admin/analytics/AdminAnalyticsPage"),
);
export const AdminComplaintsPage = lazy(
  () => import("@/pages/admin/complaints/AdminComplaintsPage"),
);
export const AdminComplaintDetailsPage = lazy(
  () => import("@/pages/admin/complaints/AdminComplaintDetailsPage"),
);
export const AdminDoctorSpecializationsPage = lazy(
  () =>
    import("@/pages/admin/doctor-specializations/AdminDoctorSpecializationsPage"),
);
