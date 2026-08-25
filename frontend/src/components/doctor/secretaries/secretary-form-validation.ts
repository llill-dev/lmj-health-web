import type { FieldErrors } from "react-hook-form";
import type { ToastOptions } from "@/components/ui/ToastProvider";
import { useI18n } from "@/i18n/provider";
import {
  mapSecretaryFieldErrors,
  pickFirstSecretaryValidationMessage,
  type DoctorSecretaryCreateFormValues,
  type DoctorSecretaryEditFormValues,
  type SecretaryFormFieldErrors,
} from "@/lib/doctor/secretaries/schema";

export function toastSecretaryValidationErrors(
  toast: (message: string, options?: ToastOptions) => void,
  errors:
    | FieldErrors<DoctorSecretaryCreateFormValues>
    | FieldErrors<DoctorSecretaryEditFormValues>,
) {
  const { t } = useI18n();
  const mapped = mapSecretaryFieldErrors(
    errors as Partial<
      Record<
        | keyof DoctorSecretaryCreateFormValues
        | keyof DoctorSecretaryEditFormValues,
        { message?: string }
      >
    >,
  );

  toast(pickFirstSecretaryValidationMessage(mapped), {
    title: t("common.validateData"),
    variant: "error",
  });
}

export function toSecretaryFormFieldErrors(
  errors:
    | FieldErrors<DoctorSecretaryCreateFormValues>
    | FieldErrors<DoctorSecretaryEditFormValues>,
): SecretaryFormFieldErrors {
  return mapSecretaryFieldErrors(
    errors as Partial<
      Record<
        | keyof DoctorSecretaryCreateFormValues
        | keyof DoctorSecretaryEditFormValues,
        { message?: string }
      >
    >,
  );
}
