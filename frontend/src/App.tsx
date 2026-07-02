import { Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import DoctorLayout from "@/layout";
import AdminLayout from "@/layouts/AdminLayout";
import { PageTransition } from "@/motion";
import ProtectedRoute, {
  GuestRoute,
  LegacySecretariesRedirect,
  RootRedirect,
} from "@/routes/ProtectedRoute";
import {
  DoctorDashboardRouteFallback,
  DoctorDetailsRouteFallback,
  DoctorNotificationRouteFallback,
  DoctorProfileRouteFallback,
  DoctorScheduleRouteFallback,
  DoctorSummaryRouteFallback,
  DoctorWorkspaceRouteFallback,
  PublicRouteFallback,
} from "@/routes/RouteFallbacks";
import * as AdminPages from "@/routes/lazy-pages/admin-pages";
import * as DoctorPages from "@/routes/lazy-pages/doctor-pages";
import * as MiscPages from "@/routes/lazy-pages/misc-pages";
import * as PublicPages from "@/routes/lazy-pages/public-pages";

function PublicPagesLayout() {
  const location = useLocation();

  return (
    <Suspense fallback={<PublicRouteFallback />}>
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </AnimatePresence>
    </Suspense>
  );
}

export default function App() {
  return (
    <div className="font-cairo">
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route element={<GuestRoute />}>
          <Route element={<PublicPagesLayout />}>
            <Route path="/welcome" element={<PublicPages.WelcomePage />} />
            <Route path="/login" element={<PublicPages.LoginPage />} />
            <Route path="/signup" element={<PublicPages.SignupPage />} />
            <Route
              path="/forgot-password"
              element={<PublicPages.ForgotPasswordPage />}
            />
            <Route
              path="/reset-password/verify"
              element={<PublicPages.ResetPasswordVerifyPage />}
            />
            <Route
              path="/reset-password"
              element={<PublicPages.ResetPasswordPage />}
            />
            <Route
              path="/reset-password/success"
              element={<PublicPages.ResetPasswordSuccessPage />}
            />
            <Route
              path="/claim-account"
              element={<PublicPages.ClaimAccountPage />}
            />
          </Route>
        </Route>

        <Route element={<PublicPagesLayout />}>
          <Route
            path="/doctor/restore-account"
            element={<DoctorPages.RestoreAccountPage />}
          />
          <Route
            path="/patient/restore-account"
            element={<DoctorPages.RestoreAccountPage />}
          />
          <Route path="/verify-otp" element={<PublicPages.VerifyOtpPage />} />
          <Route
            path="/signup-success"
            element={<PublicPages.SignupSuccessPage />}
          />
          <Route path="/onboarding" element={<PublicPages.OnboardingPage />} />
          <Route
            path="/connection-test"
            element={<MiscPages.ConnectionTestPage />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
          <Route
            path="/doctor/profile-update-success"
            element={
              <Suspense fallback={<DoctorProfileRouteFallback />}>
                <DoctorPages.DoctorProfileSuccessPage />
              </Suspense>
            }
          />
          <Route
            path="/doctor/delete-account"
            element={<DoctorPages.DeleteAccountPage />}
          />
          <Route path="/doctor" element={<DoctorLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<DoctorDashboardRouteFallback />}>
                  <DoctorPages.DoctorDashboardPage />
                </Suspense>
              }
            />
            <Route
              path="appointments"
              element={<DoctorPages.DoctorAppointmentsPage />}
            />
            <Route
              path="waitlist"
              element={<DoctorPages.DoctorWaitlistPage />}
            />
            <Route
              path="patients"
              element={<DoctorPages.DoctorPatientsPage />}
            />
            <Route
              path="patients/:patientId"
              element={
                <Suspense fallback={<DoctorDetailsRouteFallback />}>
                  <DoctorPages.DoctorPatientDetailsPage />
                </Suspense>
              }
            />
            <Route
              path="online-consultations"
              element={<DoctorPages.DoctorOnlineConsultationsPage />}
            />
            <Route
              path="work-schedule"
              element={
                <Suspense fallback={<DoctorScheduleRouteFallback />}>
                  <DoctorPages.DoctorWorkSchedulePage />
                </Suspense>
              }
            />
            <Route
              path="appointment-types"
              element={<DoctorPages.DoctorAppointmentTypesPage />}
            />
            <Route
              path="clinical-library"
              element={<DoctorPages.DoctorClinicalLibraryPage />}
            />
            <Route
              path="encounters"
              element={<DoctorPages.DoctorEncountersPage />}
            />
            <Route
              path="encounters/:patientId/:encounterId/summary"
              element={
                <Suspense fallback={<DoctorSummaryRouteFallback />}>
                  <DoctorPages.DoctorEncounterSummaryPage />
                </Suspense>
              }
            />
            <Route
              path="encounters/:patientId/:encounterId/prescription"
              element={
                <Suspense fallback={<DoctorWorkspaceRouteFallback />}>
                  <DoctorPages.DoctorPrescriptionPage />
                </Suspense>
              }
            />
            <Route
              path="encounters/:patientId/:encounterId/radiology/preview"
              element={
                <Suspense fallback={<DoctorWorkspaceRouteFallback />}>
                  <DoctorPages.DoctorEncounterOrderPreviewPage category="radiology" />
                </Suspense>
              }
            />
            <Route
              path="encounters/:patientId/:encounterId/radiology/manual"
              element={
                <Suspense fallback={<DoctorWorkspaceRouteFallback />}>
                  <DoctorPages.DoctorRadiologyManualPage />
                </Suspense>
              }
            />
            <Route
              path="encounters/:patientId/:encounterId/radiology"
              element={
                <Suspense fallback={<DoctorWorkspaceRouteFallback />}>
                  <DoctorPages.DoctorRadiologyWorkspacePage />
                </Suspense>
              }
            />
            <Route
              path="encounters/:patientId/:encounterId/lab/preview"
              element={
                <Suspense fallback={<DoctorWorkspaceRouteFallback />}>
                  <DoctorPages.DoctorEncounterOrderPreviewPage category="lab" />
                </Suspense>
              }
            />
            <Route
              path="encounters/:patientId/:encounterId/lab/manual"
              element={
                <Suspense fallback={<DoctorWorkspaceRouteFallback />}>
                  <DoctorPages.DoctorEncounterOrderManualPage category="lab" />
                </Suspense>
              }
            />
            <Route
              path="encounters/:patientId/:encounterId/lab"
              element={
                <Suspense fallback={<DoctorWorkspaceRouteFallback />}>
                  <DoctorPages.DoctorEncounterLabWorkspacePage />
                </Suspense>
              }
            />
            <Route
              path="encounters/:patientId/:encounterId/procedure/preview"
              element={
                <Suspense fallback={<DoctorWorkspaceRouteFallback />}>
                  <DoctorPages.DoctorEncounterOrderPreviewPage category="procedure" />
                </Suspense>
              }
            />
            <Route
              path="encounters/:patientId/:encounterId/procedure"
              element={
                <Suspense fallback={<DoctorWorkspaceRouteFallback />}>
                  <DoctorPages.DoctorEncounterProcedureWorkspacePage />
                </Suspense>
              }
            />
            <Route
              path="encounters/:patientId/:encounterId/referral"
              element={
                <Suspense fallback={<DoctorWorkspaceRouteFallback />}>
                  <DoctorPages.DoctorEncounterReferralWorkspacePage />
                </Suspense>
              }
            />
            <Route
              path="encounters/:patientId/:encounterId"
              element={
                <Suspense fallback={<DoctorWorkspaceRouteFallback />}>
                  <DoctorPages.DoctorEncounterWorkspacePage />
                </Suspense>
              }
            />
            <Route
              path="medical-records"
              element={<DoctorPages.DoctorMedicalRecordsPage />}
            />
            <Route
              path="prescription"
              element={<DoctorPages.DoctorPrescriptionPreviewPage />}
            />
            <Route
              path="radiology"
              element={<DoctorPages.DoctorRadiologyPreviewPage />}
            />
            <Route
              path="medical-requests"
              element={<DoctorPages.DoctorMedicalRequestsPage />}
            />
            <Route
              path="access-requests"
              element={<DoctorPages.DoctorAccessRequestsPage />}
            />
            <Route
              path="doctors-directory"
              element={<DoctorPages.DoctorDoctorsDirectoryPage />}
            />
            <Route
              path="medical-services-directory"
              element={<DoctorPages.DoctorMedicalServicesDirectoryPage />}
            />
            <Route
              path="clinic-location"
              element={<DoctorPages.DoctorClinicLocationPage />}
            />
            <Route
              path="accounts"
              element={<DoctorPages.DoctorClinicAccountsPage />}
            />
            <Route
              path="accounts/invoices"
              element={<DoctorPages.DoctorClinicInvoicesPage />}
            />
            <Route
              path="accounts/invoices/new"
              element={<DoctorPages.DoctorClinicCreateInvoicePage />}
            />
            <Route
              path="accounts/services"
              element={<DoctorPages.DoctorClinicServicesPage />}
            />
            <Route
              path="accounts/expenses"
              element={<DoctorPages.DoctorClinicExpensesPage />}
            />
            <Route
              path="accounts/payments/new"
              element={<DoctorPages.DoctorClinicAddPaymentPage />}
            />
            <Route
              path="accounts/reports"
              element={<DoctorPages.DoctorClinicFinancialReportsPage />}
            />
            <Route
              path="accounts/settings"
              element={<DoctorPages.DoctorClinicFinancialSettingsPage />}
            />
            <Route
              path="facilities"
              element={<DoctorPages.DoctorFacilitiesPage />}
            />
            <Route
              path="activity-log"
              element={<DoctorPages.DoctorActivityLogPage />}
            />
            <Route path="support" element={<DoctorPages.DoctorSupportPage />} />
            <Route
              path="secretaries"
              element={<DoctorPages.DoctorSecretariesPage />}
            />
            <Route
              path="notification"
              element={
                <Suspense fallback={<DoctorNotificationRouteFallback />}>
                  <DoctorPages.DoctorNotificationPage />
                </Suspense>
              }
            />
            <Route
              path="profile-settings"
              element={
                <Suspense fallback={<DoctorProfileRouteFallback />}>
                  <DoctorPages.DoctorProfileSettingsPage />
                </Suspense>
              }
            />
            <Route
              path="profile-settings/personal/edit"
              element={
                <Suspense fallback={<DoctorProfileRouteFallback />}>
                  <DoctorPages.DoctorProfilePersonalEditPage />
                </Suspense>
              }
            />
            <Route
              path="profile-settings/professional/edit"
              element={
                <Suspense fallback={<DoctorProfileRouteFallback />}>
                  <DoctorPages.DoctorProfileProfessionalEditPage />
                </Suspense>
              }
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route
              path="overview"
              element={<AdminPages.AdminDashboardPage />}
            />
            <Route
              path="notifications"
              element={<AdminPages.AdminNotificationsPage />}
            />
            <Route path="doctors" element={<AdminPages.AdminDoctorsPage />} />
            <Route
              path="doctor-specializations"
              element={<AdminPages.AdminDoctorSpecializationsPage />}
            />
            <Route path="users" element={<AdminPages.AdminUsersPage />} />
            <Route
              path="doctors/:doctorId"
              element={<AdminPages.AdminDoctorDetailsPage />}
            />
            <Route path="patients" element={<AdminPages.AdminPatientsPage />} />
            <Route
              path="patients/:patientId"
              element={<AdminPages.AdminPatientDetailsPage />}
            />
            <Route
              path="secretaries"
              element={<AdminPages.AdminSecretariesPage />}
            />
            <Route
              path="secretaries/:secretaryId"
              element={<AdminPages.AdminSecretaryDetailsPage />}
            />
            <Route
              path="secretaries/:secretaryId/appointments"
              element={<AdminPages.AdminSecretaryAppointmentsPage />}
            />
            <Route
              path="secretaries/:secretaryId/appointments/manage"
              element={<AdminPages.AdminSecretaryAppointmentsManagementPage />}
            />
            <Route
              path="medical-content"
              element={<AdminPages.AdminMedicalContentPage />}
            />
            <Route
              path="content-templates"
              element={<AdminPages.AdminContentTemplatesPage />}
            />
            <Route
              path="content-review"
              element={
                <Navigate to="/admin/medical-content?queue=review" replace />
              }
            />
            <Route
              path="medical-news"
              element={<AdminPages.AdminMedicalNewsQueuePage />}
            />
            <Route
              path="service-types"
              element={<AdminPages.AdminServiceTypesPage />}
            />
            <Route
              path="service-providers"
              element={<AdminPages.AdminServiceProvidersPage />}
            />
            <Route
              path="appointments"
              element={<AdminPages.AdminAppointmentsPage />}
            />
            <Route
              path="access-requests"
              element={<AdminPages.AdminAccessRequestsPage />}
            />
            <Route
              path="medical-file-options"
              element={<AdminPages.AdminMedicalFileOptionsPage />}
            />
            <Route
              path="medical-orders"
              element={<AdminPages.AdminMedicalOrdersPage />}
            />
            <Route
              path="verification-requests"
              element={<AdminPages.AdminVerificationRequestsPage />}
            />
            <Route
              path="verification-requests/:requestId"
              element={<AdminPages.AdminVerificationRequestDetailsPage />}
            />
            <Route
              path="doctor-restore-requests"
              element={<AdminPages.AdminDoctorRestoreRequestsPage />}
            />
            <Route
              path="doctor-restore-requests/:requestId"
              element={<AdminPages.AdminRestoreRequestDetailsPage />}
            />
            <Route
              path="facilities"
              element={<AdminPages.AdminFacilitiesPage />}
            />
            <Route
              path="complaints"
              element={<AdminPages.AdminComplaintsPage />}
            />
            <Route
              path="complaints/:complaintId"
              element={<AdminPages.AdminComplaintDetailsPage />}
            />
            <Route
              path="system-logs"
              element={<AdminPages.AdminSystemLogsPage />}
            />
            <Route path="settings" element={<AdminPages.AdminSettingsPage />} />
            <Route path="services" element={<AdminPages.AdminServicesPage />} />
            <Route
              path="analytics"
              element={<AdminPages.AdminAnalyticsPage />}
            />
            <Route
              path="dashboard"
              element={<Navigate to="/admin/overview" replace />}
            />
          </Route>
        </Route>

        <Route path="/secretaries" element={<LegacySecretariesRedirect />} />

        <Route path="*" element={<MiscPages.NotFoundPage />} />
      </Routes>
    </div>
  );
}
