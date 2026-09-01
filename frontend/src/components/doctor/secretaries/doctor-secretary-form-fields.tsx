"use client";

import { Eye, EyeOff } from "lucide-react";
import StyledSelect from "@/components/ui/styled-select";
import {
  ASSIGNABLE_SECRETARY_PERMISSIONS,
  secretaryPermissionLabel,
} from "@/lib/doctor/secretaries/permissionsUi";
import type { SecretaryGender } from "@/lib/doctor/secretaries/formUtils";
import type { SecretaryFormFieldErrors } from "@/lib/doctor/secretaries/schema";
import { getPhoneDialCodeOptions } from "@/lib/phone/dialCodes";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils/utils";

const inputClass =
  "h-[44px] w-full rounded-[10px] border px-4 font-cairo text-[13px] font-semibold outline-none transition focus:border-primary";

const inputErrorClass =
  "border-[#F04438] bg-[#FFFBFB] focus:border-[#F04438] focus:shadow-[0_0_0_4px_rgba(240,68,56,0.12)]";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mt-1.5 text-start font-cairo text-[11px] font-bold text-[#D92D20]"
    >
      {message}
    </p>
  );
}

type SecretaryFormFieldsProps = {
  mode: "create" | "edit";
  fullName: string;
  onFullNameChange: (value: string) => void;
  email: string;
  onEmailChange?: (value: string) => void;
  password?: string;
  onPasswordChange?: (value: string) => void;
  showPassword?: boolean;
  onToggleShowPassword?: () => void;
  phone: { countryCode: string; localNumber: string } | undefined;
  onPhoneChange: (
    value: { countryCode: string; localNumber: string } | undefined,
  ) => void;
  gender: SecretaryGender;
  onGenderChange: (value: SecretaryGender) => void;
  permissions: string[];
  onTogglePermission: (key: string) => void;
  fieldErrors?: SecretaryFormFieldErrors;
};

export function DoctorSecretaryFormFields({
  mode,
  fullName,
  onFullNameChange,
  email,
  onEmailChange,
  password = "",
  onPasswordChange,
  showPassword = false,
  onToggleShowPassword,
  phone,
  onPhoneChange,
  gender,
  onGenderChange,
  permissions,
  onTogglePermission,
  fieldErrors,
}: SecretaryFormFieldsProps) {
  const { t, locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const isEdit = mode === "edit";

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
          {t("doctor.secretaryFormFields.fullName")}
        </label>
        <input
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          className={cn(
            inputClass,
            fieldErrors?.fullName ? inputErrorClass : "border-[#E5E7EB]",
          )}
        />
        <FieldError message={fieldErrors?.fullName} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
            {t("doctor.secretaryFormFields.email")}
          </label>
          <input
            type="email"
            value={email}
            readOnly={isEdit}
            disabled={isEdit}
            onChange={(e) => onEmailChange?.(e.target.value)}
            className={cn(
              inputClass,
              isEdit && "cursor-not-allowed bg-[#F9FAFB] text-[#667085]",
              !isEdit && fieldErrors?.email
                ? inputErrorClass
                : "border-[#E5E7EB]",
            )}
          />
          <FieldError message={fieldErrors?.email} />
        </div>

        <div>
          <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
            {t("doctor.secretaryFormFields.password")}
          </label>
          {isEdit ? (
            <div className="flex h-[44px] items-center rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4">
              <span className="font-cairo text-[12px] font-semibold text-[#667085]">
                {t("doctor.secretaryFormFields.passwordUneditable")}
              </span>
            </div>
          ) : (
            <>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => onPasswordChange?.(e.target.value)}
                  className={cn(
                    inputClass,
                    "bg-white pe-12",
                    fieldErrors?.password
                      ? inputErrorClass
                      : "border-[#E5E7EB]",
                  )}
                />
                <button
                  type="button"
                  onClick={onToggleShowPassword}
                  className="absolute start-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[8px] text-primary transition hover:bg-[#F0FDFA] hover:text-[#0b766e]"
                  aria-label={
                    showPassword
                      ? t("doctor.secretaryFormFields.hidePassword")
                      : t("doctor.secretaryFormFields.showPassword")
                  }
                  title={
                    showPassword
                      ? t("doctor.secretaryFormFields.hidePassword")
                      : t("doctor.secretaryFormFields.showPassword")
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
              <FieldError message={fieldErrors?.password} />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
            {t("doctor.secretaryFormFields.phone")}
          </label>
          <div className="flex gap-2">
            <StyledSelect
              value={phone?.countryCode ?? "+963"}
              onChange={(value) =>
                onPhoneChange({
                  countryCode: value,
                  localNumber: phone?.localNumber ?? "",
                })
              }
              options={getPhoneDialCodeOptions(locale)}
              size="sm"
              tone="muted"
              className="w-[140px]"
              listboxAriaLabel={t("doctor.secretaryFormFields.dialCodeAria")}
              error={Boolean(fieldErrors?.phone)}
            />
            <input
              value={phone?.localNumber ?? ""}
              onChange={(e) =>
                onPhoneChange({
                  countryCode: phone?.countryCode ?? "+963",
                  localNumber: e.target.value,
                })
              }
              placeholder={t("doctor.secretaryFormFields.phonePlaceholder")}
              className={cn(
                inputClass,
                "flex-1",
                fieldErrors?.phone ? inputErrorClass : "border-[#E5E7EB]",
              )}
            />
          </div>
          <FieldError message={fieldErrors?.phone} />
          {!fieldErrors?.phone && (
            <p className="mt-1.5 text-start font-cairo text-[11px] font-medium text-[#667085]">
              {t("doctor.secretaryFormFields.phoneHint")}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
            {t("doctor.secretaryFormFields.gender")}
          </label>
          <StyledSelect
            value={gender}
            onChange={(value) => onGenderChange(value as SecretaryGender)}
            size="sm"
            tone="muted"
            className="w-full"
            placeholder={t("doctor.secretaryFormFields.genderPlaceholder")}
            listboxAriaLabel={t("doctor.secretaryFormFields.genderAria")}
            error={Boolean(fieldErrors?.gender)}
            options={[
              { value: "Female", label: t("doctor.secretaryFormFields.genderFemale") },
              { value: "Male", label: t("doctor.secretaryFormFields.genderMale") },
            ]}
          />
          <FieldError message={fieldErrors?.gender} />
        </div>
      </div>

      <div>
        <p className="mb-3 text-start font-cairo text-[13px] font-extrabold text-[#111827]">
          {t("doctor.secretaryFormFields.permissions")}
        </p>
        <div
          className={cn(
            "grid grid-cols-1 gap-2 rounded-[12px] sm:grid-cols-2",
            fieldErrors?.permissions &&
              "border border-[#FECACA] bg-[#FFFBFB] p-3",
          )}
        >
          {ASSIGNABLE_SECRETARY_PERMISSIONS.map((key) => {
            const active = permissions.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => onTogglePermission(key)}
                className={cn(
                  "rounded-[10px] border px-3 py-2.5 text-start font-cairo text-[12px] font-bold transition",
                  active
                    ? "border-primary bg-[#F0FDFA] text-primary"
                    : "border-[#EEF2F6] bg-white text-[#667085] hover:border-primary/30",
                )}
              >
                {secretaryPermissionLabel(key, tr)}
              </button>
            );
          })}
        </div>
        <FieldError message={fieldErrors?.permissions} />
      </div>
    </div>
  );
}
