import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/client';
import {
  markAdminDoctorOffboarded,
  rememberAdminDoctorOffboardedIds,
} from '@/lib/admin/doctors/isAdminDoctorOffboarded';
import { resolveAdminDoctorUserId } from '@/lib/admin/doctors/resolveAdminDoctorUserId';
import type {
  AdminDoctorDetailsResponse,
  AdminDoctorsListResponse,
} from '@/lib/admin/types';

function patchDoctorsList(
  data: AdminDoctorsListResponse | undefined,
  userId: string,
): AdminDoctorsListResponse | undefined {
  if (!data?.doctors?.length) return data;

  return {
    ...data,
    doctors: data.doctors.map((doctor) => {
      const linkedUserId = resolveAdminDoctorUserId(doctor);
      return linkedUserId === userId
        ? markAdminDoctorOffboarded(doctor)
        : doctor;
    }),
  };
}

function patchDoctorDetails(
  data: AdminDoctorDetailsResponse | undefined,
  userId: string,
): AdminDoctorDetailsResponse | undefined {
  if (!data) return data;

  const root = data as AdminDoctorDetailsResponse & {
    data?: { doctor?: AdminDoctorDetailsResponse['doctor'] };
  };
  const doctor = root.doctor ?? root.data?.doctor;
  if (!doctor) return data;

  const linkedUserId = resolveAdminDoctorUserId(doctor);
  if (linkedUserId !== userId) return data;

  const patchedDoctor = markAdminDoctorOffboarded(doctor);
  if (root.doctor) return { ...root, doctor: patchedDoctor };
  if (root.data?.doctor) {
    return { ...root, data: { ...root.data, doctor: patchedDoctor } } as AdminDoctorDetailsResponse;
  }

  return data;
}

export function useAdminOffboardUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      reason,
      doctorId,
    }: {
      userId: string;
      reason?: string;
      doctorId?: string;
    }) => adminApi.users.offboard(userId, reason),
    onSuccess: (_data, { userId, doctorId }) => {
      rememberAdminDoctorOffboardedIds({ userId, doctorId });

      qc.setQueriesData<AdminDoctorsListResponse>(
        { queryKey: ['admin-doctors'] },
        (old) => patchDoctorsList(old, userId) ?? old,
      );
      qc.setQueriesData<AdminDoctorDetailsResponse>(
        { queryKey: ['admin-doctor'] },
        (old) => patchDoctorDetails(old, userId) ?? old,
      );

      qc.invalidateQueries({ queryKey: ['admin', 'secretaries'] });
      qc.invalidateQueries({ queryKey: ['admin-doctors'] });
      qc.invalidateQueries({ queryKey: ['admin-doctor'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
