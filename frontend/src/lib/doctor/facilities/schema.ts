import { z } from 'zod';
import { getTranslationValue } from '@/i18n/translations';
import { getCurrentLocale } from '@/i18n/runtime';

type TFn = (key: string) => string;

function defaultT(key: string): string {
  return getTranslationValue(getCurrentLocale(), key) ?? key;
}

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

export function buildDoctorFacilityFormSchema(t: TFn = defaultT) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, t('doctor.facilitySchema.nameMin'))
      .max(120, t('doctor.facilitySchema.nameMax')),
    facilityType: z.enum(facilityTypeValues, {
      message: t('doctor.facilitySchema.typeRequired'),
    }),
    description: z
      .string()
      .trim()
      .max(500, t('doctor.facilitySchema.descriptionMax'))
      .optional()
      .or(z.literal('')),
    city: z.string().trim().min(2, t('doctor.facilitySchema.cityRequired')),
    country: z.string().trim().min(2, t('doctor.facilitySchema.countryRequired')),
    address: z.string().trim().min(3, t('doctor.facilitySchema.addressRequired')),
    phone: z
      .string()
      .trim()
      .min(8, t('doctor.facilitySchema.phoneMin'))
      .max(20, t('doctor.facilitySchema.phoneMax'))
      .regex(
        /^[+]?[\d\s()-]+$/,
        t('doctor.facilitySchema.phoneFormat'),
      ),
    attributes: z.array(z.string()),
  });
}

/** @deprecated Arabic-only — use buildDoctorFacilityFormSchema(t) for locale-aware messages. */
export const doctorFacilityFormSchema = buildDoctorFacilityFormSchema();

export type DoctorFacilityFormSchemaValues = z.infer<
  ReturnType<typeof buildDoctorFacilityFormSchema>
>;

export function buildEmptyDoctorFacilityForm(
  locale: 'ar' | 'en' = getCurrentLocale(),
): DoctorFacilityFormSchemaValues {
  return {
    name: '',
    facilityType: 'clinic',
    description: '',
    city: '',
    country: locale === 'en' ? 'Syria' : 'سوريا',
    address: '',
    phone: '',
    attributes: [],
  };
}

/** @deprecated Arabic-only — use buildEmptyDoctorFacilityForm(locale) for locale-aware defaults. */
export const EMPTY_DOCTOR_FACILITY_FORM: DoctorFacilityFormSchemaValues =
  buildEmptyDoctorFacilityForm('ar');
