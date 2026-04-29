import { z } from 'zod';

/** Dial codes for signup phone UI; merged into one `phone` string for POST /auth/signup (API-3). */
export const SIGNUP_PHONE_DIAL_CODES = [
  '+966',
  '+963',
  '+971',
  '+962',
  '+961',
  '+965',
  '+968',
  '+964',
  '+972',
  '+973',
  '+974',
  '+20',
  '+212',
  '+249',
  '+90',
  '+44',
  '+1',
] as const;

export type SignupPhoneDialCode = (typeof SIGNUP_PHONE_DIAL_CODES)[number];

export const signupPhoneDialCodeSchema = z.enum(SIGNUP_PHONE_DIAL_CODES, {
  message: 'رمز النداء غير مدعوم أو غير مختار.',
});

/** Labels for `<select>` (UI only); API still receives one combined `phone` string. */
export const SIGNUP_PHONE_DIAL_OPTIONS: ReadonlyArray<{
  value: SignupPhoneDialCode;
  label: string;
}> = [
  { value: '+966', label: 'السعودية (+966)' },
  { value: '+963', label: 'سوريا (+963)' },
  { value: '+971', label: 'الإمارات (+971)' },
  { value: '+962', label: 'الأردن (+962)' },
  { value: '+961', label: 'لبنان (+961)' },
  { value: '+965', label: 'الكويت (+965)' },
  { value: '+968', label: 'عُمان (+968)' },
  { value: '+964', label: 'العراق (+964)' },
  { value: '+972', label: 'فلسطين (+972)' },
  { value: '+973', label: 'البحرين (+973)' },
  { value: '+974', label: 'قطر (+974)' },
  { value: '+20', label: 'مصر (+20)' },
  { value: '+212', label: 'المغرب (+212)' },
  { value: '+249', label: 'السودان (+249)' },
  { value: '+90', label: 'تركيا (+90)' },
  { value: '+44', label: 'المملكة المتحدة (+44)' },
  { value: '+1', label: 'أمريكا / كندا (+1)' },
];

/** Split a stored E.164-style phone from draft into dial + local (best-effort). */
export function splitSignupPhone(phone?: string): {
  phoneDialCode: SignupPhoneDialCode;
  phoneLocal: string;
} {
  const raw = (phone ?? '').replace(/\s/g, '');
  if (!raw) return { phoneDialCode: '+966', phoneLocal: '' };

  const sorted = [...SIGNUP_PHONE_DIAL_CODES].sort(
    (a, b) => b.length - a.length,
  );
  for (const code of sorted) {
    if (raw.startsWith(code)) {
      const local = raw.slice(code.length).replace(/^0+/, '');
      return { phoneDialCode: code, phoneLocal: local };
    }
  }
  if (raw.startsWith('+')) {
    const m = raw.match(/^(\+\d{1,3})(\d+)$/);
    if (m) {
      const dial = m[1] as SignupPhoneDialCode;
      const local = m[2].replace(/^0+/, '');
      if (SIGNUP_PHONE_DIAL_CODES.includes(dial as SignupPhoneDialCode)) {
        return { phoneDialCode: dial as SignupPhoneDialCode, phoneLocal: local };
      }
    }
  }
  return { phoneDialCode: '+966', phoneLocal: raw.replace(/\D/g, '') };
}

export const verificationChannelSchema = z.enum(['whatsapp', 'email'], {
  message: 'يرجى اختيار قناة التحقق (واتساب أو البريد).',
});

export const genderSchema = z.enum(['male', 'female'], {
  message: 'يجب اختيار الجنس (ذكر أو أنثى).',
});

/** Matches POST /auth/signup `dateOfBirth`: ISO date only, no time (API-3). */
const isoDateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'اختر التاريخ من التقويم')
  .refine((s) => {
    const [y, m, d] = s.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return (
      dt.getFullYear() === y &&
      dt.getMonth() === m - 1 &&
      dt.getDate() === d
    );
  }, 'تاريخ غير صالح')
  .refine((s) => {
    const [y, m, d] = s.split('-').map(Number);
    const picked = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    picked.setHours(0, 0, 0, 0);
    return picked <= today;
  }, 'لا يمكن أن يكون تاريخ الميلاد في المستقبل')
  .refine((s) => {
    const [y, m, d] = s.split('-').map(Number);
    const picked = new Date(y, m - 1, d);
    const min = new Date(1900, 0, 1);
    picked.setHours(0, 0, 0, 0);
    min.setHours(0, 0, 0, 0);
    return picked >= min;
  }, 'تاريخ الميلاد غير معقول');

const phoneLocalPartSchema = z
  .string()
  .regex(/^\d*$/, 'أرقام فقط، بدون مسافات أو رمز الدولة');

const signupE164PhoneSchema = z
  .string()
  .regex(
    /^\+[1-9]\d{7,14}$/,
    'أدخل رقم الهاتف بصيغة دولية صحيحة مثل +963912345678',
  );

/**
 * National number length (digits after dial code, leading zeros stripped) per prefix.
 * Aligns UI validation with typical ITU national lengths and API-3 examples (E.164 `phone` string).
 * If a dial code is missing here, we fall back to the generic E.164 window only.
 */
export const SIGNUP_LOCAL_DIGIT_RULES: Partial<
  Record<
    SignupPhoneDialCode,
    { exact: number } | { min: number; max: number }
  >
> = {
  '+963': { exact: 9 }, // Syria
  '+966': { exact: 9 }, // Saudi Arabia
  '+971': { exact: 9 }, // UAE
  '+962': { exact: 9 }, // Jordan
  '+961': { exact: 8 }, // Lebanon mobile (national digits after dial code)
  '+965': { exact: 8 }, // Kuwait
  '+968': { exact: 8 }, // Oman
  '+964': { exact: 10 }, // Iraq
  '+972': { exact: 9 }, // Palestine
  '+973': { exact: 8 }, // Bahrain
  '+974': { exact: 8 }, // Qatar
  '+20': { exact: 10 }, // Egypt (API-3 example +201234567890)
  '+212': { exact: 9 }, // Morocco
  '+249': { exact: 9 }, // Sudan
  '+90': { exact: 10 }, // Turkey
  '+44': { exact: 10 }, // UK
  '+1': { exact: 10 }, // US/Canada
};

export function signupLocalLengthErrorMessage(
  dial: SignupPhoneDialCode,
  localDigitCount: number,
): string {
  const rule = SIGNUP_LOCAL_DIGIT_RULES[dial];
  if (rule && 'exact' in rule) {
    return `يجب إدخال ${rule.exact} أرقام بالضبط بعد رمز الدولة (بدون الصفر الأول). أدخلت ${localDigitCount} رقمًا.`;
  }
  if (rule && 'min' in rule) {
    return `يجب أن يكون الرقم المحلي بين ${rule.min} و${rule.max} رقمًا (بدون الصفر الأول). أدخلت ${localDigitCount} رقمًا.`;
  }
  return `رقم الهاتف المحلي غير مكتمل أو غير مطابق للصيغة المتوقعة لهذا المفتاح (${dial}).`;
}

export const step1AccountSchema = z
  .object({
    fullName: z.string().min(1, 'الاسم مطلوب'),
    email: z.string().email('بريد إلكتروني غير صالح'),
    /** API-3: minimum length 6 */
    password: z
      .string()
      .min(6, 'كلمة المرور 6 أحرف على الأقل مطلوبة'),
    phoneDialCode: signupPhoneDialCodeSchema,
    phoneLocal: phoneLocalPartSchema,
    channel: verificationChannelSchema,
  })
  .superRefine((data, ctx) => {
    const local = data.phoneLocal.replace(/^0+/, '').replace(/\D/g, '');
    if (!local.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'أدخل رقم الهاتف بدون رمز الدولة',
        path: ['phoneLocal'],
      });
      return;
    }

    const rule = SIGNUP_LOCAL_DIGIT_RULES[data.phoneDialCode];
    if (rule) {
      if ('exact' in rule && local.length !== rule.exact) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: signupLocalLengthErrorMessage(
            data.phoneDialCode,
            local.length,
          ),
          path: ['phoneLocal'],
        });
        return;
      }
      if ('min' in rule && (local.length < rule.min || local.length > rule.max)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: signupLocalLengthErrorMessage(
            data.phoneDialCode,
            local.length,
          ),
          path: ['phoneLocal'],
        });
        return;
      }
    }

    const full = `${data.phoneDialCode}${local}`;
    if (!signupE164PhoneSchema.safeParse(full).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'رقم الهاتف لا يطابق صيغة دولية صالحة (E.164). تحقق من عدد الأرقام.',
        path: ['phoneLocal'],
      });
    }
  })
  .transform((d) => {
    const local = d.phoneLocal.replace(/^0+/, '').replace(/\D/g, '');
    const phone = `${d.phoneDialCode}${local}`;
    return {
      fullName: d.fullName.trim(),
      email: d.email.trim().toLowerCase(),
      password: d.password,
      channel: d.channel,
      phone,
    };
  });

export const step2PersonalSchema = z.object({
  gender: genderSchema,
  birthDate: isoDateOnlySchema,
  address: z.string().min(1, 'العنوان مطلوب'),
});

export const step3ProfessionalSchema = z.object({
  specialty: z.string().min(1, 'التخصص الطبي مطلوب.'),
  licenseNumber: z.string().min(1, 'رقم الرخصة الطبية مطلوب.'),
  qualification: z.string().min(1, 'المؤهل العلمي مطلوب.'),
  clinicAddress: z.string().min(1, 'عنوان العيادة مطلوب.'),
  bio: z.string().min(1, 'نبذة تعريفية عنك مطلوبة.'),
});

export const step4AdditionalSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  /** Maps to `consultationTypes` in API body when non-empty (optional per API-3). */
  consultationOnline: z.boolean().optional(),
  consultationOffline: z.boolean().optional(),
});

export const signUpSchema = z.object({
  fullName: z.string().min(1, 'الاسم مطلوب'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z
    .string()
    .min(6, 'كلمة المرور 6 أحرف على الأقل (متطلب الخادم).'),
  phone: signupE164PhoneSchema,
  channel: verificationChannelSchema,
  gender: genderSchema,
  birthDate: isoDateOnlySchema,
  address: z.string().min(1, 'العنوان مطلوب'),
  specialty: z.string().min(1, 'التخصص الطبي مطلوب.'),
  licenseNumber: z.string().min(1, 'رقم الرخصة الطبية مطلوب.'),
  qualification: z.string().min(1, 'المؤهل العلمي مطلوب.'),
  clinicAddress: z.string().min(1, 'عنوان العيادة مطلوب.'),
  bio: z.string().min(1, 'نبذة تعريفية عنك مطلوبة.'),
  city: z.string().optional(),
  country: z.string().optional(),
  consultationOnline: z.boolean().optional(),
  consultationOffline: z.boolean().optional(),
});

/** Parsed step-1 output (includes single `phone` for the API). */
export type Step1AccountValues = z.output<typeof step1AccountSchema>;
/** Form fields before transform (dial + local). */
export type Step1AccountFormInput = z.input<typeof step1AccountSchema>;
export type Step2PersonalValues = z.infer<typeof step2PersonalSchema>;
export type Step3ProfessionalValues = z.infer<typeof step3ProfessionalSchema>;
export type Step4AdditionalValues = z.infer<typeof step4AdditionalSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
