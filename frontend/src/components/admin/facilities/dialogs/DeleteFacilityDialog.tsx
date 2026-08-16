"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/ToastProvider";
import { adminApi } from "@/lib/admin/client";
import { resolveAdminFacilityFormFeedback } from "@/lib/admin/facilities/facilityFormErrors";

interface DeleteFacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string | null;
  facilityName?: string;
}

export default function DeleteFacilityDialog({
  open,
  onOpenChange,
  facilityId,
  facilityName,
}: DeleteFacilityDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [rootError, setRootError] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: () => adminApi.facilities.remove(facilityId!),
    meta: {
      skipGlobalError: true,
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "facilities"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "facility", facilityId] });
      setRootError("");
      onOpenChange(false);
    },
    onError: (error) => {
      const feedback = resolveAdminFacilityFormFeedback(error, "edit");
      setRootError(feedback.rootBanner ?? "");
      toast(feedback.toastMessage, {
        title: "حذف المنشأة",
        variant: "error",
        durationMs: 4200,
      });
    },
  });

  useEffect(() => {
    if (open) {
      setConfirmText("");
      setRootError("");
    }
  }, [facilityId, facilityName, open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityId) return;
    mutation.mutate();
  };

  const isConfirmed = confirmText === facilityName;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label="حذف المنشأة"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onOpenChange(false);
          }}
        >
          <motion.div
            className="relative w-full max-w-[480px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
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
                className="absolute left-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <div className="relative text-right">
                <h2 className="font-cairo text-[22px] font-extrabold text-red-600">
                  حذف المنشأة
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6">
              {rootError ? (
                <div className="mb-4 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[12px] font-bold text-[#B42318]">
                  {rootError}
                </div>
              ) : null}
              <div className="flex items-start gap-3 mb-6">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-red-50 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-cairo text-[13px] font-semibold text-[#111827] mb-2">
                    هل أنت متأكد من حذف هذه المنشأة؟
                  </p>
                  {facilityName && (
                    <p className="font-cairo text-[12px] font-bold text-[#667085]">
                      {facilityName}
                    </p>
                  )}
                  <p className="font-cairo text-[11px] font-semibold text-[#DC2626] mt-2">
                    الحذف هنا حذف منطقي فقط، وسيؤدي أيضًا إلى إزالة ربط الأطباء بهذه المنشأة.
                  </p>
                </div>
              </div>

              {facilityName && (
                <div className="mb-6">
                  <label className="block font-cairo text-[12px] font-extrabold text-[#111827] mb-2">
                    اكتب اسم المنشأة للتأكيد
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => {
                      setConfirmText(e.target.value);
                      if (rootError) setRootError("");
                    }}
                    placeholder={facilityName}
                    className="w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2.5 font-cairo text-[12px] font-bold text-[#344054] placeholder:text-[#98A2B3] focus:border-red-600 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-[48px] items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-extrabold text-[#344054]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!isConfirmed || mutation.isPending}
                  className="flex-1 h-[48px] items-center justify-center rounded-[12px] border border-red-600 bg-red-600 font-cairo text-[14px] font-extrabold text-white disabled:opacity-50"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin ml-2" aria-hidden />
                      جاري الحذف...
                    </>
                  ) : (
                    "حذف"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
