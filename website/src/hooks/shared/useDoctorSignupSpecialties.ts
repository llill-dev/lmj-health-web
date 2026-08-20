'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDoctorSignupSpecialties } from '@/lib/auth/doctorSpecialties';
import { authEndpoints } from '@/lib/auth/endpoints';

export function useDoctorSignupSpecialties() {
  return useQuery({
    queryKey: [
      'meta',
      'doctor-specializations',
      authEndpoints.doctorSpecialties(),
      'includeAllLangs',
    ],
    queryFn: fetchDoctorSignupSpecialties,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}
