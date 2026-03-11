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
