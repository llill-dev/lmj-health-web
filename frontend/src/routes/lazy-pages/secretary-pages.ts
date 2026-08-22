import { lazy } from "react";

export const SecretaryDashboardPage = lazy(
  () => import("@/pages/secretary/dashboard"),
);

export const SecretaryPatientsPage = lazy(
  () => import("@/pages/secretary/patients"),
);

export const SecretaryCreateTemporaryPatientPage = lazy(
  () => import("@/pages/secretary/create-temporary-patient"),
);

export const SecretaryBookAppointmentPage = lazy(
  () => import("@/pages/secretary/book-appointment"),
);

export const SecretaryDoctorSchedulePage = lazy(
  () => import("@/pages/secretary/doctor-schedule"),
);

export const SecretaryPatientFilesPage = lazy(
  () => import("@/pages/secretary/patient-files"),
);

export const SecretaryDoctorsDirectoryPage = lazy(
  () => import("@/pages/secretary/doctors-directory"),
);

export const SecretaryAppointmentsPage = lazy(
  () => import("@/pages/secretary/appointments"),
);

export const SecretaryAppointmentSuggestionsPage = lazy(
  () => import("@/pages/secretary/appointment-suggestions"),
);

export const SecretaryWaitlistPage = lazy(
  () => import("@/pages/secretary/waitlist"),
);

export const SecretaryProfilePage = lazy(
  () => import("@/pages/secretary/profile"),
);

export const SecretaryNotificationsPage = lazy(
  () => import("@/pages/secretary/notifications"),
);
