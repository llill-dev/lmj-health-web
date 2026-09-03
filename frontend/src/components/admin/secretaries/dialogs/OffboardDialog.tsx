import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdminOffboardUser } from "@/hooks/admin/doctors/useAdminOffboardUser";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import {
  AdminFormField,
  adminTextareaClass,
} from "@/components/admin/form-field";
import { useI18n } from "@/i18n/provider";

type Values = { reason: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUserId: string | null;
  targetDoctorId?: string | null;
  targetLabel: string;
  accountRole?: "secretary" | "doctor" | "staff";
  onSuccess?: () => void;
};

export default function OffboardDialog({
  open,
  onOpenChange,
  targetUserId,
  targetDoctorId = null,
  targetLabel,
  accountRole = "secretary",
  onSuccess,
}: Props) {
  const { dir, t } = useI18n();
  const [done, setDone] = useState(false);
  const offboard = useAdminOffboardUser();

  const schema = useMemo(
    () =>
      z.object({
        reason: z
          .string()
          .trim()
          .min(1, t("adminSecretaryDialog.offboard.reasonRequired")),
      }),
    [t],
  );

  const OFFBOARD_DESCRIPTION: Record<NonNullable<Props["accountRole"]>, string> = {
    secretary: t("adminSecretaryDialog.offboard.description.secretary"),
    doctor: t("adminSecretaryDialog.offboard.description.doctor"),
    staff: t("adminSecretaryDialog.offboard.description.staff"),
  };

  const defaultValues = useMemo(() => ({ reason: "" }), []);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues });

  useEffect(() => {
    if (!open) {
      setDone(false);
      offboard.reset();
      return;
    }

    const prevOverflow = document.body.style.overflow;
    const scrollW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollW > 0) document.body.style.paddingRight = `${scrollW}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = "";
    };
  }, [open]);

  async function onSubmit(values: Values) {
    if (!targetUserId) return;
    try {
      await offboard.mutateAsync({
        userId: targetUserId,
        reason: values.reason,
        doctorId: targetDoctorId ?? undefined,
      });
      setDone(true);
      onSuccess?.();
      setTimeout(() => onOpenChange(false), 1400);
    } catch {
      // error shown from offboard.error
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={t("adminSecretaryDialog.offboard.ariaLabel")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSubmitting)
              onOpenChange(false);
          }}
        >
          <motion.div
            className="relative max-h-[min(92vh,860px)] w-full max-w-[520px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
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
                disabled={isSubmitting}
                className="absolute end-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#667085] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50"
                aria-label={t("common.close")}
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
                  {t("adminSecretaryDialog.offboard.ariaLabel")}
                </h2>
                <p className="mt-2 font-cairo text-[13px] font-semibold text-[#667085]">
                  {t("adminSecretaryDialog.offboard.willSuspend")}{" "}
                  <span className="font-extrabold text-[#111827]">
                    {targetLabel}
                  </span>{" "}
                  {OFFBOARD_DESCRIPTION[accountRole]}
                  <br />
                  <span className="text-[#DC2626]">
                    {t("adminSecretaryDialog.offboard.irreversible")}
                  </span>
                </p>
              </div>
            </div>

            <form dir={dir} onSubmit={handleSubmit(onSubmit)}>
              <div className="max-h-[calc(92vh-220px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                  <AdminFormField
                    label={t("adminSecretaryDialog.offboard.field.reason.label")}
                    required
                    error={errors.reason?.message}
                  >
                    <textarea
                      {...register("reason")}
                      placeholder={t("adminSecretaryDialog.offboard.reason.placeholder")}
                      className={adminTextareaClass}
                    />
                  </AdminFormField>

                  {offboard.error && !done && (
                    <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[12px] font-bold text-[#991B1B]">
                      {userFacingErrorMessage(
                        offboard.error,
                        t("adminSecretaryDialog.offboard.error.generic"),
                      )}
                    </div>
                  )}

                  {done && (
                    <div className="rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 font-cairo text-[12px] font-bold text-[#166534]">
                      {t("adminSecretaryDialog.offboard.success")}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#EEF2F6] px-8 py-5">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-extrabold text-[#111827] disabled:opacity-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !targetUserId || done}
                  className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-[#DC2626] font-cairo text-[14px] font-extrabold text-white hover:bg-[#B91C1C] disabled:opacity-60"
                >
                  <AlertTriangle className="w-4 h-4" aria-hidden />
                  {isSubmitting
                    ? t("adminSecretaryDialog.offboard.confirming")
                    : t("adminSecretaryDialog.offboard.confirmButton")}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
