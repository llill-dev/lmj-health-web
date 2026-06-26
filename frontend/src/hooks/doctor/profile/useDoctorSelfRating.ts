'use client';

import { useQuery } from '@tanstack/react-query';
import { doctorApi } from '@/lib/doctor/client';

export function useDoctorSelfRating(input?: {
  doctorId?: string | null;
  searchHint?: string | null;
}) {
  const doctorId = input?.doctorId?.trim() || null;
  const searchHint = input?.searchHint?.trim() || null;

  return useQuery({
    queryKey: ['doctor', 'self-rating', doctorId, searchHint],
    queryFn: async () => {
      if (!doctorId && !searchHint) return null;

      const response = await doctorApi.internalDirectory.list({
        search: searchHint ?? undefined,
        limit: 20,
      });

      const match =
        response.doctors?.find((doctor) => doctor._id === doctorId) ??
        (response.doctors?.length === 1 ? response.doctors[0] : undefined);

      if (!match) return null;

      return {
        averageRating:
          typeof match.averageRating === 'number' ? match.averageRating : null,
        totalReviews:
          typeof match.totalReviews === 'number' ? match.totalReviews : 0,
      };
    },
    enabled: Boolean(doctorId || searchHint),
    staleTime: 1000 * 60,
  });
}
