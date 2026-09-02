import { z } from "zod";
import {
  SIGNUP_EMAIL_INVALID_MESSAGE_AR,
  SIGNUP_EMAIL_REQUIRED_MESSAGE_AR,
  signupPasswordSchema,
} from "@/components/auth/signUp/signup-schemas";
import { isValidAuthPhoneIdentifier } from "@/lib/phone/normalizeAuthPhone";
import { ASSIGNABLE_SECRETARY_PERMISSIONS } from "@/lib/doctor/secretaries/permissionsUi";
import { PHONE_DIAL_CODE_OPTIONS } from "@/lib/phone/dialCodes";
import { getTranslationValue } from "@/i18n/translations";
import { getCurrentLocale } from "@/i18n/runtime";

type TFn = (key: string) => string;

function defaultT(key: string): string {
  return getTranslationValue(getCurrentLocale(), key) ?? key;
}

const assignablePermissionSet = new Set<string>(
  ASSIGNABLE_SECRETARY_PERMISSIONS,
);

export const MAX_DOCTOR_SECRETARIES = 3;

export function buildSecretaryGenderSchema(t: TFn = defaultT) {
  return z.enum(["Male", "Female"], {
    message: t("doctor.secretarySchema.genderRequired"),
  });
}

/** @deprecated Arabic-only — use buildSecretaryGenderSchema(t) for locale-aware messages. */
export const secretaryGenderSchema = buildSecretaryGenderSchema();

function buildFullNameSchema(t: TFn) {
  return z
    .string()
    .trim()
    .min(2, t("doctor.secretarySchema.fullNameMin"))
    .max(120, t("doctor.secretarySchema.fullNameMax"));
}

function buildPhoneLocalSchema(t: TFn) {
  return z
    .string()
    .trim()
    .refine(
      (value) => !value || value.length <= 15,
      t("doctor.secretarySchema.phoneTooLong"),
    )
    .refine(
      (value) => !value || value.length >= 6,
      t("doctor.secretarySchema.phoneTooShort"),
    )
    .refine(
      (value) => !value || /^\d+$/.test(value),
      t("doctor.secretarySchema.phoneDigitsOnly"),
    );
}

function buildPhoneCountryCodeSchema(t: TFn) {
  return z
    .string()
    .refine(
      (value) => PHONE_DIAL_CODE_OPTIONS.some((opt) => opt.value === value),
      t("doctor.secretarySchema.selectCountryCode"),
    );
}

function buildPhoneSchema(t: TFn) {
  return z
    .object({
      countryCode: buildPhoneCountryCodeSchema(t),
      localNumber: buildPhoneLocalSchema(t),
    })
    .optional();
}

function buildPermissionsSchema(t: TFn) {
  return z
    .array(z.string())
    .min(1, t("doctor.secretarySchema.selectAtLeastOnePermission"))
    .refine(
      (items) => items.every((item) => assignablePermissionSet.has(item)),
      t("doctor.secretarySchema.unsupportedPermissions"),
    );
}

export function buildDoctorSecretaryCreateFormSchema(t: TFn = defaultT) {
  return z.object({
    fullName: buildFullNameSchema(t),
    email: z
      .string()
      .trim()
      .min(1, SIGNUP_EMAIL_REQUIRED_MESSAGE_AR)
      .email(SIGNUP_EMAIL_INVALID_MESSAGE_AR),
    password: signupPasswordSchema(getCurrentLocale()),
    phone: buildPhoneSchema(t),
    gender: buildSecretaryGenderSchema(t),
    permissions: buildPermissionsSchema(t),
  });
}

/** @deprecated Arabic-only — use buildDoctorSecretaryCreateFormSchema(t) for locale-aware messages. */
export const doctorSecretaryCreateFormSchema = buildDoctorSecretaryCreateFormSchema();

export function buildDoctorSecretaryEditFormSchema(t: TFn = defaultT) {
  return z.object({
    fullName: buildFullNameSchema(t),
    phone: buildPhoneSchema(t),
    gender: buildSecretaryGenderSchema(t),
    permissions: buildPermissionsSchema(t),
  });
}

/** @deprecated Arabic-only — use buildDoctorSecretaryEditFormSchema(t) for locale-aware messages. */
export const doctorSecretaryEditFormSchema = buildDoctorSecretaryEditFormSchema();

export type DoctorSecretaryCreateFormValues = z.infer<
  ReturnType<typeof buildDoctorSecretaryCreateFormSchema>
>;

export type DoctorSecretaryEditFormValues = z.infer<
  ReturnType<typeof buildDoctorSecretaryEditFormSchema>
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
  t: TFn = defaultT,
): string {
  return (
    errors.fullName ??
    errors.email ??
    errors.password ??
    errors.phone ??
    errors.gender ??
    errors.permissions ??
    t("doctor.secretarySchema.correctHighlightedFields")
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
