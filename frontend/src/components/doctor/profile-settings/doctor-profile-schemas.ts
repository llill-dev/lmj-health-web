import { z } from 'zod';

export const PROFILE_FIELD_MESSAGES = {
  fullNameRequired: 'الاسم الكامل مطلوب',
  fullNameMin: 'الاسم الكامل قصير جداً (حرفان على الأقل)',
  dateOfBirthRequired: 'تاريخ الميلاد مطلوب',
  dateOfBirthInvalid: 'أدخل تاريخ ميلاد صالحاً',
  dateOfBirthFuture: 'تاريخ الميلاد لا يمكن أن يكون في المستقبل',
  addressRequired: 'العنوان مطلوب',
  addressMin: 'العنوان قصير جداً (5 أحرف على الأقل)',
  bioMax: 'النبذة يجب ألا تتجاوز 200 حرف',
  consultationFeeInvalid: 'أدخل رسوماً صالحة (رقم أكبر من أو يساوي 0)',
  consultationModeRequired: 'اختر نوع الاستشارة',
  medicalLicenseRequired: 'رقم الشهادة الطبية مطلوب',
  specializationRequired: 'التخصص مطلوب',
  educationRequired: 'التعليم مطلوب',
  educationMin: 'التعليم قصير جداً (5 أحرف على الأقل)',
  clinicAddressRequired: 'عنوان العيادة مطلوب',
  clinicAddressMin: 'عنوان العيادة قصير جداً (5 أحرف على الأقل)',
  coordinatesPair: 'يجب إدخال خط العرض وخط الطول معاً',
  latitudeInvalid: 'أدخل خط عرض صالحاً',
  longitudeInvalid: 'أدخل خط طول صالحاً',
  noProfessionalChanges: 'لم يتم تغيير أي حقل مهني',
} as const;

function isValidDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function isFutureDateInput(value: string) {
  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() > today.getTime();
}

export const doctorPersonalEditSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, PROFILE_FIELD_MESSAGES.fullNameRequired)
    .min(2, PROFILE_FIELD_MESSAGES.fullNameMin),
  dateOfBirth: z
    .string()
    .trim()
    .min(1, PROFILE_FIELD_MESSAGES.dateOfBirthRequired)
    .refine(isValidDateInput, PROFILE_FIELD_MESSAGES.dateOfBirthInvalid)
    .refine(
      (value) => !isFutureDateInput(value),
      PROFILE_FIELD_MESSAGES.dateOfBirthFuture,
    ),
  address: z
    .string()
    .trim()
    .min(1, PROFILE_FIELD_MESSAGES.addressRequired)
    .min(5, PROFILE_FIELD_MESSAGES.addressMin),
  bio: z
    .string()
    .trim()
    .max(200, PROFILE_FIELD_MESSAGES.bioMax)
    .optional()
    .or(z.literal('')),
  consultationFee: z
    .string()
    .trim()
    .refine(
      (value) =>
        !value ||
        (!Number.isNaN(Number(value)) &&
          Number(value) >= 0 &&
          Number.isFinite(Number(value))),
      PROFILE_FIELD_MESSAGES.consultationFeeInvalid,
    ),
  consultationMode: z.enum(['offline', 'online', 'both'], {
    message: PROFILE_FIELD_MESSAGES.consultationModeRequired,
  }),
});

export type DoctorPersonalEditForm = z.infer<typeof doctorPersonalEditSchema>;

export const doctorProfessionalEditSchema = z
  .object({
    medicalLicenseNumber: z
      .string()
      .trim()
      .min(1, PROFILE_FIELD_MESSAGES.medicalLicenseRequired),
    specialization: z
      .string()
      .trim()
      .min(1, PROFILE_FIELD_MESSAGES.specializationRequired),
    education: z
      .string()
      .trim()
      .min(1, PROFILE_FIELD_MESSAGES.educationRequired)
      .min(5, PROFILE_FIELD_MESSAGES.educationMin),
    clinicAddress: z
      .string()
      .trim()
      .min(1, PROFILE_FIELD_MESSAGES.clinicAddressRequired)
      .min(5, PROFILE_FIELD_MESSAGES.clinicAddressMin),
    locationCountry: z.string().trim().optional().or(z.literal('')),
    locationCity: z.string().trim().optional().or(z.literal('')),
    clinicLat: z.string().trim().optional().or(z.literal('')),
    clinicLng: z.string().trim().optional().or(z.literal('')),
  })
  .superRefine((values, ctx) => {
    const hasLat = Boolean(values.clinicLat?.trim());
    const hasLng = Boolean(values.clinicLng?.trim());
    if (hasLat !== hasLng) {
      ctx.addIssue({
        code: 'custom',
        message: PROFILE_FIELD_MESSAGES.coordinatesPair,
        path: hasLat ? ['clinicLng'] : ['clinicLat'],
      });
    }
    if (hasLat && Number.isNaN(Number(values.clinicLat))) {
      ctx.addIssue({
        code: 'custom',
        message: PROFILE_FIELD_MESSAGES.latitudeInvalid,
        path: ['clinicLat'],
      });
    }
    if (hasLng && Number.isNaN(Number(values.clinicLng))) {
      ctx.addIssue({
        code: 'custom',
        message: PROFILE_FIELD_MESSAGES.longitudeInvalid,
        path: ['clinicLng'],
      });
    }
  });

export type DoctorProfessionalEditForm = z.infer<
  typeof doctorProfessionalEditSchema
>;
