import { lazyWithRetry } from "@/lib/routing/lazyWithRetry";

export const SecretaryDashboardPage = lazyWithRetry(
  () => import("@/pages/secretary/dashboard"),
);

export const SecretaryPatientsPage = lazyWithRetry(
  () => import("@/pages/secretary/patients"),
);

export const SecretaryCreateTemporaryPatientPage = lazyWithRetry(
  () => import("@/pages/secretary/create-temporary-patient"),
);

export const SecretaryBookAppointmentPage = lazyWithRetry(
  () => import("@/pages/secretary/book-appointment"),
);

export const SecretaryDoctorSchedulePage = lazyWithRetry(
  () => import("@/pages/secretary/doctor-schedule"),
);

export const SecretaryPatientFilesPage = lazyWithRetry(
  () => import("@/pages/secretary/patient-files"),
);

export const SecretaryDoctorsDirectoryPage = lazyWithRetry(
  () => import("@/pages/secretary/doctors-directory"),
);

export const SecretaryAppointmentsPage = lazyWithRetry(
  () => import("@/pages/secretary/appointments"),
);

export const SecretaryAppointmentSuggestionsPage = lazyWithRetry(
  () => import("@/pages/secretary/appointment-suggestions"),
);

export const SecretaryWaitlistPage = lazyWithRetry(
  () => import("@/pages/secretary/waitlist"),
);

export const SecretaryProfilePage = lazyWithRetry(
  () => import("@/pages/secretary/profile"),
);

export const SecretaryNotificationsPage = lazyWithRetry(
  () => import("@/pages/secretary/notifications"),
);
