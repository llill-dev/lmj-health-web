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

type TrFn = (ar: string, en: string) => string;
const defaultTr: TrFn = (ar) => ar;

export function buildMedicalServiceCategoryTabs(
  tr: TrFn = defaultTr,
): Array<{ id: MedicalServiceCategory; label: string }> {
  return [
    { id: 'clinics', label: tr('عيادات', 'Clinics') },
    { id: 'imaging', label: tr('تصوير طبي', 'Imaging') },
    { id: 'treatment', label: tr('مراكز علاج', 'Treatment centers') },
    { id: 'labs', label: tr('مخابر', 'Labs') },
  ];
}
