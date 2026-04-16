import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';

const STALE = 5 * 60 * 1000;

export function useAdminPlatformStats() {
  const patients = useQuery({
    queryKey: ['admin', 'stats', 'patients'],
    queryFn: () => adminApi.patients.list({ limit: 1 }),
    staleTime: STALE,
  });

  const allDoctors = useQuery({
    queryKey: ['admin', 'stats', 'doctors', 'all'],
    queryFn: () => adminApi.doctors.list({ limit: 1 }),
    staleTime: STALE,
  });

  const approvedDoctors = useQuery({
    queryKey: ['admin', 'stats', 'doctors', 'approved'],
    queryFn: () => adminApi.doctors.list({ status: 'approved', limit: 1 }),
    staleTime: STALE,
  });

  const pendingDoctors = useQuery({
    queryKey: ['admin', 'stats', 'doctors', 'pending'],
    queryFn: () => adminApi.doctors.list({ status: 'pending', limit: 1 }),
    staleTime: STALE,
  });

  const appointments = useQuery({
    queryKey: ['admin', 'stats', 'appointments'],
    queryFn: () => adminApi.appointments.list({ limit: 1 }),
    staleTime: STALE,
  });

  const secretaries = useQuery({
    queryKey: ['admin', 'stats', 'secretaries'],
    queryFn: () => adminApi.secretaries.list({ limit: 1 }),
    staleTime: STALE,
  });

  const pendingVerifications = useQuery({
    queryKey: ['admin', 'stats', 'verifications', 'pending'],
    queryFn: () =>
      adminApi.verificationRequests.list({ status: 'pending', limit: 1 }),
    staleTime: STALE,
  });

  const isLoading =
    patients.isLoading || allDoctors.isLoading || appointments.isLoading;
  const isError =
    patients.isError || allDoctors.isError || appointments.isError;

  return {
    stats: {
      totalPatients: patients.data?.total ?? 0,
      totalDoctors: allDoctors.data?.total ?? 0,
      approvedDoctors: approvedDoctors.data?.total ?? 0,
      pendingDoctors: pendingDoctors.data?.total ?? 0,
      totalAppointments: appointments.data?.total ?? 0,
      totalSecretaries: secretaries.data?.total ?? 0,
      pendingVerifications: pendingVerifications.data?.total ?? 0,
    },
    isLoading,
    isError,
    refetch: () => {
      patients.refetch();
      allDoctors.refetch();
      approvedDoctors.refetch();
      pendingDoctors.refetch();
      appointments.refetch();
      secretaries.refetch();
      pendingVerifications.refetch();
    },
  };
}

export function useTopApprovedDoctors(limit = 8) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'top-doctors', limit],
    queryFn: () => adminApi.doctors.list({ status: 'approved', limit }),
    staleTime: STALE,
  });
}

export function useRecentAppointments(limit = 6) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'recent-appointments', limit],
    queryFn: () => adminApi.appointments.list({ limit }),
    staleTime: STALE,
  });
}
