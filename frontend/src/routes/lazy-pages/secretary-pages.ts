import { lazy } from 'react';

export const SecretaryDashboardPage = lazy(
  () => import('@/pages/secretary/SecretaryDashboardPage'),
);

export const SecretaryPatientsPage = lazy(
  () => import('@/pages/secretary/SecretaryPatientsPage'),
);

export const SecretaryCreateTemporaryPatientPage = lazy(
  () => import('@/pages/secretary/SecretaryCreateTemporaryPatientPage'),
);

export const SecretaryBookAppointmentPage = lazy(
  () => import('@/pages/secretary/SecretaryBookAppointmentPage'),
);

export const SecretaryDoctorSchedulePage = lazy(
  () => import('@/pages/secretary/SecretaryDoctorSchedulePage'),
);

export const SecretaryPatientFilesPage = lazy(
  () => import('@/pages/secretary/SecretaryPatientFilesPage'),
);

export const SecretaryDoctorsDirectoryPage = lazy(
  () => import('@/pages/secretary/SecretaryDoctorsDirectoryPage'),
);

export const SecretaryAppointmentsPage = lazy(
  () => import('@/pages/secretary/SecretaryAppointmentsPage'),
);

export const SecretaryAppointmentSuggestionsPage = lazy(
  () => import('@/pages/secretary/SecretaryAppointmentSuggestionsPage'),
);

export const SecretaryWaitlistPage = lazy(
  () => import('@/pages/secretary/SecretaryWaitlistPage'),
);

export const SecretaryProfilePage = lazy(
  () => import('@/pages/secretary/SecretaryProfilePage'),
);

export const SecretaryNotificationsPage = lazy(
  () => import('@/pages/secretary/SecretaryNotificationsPage'),
);
