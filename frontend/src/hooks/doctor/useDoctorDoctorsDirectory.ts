import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorApi } from '@/lib/doctor/client';
import type {
  InternalDirectoryDoctor,
  InternalDirectoryListParams,
} from '@/lib/doctor/doctorDirectoryTypes';
import { platformApi } from '@/lib/platform/client';
import type { PlatformServiceTypeItem } from '@/lib/platform/types';

export type DoctorDirectoryListItem = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  tags: string[];
  price: number | null;
  city: string;
  email?: string;
  phone?: string;
  photoUrl?: string | null;
  bio?: string;
  clinicAddress?: string;
  consultationTypes: string[];
  distanceMeters?: number | null;
};

export type DoctorDirectoryDetails = DoctorDirectoryListItem;

export type DirectoryServiceItem = PlatformServiceTypeItem;

function mapConsultationTags(types?: Array<'online' | 'offline' | string>) {
  if (!types?.length) return [];
  const unique = new Set<string>();
  types.forEach((type) => {
    if (type === 'online') unique.add('أونلاين');
    if (type === 'offline') unique.add('حضوري');
  });
  return [...unique];
}

function mapInternalDoctorToCard(
  doctor: InternalDirectoryDoctor,
): DoctorDirectoryListItem {
  const city = [doctor.locationCity, doctor.locationCountry]
    .filter(Boolean)
    .join('، ');

  return {
    id: doctor._id,
    name: doctor.user?.fullName ?? 'طبيب',
    specialty: doctor.specialization ?? 'غير محدد',
    rating: doctor.averageRating ?? 0,
    reviews: doctor.totalReviews ?? 0,
    tags: mapConsultationTags(doctor.consultationTypes),
    price: doctor.consultationFee ?? null,
    city: city || 'غير محدد',
    email: doctor.user?.email,
    phone: doctor.user?.phone,
    photoUrl: doctor.user?.photoUrl ?? null,
    bio: doctor.bio,
    clinicAddress: doctor.clinicAddress,
    consultationTypes: mapConsultationTags(doctor.consultationTypes),
    distanceMeters: doctor.distanceMeters ?? null,
  };
}

export function useDoctorDoctorsDirectory(params: InternalDirectoryListParams) {
  const query = useQuery({
    queryKey: ['doctor-directory', params],
    queryFn: () => doctorApi.internalDirectory.list(params),
    staleTime: 1000 * 30,
  });

  const doctors = useMemo(
    () => (query.data?.doctors ?? []).map(mapInternalDoctorToCard),
    [query.data?.doctors],
  );

  return {
    ...query,
    doctors,
    page: query.data?.page ?? params.page ?? 1,
    limit: query.data?.limit ?? params.limit ?? 8,
    total: query.data?.total ?? 0,
    results: query.data?.results ?? query.data?.total ?? 0,
  };
}

export function useDoctorDirectoryDoctorDetails(doctorId?: string | null) {
  const query = useQuery({
    queryKey: ['doctor-directory-details', doctorId],
    queryFn: () =>
      doctorApi.internalDirectory.list({
        search: '',
        page: 1,
        limit: 100,
      }),
    enabled: Boolean(doctorId),
    staleTime: 1000 * 30,
    select: (data) => {
      const match = data.doctors.find((row) => row._id === doctorId);
      return match ? mapInternalDoctorToCard(match) : null;
    },
  });

  return {
    ...query,
    details: query.data ?? null,
  };
}

export function useDoctorDirectoryServices() {
  const query = useQuery({
    queryKey: ['doctor-directory-services'],
    queryFn: () => platformApi.serviceTypes.list('ar'),
    staleTime: 1000 * 60 * 10,
  });

  return {
    ...query,
    services: query.data ?? [],
  };
}
