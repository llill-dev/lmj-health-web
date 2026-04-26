// Re-export all hooks from a central location
export {
  useAppointments,
  useAppointment,
  useCreateAppointment,
  useUpdateAppointmentStatus,
  useCancelAppointment,
  useCompleteAppointment,
} from './useAppointments';
export {
  usePatients,
  usePatient,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
  useUpdatePatientStatus,
} from './usePatients';
export { useDashboardStats } from './useDashboardStats';
export { useWorkSchedule, useUpdateWorkSchedule } from './useWorkSchedule';
export { useAdminPatient } from './useAdminPatient';
export { useAdminPatientFiles } from './useAdminPatientFiles';
export {
  useAdminContentList,
  useAdminContentById,
  useSubmitContentReview,
  useApproveContent,
  useRejectContent,
  usePublishContent,
  useArchiveContent,
  useCreateAdminContent,
  useUpdateAdminContent,
} from './useAdminContent';
export { useAdminContentStatusCounts } from './useAdminContentStatusCounts';

// Admin — Analytics
export {
  useAdminPlatformStats,
  useTopApprovedDoctors,
  useRecentAppointments,
} from './useAdminAnalytics';

// Admin — Secretaries
export {
  useAdminSecretariesList,
  useAdminOffboardUser,
} from './useAdminSecretaries';

// Admin — Audit Logs
export { AUDIT_LOGS_KEYS, useAdminAuditLogs } from './useAdminAuditLogs';

// Admin — Notifications (GET/PATCH حسب API-3.pdf)
export {
  adminNotificationsQueryKeys,
  useAdminNotificationsPage,
  useAdminUnreadNotificationCount,
} from './useAdminNotifications';

// Admin — Services (Facilities, Service Types, Providers)
export {
  SERVICES_KEYS,
  useFacilitiesList,
  useFacilityById,
  useCreateFacility,
  useUpdateFacility,
  useUpdateFacilityStatus,
  useDeleteFacility,
  useServiceTypesList,
  useCreateServiceType,
  useUpdateServiceType,
  useMutateServiceType,
  useServiceProvidersList,
  useCreateProvider,
  useUpdateProvider,
  useUpdateProviderStatus,
} from './useAdminServices';
