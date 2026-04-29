'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDoctorSignupSpecialties } from '@/lib/meta/doctorSpecialties';

export function useDoctorSignupSpecialties() {
  return useQuery({
    queryKey: ['meta', 'doctor-signup-specialties', import.meta.env.VITE_PUBLIC_DOCTOR_SPECIALTIES_PATH ?? 'default'],
    queryFn: fetchDoctorSignupSpecialties,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}
