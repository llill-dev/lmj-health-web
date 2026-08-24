"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import type { ToastVariant } from "@/components/ui/ToastProvider";
import { useI18n } from "@/i18n/provider";

export type ConfirmSuccessToast = {
  message: string;
  title?: string;
  variant?: ToastVariant;
};

export default function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  confirmDisabled,
  cancelLabel,
  variant = "primary",
  icon,
  successToast,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  confirmDisabled?: boolean;
  cancelLabel?: string;
  variant?: "primary" | "destructive";
  icon?: ReactNode;
  /** يُظهر إشعاراً بعد نجاح التنفيذ (قبل إغلاق النافذة) */
  successToast?: ConfirmSuccessToast;
}) {
  const { toast } = useToast();
  const { locale, dir, t } = useI18n();
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
            if (e.target === e.currentTarget) onOpenChange(false);
          }}
        >
          <motion.div
            className="relative w-[460px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[18px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            dir={dir}
            lang={locale}
          >
            <div
              className={
                variant === "destructive"
                  ? "h-1 w-full bg-gradient-to-l from-[#DC2626] to-[#F87171]"
                  : "h-1 w-full bg-gradient-to-l from-[#0F8F8B] to-[#14B3AE]"
              }
              aria-hidden
            />
            <div className="relative px-7 pt-5 pb-6">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="absolute start-5 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] transition-colors hover:bg-[#F2F4F7]"
                aria-label={t("common.close")}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex gap-4 items-start pe-1">
                {icon ? (
                  <div
                    className={
                      variant === "destructive"
                        ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#FEF2F2] text-[#DC2626] shadow-[inset_0_0_0_1px_rgba(220,38,38,0.12)]"
                        : "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#F0FDFC] text-[#0F8F8B] shadow-[inset_0_0_0_1px_rgba(15,143,139,0.15)]"
                    }
                  >
                    {icon}
                  </div>
                ) : null}
                <div className="flex-1 min-w-0">
                  <h3 className="text-start font-cairo text-[20px] font-extrabold leading-[28px] text-[#101828]">
                    {title}
                  </h3>

                  <p className="mt-2 text-start font-cairo text-[13px] font-semibold leading-[22px] text-[#667085]">
                    {description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-end items-center mt-6">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="h-[40px] rounded-[10px] border border-[#E4E7EC] bg-white px-8 font-cairo text-[14px] font-extrabold text-[#344054] transition hover:bg-[#F9FAFB]"
                >
                  {cancelLabel || t("common.cancel")}
                </button>

                <button
                  type="button"
                  disabled={confirmDisabled}
                  onClick={async () => {
                    try {
                      await Promise.resolve(onConfirm());
                      if (successToast) {
                        toast(successToast.message, {
                          title: successToast.title,
                          variant: successToast.variant ?? "success",
                        });
                      }
                      onOpenChange(false);
                    } catch {
                      /* يبقى الحوار مفتوحاً لإعادة المحاولة */
                    }
                  }}
                  className={
                    variant === "destructive"
                      ? "h-[40px] rounded-[10px] bg-gradient-to-b from-[#DC2626] to-[#EF4444] px-8 font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_24px_rgba(220,38,38,0.28)] transition hover:brightness-[1.03] disabled:opacity-60"
                      : "h-[40px] rounded-[10px] bg-gradient-to-b from-[#0F8F8B] to-[#14B3AE] px-8 font-cairo text-[14px] font-extrabold text-white shadow-[0_14px_24px_rgba(15, 143, 139,0.22)] transition hover:brightness-[1.03] disabled:opacity-60"
                  }
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
