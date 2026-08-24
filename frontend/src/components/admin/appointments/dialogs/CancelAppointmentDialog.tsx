"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/ToastProvider";
import type { ToastVariant } from "@/components/ui/ToastProvider";
import {
  AdminFormField,
  adminTextareaClass,
} from "@/components/admin/form-field";
import { useI18n } from "@/i18n/provider";

type CancelAppointmentFormValues = { reason: string };

export default function CancelAppointmentDialog({
  open,
  onOpenChange,
  targetName,
  onConfirm,
  confirmDisabled,
  confirmLabel,
  successToast,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetName: string;
  onConfirm: (reason: string) => void | Promise<void>;
  confirmDisabled?: boolean;
  confirmLabel?: string;
  successToast?: { title?: string; message: string; variant?: ToastVariant };
}) {
  const { locale, dir, t } = useI18n();
  const { toast } = useToast();
  const cancelAppointmentSchema = useMemo(
    () =>
      z.object({
        reason: z.string().max(300, t("adminAppointments.cancel.validation.reasonTooLong")),
      }),
    [t],
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<CancelAppointmentFormValues>({
    resolver: zodResolver(cancelAppointmentSchema),
    defaultValues: {
      reason: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) {
              onOpenChange(false);
              reset({ reason: "" });
            }
          }}
        >
          <motion.div
            className="relative w-[680px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            dir={dir}
            lang={locale}
          >
            <div className="relative px-8 pt-7">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  onOpenChange(false);
                  reset({ reason: "" });
                }}
                className="absolute start-6 top-6 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={t("common.close")}
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-start font-cairo text-[24px] font-extrabold leading-[30px] text-[#101828]">
                {t("adminAppointments.cancel.title")}
              </h2>

              <div className="mt-10 text-start">
                <div className="font-cairo text-[14px] font-bold text-[#101828]">
                  {t("adminAppointments.cancel.targetLabel")}
                </div>
                <div className="mt-1 font-cairo text-[16px] font-extrabold text-[#101828]">
                  {targetName}
                </div>
              </div>

              <div className="mt-7">
                <AdminFormField
                  label={t("adminAppointments.cancel.reasonLabel")}
                  error={errors.reason?.message}
                >
                  <textarea
                    {...register("reason")}
                    placeholder={t("adminAppointments.cancel.reason.placeholder")}
                    className={adminTextareaClass}
                    rows={5}
                  />
                </AdminFormField>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 pb-7">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    onOpenChange(false);
                    reset({ reason: "" });
                  }}
                  className="h-[46px] w-full rounded-[10px] border border-[#F04438] bg-white font-cairo text-[14px] font-extrabold text-[#F04438] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t("common.cancel")}
                </button>

                <button
                  type="button"
                  disabled={confirmDisabled || isSubmitting}
                  onClick={handleSubmit(async (values) => {
                    try {
                      await onConfirm(values.reason.trim());
                      if (successToast) {
                        toast(successToast.message, {
                          title: successToast.title,
                          variant: successToast.variant ?? "success",
                          durationMs: 4200,
                        });
                      }
                      onOpenChange(false);
                      reset({ reason: "" });
                    } catch {
                      /* keep open on failure */
                    }
                  })}
                  className="flex h-[46px] w-full items-center justify-center gap-3 rounded-[10px] bg-gradient-to-b from-[#0F8F8B] to-[#14B3AE] font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_24px_rgba(15, 143, 139,0.25)] disabled:opacity-60"
                >
                  <span>{confirmLabel ?? t("adminAppointments.cancel.confirmAction")}</span>
                  <Check className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
