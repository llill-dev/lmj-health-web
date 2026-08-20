export type MedicalServiceCategory =
  | 'clinics'
  | 'imaging'
  | 'treatment'
  | 'labs';

export type WorkingHoursEntry = {
  days: string;
  hours: string;
};

export type MedicalServiceFacility = {
  id: string;
  category: MedicalServiceCategory;
  name: string;
  location: string;
  description: string;
  shortDescription: string;
  tags: string[];
  services: string[];
  workingHours: WorkingHoursEntry[];
  imageUrl: string;
  contact: {
    whatsapp?: string;
    phone?: string;
    facebook?: string;
    website?: string;
  };
};

export const MEDICAL_SERVICE_CATEGORY_TABS: Array<{
  id: MedicalServiceCategory;
  label: string;
}> = [
  { id: 'clinics', label: 'عيادات' },
  { id: 'imaging', label: 'تصوير طبي' },
  { id: 'treatment', label: 'مراكز علاج' },
  { id: 'labs', label: 'مخابر' },
];
