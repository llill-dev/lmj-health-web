"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/ToastProvider";
import { adminApi } from "@/lib/admin/client";
import { resolveAdminFacilityFormFeedback } from "@/lib/admin/facilities/facilityFormErrors";
import StyledSelect from "@/components/ui/styled-select";
import { useI18n } from "@/i18n/provider";

interface ChangeFacilityStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string | null;
  facilityName?: string;
  currentStatus?: string;
}

export default function ChangeFacilityStatusDialog({
  open,
  onOpenChange,
  facilityId,
  facilityName,
  currentStatus,
}: ChangeFacilityStatusDialogProps) {
  const { t } = useI18n();
  const STATUS_OPTIONS = [
    { value: "ACTIVE", label: t("common.active") },
    { value: "PENDING", label: t("adminFacility.status.pending") },
    { value: "INACTIVE", label: t("common.disabled") },
    { value: "DELETED", label: t("adminFacility.status.deleted") },
  ];
  const [selectedStatus, setSelectedStatus] = useState("");
  const [rootError, setRootError] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (status: string) =>
      adminApi.facilities.updateStatus(facilityId!, status),
    meta: {
      skipGlobalError: true,
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "facilities"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "facility", facilityId],
      });
      setRootError("");
      onOpenChange(false);
    },
    onError: (error) => {
      const feedback = resolveAdminFacilityFormFeedback(error, "edit");
      setRootError(feedback.rootBanner ?? "");
      toast(feedback.toastMessage, {
        title: feedback.toastTitle,
        variant: "error",
        durationMs: 4200,
      });
    },
  });

  useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus || "");
      setRootError("");
    }
  }, [facilityId, facilityName, open, currentStatus]);

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
    if (!selectedStatus || !facilityId) return;
    mutation.mutate(selectedStatus);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={t('adminFacilityDialog.changeStatus.ariaLabel')}
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
                className="absolute left-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
                aria-label={t("common.close")}
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <div className="relative text-right">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  {t('adminFacilityDialog.changeStatus.ariaLabel')}
                </h2>
                {facilityName && (
                  <p className="mt-1 font-cairo text-[12px] font-bold text-[#667085]">
                    {facilityName}
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6">
              {rootError ? (
                <div className="mb-4 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[12px] font-bold text-[#B42318]">
                  {rootError}
                </div>
              ) : null}
              <div className="mb-6">
                <label className="block font-cairo text-[12px] font-extrabold text-[#111827] mb-2">
                  {t('adminFacilityDialog.changeStatus.newStatusLabel')}
                </label>
                <p className="mb-2 text-right font-cairo text-[12px] font-bold leading-6 text-[#667085]">
                  {t('adminFacilityDialog.changeStatus.explain')}
                </p>
                <StyledSelect
                  value={selectedStatus}
                  onChange={(value) => {
                    setSelectedStatus(value);
                    if (rootError) setRootError("");
                  }}
                  options={STATUS_OPTIONS}
                  placeholder={t('common.selectStatus')}
                />
              </div>

              {currentStatus ? (
                <div className="mb-4 rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-right font-cairo text-[12px] font-bold text-[#475467]">
                  {t('adminFacilityDialog.changeStatus.currentStatusPrefix')}{STATUS_OPTIONS.find((option) => option.value === currentStatus)?.label ?? currentStatus}
                </div>
              ) : null}

              {selectedStatus === "DELETED" ? (
                <div className="mb-6 rounded-[12px] border border-[#FECACA] bg-[#FFF1F2] px-4 py-3 font-cairo text-[12px] font-bold text-[#B42318]">
                  {t('adminFacilityDialog.changeStatus.deletedWarning')}
                </div>
              ) : selectedStatus && selectedStatus !== currentStatus ? (
                <div className="mb-6 rounded-[12px] border border-[#D9F2EF] bg-[#F4FFFD] px-4 py-3 text-right font-cairo text-[12px] font-bold text-[#0F766E]">
                  {t('adminFacilityDialog.changeStatus.pendingSaveNote')}
                </div>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-[48px] items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white font-cairo text-[14px] font-extrabold text-[#344054]"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!selectedStatus || mutation.isPending}
                  className="flex-1 h-[48px] items-center justify-center rounded-[12px] border border-primary bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-50"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2
                        className="w-4 h-4 animate-spin ml-2"
                        aria-hidden
                      />
                      {t('adminFacilityDialog.changeStatus.saving')}
                    </>
                  ) : (
                    t('adminFacilityDialog.changeStatus.submit')
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
