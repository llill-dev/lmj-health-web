import { z } from 'zod';

const facilityTypeValues = [
  'hospital',
  'clinic',
  'polyclinic',
  'medical_center',
  'laboratory',
  'imaging_center',
  'pharmacy',
  'rehabilitation_center',
  'dialysis_center',
  'emergency_center',
  'other',
] as const;

export const doctorFacilityFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'اسم المنشأة مطلوب (حرفان على الأقل)')
    .max(120, 'اسم المنشأة طويل جداً'),
  facilityType: z.enum(facilityTypeValues, {
    message: 'نوع المنشأة مطلوب',
  }),
  description: z
    .string()
    .trim()
    .max(500, 'الوصف طويل جداً (500 حرف كحد أقصى)')
    .optional()
    .or(z.literal('')),
  city: z.string().trim().min(2, 'المدينة مطلوبة'),
  country: z.string().trim().min(2, 'الدولة مطلوبة'),
  address: z.string().trim().min(3, 'العنوان التفصيلي مطلوب'),
  phone: z
    .string()
    .trim()
    .min(8, 'رقم الهاتف قصير جداً')
    .max(20, 'رقم الهاتف طويل جداً')
    .regex(
      /^[+]?[\d\s()-]+$/,
      'صيغة الهاتف غير صحيحة. استخدم أرقاماً مع + اختيارياً',
    ),
  attributes: z.array(z.string()),
});

export type DoctorFacilityFormSchemaValues = z.infer<
  typeof doctorFacilityFormSchema
>;

export const EMPTY_DOCTOR_FACILITY_FORM: DoctorFacilityFormSchemaValues = {
  name: '',
  facilityType: 'clinic',
  description: '',
  city: '',
  country: 'سوريا',
  address: '',
  phone: '',
  attributes: [],
};
