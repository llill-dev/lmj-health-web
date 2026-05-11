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
  const bookedSlots =
    response?.appointments?.map((apt) => ({
      startTime: apt.startTime,
      endTime: apt.endTime,
      appointmentId: apt._id,
      patientName: apt.patientName,
      status: apt.status,
    })) || [];

  return {
    date: response?.date,
    duration: response?.duration,
    gap: response?.gap,
    freeSlots: response?.freeSlots || [],
    bookedSlots,
    totalFreeSlots: response?.totalFreeSlots || 0,
    totalBookedSlots: response?.totalBooked || 0,
    isLoading,
    error,
    refetch,
  };
}
