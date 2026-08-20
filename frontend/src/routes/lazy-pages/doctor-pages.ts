import { lazyWithRetry } from "@/lib/routing/lazyWithRetry";

export const DoctorDashboardPage = lazyWithRetry(
  () => import("@/pages/doctor/dashboard/DoctorDashboardPage"),
);
export const DoctorAppointmentsPage = lazyWithRetry(
  () => import("@/pages/doctor/appointments/DoctorAppointmentsPage"),
);
export const DoctorWaitlistPage = lazyWithRetry(
  () => import("@/pages/doctor/waitlist/DoctorWaitlistPage"),
);
export const DoctorPatientsPage = lazyWithRetry(
  () => import("@/pages/doctor/patients/DoctorPatientsPage"),
);
export const DoctorPatientDetailsPage = lazyWithRetry(
  () => import("@/pages/doctor/patients/DoctorPatientDetailsPage"),
);
export const DoctorOnlineConsultationsPage = lazyWithRetry(
  () =>
    import("@/pages/doctor/online-consultations/DoctorOnlineConsultationsPage"),
);
export const DoctorWorkSchedulePage = lazyWithRetry(
  () => import("@/pages/doctor/work-schedule/DoctorWorkSchedulePage"),
);
export const DoctorAppointmentTypesPage = lazyWithRetry(
  () => import("@/pages/doctor/appointment-types/DoctorAppointmentTypesPage"),
);
export const DoctorClinicalLibraryPage = lazyWithRetry(
  () => import("@/pages/doctor/clinical-library/DoctorClinicalLibraryPage"),
);
export const DoctorMedicalRecordsPage = lazyWithRetry(
  () => import("@/pages/doctor/medical-records/DoctorMedicalRecordsPage"),
);
export const DoctorPrescriptionPage = lazyWithRetry(
  () => import("@/pages/doctor/prescription/DoctorPrescriptionPage"),
);
export const DoctorPrescriptionPreviewPage = lazyWithRetry(
  () => import("@/pages/doctor/prescription/DoctorPrescriptionPreviewPage"),
);
export const DoctorRadiologyWorkspacePage = lazyWithRetry(
  () => import("@/pages/doctor/radiology/DoctorRadiologyWorkspacePage"),
);
export const DoctorRadiologyManualPage = lazyWithRetry(
  () => import("@/pages/doctor/radiology/DoctorRadiologyManualPage"),
);
export const DoctorRadiologyPreviewPage = lazyWithRetry(
  () => import("@/pages/doctor/radiology/DoctorRadiologyPreviewPage"),
);
export const DoctorMedicalRequestsPage = lazyWithRetry(
  () => import("@/pages/doctor/medical-requests/DoctorMedicalRequestsPage"),
);
export const DoctorEncountersPage = lazyWithRetry(
  () => import("@/pages/doctor/encounters/DoctorEncountersPage"),
);
export const DoctorEncounterWorkspacePage = lazyWithRetry(
  () => import("@/pages/doctor/encounters/DoctorEncounterWorkspacePage"),
);
export const DoctorEncounterLabWorkspacePage = lazyWithRetry(
  () => import("@/pages/doctor/encounters/DoctorEncounterLabWorkspacePage"),
);
export const DoctorEncounterProcedureWorkspacePage = lazyWithRetry(
  () =>
    import("@/pages/doctor/encounters/DoctorEncounterProcedureWorkspacePage"),
);
export const DoctorEncounterReferralWorkspacePage = lazyWithRetry(
  () =>
    import("@/pages/doctor/encounters/DoctorEncounterReferralWorkspacePage"),
);
export const DoctorEncounterOrderManualPage = lazyWithRetry(
  () => import("@/pages/doctor/encounters/DoctorEncounterOrderManualPage"),
);
export const DoctorEncounterOrderPreviewPage = lazyWithRetry(
  () => import("@/pages/doctor/encounters/DoctorEncounterOrderPreviewPage"),
);
export const DoctorEncounterSummaryPage = lazyWithRetry(
  () => import("@/pages/doctor/encounters/DoctorEncounterSummaryPage"),
);
export const DoctorAccessRequestsPage = lazyWithRetry(
  () => import("@/pages/doctor/access-requests/DoctorAccessRequestsPage"),
);
export const DoctorDoctorsDirectoryPage = lazyWithRetry(
  () => import("@/pages/doctor/doctors-directory/DoctorDoctorsDirectoryPage"),
);
export const DoctorMedicalServicesDirectoryPage = lazyWithRetry(
  () =>
    import("@/pages/doctor/medical-services-directory/DoctorMedicalServicesDirectoryPage"),
);
export const DoctorMedicalServiceDetailsPage = lazyWithRetry(
  () =>
    import("@/pages/doctor/medical-services-directory/DoctorMedicalServiceDetailsPage"),
);
export const DoctorClinicLocationPage = lazyWithRetry(
  () => import("@/pages/doctor/clinic-location/DoctorClinicLocationPage"),
);
export const DoctorNotificationPage = lazyWithRetry(
  () => import("@/pages/doctor/notification/DoctorNotificationPage"),
);
export const DoctorProfileSettingsPage = lazyWithRetry(
  () => import("@/pages/doctor/profile-settings/DoctorProfileSettingsPage"),
);
export const DoctorProfilePersonalEditPage = lazyWithRetry(
  () => import("@/pages/doctor/profile-settings/DoctorProfilePersonalEditPage"),
);
export const DoctorProfileProfessionalEditPage = lazyWithRetry(
  () =>
    import("@/pages/doctor/profile-settings/DoctorProfileProfessionalEditPage"),
);
export const DoctorProfileSuccessPage = lazyWithRetry(
  () => import("@/pages/doctor/profile-settings/DoctorProfileSuccessPage"),
);
export const DeleteAccountPage = lazyWithRetry(
  () => import("@/pages/account-deletion/DeleteAccountPage"),
);
export const RestoreAccountPage = lazyWithRetry(
  () => import("@/pages/account-deletion/RestoreAccountPage"),
);
export const DoctorClinicAccountsPage = lazyWithRetry(
  () => import("@/pages/doctor/clinic-accounts/DoctorClinicAccountsPage"),
);
export const DoctorClinicInvoicesPage = lazyWithRetry(
  () => import("@/pages/doctor/clinic-accounts/DoctorClinicInvoicesPage"),
);
export const DoctorClinicCreateInvoicePage = lazyWithRetry(
  () => import("@/pages/doctor/clinic-accounts/DoctorClinicCreateInvoicePage"),
);
export const DoctorClinicExpensesPage = lazyWithRetry(
  () => import("@/pages/doctor/clinic-accounts/DoctorClinicExpensesPage"),
);
export const DoctorClinicAddPaymentPage = lazyWithRetry(
  () => import("@/pages/doctor/clinic-accounts/DoctorClinicAddPaymentPage"),
);
export const DoctorClinicFinancialReportsPage = lazyWithRetry(
  () =>
    import("@/pages/doctor/clinic-accounts/DoctorClinicFinancialReportsPage"),
);
export const DoctorClinicFinancialSettingsPage = lazyWithRetry(
  () =>
    import("@/pages/doctor/clinic-accounts/DoctorClinicFinancialSettingsPage"),
);
export const DoctorClinicServicesPage = lazyWithRetry(
  () => import("@/pages/doctor/clinic-accounts/DoctorClinicServicesPage"),
);
export const DoctorFacilitiesPage = lazyWithRetry(
  () => import("@/pages/doctor/facilities/DoctorFacilitiesPage"),
);
export const DoctorActivityLogPage = lazyWithRetry(
  () => import("@/pages/doctor/activity-log/DoctorActivityLogPage"),
);
export const DoctorSupportPage = lazyWithRetry(
  () => import("@/pages/doctor/support/DoctorSupportPage"),
);
export const DoctorSecretariesPage = lazyWithRetry(
  () => import("@/pages/doctor/secretaries/DoctorSecretariesPage"),
);
