import type { DoctorFacility } from '@/lib/doctor/facilities/types';

export const MOCK_DOCTOR_FACILITIES: DoctorFacility[] = [
  {
    id: 'FAC-001',
    name: 'عيادة القلب',
    description: 'عيادة متخصصة في أمراض القلب',
    city: 'دمشق',
    address: 'دمشق - المزة',
    phone: '+963501234567',
    email: 'heart@example.com',
    workHoursFrom: '09:00',
    workHoursTo: '17:00',
    status: 'active',
  },
  {
    id: 'FAC-002',
    name: 'مشفى دمشق',
    description: 'مشفى عام',
    city: 'دمشق',
    address: 'دمشق - باب توما',
    phone: '+963501234567',
    email: 'hospital@example.com',
    workHoursFrom: '08:00',
    workHoursTo: '20:00',
    status: 'closed',
  },
];

export const FACILITY_STATUS_LABELS: Record<
  import('@/lib/doctor/facilities/types').DoctorFacilityStatus,
  string
> = {
  active: 'نشط',
  closed: 'مغلق',
};
