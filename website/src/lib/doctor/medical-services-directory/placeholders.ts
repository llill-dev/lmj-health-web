import type { MedicalServiceCategory } from '@/lib/doctor/medical-services-directory/types';

const IMAGES: Record<MedicalServiceCategory, string> = {
  clinics:
    'https://images.unsplash.com/photo-1519494025725-880169323bca?auto=format&fit=crop&w=800&q=80',
  imaging:
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
  treatment:
    'https://images.unsplash.com/photo-1631217868264-e5b1bb874218?auto=format&fit=crop&w=800&q=80',
  labs: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
};

export function getMedicalServiceFacilityImage(
  category: MedicalServiceCategory,
): string {
  return IMAGES[category];
}
