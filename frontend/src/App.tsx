import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// ─── Public / Auth pages ──────────────────────────────────────────────────────
import WelcomePage from '@/pages/welcome/WelcomePage';
import LoginPage from '@/pages/auth/login/LoginPage';
import SignupPage from '@/pages/auth/signup/SignupPage';
import ForgotPasswordPage from '@/pages/auth/password/forgot-password/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/password/reset-password/ResetPasswordPage';
import VerifyOtpPage from '@/pages/auth/verify-otp/VerifyOtpPage';
import SignupSuccessPage from '@/pages/auth/signup-success/SignupSuccessPage';
import OnboardingPage from '@/pages/onboarding/OnboardingPage';
import ConnectionTestPage from '@/pages/connection-test/ConnectionTestPage';
import NotFoundPage from '@/pages/not-found/NotFoundPage';

// ─── Doctor pages ─────────────────────────────────────────────────────────────
import DoctorLayout from '@/layout';
import DoctorDashboardPage from '@/pages/doctor/dashboard/DoctorDashboardPage';
import DoctorAppointmentsPage from '@/pages/doctor/appointments/DoctorAppointmentsPage';
import DoctorPatientsPage from '@/pages/doctor/patients/DoctorPatientsPage';
import DoctorOnlineConsultationsPage from '@/pages/doctor/online-consultations/DoctorOnlineConsultationsPage';
import DoctorWorkSchedulePage from '@/pages/doctor/work-schedule/DoctorWorkSchedulePage';
import DoctorMedicalRecordsPage from '@/pages/doctor/medical-records/DoctorMedicalRecordsPage';
import DoctorAccessRequestsPage from '@/pages/doctor/access-requests/DoctorAccessRequestsPage';
import DoctorDoctorsDirectoryPage from '@/pages/doctor/doctors-directory/DoctorDoctorsDirectoryPage';
import DoctorClinicLocationPage from '@/pages/doctor/clinic-location/DoctorClinicLocationPage';
import DoctorNotificationPage from '@/pages/doctor/notification/DoctorNotificationPage';
import DoctorProfileSettingsPage from '@/pages/doctor/profile-settings/DoctorProfileSettingsPage';

// ─── Admin pages ──────────────────────────────────────────────────────────────
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboardPage from '@/pages/admin/dashboard/AdminDashboardPage';
import AdminDoctorsPage from '@/pages/admin/doctors/AdminDoctorsPage';
import AdminDoctorDetailsPage from '@/pages/admin/doctors/AdminDoctorDetailsPage';
import AdminPatientsPage from '@/pages/admin/patients/AdminPatientsPage';
import AdminPatientDetailsPage from '@/pages/admin/patients/AdminPatientDetailsPage';
import AdminSecretariesPage from '@/pages/admin/secretaries/AdminSecretariesPage';
import AdminSecretaryDetailsPage from '@/pages/admin/secretaries/AdminSecretaryDetailsPage';
import AdminSecretaryAppointmentsPage from '@/pages/admin/secretaries/AdminSecretaryAppointmentsPage';
import AdminSecretaryAppointmentsManagementPage from '@/pages/admin/secretaries/AdminSecretaryAppointmentsManagementPage';
import AdminMedicalContentPage from '@/pages/admin/medical-content/AdminMedicalContentPage';
import AdminContentReviewPage from '@/pages/admin/content-review/AdminContentReviewPage';
import AdminMedicalNewsPage from '@/pages/admin/medical-news/AdminMedicalNewsPage';
import AdminServiceTypesPage from '@/pages/admin/service-types/AdminServiceTypesPage';
import AdminAppointmentsPage from '@/pages/admin/appointments/AdminAppointmentsPage';
import AdminMedicalFileOptionsPage from '@/pages/admin/medical-file-options/AdminMedicalFileOptionsPage';
import AdminMedicalOrdersPage from '@/pages/admin/medical-orders/AdminMedicalOrdersPage';
import AdminVerificationRequestsPage from '@/pages/admin/verification-requests/AdminVerificationRequestsPage';
import AdminVerificationRequestDetailsPage from '@/pages/admin/verification-requests/AdminVerificationRequestDetailsPage';
import AdminSystemLogsPage from '@/pages/admin/system-logs/AdminSystemLogsPage';
import AdminSettingsPage from '@/pages/admin/settings/AdminSettingsPage';
import AdminServicesPage from '@/pages/admin/services/AdminServicesPage';
import AdminAnalyticsPage from '@/pages/admin/analytics/AdminAnalyticsPage';
import AdminComplaintsPage from '@/pages/admin/complaints/AdminComplaintsPage';
import AdminComplaintDetailsPage from '@/pages/admin/complaints/AdminComplaintDetailsPage';

// ─── Routing guards ───────────────────────────────────────────────────────────
import ProtectedRoute, { GuestRoute, RootRedirect } from '@/routes/ProtectedRoute';
import { PageTransition } from '@/motion';

// ─────────────────────────────────────────────────────────────────────────────
// PublicPagesLayout
// Shared animated shell for all public / auth pages.
// AnimatePresence lives here so enter + exit transitions play correctly
// as users move between /login → /signup → /forgot-password, etc.
// ─────────────────────────────────────────────────────────────────────────────
function PublicPagesLayout() {
  const location = useLocation();
  return (
    <AnimatePresence mode='wait'>
      <PageTransition key={location.pathname}>
        <Outlet />
      </PageTransition>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className='font-cairo'>
      <Routes>

        {/* ── "/" → smart redirect (role dashboard | /welcome) ───────── */}
        <Route path='/' element={<RootRedirect />} />

        {/* ── Guest-only pages ────────────────────────────────────────
            Already-authenticated users are immediately redirected to
            their role dashboard so they never see auth pages again.    */}
        <Route element={<GuestRoute />}>
          <Route element={<PublicPagesLayout />}>
            <Route path='/welcome'         element={<WelcomePage />} />
            <Route path='/login'           element={<LoginPage />} />
            <Route path='/signup'          element={<SignupPage />} />
            <Route path='/forgot-password' element={<ForgotPasswordPage />} />
            <Route path='/reset-password'  element={<ResetPasswordPage />} />
          </Route>
        </Route>

        {/* ── Auth-flow pages ─────────────────────────────────────────
            Not blocked for authenticated users: a doctor might need
            to re-verify OTP or complete onboarding after first login. */}
        <Route element={<PublicPagesLayout />}>
          <Route path='/verify-otp'     element={<VerifyOtpPage />} />
          <Route path='/signup-success' element={<SignupSuccessPage />} />
          <Route path='/onboarding'     element={<OnboardingPage />} />
          <Route path='/connection-test' element={<ConnectionTestPage />} />
        </Route>

        {/* ── Doctor protected routes ──────────────────────────────────
            Requires: authenticated + role === 'doctor'
            Wrong role → redirected to their own role root.
            No token   → /login?next=<intended-path>                   */}
        <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
          <Route path='/doctor' element={<DoctorLayout />}>
            <Route index                       element={<Navigate to='dashboard'            replace />} />
            <Route path='dashboard'            element={<DoctorDashboardPage />} />
            <Route path='appointments'         element={<DoctorAppointmentsPage />} />
            <Route path='patients'             element={<DoctorPatientsPage />} />
            <Route path='online-consultations' element={<DoctorOnlineConsultationsPage />} />
            <Route path='work-schedule'        element={<DoctorWorkSchedulePage />} />
            <Route path='medical-records'      element={<DoctorMedicalRecordsPage />} />
            <Route path='access-requests'      element={<DoctorAccessRequestsPage />} />
            <Route path='doctors-directory'    element={<DoctorDoctorsDirectoryPage />} />
            <Route path='clinic-location'      element={<DoctorClinicLocationPage />} />
            <Route path='notification'         element={<DoctorNotificationPage />} />
            <Route path='profile-settings'     element={<DoctorProfileSettingsPage />} />
          </Route>
        </Route>

        {/* ── Admin protected routes ───────────────────────────────────
            Requires: authenticated + role === 'admin'                 */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path='/admin' element={<AdminLayout />}>
            <Route index                         element={<Navigate to='overview' replace />} />
            <Route path='overview'               element={<AdminDashboardPage />} />
            <Route path='doctors'                element={<AdminDoctorsPage />} />
            <Route path='doctors/:doctorId'      element={<AdminDoctorDetailsPage />} />
            <Route path='patients'               element={<AdminPatientsPage />} />
            <Route path='patients/:patientId'    element={<AdminPatientDetailsPage />} />
            <Route path='secretaries'                                  element={<AdminSecretariesPage />} />
            <Route path='secretaries/:secretaryId'                     element={<AdminSecretaryDetailsPage />} />
            <Route path='secretaries/:secretaryId/appointments'        element={<AdminSecretaryAppointmentsPage />} />
            <Route path='secretaries/:secretaryId/appointments/manage' element={<AdminSecretaryAppointmentsManagementPage />} />
            <Route path='medical-content'       element={<AdminMedicalContentPage />} />
            <Route path='content-review'        element={<AdminContentReviewPage />} />
            <Route path='medical-news'          element={<AdminMedicalNewsPage />} />
            <Route path='service-types'         element={<AdminServiceTypesPage />} />
            <Route path='appointments'          element={<AdminAppointmentsPage />} />
            <Route path='medical-file-options'  element={<AdminMedicalFileOptionsPage />} />
            <Route path='medical-orders'        element={<AdminMedicalOrdersPage />} />
            <Route path='verification-requests' element={<AdminVerificationRequestsPage />} />
            <Route path='verification-requests/:requestId' element={<AdminVerificationRequestDetailsPage />} />
            <Route path='complaints' element={<AdminComplaintsPage />} />
            <Route path='complaints/:complaintId' element={<AdminComplaintDetailsPage />} />
            <Route path='system-logs'           element={<AdminSystemLogsPage />} />
            <Route path='settings'              element={<AdminSettingsPage />} />
            <Route path='services'              element={<AdminServicesPage />} />
            <Route path='analytics'             element={<AdminAnalyticsPage />} />
            {/* legacy /admin/dashboard → canonical path */}
            <Route path='dashboard'             element={<Navigate to='/admin/overview' replace />} />
          </Route>
        </Route>

        {/* ── Catch-all 404 ───────────────────────────────────────── */}
        <Route path='*' element={<NotFoundPage />} />

      </Routes>
    </div>
  );
}
