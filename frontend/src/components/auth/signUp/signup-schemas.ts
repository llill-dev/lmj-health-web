import { z } from 'zod';
import {
  PHONE_DIAL_CODES,
  PHONE_DIAL_CODE_OPTIONS,
  type PhoneDialCode,
} from '@/lib/phone/dialCodes';

/**
 * رسائل التحقق من البريد في التسجيل (تظهر عند الخروج من الحقل أو عند المتابعة).
 */
export const SIGNUP_EMAIL_REQUIRED_MESSAGE_AR = 'البريد الإلكتروني مطلوب.';
export const SIGNUP_EMAIL_INVALID_MESSAGE_AR =
  'البريد غير صالح. يُرجى إدخال بريد إلكتروني صالح.';

/**
 * تسجيل طبيب متعدد الخطوات — محاذاة التحقق مع `POST /auth/signup` (مرجع API PDF).
 *
 * طبيب إلزامي عند role=doctor: gender, dateOfBirth (`birthDate` محلياً → `dateOfBirth` في JSON),
 * address، وواحد فقط من specializationKey | customSpecializationText | specialization؛
 * ومزاولة: medicalLicenseNumber, bio, education, clinicAddress؛ اختياري: locationCity,
 * locationCountry, clinicLat+clinicLng, consultationTypes=["online"|"offline"].
 */

/** Dial codes for signup phone UI; merged into one `phone` string for POST /auth/signup (API-3). */
export const SIGNUP_PHONE_DIAL_CODES = PHONE_DIAL_CODES;

export type SignupPhoneDialCode = PhoneDialCode;

export const signupPhoneDialCodeSchema = z.enum(SIGNUP_PHONE_DIAL_CODES, {
  message: 'رمز النداء غير مدعوم أو غير مختار.',
});

/** Labels for `<select>` (UI only); API still receives one combined `phone` string. */
export const SIGNUP_PHONE_DIAL_OPTIONS =
  PHONE_DIAL_CODE_OPTIONS satisfies ReadonlyArray<{
    value: SignupPhoneDialCode;
    label: string;
  }>;

/** Split a stored E.164-style phone from draft into dial + local (best-effort). */
export function splitSignupPhone(phone?: string): {
  phoneDialCode: SignupPhoneDialCode;
  phoneLocal: string;
} {
  const raw = (phone ?? '').replace(/\s/g, '');
  if (!raw) return { phoneDialCode: '+963', phoneLocal: '' };

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
  return { phoneDialCode: '+963', phoneLocal: raw.replace(/\D/g, '') };
}

export const verificationChannelSchema = z.enum(['whatsapp', 'email'], {
  message: 'يرجى اختيار قناة التحقق (واتساب أو البريد).',
});

export const genderSchema = z.enum(['male', 'female'], {
  message: 'يجب اختيار الجنس (ذكر أو أنثى).',
});

/** مفاتيح كتالوج التخصصات كما تعيدها الخادم (مثل cardiology، demo_mok5ic19). ليست للنص العربي اليدوي. */
export const doctorCatalogSpecializationKeyRegex = /^[a-zA-Z0-9_.-]+$/;

/**
 * بادئة "د./Dr." تُضاف تلقائياً في بداية الاسم الكامل عند التسجيل: "د." إن كان
 * الاسم عربياً و"Dr." إن كان أجنبياً (لاتينياً)، حسب أول حرف فعلي يكتبه المستخدم.
 * تبقى ثابتة داخل الحقل ولا يمكن حذفها، وتُرسل دائماً كجزء من `fullName`.
 */
export const SIGNUP_NAME_PREFIX_AR = 'د.';
export const SIGNUP_NAME_PREFIX_EN = 'Dr.';

/** يكتشف نص الاسم (عربي/أجنبي) من أول حرف أبجدي يكتبه المستخدم؛ الافتراضي عربي. */
export function detectSignupNameScript(text: string): 'ar' | 'en' {
  const firstLetter = text.match(/[A-Za-z؀-ۿ]/);
  if (!firstLetter) return 'ar';
  return /[؀-ۿ]/.test(firstLetter[0]) ? 'ar' : 'en';
}

/** يزيل بادئة "د."/"Dr." الموجودة مسبقاً من قيمة محفوظة (عند العودة لهذه الخطوة). */
export function stripSignupNamePrefix(fullName: string): string {
  const trimmed = fullName.trim();
  if (trimmed.startsWith(SIGNUP_NAME_PREFIX_AR)) {
    return trimmed.slice(SIGNUP_NAME_PREFIX_AR.length).trim();
  }
  if (/^dr\.?/i.test(trimmed)) {
    return trimmed.replace(/^dr\.?/i, '').trim();
  }
  return trimmed;
}

/** يبني قيمة `fullName` الكاملة المرسلة للخادم من الاسم المكتوب بعد البادئة. */
export function buildSignupFullName(nameRest: string): string {
  const rest = nameRest.trim();
  if (!rest) return '';
  const prefix =
    detectSignupNameScript(rest) === 'ar'
      ? SIGNUP_NAME_PREFIX_AR
      : SIGNUP_NAME_PREFIX_EN;
  return `${prefix} ${rest}`;
}

const signupStringTrim = z.string().trim();

const SIGNUP_PASSWORD_COMPLEXITY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export const signupPasswordSchema = z
  .string()
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.')
  .max(256, 'كلمة المرور طويلة جداً.')
  .regex(
    SIGNUP_PASSWORD_COMPLEXITY_REGEX,
    'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم واحد على الأقل.',
  );

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

export const signupE164PhoneSchema = z
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

export function normalizePhoneLocalDigits(value: string): string {
  return value.replace(/^0+/, '').replace(/\D/g, '');
}

export function validatePhoneByDialCode(
  dial: SignupPhoneDialCode,
  phoneLocal: string,
): string | null {
  const local = normalizePhoneLocalDigits(phoneLocal);
  if (!local.length) {
    return 'أدخل رقم الهاتف بدون رمز الدولة';
  }

  const rule = SIGNUP_LOCAL_DIGIT_RULES[dial];
  if (rule) {
    if ('exact' in rule && local.length !== rule.exact) {
      return signupLocalLengthErrorMessage(dial, local.length);
    }
    if ('min' in rule && (local.length < rule.min || local.length > rule.max)) {
      return signupLocalLengthErrorMessage(dial, local.length);
    }
  }

  const full = `${dial}${local}`;
  if (!signupE164PhoneSchema.safeParse(full).success) {
    return 'رقم الهاتف لا يطابق صيغة دولية صالحة (E.164). تحقق من عدد الأرقام.';
  }

  return null;
}

export const step1AccountSchema = z
  .object({
    fullName: signupStringTrim.pipe(
      z
        .string()
        .min(1, 'الاسم مطلوب')
        .max(200, 'الاسم طويل جداً بالنسبة للحد المسموح في التسجيل'),
    ),
    email: z
      .string()
      .trim()
      .min(1, SIGNUP_EMAIL_REQUIRED_MESSAGE_AR)
      .email(SIGNUP_EMAIL_INVALID_MESSAGE_AR),
    password: signupPasswordSchema,
    confirmPassword: z.string().min(1, 'يرجى تأكيد كلمة المرور.'),
    phoneDialCode: signupPhoneDialCodeSchema,
    phoneLocal: phoneLocalPartSchema,
    channel: verificationChannelSchema,
  })
.superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'كلمتا المرور غير متطابقتين.',
        path: ['confirmPassword'],
      });
    }

    const local = normalizePhoneLocalDigits(data.phoneLocal);
    if (!local.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'أدخل رقم الهاتف بدون رمز الدولة',
        path: ['phoneLocal'],
      });
      return;
    }

    const phoneError = validatePhoneByDialCode(data.phoneDialCode, data.phoneLocal);
    if (phoneError && phoneError !== 'أدخل رقم الهاتف بدون رمز الدولة') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: phoneError,
        path: ['phoneLocal'],
      });
      return;
    }
  })
  .transform((d) => {
    const local = normalizePhoneLocalDigits(d.phoneLocal);
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
  address: signupStringTrim.pipe(
    z
      .string()
      .min(1, 'العنوان مطلوب')
      .max(500, 'العنوان طويل جداً'),
  ),
});

export const step3ProfessionalSchema = z
  .object({
    specialty: signupStringTrim.pipe(
      z
        .string()
        .min(1, 'التخصص الطبي مطلوب.')
        .max(
          500,
          'نص التخصص طويل جداً؛ استخدم مفتاحاً من القائمة أو اختصر الوصف.',
        ),
    ),
    /** اختيار من القائمة المحمَّلة أم إدخال يدوي (لمطابقة specializationKey vs customSpecializationText). */
    specialtySource: z.enum(['catalog', 'manual']),
    licenseNumber: signupStringTrim.pipe(
      z
        .string()
        .min(1, 'رقم الرخصة الطبية مطلوب.')
        .max(120, 'رقم الرخصة طويل جداً'),
    ),
    qualification: signupStringTrim.pipe(
      z
        .string()
        .min(1, 'المؤهل العلمي مطلوب.')
        .max(400, 'المؤهل العلمي طويل جداً'),
    ),
    clinicAddress: signupStringTrim.pipe(
      z
        .string()
        .min(1, 'عنوان العيادة مطلوب.')
        .max(500, 'عنوان العيادة طويل جداً'),
    ),
    bio: signupStringTrim.pipe(
      z
        .string()
        .min(1, 'نبذة تعريفية عنك مطلوبة.')
        .max(8000, 'النبذة طويلة جداً'),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.specialtySource !== 'catalog') return;
    if (!doctorCatalogSpecializationKeyRegex.test(data.specialty)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'عند الاختيار من قائمة التخصصات يجب أن يكون القيمة مفتاحاً إنجليزياً كما تعيده الخادم. للنص الحر اختر الإدخال اليدوي أو انتظر تحميل القائمة.',
        path: ['specialty'],
      });
    }
  });

const optionalSignupLocationField = () =>
  z
    .string()
    .max(160)
    .optional()
    .transform((v): string | undefined => {
      if (v == null) return undefined;
      const t = v.trim();
      return t.length ? t : undefined;
    });

export const step4AdditionalSchema = z.object({
  city: optionalSignupLocationField(),
  country: optionalSignupLocationField(),
  /** Maps to `consultationTypes` in API body when non-empty (optional per API-3). */
  consultationOnline: z.boolean().optional(),
  consultationOffline: z.boolean().optional(),
});

export const signUpSchema = z
  .object({
    fullName: signupStringTrim.pipe(
      z.string().min(1, 'الاسم مطلوب').max(200, 'الاسم طويل جداً'),
    ),
    email: z
      .string()
      .trim()
      .min(1, SIGNUP_EMAIL_REQUIRED_MESSAGE_AR)
      .email(SIGNUP_EMAIL_INVALID_MESSAGE_AR),
    password: signupPasswordSchema,
    phone: signupE164PhoneSchema,
    channel: verificationChannelSchema,
    gender: genderSchema,
    birthDate: isoDateOnlySchema,
    address: signupStringTrim.pipe(
      z.string().min(1, 'العنوان مطلوب').max(500, 'العنوان طويل جداً'),
    ),
    specialty: signupStringTrim.pipe(
      z
        .string()
        .min(1, 'التخصص الطبي مطلوب.')
        .max(500, 'نص التخصص طويل جداً'),
    ),
    specialtySource: z.enum(['catalog', 'manual']).default('manual'),
    licenseNumber: signupStringTrim.pipe(
      z.string().min(1, 'رقم الرخصة الطبية مطلوب.').max(120, 'رقم الرخصة طويل جداً'),
    ),
    qualification: signupStringTrim.pipe(
      z
        .string()
        .min(1, 'المؤهل العلمي مطلوب.')
        .max(400, 'المؤهل العلمي طويل جداً'),
    ),
    clinicAddress: signupStringTrim.pipe(
      z.string().min(1, 'عنوان العيادة مطلوب.').max(500, 'عنوان العيادة طويل جداً'),
    ),
    bio: signupStringTrim.pipe(
      z.string().min(1, 'نبذة تعريفية عنك مطلوبة.').max(8000, 'النبذة طويلة جداً'),
    ),
    city: optionalSignupLocationField(),
    country: optionalSignupLocationField(),
    consultationOnline: z.boolean().optional(),
    consultationOffline: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.specialtySource !== 'catalog') return;
    if (!doctorCatalogSpecializationKeyRegex.test(data.specialty)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'وضع «من القائمة» يتطلب مفتاح تخصص كما يعيده GET /meta/doctor-specializations. للنص العربي استخدم الإدخال اليدوي.',
        path: ['specialty'],
      });
    }
  });

/** Parsed step-1 output (includes single `phone` for the API). */
export type Step1AccountValues = z.output<typeof step1AccountSchema>;
/** Form fields before transform (dial + local). */
export type Step1AccountFormInput = z.input<typeof step1AccountSchema>;
export type Step2PersonalValues = z.infer<typeof step2PersonalSchema>;
export type Step3ProfessionalValues = z.infer<typeof step3ProfessionalSchema>;
export type Step4AdditionalValues = z.infer<typeof step4AdditionalSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
