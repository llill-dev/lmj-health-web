import { z } from "zod";
import {
  SIGNUP_EMAIL_INVALID_MESSAGE_AR,
  SIGNUP_EMAIL_REQUIRED_MESSAGE_AR,
  signupPasswordSchema,
} from "@/components/auth/signUp/signup-schemas";
import { isValidAuthPhoneIdentifier } from "@/lib/phone/normalizeAuthPhone";
import { ASSIGNABLE_SECRETARY_PERMISSIONS } from "@/lib/doctor/secretaries/permissionsUi";
import { PHONE_DIAL_CODE_OPTIONS } from "@/lib/phone/dialCodes";

const assignablePermissionSet = new Set<string>(
  ASSIGNABLE_SECRETARY_PERMISSIONS,
);

export const MAX_DOCTOR_SECRETARIES = 3;

export const secretaryGenderSchema = z.enum(["Male", "Female"], {
  message: "يجب اختيار الجنس.",
});

const fullNameSchema = z
  .string()
  .trim()
  .min(2, "الاسم الكامل مطلوب (حرفان على الأقل).")
  .max(120, "الاسم الكامل طويل جداً.");

const phoneLocalSchema = z
  .string()
  .trim()
  .refine(
    (value) => !value || value.length <= 15,
    "رقم الهاتف طويل جداً. الحد الأقصى 15 رقم.",
  )
  .refine(
    (value) => !value || value.length >= 6,
    "رقم الهاتف قصير جداً. الحد الأدنى 6 أرقام.",
  )
  .refine(
    (value) => !value || /^\d+$/.test(value),
    "رقم الهاتف يجب أن يحتوي على أرقام فقط.",
  );

const phoneCountryCodeSchema = z
  .string()
  .refine(
    (value) => PHONE_DIAL_CODE_OPTIONS.some((opt) => opt.value === value),
    "اختر رمز الدولة.",
  );

const phoneSchema = z
  .object({
    countryCode: phoneCountryCodeSchema,
    localNumber: phoneLocalSchema,
  })
  .optional();

const permissionsSchema = z
  .array(z.string())
  .min(1, "اختر صلاحية واحدة على الأقل.")
  .refine(
    (items) => items.every((item) => assignablePermissionSet.has(item)),
    "توجد صلاحيات غير مدعومة.",
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
  fullName: "",
  email: "",
  password: "",
  phone: {
    countryCode: "+963",
    localNumber: "",
  },
  gender: "Female",
  permissions: ["appointments:view", "patients:view"],
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
    "يرجى تصحيح الحقول المميزة."
  );
}

export function mapSecretaryFieldErrors(
  fieldErrors: Partial<
    Record<SecretaryFormFieldName, { message?: string } | undefined>
  >,
): SecretaryFormFieldErrors {
  const mapped: SecretaryFormFieldErrors = {};
  const allowedFields: readonly SecretaryFormFieldName[] = [
    "fullName",
    "email",
    "password",
    "phone",
    "gender",
    "permissions",
  ];
  for (const [key, value] of Object.entries(fieldErrors)) {
    if (!value?.message) continue;
    const field = allowedFields.find((entry) => entry === key);
    if (!field) continue;
    mapped[field] = value.message;
  }
  return mapped;
}
