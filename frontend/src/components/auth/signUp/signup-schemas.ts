import { z } from "zod";
import {
  PHONE_DIAL_CODES,
  PHONE_DIAL_CODE_OPTIONS,
  type PhoneDialCode,
} from "@/lib/phone/dialCodes";
import type { AppLocale as Locale } from "@/i18n/runtime";

/**
 * Helper function to get localized validation messages for signup schemas.
 * Since this is a non-React file, we pass locale as a parameter.
 */
export function getSignupValidationMessage(
  key: string,
  locale: Locale = "ar",
  params?: Record<string, string | number>,
): string {
  const messages: Record<Locale, Record<string, string>> = {
    ar: {
      emailRequired: "البريد الإلكتروني مطلوب.",
      emailInvalid: "البريد غير صالح. يُرجى إدخال بريد إلكتروني صالح.",
      phoneDialCodeInvalid: "رمز النداء غير مدعوم أو غير مختار.",
      verificationChannelRequired:
        "يرجى اختيار قناة التحقق (واتساب أو البريد).",
      genderRequired: "يجب اختيار الجنس (ذكر أو أنثى).",
      passwordMinLength: "كلمة المرور يجب أن تكون 8 أحرف على الأقل.",
      passwordMaxLength: "كلمة المرور طويلة جداً.",
      passwordComplexity:
        "كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم واحد على الأقل.",
      dateRequired: "اختر التاريخ من التقويم",
      dateInvalid: "تاريخ غير صالح",
      dateFuture: "لا يمكن أن يكون تاريخ الميلاد في المستقبل",
      dateUnreasonable: "تاريخ الميلاد غير معقول",
      phoneLocalDigitsOnly: "أرقام فقط، بدون مسافات أو رمز الدولة",
      phoneE164Format: "أدخل رقم الهاتف بصيغة دولية صحيحة مثل +963912345678",
      phoneLocalExact: `يجب إدخال ${params?.count || 0} أرقام بالضبط بعد رمز الدولة (بدون الصفر الأول). أدخلت ${params?.actual || 0} رقمًا.`,
      phoneLocalRange: `يجب أن يكون الرقم المحلي بين ${params?.min || 0} و${params?.max || 0} رقمًا (بدون الصفر الأول). أدخلت ${params?.actual || 0} رقمًا.`,
      phoneLocalIncomplete: `رقم الهاتف المحلي غير مكتمل أو غير مطابق للصيغة المتوقعة لهذا المفتاح (${params?.dial || ""}).`,
      phoneLocalRequired: "أدخل رقم الهاتف بدون رمز الدولة",
      phoneE164Invalid:
        "رقم الهاتف لا يطابق صيغة دولية صالحة (E.164). تحقق من عدد الأرقام.",
      nameRequired: "الاسم مطلوب",
      nameTooLong: "الاسم طويل جداً بالنسبة للحد المسموح في التسجيل",
      confirmPasswordRequired: "يرجى تأكيد كلمة المرور.",
      passwordMismatch: "كلمتا المرور غير متطابقتين.",
      addressRequired: "العنوان مطلوب",
      addressTooLong: "العنوان طويل جداً",
      specialtyRequired: "التخصص الطبي مطلوب.",
      specialtyTooLong:
        "نص التخصص طويل جداً؛ استخدم مفتاحاً من القائمة أو اختصر الوصف.",
      licenseNumberRequired: "رقم الرخصة الطبية مطلوب.",
      licenseNumberTooLong: "رقم الرخصة طويل جداً",
      qualificationRequired: "المؤهل العلمي مطلوب.",
      qualificationTooLong: "المؤهل العلمي طويل جداً",
      clinicAddressRequired: "عنوان العيادة مطلوب.",
      clinicAddressTooLong: "عنوان العيادة طويل جداً",
      bioRequired: "نبذة تعريفية عنك مطلوبة.",
      bioTooLong: "النبذة طويلة جداً",
      specialtyCatalogKeyInvalid:
        "عند الاختيار من قائمة التخصصات يجب أن يكون القيمة مفتاحاً إنجليزياً كما تعيده الخادم. للنص الحر اختر الإدخال اليدوي أو انتظر تحميل القائمة.",
      specialtyCatalogKeyInvalidFull:
        "وضع «من القائمة» يتطلب مفتاح تخصص كما يعيده GET /meta/doctor-specializations. للنص العربي استخدم الإدخال اليدوي.",
    },
    en: {
      emailRequired: "Email is required.",
      emailInvalid: "Invalid email. Please enter a valid email address.",
      phoneDialCodeInvalid: "Unsupported or unselected dial code.",
      verificationChannelRequired:
        "Please select a verification channel (WhatsApp or email).",
      genderRequired: "Gender must be selected (male or female).",
      passwordMinLength: "Password must be at least 8 characters.",
      passwordMaxLength: "Password is too long.",
      passwordComplexity:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
      dateRequired: "Select a date from the calendar",
      dateInvalid: "Invalid date",
      dateFuture: "Date of birth cannot be in the future",
      dateUnreasonable: "Date of birth is unreasonable",
      phoneLocalDigitsOnly: "Numbers only, no spaces or country code",
      phoneE164Format:
        "Enter a phone number in valid international format like +963912345678",
      phoneLocalExact: `Must enter exactly ${params?.count || 0} digits after country code (without leading zero). You entered ${params?.actual || 0} digits.`,
      phoneLocalRange: `Local number must be between ${params?.min || 0} and ${params?.max || 0} digits (without leading zero). You entered ${params?.actual || 0} digits.`,
      phoneLocalIncomplete: `Local phone number is incomplete or does not match expected format for this key (${params?.dial || ""}).`,
      phoneLocalRequired: "Enter phone number without country code",
      phoneE164Invalid:
        "Phone number does not match a valid international format (E.164). Check the number of digits.",
      nameRequired: "Name is required",
      nameTooLong: "Name is too long for the allowed registration limit",
      confirmPasswordRequired: "Please confirm password.",
      passwordMismatch: "Passwords do not match.",
      addressRequired: "Address is required",
      addressTooLong: "Address is too long",
      specialtyRequired: "Medical specialty is required.",
      specialtyTooLong:
        "Specialty text is too long; use a key from the list or shorten the description.",
      licenseNumberRequired: "Medical license number is required.",
      licenseNumberTooLong: "License number is too long",
      qualificationRequired: "Academic qualification is required.",
      qualificationTooLong: "Academic qualification is too long",
      clinicAddressRequired: "Clinic address is required.",
      clinicAddressTooLong: "Clinic address is too long",
      bioRequired: "Brief bio about you is required.",
      bioTooLong: "Bio is too long",
      specialtyCatalogKeyInvalid:
        "When choosing from the specialties list, the value must be an English key as returned by the server. For free text, choose manual entry or wait for the list to load.",
      specialtyCatalogKeyInvalidFull:
        'The "from list" mode requires a specialty key as returned by GET /meta/doctor-specializations. For Arabic text, use manual entry.',
    },
  };

  return messages[locale][key] || messages.ar[key] || key;
}

/**
 * رسائل التحقق من البريد في التسجيل (تظهر عند الخروج من الحقل أو عند المتابعة).
 * @deprecated Use getSignupValidationMessage instead
 */
export const SIGNUP_EMAIL_REQUIRED_MESSAGE_AR = "البريد الإلكتروني مطلوب.";
export const SIGNUP_EMAIL_INVALID_MESSAGE_AR =
  "البريد غير صالح. يُرجى إدخال بريد إلكتروني صالح.";

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

export const signupPhoneDialCodeSchema = (locale: Locale = "ar") =>
  z.enum(SIGNUP_PHONE_DIAL_CODES, {
    message: getSignupValidationMessage("phoneDialCodeInvalid", locale),
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
  const raw = (phone ?? "").replace(/\s/g, "");
  if (!raw) return { phoneDialCode: "+963", phoneLocal: "" };

  const sorted = [...SIGNUP_PHONE_DIAL_CODES].sort(
    (a, b) => b.length - a.length,
  );
  for (const code of sorted) {
    if (raw.startsWith(code)) {
      const local = raw.slice(code.length).replace(/^0+/, "");
      return { phoneDialCode: code, phoneLocal: local };
    }
  }
  if (raw.startsWith("+")) {
    const m = raw.match(/^(\+\d{1,3})(\d+)$/);
    if (m) {
      const dial = m[1] as SignupPhoneDialCode;
      const local = m[2].replace(/^0+/, "");
      if (SIGNUP_PHONE_DIAL_CODES.includes(dial as SignupPhoneDialCode)) {
        return {
          phoneDialCode: dial as SignupPhoneDialCode,
          phoneLocal: local,
        };
      }
    }
  }
  return { phoneDialCode: "+963", phoneLocal: raw.replace(/\D/g, "") };
}

export const verificationChannelSchema = (locale: Locale = "ar") =>
  z.enum(["whatsapp", "email"], {
    message: getSignupValidationMessage("verificationChannelRequired", locale),
  });

export const genderSchema = (locale: Locale = "ar") =>
  z.enum(["male", "female"], {
    message: getSignupValidationMessage("genderRequired", locale),
  });

/** مفاتيح كتالوج التخصصات كما تعيدها الخادم (مثل cardiology، demo_mok5ic19). ليست للنص العربي اليدوي. */
export const doctorCatalogSpecializationKeyRegex = /^[a-zA-Z0-9_.-]+$/;

/**
 * بادئة "د./Dr." تُضاف تلقائياً في بداية الاسم الكامل عند التسجيل: "د." إن كان
 * الاسم عربياً و"Dr." إن كان أجنبياً (لاتينياً)، حسب أول حرف فعلي يكتبه المستخدم.
 * تبقى ثابتة داخل الحقل ولا يمكن حذفها، وتُرسل دائماً كجزء من `fullName`.
 */
export const SIGNUP_NAME_PREFIX_AR = "د.";
export const SIGNUP_NAME_PREFIX_EN = "Dr.";

/** يكتشف نص الاسم (عربي/أجنبي) من أول حرف أبجدي يكتبه المستخدم؛ الافتراضي عربي. */
export function detectSignupNameScript(text: string): "ar" | "en" {
  const firstLetter = text.match(/[A-Za-z؀-ۿ]/);
  if (!firstLetter) return "ar";
  return /[؀-ۿ]/.test(firstLetter[0]) ? "ar" : "en";
}

/** يزيل بادئة "د."/"Dr." الموجودة مسبقاً من قيمة محفوظة (عند العودة لهذه الخطوة). */
export function stripSignupNamePrefix(fullName: string): string {
  const trimmed = fullName.trim();
  if (trimmed.startsWith(SIGNUP_NAME_PREFIX_AR)) {
    return trimmed.slice(SIGNUP_NAME_PREFIX_AR.length).trim();
  }
  if (/^dr\.?/i.test(trimmed)) {
    return trimmed.replace(/^dr\.?/i, "").trim();
  }
  return trimmed;
}

/** يبني قيمة `fullName` الكاملة المرسلة للخادم من الاسم المكتوب بعد البادئة. */
export function buildSignupFullName(nameRest: string): string {
  const rest = nameRest.trim();
  if (!rest) return "";
  const prefix =
    detectSignupNameScript(rest) === "ar"
      ? SIGNUP_NAME_PREFIX_AR
      : SIGNUP_NAME_PREFIX_EN;
  return `${prefix} ${rest}`;
}

const signupStringTrim = z.string().trim();

const SIGNUP_PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export const signupPasswordSchema = (locale: Locale = "ar") =>
  z
    .string()
    .min(8, getSignupValidationMessage("passwordMinLength", locale))
    .max(256, getSignupValidationMessage("passwordMaxLength", locale))
    .regex(
      SIGNUP_PASSWORD_COMPLEXITY_REGEX,
      getSignupValidationMessage("passwordComplexity", locale),
    );

/** Matches POST /auth/signup `dateOfBirth`: ISO date only, no time (API-3). */
const isoDateOnlySchema = (locale: Locale = "ar") =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, getSignupValidationMessage("dateRequired", locale))
    .refine((s) => {
      const [y, m, d] = s.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      return (
        dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
      );
    }, getSignupValidationMessage("dateInvalid", locale))
    .refine((s) => {
      const [y, m, d] = s.split("-").map(Number);
      const picked = new Date(y, m - 1, d);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      picked.setHours(0, 0, 0, 0);
      return picked <= today;
    }, getSignupValidationMessage("dateFuture", locale))
    .refine((s) => {
      const [y, m, d] = s.split("-").map(Number);
      const picked = new Date(y, m - 1, d);
      const min = new Date(1900, 0, 1);
      picked.setHours(0, 0, 0, 0);
      min.setHours(0, 0, 0, 0);
      return picked >= min;
    }, getSignupValidationMessage("dateUnreasonable", locale));

const phoneLocalPartSchema = (locale: Locale = "ar") =>
  z
    .string()
    .regex(/^\d*$/, getSignupValidationMessage("phoneLocalDigitsOnly", locale));

export const signupE164PhoneSchema = (locale: Locale = "ar") =>
  z
    .string()
    .regex(
      /^\+[1-9]\d{7,14}$/,
      getSignupValidationMessage("phoneE164Format", locale),
    );

/**
 * National number length (digits after dial code, leading zeros stripped) per prefix.
 * Aligns UI validation with typical ITU national lengths and API-3 examples (E.164 `phone` string).
 * If a dial code is missing here, we fall back to the generic E.164 window only.
 */
export const SIGNUP_LOCAL_DIGIT_RULES: Partial<
  Record<SignupPhoneDialCode, { exact: number } | { min: number; max: number }>
> = {
  "+963": { exact: 9 }, // Syria
  "+966": { exact: 9 }, // Saudi Arabia
  "+971": { exact: 9 }, // UAE
  "+962": { exact: 9 }, // Jordan
  "+961": { exact: 8 }, // Lebanon mobile (national digits after dial code)
  "+965": { exact: 8 }, // Kuwait
  "+968": { exact: 8 }, // Oman
  "+964": { exact: 10 }, // Iraq
  "+972": { exact: 9 }, // Palestine
  "+973": { exact: 8 }, // Bahrain
  "+974": { exact: 8 }, // Qatar
  "+20": { exact: 10 }, // Egypt (API-3 example +201234567890)
  "+212": { exact: 9 }, // Morocco
  "+249": { exact: 9 }, // Sudan
  "+90": { exact: 10 }, // Turkey
  "+44": { exact: 10 }, // UK
  "+1": { exact: 10 }, // US/Canada
};

export function signupLocalLengthErrorMessage(
  dial: SignupPhoneDialCode,
  localDigitCount: number,
  locale: Locale = "ar",
): string {
  const rule = SIGNUP_LOCAL_DIGIT_RULES[dial];
  if (rule && "exact" in rule) {
    return getSignupValidationMessage("phoneLocalExact", locale, {
      count: rule.exact,
      actual: localDigitCount,
    });
  }
  if (rule && "min" in rule) {
    return getSignupValidationMessage("phoneLocalRange", locale, {
      min: rule.min,
      max: rule.max,
      actual: localDigitCount,
    });
  }
  return getSignupValidationMessage("phoneLocalIncomplete", locale, { dial });
}

export function normalizePhoneLocalDigits(value: string): string {
  return value.replace(/^0+/, "").replace(/\D/g, "");
}

export function validatePhoneByDialCode(
  dial: SignupPhoneDialCode,
  phoneLocal: string,
  locale: Locale = "ar",
): string | null {
  const local = normalizePhoneLocalDigits(phoneLocal);
  if (!local.length) {
    return getSignupValidationMessage("phoneLocalRequired", locale);
  }

  const rule = SIGNUP_LOCAL_DIGIT_RULES[dial];
  if (rule) {
    if ("exact" in rule && local.length !== rule.exact) {
      return signupLocalLengthErrorMessage(dial, local.length, locale);
    }
    if ("min" in rule && (local.length < rule.min || local.length > rule.max)) {
      return signupLocalLengthErrorMessage(dial, local.length, locale);
    }
  }

  const full = `${dial}${local}`;
  if (!signupE164PhoneSchema(locale).safeParse(full).success) {
    return getSignupValidationMessage("phoneE164Invalid", locale);
  }

  return null;
}

export const step1AccountSchema = (locale: Locale = "ar") =>
  z
    .object({
      fullName: signupStringTrim.pipe(
        z
          .string()
          .min(1, getSignupValidationMessage("nameRequired", locale))
          .max(200, getSignupValidationMessage("nameTooLong", locale)),
      ),
      email: z
        .string()
        .trim()
        .min(1, getSignupValidationMessage("emailRequired", locale))
        .email(getSignupValidationMessage("emailInvalid", locale)),
      password: signupPasswordSchema(locale),
      confirmPassword: z
        .string()
        .min(1, getSignupValidationMessage("confirmPasswordRequired", locale)),
      phoneDialCode: signupPhoneDialCodeSchema(locale),
      phoneLocal: phoneLocalPartSchema(locale),
      channel: verificationChannelSchema(locale),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: getSignupValidationMessage("passwordMismatch", locale),
          path: ["confirmPassword"],
        });
      }

      const local = normalizePhoneLocalDigits(data.phoneLocal);
      if (!local.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: getSignupValidationMessage("phoneLocalRequired", locale),
          path: ["phoneLocal"],
        });
        return;
      }

      const phoneError = validatePhoneByDialCode(
        data.phoneDialCode,
        data.phoneLocal,
        locale,
      );
      const phoneLocalRequiredMsg = getSignupValidationMessage(
        "phoneLocalRequired",
        locale,
      );
      if (phoneError && phoneError !== phoneLocalRequiredMsg) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: phoneError,
          path: ["phoneLocal"],
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

export const step2PersonalSchema = (locale: Locale = "ar") =>
  z.object({
    gender: genderSchema(locale),
    birthDate: isoDateOnlySchema(locale),
    address: signupStringTrim.pipe(
      z
        .string()
        .min(1, getSignupValidationMessage("addressRequired", locale))
        .max(500, getSignupValidationMessage("addressTooLong", locale)),
    ),
  });

export const step3ProfessionalSchema = (locale: Locale = "ar") =>
  z
    .object({
      specialty: signupStringTrim.pipe(
        z
          .string()
          .min(1, getSignupValidationMessage("specialtyRequired", locale))
          .max(500, getSignupValidationMessage("specialtyTooLong", locale)),
      ),
      /** اختيار من القائمة المحمَّلة أم إدخال يدوي (لمطابقة specializationKey vs customSpecializationText). */
      specialtySource: z.enum(["catalog", "manual"]),
      licenseNumber: signupStringTrim.pipe(
        z
          .string()
          .min(1, getSignupValidationMessage("licenseNumberRequired", locale))
          .max(120, getSignupValidationMessage("licenseNumberTooLong", locale)),
      ),
      qualification: signupStringTrim.pipe(
        z
          .string()
          .min(1, getSignupValidationMessage("qualificationRequired", locale))
          .max(400, getSignupValidationMessage("qualificationTooLong", locale)),
      ),
      clinicAddress: signupStringTrim.pipe(
        z
          .string()
          .min(1, getSignupValidationMessage("clinicAddressRequired", locale))
          .max(500, getSignupValidationMessage("clinicAddressTooLong", locale)),
      ),
      bio: signupStringTrim.pipe(
        z
          .string()
          .min(1, getSignupValidationMessage("bioRequired", locale))
          .max(8000, getSignupValidationMessage("bioTooLong", locale)),
      ),
    })
    .superRefine((data, ctx) => {
      if (data.specialtySource !== "catalog") return;
      if (!doctorCatalogSpecializationKeyRegex.test(data.specialty)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: getSignupValidationMessage(
            "specialtyCatalogKeyInvalid",
            locale,
          ),
          path: ["specialty"],
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

export const signUpSchema = (locale: Locale = "ar") =>
  z
    .object({
      fullName: signupStringTrim.pipe(
        z
          .string()
          .min(1, getSignupValidationMessage("nameRequired", locale))
          .max(200, getSignupValidationMessage("nameTooLong", locale)),
      ),
      email: z
        .string()
        .trim()
        .min(1, getSignupValidationMessage("emailRequired", locale))
        .email(getSignupValidationMessage("emailInvalid", locale)),
      password: signupPasswordSchema(locale),
      phone: signupE164PhoneSchema(locale),
      channel: verificationChannelSchema(locale),
      gender: genderSchema(locale),
      birthDate: isoDateOnlySchema(locale),
      address: signupStringTrim.pipe(
        z
          .string()
          .min(1, getSignupValidationMessage("addressRequired", locale))
          .max(500, getSignupValidationMessage("addressTooLong", locale)),
      ),
      specialty: signupStringTrim.pipe(
        z
          .string()
          .min(1, getSignupValidationMessage("specialtyRequired", locale))
          .max(500, getSignupValidationMessage("specialtyTooLong", locale)),
      ),
      specialtySource: z.enum(["catalog", "manual"]).default("manual"),
      licenseNumber: signupStringTrim.pipe(
        z
          .string()
          .min(1, getSignupValidationMessage("licenseNumberRequired", locale))
          .max(120, getSignupValidationMessage("licenseNumberTooLong", locale)),
      ),
      qualification: signupStringTrim.pipe(
        z
          .string()
          .min(1, getSignupValidationMessage("qualificationRequired", locale))
          .max(400, getSignupValidationMessage("qualificationTooLong", locale)),
      ),
      clinicAddress: signupStringTrim.pipe(
        z
          .string()
          .min(1, getSignupValidationMessage("clinicAddressRequired", locale))
          .max(500, getSignupValidationMessage("clinicAddressTooLong", locale)),
      ),
      bio: signupStringTrim.pipe(
        z
          .string()
          .min(1, getSignupValidationMessage("bioRequired", locale))
          .max(8000, getSignupValidationMessage("bioTooLong", locale)),
      ),
      city: optionalSignupLocationField(),
      country: optionalSignupLocationField(),
      consultationOnline: z.boolean().optional(),
      consultationOffline: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.specialtySource !== "catalog") return;
      if (!doctorCatalogSpecializationKeyRegex.test(data.specialty)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: getSignupValidationMessage(
            "specialtyCatalogKeyInvalidFull",
            locale,
          ),
          path: ["specialty"],
        });
      }
    });

/** Default schemas with Arabic locale for backward compatibility */
export const step1AccountSchemaDefault = step1AccountSchema("ar");
export const step2PersonalSchemaDefault = step2PersonalSchema("ar");
export const step3ProfessionalSchemaDefault = step3ProfessionalSchema("ar");
export const signUpSchemaDefault = signUpSchema("ar");

/** Parsed step-1 output (includes single `phone` for the API). */
export type Step1AccountValues = z.output<typeof step1AccountSchemaDefault>;
/** Form fields before transform (dial + local). */
export type Step1AccountFormInput = z.input<typeof step1AccountSchemaDefault>;
export type Step2PersonalValues = z.infer<typeof step2PersonalSchemaDefault>;
export type Step3ProfessionalValues = z.infer<
  typeof step3ProfessionalSchemaDefault
>;
export type Step4AdditionalValues = z.infer<typeof step4AdditionalSchema>;
export type SignUpValues = z.infer<typeof signUpSchemaDefault>;
