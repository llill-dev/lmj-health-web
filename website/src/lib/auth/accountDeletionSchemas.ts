import { z } from 'zod';

export const deleteAccountPasswordSchema = z.object({
  currentPassword: z
    .string()
    .trim()
    .min(1, 'كلمة المرور الحالية مطلوبة')
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export type DeleteAccountPasswordValues = z.infer<
  typeof deleteAccountPasswordSchema
>;

export const deleteAccountOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .length(6, 'أدخل رمز التحقق المكوّن من 6 أرقام')
    .regex(/^\d{6}$/, 'رمز التحقق يجب أن يتكوّن من أرقام فقط'),
});

export type DeleteAccountOtpValues = z.infer<typeof deleteAccountOtpSchema>;
