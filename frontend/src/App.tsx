import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import WelcomePage from '@/pages/welcome/WelcomePage';
import LoginPage from '@/pages/auth/login/LoginPage';
import SignupPage from '@/pages/auth/signup/SignupPage';
import ForgotPasswordPage from '@/pages/auth/password/forgot-password/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/password/reset-password/ResetPasswordPage';
import VerifyOtpPage from '@/pages/auth/verify-otp/VerifyOtpPage';
import SignupSuccessPage from '@/pages/auth/signup-success/SignupSuccessPage';
import OnboardingPage from '@/pages/onboarding/OnboardingPage';
import ProtectedRoute from '@/routes/ProtectedRoute';
import DoctorLayout from '@/layout';
import DashboardPage from '@/page';
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
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboardPage from '@/pages/admin/dashboard/AdminDashboardPage';
import AdminDoctorsPage from '@/pages/admin/doctors/AdminDoctorsPage';
import AdminPatientsPage from '@/pages/admin/patients/AdminPatientsPage';
import AdminSecretariesPage from '@/pages/admin/secretaries/AdminSecretariesPage';
import AdminMedicalContentPage from '@/pages/admin/medical-content/AdminMedicalContentPage';
import AdminContentReviewPage from '@/pages/admin/content-review/AdminContentReviewPage';
import AdminMedicalNewsPage from '@/pages/admin/medical-news/AdminMedicalNewsPage';
import AdminServiceTypesPage from '@/pages/admin/service-types/AdminServiceTypesPage';
import AdminAppointmentsPage from '@/pages/admin/appointments/AdminAppointmentsPage';
import AdminMedicalFileOptionsPage from '@/pages/admin/medical-file-options/AdminMedicalFileOptionsPage';
import AdminVerificationRequestsPage from '@/pages/admin/verification-requests/AdminVerificationRequestsPage';
import AdminSystemLogsPage from '@/pages/admin/system-logs/AdminSystemLogsPage';
import AdminSettingsPage from '@/pages/admin/settings/AdminSettingsPage';
import AdminServicesPage from '@/pages/admin/services/AdminServicesPage';
import AdminAnalyticsPage from '@/pages/admin/analytics/AdminAnalyticsPage';
import NotFoundPage from '@/pages/not-found/NotFoundPage';
import { PageTransition } from '@/motion';

export default function App() {
  const location = useLocation();
  const isDoctorArea =
    location.pathname === '/' || location.pathname.startsWith('/doctor');
  const isAdminArea = location.pathname.startsWith('/admin');

  return (
    <AnimatePresence mode='wait'>
      {isDoctorArea ? (
        <Routes location={location}>
          <Route
            path='/'
            element={
              <DoctorLayout>
                <DashboardPage />
              </DoctorLayout>
            }
          />

          <Route
            path='/doctor'
            element={<DoctorLayout />}
          >
            <Route
              index
              element={
                <Navigate
                  to='dashboard'
                  replace
                />
              }
            />
            <Route
              path='dashboard'
              element={<DoctorDashboardPage />}
            />
            <Route
              path='appointments'
              element={<DoctorAppointmentsPage />}
            />
            <Route
              path='patients'
              element={<DoctorPatientsPage />}
            />
            <Route
              path='online-consultations'
              element={<DoctorOnlineConsultationsPage />}
            />
            <Route
              path='work-schedule'
              element={<DoctorWorkSchedulePage />}
            />
            <Route
              path='medical-records'
              element={<DoctorMedicalRecordsPage />}
            />
            <Route
              path='access-requests'
              element={<DoctorAccessRequestsPage />}
            />
            <Route
              path='doctors-directory'
              element={<DoctorDoctorsDirectoryPage />}
            />
            <Route
              path='clinic-location'
              element={<DoctorClinicLocationPage />}
            />
            <Route
              path='notification'
              element={<DoctorNotificationPage />}
            />
            <Route
              path='profile-settings'
              element={<DoctorProfileSettingsPage />}
            />
          </Route>

          <Route
            path='*'
            element={<NotFoundPage />}
          />
        </Routes>
      ) : isAdminArea ? (
        <Routes location={location}>
          <Route
            path='/admin'
            element={<AdminLayout />}
          >
            <Route
              index
              element={
                <Navigate
                  to='overview'
                  replace
                />
              }
            />
            <Route
              path='overview'
              element={<AdminDashboardPage />}
            />
            <Route
              path='doctors'
              element={<AdminDoctorsPage />}
            />
            <Route
              path='patients'
              element={<AdminPatientsPage />}
            />
            <Route
              path='secretaries'
              element={<AdminSecretariesPage />}
            />
            <Route
              path='medical-content'
              element={<AdminMedicalContentPage />}
            />
            <Route
              path='content-review'
              element={<AdminContentReviewPage />}
            />
            <Route
              path='medical-news'
              element={<AdminMedicalNewsPage />}
            />
            <Route
              path='service-types'
              element={<AdminServiceTypesPage />}
            />
            <Route
              path='appointments'
              element={<AdminAppointmentsPage />}
            />
            <Route
              path='medical-file-options'
              element={<AdminMedicalFileOptionsPage />}
            />
            <Route
              path='verification-requests'
              element={<AdminVerificationRequestsPage />}
            />
            <Route
              path='system-logs'
              element={<AdminSystemLogsPage />}
            />
            <Route
              path='settings'
              element={<AdminSettingsPage />}
            />
            <Route
              path='services'
              element={<AdminServicesPage />}
            />
            <Route
              path='analytics'
              element={<AdminAnalyticsPage />}
            />
            <Route
              path='dashboard'
              element={
                <Navigate
                  to='/admin/overview'
                  replace
                />
              }
            />
          </Route>

          <Route
            path='*'
            element={<NotFoundPage />}
          />
        </Routes>
      ) : (
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route
              path='/welcome'
              element={<WelcomePage />}
            />
            <Route
              path='/login'
              element={<LoginPage />}
            />
            <Route
              path='/signup'
              element={<SignupPage />}
            />
            <Route
              path='/forgot-password'
              element={<ForgotPasswordPage />}
            />
            <Route
              path='/reset-password'
              element={<ResetPasswordPage />}
            />
            <Route
              path='/verify-otp'
              element={<VerifyOtpPage />}
            />
            <Route
              path='/signup-success'
              element={<SignupSuccessPage />}
            />
            <Route
              path='/onboarding'
              element={<OnboardingPage />}
            />
            <Route
              path='*'
              element={<NotFoundPage />}
            />
          </Routes>
        </PageTransition>
      )}
    </AnimatePresence>
  );
}
