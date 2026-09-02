"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X, Save, TriangleAlert } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
  ADMIN_SECRETARY_BLOCKER_MESSAGE,
  ADMIN_SECRETARY_BLOCKER_TITLE,
  ADMIN_SECRETARY_WRITE_SUPPORTED,
} from "@/hooks/admin/secretaries/useAdminSecretaries";
import { useToast } from "@/components/ui/ToastProvider";
import { useI18n } from "@/i18n/provider";
import StyledSelect from "@/components/ui/styled-select";
import { AppCheckbox } from "@/components/ui";
import {
  ASSIGNABLE_SECRETARY_PERMISSIONS,
  secretaryPermissionLabel,
} from "@/lib/doctor/secretaries/permissionsUi";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
} from "@/components/admin/form-field";
import { cn } from "@/lib/utils/utils";

interface CreateSecretaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateSecretaryDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSecretaryDialogProps) {
  const { dir, locale, t } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const PERMISSION_OPTIONS = useMemo(
    () =>
      ASSIGNABLE_SECRETARY_PERMISSIONS.map((value) => ({
        value,
        label: secretaryPermissionLabel(value, tr),
      })),
    [locale],
  );
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const writeBlocked = !ADMIN_SECRETARY_WRITE_SUPPORTED;

  const GENDER_OPTIONS = [
    { value: "Male", label: t("adminSecretaryDialog.field.gender.male") },
    { value: "Female", label: t("adminSecretaryDialog.field.gender.female") },
  ];

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    gender: "Male",
    permissions: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onOpenChange(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange, isSubmitting]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t("adminSecretaryDialog.validation.fullNameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("adminSecretaryDialog.validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("adminSecretaryDialog.validation.emailInvalid");
    }

    if (!formData.password) {
      newErrors.password = t("adminSecretaryDialog.validation.passwordRequired");
    } else if (formData.password.length < 8) {
      newErrors.password = t("adminSecretaryDialog.validation.passwordTooShort");
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t("adminSecretaryDialog.validation.phoneRequired");
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = t("adminFacilityDialog.validation.phoneInvalid");
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = t("adminSecretaryDialog.validation.permissionsRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (writeBlocked) {
      toast(ADMIN_SECRETARY_BLOCKER_MESSAGE[locale], {
        title: ADMIN_SECRETARY_BLOCKER_TITLE[locale],
        variant: "error",
        durationMs: 4200,
      });
      return;
    }

    if (!validateForm()) return;
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
    if (errors.permissions) {
      setErrors((prev) => ({ ...prev, permissions: "" }));
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={t("adminSecretaryDialog.create.ariaLabel")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting)
              onOpenChange(false);
          }}
        >
          <motion.div
            className="relative max-h-[min(92vh,860px)] w-full max-w-[760px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden border-b border-[#EEF2F6] px-8 pb-5 pt-8">
              <div
                className="pointer-events-none absolute inset-0 bg-[#E6F4F3]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center opacity-80"
                aria-hidden
              />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="absolute start-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50"
                aria-label={t("common.close")}
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <div className="relative text-start">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  {t("adminSecretaryDialog.create.ariaLabel")}
                </h2>
              </div>
            </div>

            <form dir={dir} onSubmit={handleSubmit}>
              <div className="max-h-[calc(92vh-220px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                  <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] p-3">
                    <div className="flex items-start gap-2">
                      <TriangleAlert className="mt-0.5 h-4 w-4 text-[#DC2626]" />
                      <div className="font-cairo text-[11px] font-semibold leading-relaxed text-[#991B1B]">
                        {ADMIN_SECRETARY_BLOCKER_MESSAGE[locale]}
                      </div>
                    </div>
                  </div>

                  <AdminFormField
                    label={t("adminSecretaryDialog.field.fullName.label")}
                    required
                    error={errors.fullName}
                  >
                    <input
                      type="text"
                      value={formData.fullName}
                      disabled={writeBlocked}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }));
                        if (errors.fullName)
                          setErrors((prev) => ({ ...prev, fullName: "" }));
                      }}
                      placeholder={t("common.enterFullName")}
                      className={adminFieldClass(
                        cn(
                          adminInputClass,
                          "text-start placeholder:text-start",
                        ),
                        Boolean(errors.fullName),
                      )}
                    />
                  </AdminFormField>

                  <AdminFormField
                    label={t("adminSecretaryDialog.field.email.label")}
                    required
                    error={errors.email}
                  >
                    <input
                      type="email"
                      value={formData.email}
                      disabled={writeBlocked}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }));
                        if (errors.email)
                          setErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      placeholder="example@email.com"
                      className={adminFieldClass(
                        cn(
                          adminInputClass,
                          "text-start placeholder:text-start",
                        ),
                        Boolean(errors.email),
                      )}
                    />
                  </AdminFormField>

                  <AdminFormField
                    label={t("adminSecretaryDialog.field.password.label")}
                    required
                    error={errors.password}
                  >
                    <input
                      type="password"
                      value={formData.password}
                      disabled={writeBlocked}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }));
                        if (errors.password)
                          setErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      placeholder="••••••••"
                      className={adminFieldClass(
                        cn(
                          adminInputClass,
                          "text-start placeholder:text-start",
                        ),
                        Boolean(errors.password),
                      )}
                    />
                  </AdminFormField>

                  <AdminFormField
                    label={t("adminFacilityDialog.field.phone.label")}
                    required
                    error={errors.phone}
                  >
                    <input
                      type="tel"
                      value={formData.phone}
                      disabled={writeBlocked}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }));
                        if (errors.phone)
                          setErrors((prev) => ({ ...prev, phone: "" }));
                      }}
                      placeholder="+963944000000"
                      className={adminFieldClass(
                        cn(
                          adminInputClass,
                          "text-start placeholder:text-start",
                        ),
                        Boolean(errors.phone),
                      )}
                    />
                  </AdminFormField>

                  <AdminFormField label={t("common.genderLabel")} required>
                    <StyledSelect
                      value={formData.gender}
                      disabled={writeBlocked}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, gender: value }))
                      }
                      options={GENDER_OPTIONS}
                      placeholder={t("common.selectGender")}
                    />
                  </AdminFormField>

                  <AdminFormField
                    label={t("adminSecretaryDialog.field.permissions.label")}
                    required
                    error={errors.permissions}
                  >
                    <div className="flex flex-wrap gap-2">
                      {PERMISSION_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center gap-2 rounded-[8px] border px-3 py-2 cursor-pointer transition ${
                            formData.permissions.includes(option.value)
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-[#E5E7EB] bg-white text-[#667085] hover:border-[#D1D5DB]"
                          }`}
                        >
                          <AppCheckbox
                            size="sm"
                            disabled={writeBlocked}
                            checked={formData.permissions.includes(
                              option.value,
                            )}
                            onChange={() => togglePermission(option.value)}
                          />
                          <span className="font-cairo text-[12px] font-bold">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </AdminFormField>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#EEF2F6] px-8 py-5">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary disabled:opacity-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || writeBlocked}
                  className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
                >
                  <Save className="w-4 h-4" aria-hidden />
                  {isSubmitting
                    ? t("adminFacilityDialog.action.creating")
                    : writeBlocked
                      ? t("adminSecretaryDialog.action.unavailable")
                      : t("adminSecretaryDialog.action.createAccount")}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
