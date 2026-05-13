'use client';

import { useQuery } from '@tanstack/react-query';
import { doctorApi, doctorSlotsQueryKeys } from '@/lib/doctor/client';
import type { DoctorSlotsQueryParams } from '@/lib/doctor/types';
import { readAuthUser } from '@/lib/cookies';

function getDoctorIdFromAuth(): string {
  const user = readAuthUser();
  return user?.actorIds?.doctorId ?? '';
}

/**
 * Hook to fetch slots for a specific date
 * @param date - YYYY-MM-DD format
 * @param type - 'free' | 'booked' | 'all' (default: 'free')
 * @param doctorId - Optional doctor ID (defaults to current doctor from auth)
 * @param page - Optional page number for booked slots pagination
 * @param limit - Optional limit per page for booked slots
 */
export function useSlots(
  date: string,
  type: 'free' | 'booked' | 'all' = 'free',
  doctorId?: string,
  page?: number,
  limit?: number,
) {
  const actualDoctorId = doctorId || getDoctorIdFromAuth();

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: doctorSlotsQueryKeys.byDate(actualDoctorId, date, type),
    queryFn: () =>
      doctorApi.slots.getSlots({
        date,
        type,
        doctorId: actualDoctorId,
        page,
        limit,
      }),
    enabled: !!actualDoctorId && !!date && /^\d{4}-\d{2}-\d{2}$/.test(date),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Map API response to consistent format
  // API returns "appointments" for booked data, not "bookedSlots"
  const appointments =
    response && 'appointments' in response && Array.isArray(response.appointments)
      ? response.appointments
      : [];
  const bookedSlots = appointments.map((apt) => ({
    startTime: apt.startTime,
    endTime: apt.endTime,
    appointmentId: apt._id,
    patientName: apt.patientName,
    status: apt.status,
  }));
  const duration =
    response && 'duration' in response ? response.duration : undefined;
  const gap = response && 'gap' in response ? response.gap : undefined;
  const freeSlots =
    response && 'freeSlots' in response && Array.isArray(response.freeSlots)
      ? response.freeSlots
      : [];
  const totalFreeSlots =
    response && 'totalFreeSlots' in response ? response.totalFreeSlots ?? 0 : 0;
  const totalBookedSlots =
    response && 'totalBooked' in response ? response.totalBooked ?? 0 : 0;

  return {
    date: response?.date,
    duration,
    gap,
    freeSlots,
    bookedSlots,
    totalFreeSlots,
    totalBookedSlots,
    isLoading,
    error,
    refetch,
  };
}
