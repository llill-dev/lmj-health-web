"use client";

import { AnimatePresence, motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Save,
  X,
  User,
  Mail,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import StyledSelect from "@/components/ui/styled-select";
import { useToast } from "@/components/ui/ToastProvider";
import { useCreateAdminUser } from "@/hooks/admin/users/useAdminUsers";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import type { CreateAdminUserBody } from "@/lib/admin/types";
import { cn } from "@/lib/utils/utils";
import { useI18n } from "@/i18n/provider";
import {
  PHONE_DIAL_CODE_OPTIONS,
  getPhoneDialCodeOptions,
  type PhoneDialCode,
} from "@/lib/phone/dialCodes";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
} from "@/components/admin/form-field";

type CreateAdminUserFormValues = {
  fullName: string;
  email: string;
  phoneDialCode: PhoneDialCode;
  phoneLocal: string;
  password: string;
  role: "data_entry";
};

const DEFAULT_VALUES: CreateAdminUserFormValues = {
  fullName: "",
  email: "",
  phoneDialCode: "+963",
  phoneLocal: "",
  password: "",
  role: "data_entry",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface CreateAdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateAdminUserDialog({
  open,
  onOpenChange,
}: CreateAdminUserDialogProps) {
  const { dir, t, locale } = useI18n();
  const { toast } = useToast();
  const createMutation = useCreateAdminUser();
  const [showPassword, setShowPassword] = useState(false);

  // ───────────────────────────────────────────────────────────────────────
  // Zod Schema - Professional validation matching backend requirements
  // ───────────────────────────────────────────────────────────────────────
  const createAdminUserSchema = useMemo(
    () =>
      z
        .object({
          fullName: z
            .string()
            .min(2, t("adminUsersDialog.validation.nameMinLength"))
            .max(100, t("adminUsersDialog.validation.nameMaxLength"))
            .trim()
            .regex(/^[؀-ۿa-zA-Z\s]+$/, t("adminUsersDialog.validation.nameLettersOnly")),

          email: z
            .string()
            .min(1, t("adminSecretaryDialog.validation.emailRequired"))
            .email(t("adminSecretaryDialog.validation.emailInvalid"))
            .max(255, t("adminUsersDialog.validation.emailTooLong"))
            .toLowerCase()
            .trim(),

          phoneDialCode: z.enum(
            PHONE_DIAL_CODE_OPTIONS.map((o) => o.value) as [
              PhoneDialCode,
              ...PhoneDialCode[],
            ],
            {
              message: t("adminUsersDialog.validation.dialCodeUnsupported"),
            },
          ),
          phoneLocal: z
            .string()
            .min(1, t("adminSecretaryDialog.validation.phoneRequired"))
            .max(9, t("adminUsersDialog.validation.phoneTooLong"))
            .regex(/^\d+$/, t("adminUsersDialog.validation.phoneDigitsOnly")),

          password: z
            .string()
            .min(8, t("adminSecretaryDialog.validation.passwordTooShort"))
            .max(128, t("adminUsersDialog.validation.passwordTooLong"))
            .regex(/[a-z]/, t("adminUsersDialog.validation.passwordLowercase"))
            .regex(/[A-Z]/, t("adminUsersDialog.validation.passwordUppercase"))
            .regex(/[0-9]/, t("adminUsersDialog.validation.passwordDigit"))
            .regex(/[^a-zA-Z0-9]/, t("adminUsersDialog.validation.passwordSymbol")),

          role: z.enum(["data_entry"]),
        })
        .strict(),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateAdminUserFormValues>({
    resolver: zodResolver(createAdminUserSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onSubmit",
  });

  async function onSubmit(values: CreateAdminUserFormValues) {
    const payload: CreateAdminUserBody = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      password: values.password,
      role: values.role,
      phoneNumber: `${values.phoneDialCode}${values.phoneLocal}`,
    };

    try {
      await createMutation.mutateAsync(payload);
      toast(t("adminUsersDialog.create.toast"), {
        title: t("adminMedicalOrders.toast.created.title"),
        variant: "success",
      });
      reset(DEFAULT_VALUES);
      onOpenChange(false);
    } catch (error) {
      toast(userFacingErrorMessage(error), {
        title: t("adminUsersDialog.toast.createFailedTitle"),
        variant: "error",
      });
    }
  }

  useEffect(() => {
    if (!open) {
      reset(DEFAULT_VALUES);
      createMutation.reset();
      setShowPassword(false);
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !createMutation.isPending) onOpenChange(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange, createMutation.isPending]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={t("adminUsersDialog.create.ariaLabel")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !createMutation.isPending)
              onOpenChange(false);
          }}
        >
          <motion.div
            className="relative max-h-[min(92vh,860px)] w-full max-w-[600px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header - Matching facility dialog design */}
            <div className="relative overflow-hidden border-b border-[#EEF2F6] px-8 pb-5 pt-8">
              <div
                className="pointer-events-none absolute inset-0 bg-[#E6F4F3]"
                aria-hidden
              />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
                className="absolute end-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50"
                aria-label={t("common.close")}
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <div className="relative text-start">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  {t("adminUsersDialog.create.ariaLabel")}
                </h2>
                <p className="mt-1 font-cairo text-[13px] font-semibold text-[#667085]">
                  {t("adminUsersDialog.create.description")}
                </p>
              </div>
            </div>

            {/* Form */}
            <form dir={dir} onSubmit={handleSubmit(onSubmit)}>
              <div className="max-h-[calc(92vh-220px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                  {/* Full Name */}
                  <AdminFormField
                    label={t("adminSecretaryDialog.field.fullName.label")}
                    required
                    error={errors.fullName?.message}
                  >
                    <div className="relative">
                      <User className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
                      <input
                        {...register("fullName")}
                        className={adminFieldClass(
                          cn(adminInputClass, "ps-10"),
                          Boolean(errors.fullName),
                        )}
                        placeholder={t("adminUsersDialog.field.fullName.placeholder")}
                        disabled={createMutation.isPending}
                      />
                    </div>
                  </AdminFormField>

                  {/* Email */}
                  <AdminFormField
                    label={t("adminSecretaryDialog.field.email.label")}
                    required
                    error={errors.email?.message}
                  >
                    <div className="relative">
                      <Mail className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
                      <input
                        {...register("email")}
                        className={adminFieldClass(
                          cn(adminInputClass, "ps-10"),
                          Boolean(errors.email),
                        )}
                        placeholder="name@example.com"
                        dir="ltr"
                        disabled={createMutation.isPending}
                      />
                    </div>
                  </AdminFormField>

                  {/* Phone Number */}
                  <AdminFormField
                    label={t("adminFacilityDialog.field.phone.label")}
                    required
                    error={
                      errors.phoneDialCode?.message ||
                      errors.phoneLocal?.message
                    }
                  >
                    <div className="flex gap-2">
                      <Controller
                        name="phoneDialCode"
                        control={control}
                        render={({ field }) => (
                          <StyledSelect
                            {...field}
                            options={getPhoneDialCodeOptions(locale) as any}
                            size="sm"
                            tone="muted"
                            disabled={createMutation.isPending}
                            className="w-[140px] shrink-0"
                          />
                        )}
                      />
                      <div className="relative flex-1">
                        <Phone className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                          {...register("phoneLocal")}
                          className={adminFieldClass(
                            cn(adminInputClass, "ps-10"),
                            Boolean(errors.phoneLocal),
                          )}
                          placeholder="912345678"
                          dir="ltr"
                          inputMode="numeric"
                          maxLength={9}
                          disabled={createMutation.isPending}
                        />
                      </div>
                    </div>
                  </AdminFormField>

                  {/* Password */}
                  <AdminFormField
                    label={t("adminSecretaryDialog.field.password.label")}
                    required
                    error={errors.password?.message}
                  >
                    <div className="relative">
                      <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        className={adminFieldClass(
                          cn(adminInputClass, "ps-10 pe-10"),
                          Boolean(errors.password),
                        )}
                        placeholder="••••••••"
                        dir="ltr"
                        disabled={createMutation.isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute start-3 top-1/2 -translate-y-1/2 text-[#6B7280] transition hover:text-[#111827]"
                        disabled={createMutation.isPending}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {/* Password Requirements */}
                    <div className="mt-2 space-y-1">
                      <p className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                        {t("adminUsersDialog.password.requirementsIntro")}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#6B7280]">
                        <span className="text-primary">•</span>{t("adminUsersDialog.password.req.length")}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#6B7280]">
                        <span className="text-primary">•</span>
                        {t("adminUsersDialog.password.req.uppercase")}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#6B7280]">
                        <span className="text-primary">•</span>
                        {t("adminUsersDialog.password.req.lowercase")}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#6B7280]">
                        <span className="text-primary">•</span>
                        {t("adminUsersDialog.password.req.digit")}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#6B7280]">
                        <span className="text-primary">•</span>
                        {t("adminUsersDialog.password.req.symbol")}
                      </div>
                    </div>
                  </AdminFormField>

                  {/* Role */}
                  <AdminFormField
                    label={t("adminUsersDialog.field.role.label")}
                    required
                    error={errors.role?.message}
                  >
                    <Controller
                      control={control}
                      name="role"
                      render={({ field }) => (
                        <StyledSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            {
                              value: "data_entry",
                              label: t("adminUsersDialog.role.dataEntry"),
                            },
                          ]}
                          placeholder={t("adminUsersDialog.field.role.placeholder")}
                          disabled={createMutation.isPending}
                          error={Boolean(errors.role)}
                          size="sm"
                          tone="muted"
                        />
                      )}
                    />
                  </AdminFormField>
                </div>
              </div>

              {/* Footer - Matching facility dialog design */}
              <div className="grid grid-cols-2 gap-3 border-t border-[#EEF2F6] px-8 py-5">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={createMutation.isPending}
                  className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary disabled:opacity-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
                >
                  <Save className="w-4 h-4" aria-hidden />
                  {createMutation.isPending ? t("adminUsersDialog.action.saving") : t("adminUsersDialog.action.save")}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
