import { z } from 'zod';
import {
  SIGNUP_EMAIL_INVALID_MESSAGE_AR,
  SIGNUP_EMAIL_REQUIRED_MESSAGE_AR,
  signupPasswordSchema,
} from '@/components/auth/signUp/signup-schemas';
import { isValidAuthPhoneIdentifier } from '@/lib/phone/normalizeAuthPhone';
import { ASSIGNABLE_SECRETARY_PERMISSIONS } from '@/lib/doctor/secretaries/permissionsUi';

const assignablePermissionSet = new Set<string>(ASSIGNABLE_SECRETARY_PERMISSIONS);

export const secretaryGenderSchema = z.enum(['Male', 'Female'], {
  errorMap: () => ({ message: 'يجب اختيار الجنس.' }),
});

const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'الاسم الكامل مطلوب (حرفان على الأقل).')
  .max(120, 'الاسم الكامل طويل جداً.');

const phoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => !value || isValidAuthPhoneIdentifier(value),
    'أدخل رقم هاتف بصيغة دولية صحيحة مثل +963912345678.',
  );

const permissionsSchema = z
  .array(z.string())
  .min(1, 'اختر صلاحية واحدة على الأقل.')
  .refine(
    (items) => items.every((item) => assignablePermissionSet.has(item)),
    'توجد صلاحيات غير مدعومة.',
  );

export const doctorSecretaryCreateFormSchema = z.object({
  fullName: fullNameSchema,
  email: z
    .string()
    .trim()
    .min(1, SIGNUP_EMAIL_REQUIRED_MESSAGE_AR)
    .email(SIGNUP_EMAIL_INVALID_MESSAGE_AR),
  password: signupPasswordSchema,
  phone: phoneSchema,
  gender: secretaryGenderSchema,
  permissions: permissionsSchema,
});

export const doctorSecretaryEditFormSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
  gender: secretaryGenderSchema,
  permissions: permissionsSchema,
});

export type DoctorSecretaryCreateFormValues = z.infer<
  typeof doctorSecretaryCreateFormSchema
>;

export type DoctorSecretaryEditFormValues = z.infer<
  typeof doctorSecretaryEditFormSchema
>;

export type SecretaryFormFieldName =
  | keyof DoctorSecretaryCreateFormValues
  | keyof DoctorSecretaryEditFormValues;

export type SecretaryFormFieldErrors = Partial<
  Record<SecretaryFormFieldName, string>
>;

export const DEFAULT_SECRETARY_CREATE_FORM: DoctorSecretaryCreateFormValues = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  gender: 'Female',
  permissions: ['appointments:view', 'patients:view'],
};

export function pickFirstSecretaryValidationMessage(
  errors: SecretaryFormFieldErrors,
): string {
  return (
    errors.fullName ??
    errors.email ??
    errors.password ??
    errors.phone ??
    errors.gender ??
    errors.permissions ??
    'يرجى تصحيح الحقول المميزة.'
  );
}

export function mapSecretaryFieldErrors(
  fieldErrors: Partial<
    Record<
      SecretaryFormFieldName,
      { message?: string } | undefined
    >
  >,
): SecretaryFormFieldErrors {
  const mapped: SecretaryFormFieldErrors = {};
  for (const [key, value] of Object.entries(fieldErrors)) {
    if (value?.message) {
      mapped[key as SecretaryFormFieldName] = value.message;
    }
  }
  return mapped;
}
