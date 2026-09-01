import { isAwaitingInitialQueryData } from '@/lib/query/queryUi';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorApi } from '@/lib/doctor/client';
import type {
  InternalDirectoryDoctor,
  InternalDirectoryListParams,
} from '@/lib/doctor/directory/doctorDirectoryTypes';
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

type TrFn = (ar: string, en: string) => string;
const defaultTr: TrFn = (ar) => ar;

function mapConsultationTags(
  types: Array<'online' | 'offline' | string> | undefined,
  tr: TrFn,
) {
  if (!types?.length) return [];
  const unique = new Set<string>();
  types.forEach((type) => {
    if (type === 'online') unique.add(tr('أونلاين', 'Online'));
    if (type === 'offline') unique.add(tr('حضوري', 'In-person'));
  });
  return [...unique];
}

function mapInternalDoctorToCard(
  doctor: InternalDirectoryDoctor,
  tr: TrFn = defaultTr,
): DoctorDirectoryListItem {
  const city = [doctor.locationCity, doctor.locationCountry]
    .filter(Boolean)
    .join(tr('، ', ', '));

  return {
    id: doctor._id,
    name: doctor.user?.fullName ?? tr('طبيب', 'Doctor'),
    specialty: doctor.specialization ?? tr('غير محدد', 'Not specified'),
    rating: doctor.averageRating ?? 0,
    reviews: doctor.totalReviews ?? 0,
    tags: mapConsultationTags(doctor.consultationTypes, tr),
    price: doctor.consultationFee ?? null,
    city: city || tr('غير محدد', 'Not specified'),
    email: doctor.user?.email,
    phone: doctor.user?.phone,
    photoUrl: doctor.user?.photoUrl ?? null,
    bio: doctor.bio,
    clinicAddress: doctor.clinicAddress,
    consultationTypes: mapConsultationTags(doctor.consultationTypes, tr),
    distanceMeters: doctor.distanceMeters ?? null,
  };
}

export function useDoctorDoctorsDirectory(
  params: InternalDirectoryListParams,
  enabled = true,
  tr: TrFn = defaultTr,
) {
  const query = useQuery({
    queryKey: ['doctor-directory', params],
    queryFn: () => doctorApi.internalDirectory.list(params),
    enabled,
    staleTime: 1000 * 30,
  });

  const doctors = useMemo(
    () => (query.data?.doctors ?? []).map((doctor) => mapInternalDoctorToCard(doctor, tr)),
    [query.data?.doctors, tr],
  );

  return {
    ...query,
    doctors,
    page: query.data?.page ?? params.page ?? 1,
    limit: query.data?.limit ?? params.limit ?? 8,
    total: query.data?.total ?? 0,
    results: query.data?.results ?? query.data?.total ?? 0,
    isAwaitingData: isAwaitingInitialQueryData(query.data, query.isError),
  };
}

export function useDoctorDirectoryDoctorDetails(
  doctorId?: string | null,
  tr: TrFn = defaultTr,
) {
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
      return match ? mapInternalDoctorToCard(match, tr) : null;
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
