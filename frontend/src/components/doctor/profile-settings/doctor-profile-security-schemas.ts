import { z } from 'zod';
import {
  SIGNUP_EMAIL_INVALID_MESSAGE_AR,
  SIGNUP_EMAIL_REQUIRED_MESSAGE_AR,
} from '@/components/auth/signUp/signup-schemas';

type TFn = (key: string, fallback?: string) => string;

export function buildDoctorPasswordChangeSchema(t?: TFn) {
  const currentPasswordRequired = t
    ? t('doctor.profileSettings.security.currentPasswordRequired')
    : 'كلمة المرور الحالية مطلوبة';
  const newPasswordMin = t
    ? t('doctor.profileSettings.security.newPasswordMin')
    : 'كلمة المرور الجديدة 6 أحرف على الأقل';
  const newPasswordMax = t
    ? t('doctor.profileSettings.security.newPasswordMax')
    : 'كلمة المرور طويلة جداً';
  const confirmPasswordRequired = t
    ? t('doctor.profileSettings.security.confirmPasswordRequired')
    : 'أكّد كلمة المرور الجديدة';
  const newPasswordSameAsCurrent = t
    ? t('doctor.profileSettings.security.newPasswordSameAsCurrent')
    : 'كلمة المرور الجديدة يجب أن تختلف عن الحالية';
  const passwordsMismatch = t
    ? t('doctor.profileSettings.security.passwordsMismatch')
    : 'كلمتا المرور غير متطابقتين';

  return z
    .object({
      currentPassword: z.string().trim().min(1, currentPasswordRequired),
      newPassword: z
        .string()
        .trim()
        .min(6, newPasswordMin)
        .max(128, newPasswordMax),
      confirmPassword: z.string().trim().min(1, confirmPasswordRequired),
    })
    .superRefine((values, ctx) => {
      if (
        values.newPassword &&
        values.currentPassword &&
        values.newPassword === values.currentPassword
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: newPasswordSameAsCurrent,
          path: ['newPassword'],
        });
      }
      if (
        values.confirmPassword &&
        values.newPassword &&
        values.confirmPassword !== values.newPassword
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: passwordsMismatch,
          path: ['confirmPassword'],
        });
      }
    });
}

export const doctorPasswordChangeSchema = buildDoctorPasswordChangeSchema();

export type DoctorPasswordChangeForm = z.infer<typeof doctorPasswordChangeSchema>;

export function buildDoctorEmailChangeRequestSchema(t?: TFn) {
  const currentPasswordRequired = t
    ? t('doctor.profileSettings.security.currentPasswordRequired')
    : 'كلمة المرور الحالية مطلوبة';
  return z.object({
    currentPassword: z.string().trim().min(1, currentPasswordRequired),
    newEmail: z
      .string()
      .trim()
      .min(1, SIGNUP_EMAIL_REQUIRED_MESSAGE_AR)
      .email(SIGNUP_EMAIL_INVALID_MESSAGE_AR),
  });
}

export const doctorEmailChangeRequestSchema = buildDoctorEmailChangeRequestSchema();

export type DoctorEmailChangeRequestForm = z.infer<
  typeof doctorEmailChangeRequestSchema
>;

export function buildDoctorPhoneChangeRequestSchema(t?: TFn) {
  const currentPasswordRequired = t
    ? t('doctor.profileSettings.security.currentPasswordRequired')
    : 'كلمة المرور الحالية مطلوبة';
  const newPhoneRequired = t
    ? t('doctor.profileSettings.security.newPhoneRequired')
    : 'رقم الهاتف مطلوب';
  const newPhoneInvalid = t
    ? t('doctor.profileSettings.security.newPhoneInvalid')
    : 'أدخل رقم هاتف صالحاً مع رمز الدولة (مثل +9639XXXXXXXX)';
  return z.object({
    currentPassword: z.string().trim().min(1, currentPasswordRequired),
    newPhone: z
      .string()
      .trim()
      .min(1, newPhoneRequired)
      .refine(
        (value) => /^\+?[0-9]{7,15}$/.test(value.replace(/[\s-]/g, '')),
        newPhoneInvalid,
      ),
  });
}

export const doctorPhoneChangeRequestSchema = buildDoctorPhoneChangeRequestSchema();

export type DoctorPhoneChangeRequestForm = z.infer<
  typeof doctorPhoneChangeRequestSchema
>;
