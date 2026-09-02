import { z } from 'zod';

type TFn = (key: string, fallback?: string) => string;

export function buildDeleteAccountPasswordSchema(t: TFn) {
  return z.object({
    currentPassword: z
      .string()
      .trim()
      .min(1, t('doctor.profileSettings.security.currentPasswordRequired'))
      .min(6, t('auth.validation.passwordMin6')),
  });
}

export type DeleteAccountPasswordValues = z.infer<
  ReturnType<typeof buildDeleteAccountPasswordSchema>
>;

export function buildDeleteAccountOtpSchema(t: TFn) {
  return z.object({
    otp: z
      .string()
      .trim()
      .length(6, t('accountDeletion.otp.codeLengthRequired'))
      .regex(/^\d{6}$/, t('accountDeletion.otp.codeDigitsOnly')),
  });
}

export type DeleteAccountOtpValues = z.infer<
  ReturnType<typeof buildDeleteAccountOtpSchema>
>;
