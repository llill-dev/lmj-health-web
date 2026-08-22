import { z } from 'zod';
import {
  SIGNUP_EMAIL_INVALID_MESSAGE_AR,
  SIGNUP_EMAIL_REQUIRED_MESSAGE_AR,
} from '@/components/auth/signUp/signup-schemas';

export const doctorPasswordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .trim()
      .min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: z
      .string()
      .trim()
      .min(6, 'كلمة المرور الجديدة 6 أحرف على الأقل')
      .max(128, 'كلمة المرور طويلة جداً'),
    confirmPassword: z
      .string()
      .trim()
      .min(1, 'أكّد كلمة المرور الجديدة'),
  })
  .superRefine((values, ctx) => {
    if (
      values.newPassword &&
      values.currentPassword &&
      values.newPassword === values.currentPassword
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'كلمة المرور الجديدة يجب أن تختلف عن الحالية',
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
        message: 'كلمتا المرور غير متطابقتين',
        path: ['confirmPassword'],
      });
    }
  });

export type DoctorPasswordChangeForm = z.infer<typeof doctorPasswordChangeSchema>;

export const doctorEmailChangeRequestSchema = z.object({
  currentPassword: z
    .string()
    .trim()
    .min(1, 'كلمة المرور الحالية مطلوبة'),
  newEmail: z
    .string()
    .trim()
    .min(1, SIGNUP_EMAIL_REQUIRED_MESSAGE_AR)
    .email(SIGNUP_EMAIL_INVALID_MESSAGE_AR),
});

export type DoctorEmailChangeRequestForm = z.infer<
  typeof doctorEmailChangeRequestSchema
>;

export const doctorPhoneChangeRequestSchema = z.object({
  currentPassword: z
    .string()
    .trim()
    .min(1, 'كلمة المرور الحالية مطلوبة'),
  newPhone: z
    .string()
    .trim()
    .min(1, 'رقم الهاتف مطلوب')
    .refine(
      (value) => /^\+?[0-9]{7,15}$/.test(value.replace(/[\s-]/g, '')),
      'أدخل رقم هاتف صالحاً مع رمز الدولة (مثل +9639XXXXXXXX)',
    ),
});

export type DoctorPhoneChangeRequestForm = z.infer<
  typeof doctorPhoneChangeRequestSchema
>;
