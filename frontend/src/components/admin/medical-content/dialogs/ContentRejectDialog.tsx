"use client";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AdminFormField,
  adminTextareaClass,
} from "@/components/admin/form-field";

const schema = z.object({
  reason: z
    .string()
    .min(4, "أدخل سبباً واضحاً (4 أحرف على الأقل)")
    .max(2000, "الحد الأقصى 2000 حرف"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentTitle: string;
  onConfirm: (reason: string) => void | Promise<void>;
  isPending: boolean;
};

export default function ContentRejectDialog({
  open,
  onOpenChange,
  contentTitle,
  onConfirm,
  isPending,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "" },
  });

  useEffect(() => {
    if (!open) {
      reset({ reason: "" });
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label="رفض المحتوى"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isPending) onOpenChange(false);
          }}
        >
          <motion.div
            className="relative max-h-[min(92vh,860px)] w-full max-w-[460px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden border-b border-[#EEF2F6] px-8 pb-5 pt-8">
              <div
                className="pointer-events-none absolute inset-0 bg-[#FEF2F2]"
                aria-hidden
              />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="absolute left-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <div className="relative text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2]">
                    <AlertTriangle
                      className="h-7 w-7 text-[#DC2626]"
                      aria-hidden
                    />
                  </div>
                </div>
                <h2 className="font-cairo text-[22px] font-extrabold text-[#101828]">
                  رفض المحتوى
                </h2>
                <p className="mt-2 font-cairo text-[13px] font-semibold text-[#667085]">
                  سيتم رفض:{" "}
                  <span className="text-[#101827]">
                    «{contentTitle || "—"}»
                  </span>
                </p>
              </div>
            </div>

            <form
              dir="rtl"
              onSubmit={handleSubmit(async (v) => {
                await onConfirm(v.reason.trim());
              })}
            >
              <div className="max-h-[calc(92vh-220px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                  <AdminFormField
                    label="سبب الرفض"
                    required
                    error={errors.reason?.message}
                  >
                    <textarea
                      {...register("reason")}
                      rows={4}
                      placeholder="وضّح ما يجب تعديله…"
                      className={adminTextareaClass}
                    />
                  </AdminFormField>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#EEF2F6] px-8 py-5">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-extrabold text-[#111827] disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#DC2626] font-cairo text-[14px] font-extrabold text-white hover:bg-[#B91C1C] disabled:opacity-60"
                >
                  {isPending ? "جاري الرفض…" : "تأكيد الرفض"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
