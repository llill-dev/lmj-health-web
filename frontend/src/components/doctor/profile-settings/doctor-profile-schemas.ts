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

type TFn = (key: string, fallback?: string) => string;

export function getProfileFieldMessages(
  t?: TFn,
): Record<keyof typeof PROFILE_FIELD_MESSAGES, string> {
  if (!t) return PROFILE_FIELD_MESSAGES;
  return {
    fullNameRequired: t('doctor.profileSettings.field.fullNameRequired'),
    fullNameMin: t('doctor.profileSettings.field.fullNameMin'),
    dateOfBirthRequired: t('doctor.profileSettings.field.dateOfBirthRequired'),
    dateOfBirthInvalid: t('doctor.profileSettings.field.dateOfBirthInvalid'),
    dateOfBirthFuture: t('doctor.profileSettings.field.dateOfBirthFuture'),
    addressRequired: t('doctor.profileSettings.field.addressRequired'),
    addressMin: t('doctor.profileSettings.field.addressMin'),
    bioMax: t('doctor.profileSettings.field.bioMax'),
    consultationFeeInvalid: t(
      'doctor.profileSettings.field.consultationFeeInvalid',
    ),
    consultationModeRequired: t(
      'doctor.profileSettings.field.consultationModeRequired',
    ),
    medicalLicenseRequired: t(
      'doctor.profileSettings.field.medicalLicenseRequired',
    ),
    specializationRequired: t(
      'doctor.profileSettings.field.specializationRequired',
    ),
    educationRequired: t('doctor.profileSettings.field.educationRequired'),
    educationMin: t('doctor.profileSettings.field.educationMin'),
    clinicAddressRequired: t(
      'doctor.profileSettings.field.clinicAddressRequired',
    ),
    clinicAddressMin: t('doctor.profileSettings.field.clinicAddressMin'),
    coordinatesPair: t('doctor.profileSettings.field.coordinatesPair'),
    latitudeInvalid: t('doctor.profileSettings.field.latitudeInvalid'),
    longitudeInvalid: t('doctor.profileSettings.field.longitudeInvalid'),
    noProfessionalChanges: t(
      'doctor.profileSettings.field.noProfessionalChanges',
    ),
  };
}

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

export function buildDoctorPersonalEditSchema(t?: TFn) {
  const messages = getProfileFieldMessages(t);
  return z.object({
    fullName: z
      .string()
      .trim()
      .min(1, messages.fullNameRequired)
      .min(2, messages.fullNameMin),
    dateOfBirth: z
      .string()
      .trim()
      .min(1, messages.dateOfBirthRequired)
      .refine(isValidDateInput, messages.dateOfBirthInvalid)
      .refine(
        (value) => !isFutureDateInput(value),
        messages.dateOfBirthFuture,
      ),
    address: z
      .string()
      .trim()
      .min(1, messages.addressRequired)
      .min(5, messages.addressMin),
    bio: z
      .string()
      .trim()
      .max(200, messages.bioMax)
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
        messages.consultationFeeInvalid,
      ),
    consultationMode: z.enum(['offline', 'online', 'both'], {
      message: messages.consultationModeRequired,
    }),
  });
}

export const doctorPersonalEditSchema = buildDoctorPersonalEditSchema();

export type DoctorPersonalEditForm = z.infer<typeof doctorPersonalEditSchema>;

export function buildDoctorProfessionalEditSchema(t?: TFn) {
  const messages = getProfileFieldMessages(t);
  return z
    .object({
      medicalLicenseNumber: z
        .string()
        .trim()
        .min(1, messages.medicalLicenseRequired),
      specialization: z
        .string()
        .trim()
        .min(1, messages.specializationRequired),
      education: z
        .string()
        .trim()
        .min(1, messages.educationRequired)
        .min(5, messages.educationMin),
      clinicAddress: z
        .string()
        .trim()
        .min(1, messages.clinicAddressRequired)
        .min(5, messages.clinicAddressMin),
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
          message: messages.coordinatesPair,
          path: hasLat ? ['clinicLng'] : ['clinicLat'],
        });
      }
      if (hasLat && Number.isNaN(Number(values.clinicLat))) {
        ctx.addIssue({
          code: 'custom',
          message: messages.latitudeInvalid,
          path: ['clinicLat'],
        });
      }
      if (hasLng && Number.isNaN(Number(values.clinicLng))) {
        ctx.addIssue({
          code: 'custom',
          message: messages.longitudeInvalid,
          path: ['clinicLng'],
        });
      }
    });
}

export const doctorProfessionalEditSchema = buildDoctorProfessionalEditSchema();

export type DoctorProfessionalEditForm = z.infer<
  typeof doctorProfessionalEditSchema
>;
