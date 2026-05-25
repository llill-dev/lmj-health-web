'use client';

import { useQuery } from '@tanstack/react-query';
import { doctorHomeApi } from '@/lib/doctor/homeSnapshot';

export function useDoctorHomeSnapshot() {
  return useQuery({
    queryKey: ['doctor', 'home', 'snapshot'],
    queryFn: () => doctorHomeApi.getSnapshot(),
    staleTime: 1000 * 60,
  });
}
