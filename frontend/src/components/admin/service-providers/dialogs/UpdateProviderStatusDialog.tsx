"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X, AlertTriangle, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { useI18n } from "@/i18n/provider";
import StyledSelect from "@/components/ui/styled-select";
import { adminApi } from "@/lib/admin/client";
import { getAdminServiceProviderMutationErrorMessage } from "@/lib/admin/adminWriteFlowErrors";
import { AdminFormField } from "@/components/admin/form-field";

interface UpdateProviderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
  providerName: string;
  currentStatus: string;
  /** When the provider's service type is inactive, "active" is disabled client-side —
   * the backend has no documented transition matrix, so this is a soft UX guard only. */
  isServiceTypeActive?: boolean;
  onSuccess?: () => void;
}

export default function UpdateProviderStatusDialog({
  open,
  onOpenChange,
  providerId,
  providerName,
  currentStatus,
  isServiceTypeActive = true,
  onSuccess,
}: UpdateProviderStatusDialogProps) {
  const { dir, t } = useI18n();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const STATUS_OPTIONS = [
    { value: "draft", label: t("adminServiceProvider.status.draft") },
    { value: "active", label: t("common.active") },
    { value: "inactive", label: t("common.disabled") },
  ];

  useEffect(() => {
    if (open) setStatus(currentStatus);
  }, [open, currentStatus]);

  const statusOptions = isServiceTypeActive
    ? STATUS_OPTIONS
    : STATUS_OPTIONS.filter((o) => o.value !== "active");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === currentStatus) {
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await adminApi.serviceProviders.updateStatus(providerId, { status });

      toast(t("adminServiceProviderDialog.toast.statusUpdated"), {
        title: t("adminFacilityDialog.toast.updatedTitle"),
        variant: "success",
        durationMs: 4200,
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast(getAdminServiceProviderMutationErrorMessage(error, "status"), {
        title: t("common.operationFailed"),
        variant: "error",
        durationMs: 4200,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={t("adminServiceProviderDialog.changeStatus.ariaLabel")}
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
                className="absolute left-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50"
                aria-label={t("common.close")}
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <div className="relative text-right">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  {t("adminServiceProviderDialog.changeStatus.ariaLabel")}
                </h2>
                <p className="mt-1 font-cairo text-[13px] font-bold text-[#667085]">
                  {providerName}
                </p>
              </div>
            </div>

            <form dir={dir} onSubmit={handleSubmit}>
              <div className="max-h-[calc(92vh-220px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                  <AdminFormField
                    label={t("adminFacilityDialog.changeStatus.newStatusLabel")}
                    required
                    hint={
                      !isServiceTypeActive
                        ? t("adminServiceProviderDialog.changeStatus.inactiveTypeHint")
                        : undefined
                    }
                  >
                    <StyledSelect
                      value={status}
                      onChange={setStatus}
                      options={statusOptions}
                      placeholder={t("common.selectStatus")}
                    />
                  </AdminFormField>

                  <div className="rounded-[12px] bg-[#FFFBEB] border border-[#FDE68A] p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-[#D97706] mt-0.5 shrink-0" />
                      <div className="font-cairo text-[12px] font-semibold text-[#92400E] leading-relaxed">
                        {t("adminServiceProviderDialog.changeStatus.warning")}
                      </div>
                    </div>
                  </div>
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
                  disabled={isSubmitting || status === currentStatus}
                  className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
                >
                  <Check className="w-4 h-4" aria-hidden />
                  {isSubmitting ? t("adminFacilityDialog.action.updating") : t("adminServiceProviderDialog.changeStatus.confirmButton")}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
