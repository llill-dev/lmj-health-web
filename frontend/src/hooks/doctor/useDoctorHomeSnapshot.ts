'use client';

import { useQuery } from '@tanstack/react-query';
import { doctorHomeApi } from '@/lib/doctor/homeSnapshot';
import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';

export function useDoctorHomeSnapshot() {
  const query = useQuery({
    queryKey: ['doctor', 'home', 'snapshot'],
    queryFn: () => doctorHomeApi.getSnapshot(),
    staleTime: 1000 * 60,
  });

  return {
    ...query,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}
