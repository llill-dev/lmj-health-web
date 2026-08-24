"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  User,
  Loader2,
  Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/client";
import { useI18n } from "@/i18n/provider";

interface FacilityDoctorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string | null;
  facilityName?: string;
}

export default function FacilityDoctorsDialog({
  open,
  onOpenChange,
  facilityId,
  facilityName,
}: FacilityDoctorsDialogProps) {
  const { t } = useI18n();
  const DOCTOR_APPROVAL_STATUS_LABELS: Record<string, string> = {
    approved: t("adminApproval.approved"),
    pending: t("adminFacility.status.pending"),
    rejected: t("adminApproval.rejected"),
  };
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [facilityId, open]);

  const { data: doctorsData, isLoading } = useQuery({
    queryKey: ["admin", "facility", facilityId, "doctors", searchQuery],
    queryFn: () =>
      adminApi.facilities.listDoctors(facilityId!, {
        page: 1,
        limit: 50,
        q: searchQuery || undefined,
      }),
    enabled: !!facilityId && open,
  });

  const doctors = doctorsData?.doctors || [];

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

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={t('adminFacilityDialog.doctors.ariaLabelTemplate').replace('{name}', facilityName || t('adminFacilityDialog.doctors.fallbackName'))}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onOpenChange(false);
          }}
        >
          <motion.div
            className="relative max-h-[min(92vh,860px)] w-full max-w-[640px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
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
                className="absolute start-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
                aria-label={t("common.close")}
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <div className="relative text-start">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  {t('adminFacilityDialog.doctors.titleGeneric')}
                </h2>
                {facilityName && (
                  <p className="mt-1 font-cairo text-[12px] font-bold text-[#667085]">
                    {facilityName}
                  </p>
                )}
              </div>
            </div>

            <div className="max-h-[calc(92vh-220px)] overflow-y-auto px-8 py-6">
              <div className="relative mb-4">
                <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#98A2B3]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('common.searchByName')}
                  className="w-full rounded-[8px] border border-[#E5E7EB] bg-white pe-10 ps-3 py-2.5 font-cairo text-[12px] font-bold text-[#344054] placeholder:text-[#98A2B3] focus:border-primary focus:outline-none"
                />
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-8 font-cairo text-[13px] font-semibold text-[#667085]">
                  {searchQuery.trim()
                    ? t('adminFacilityDialog.doctors.noMatch')
                    : t('adminFacilityDialog.doctors.noneInFacility')}
                </div>
              ) : (
                <div className="space-y-3">
                  {doctors.map((doctor: Record<string, unknown>) => {
                    const doctorUser =
                      doctor.user && typeof doctor.user === "object"
                        ? (doctor.user as Record<string, unknown>)
                        : null;
                    const doctorId =
                      (doctor.id as string | undefined) ||
                      (doctor._id as string | undefined) ||
                      "";

                    return (
                      <div
                        key={doctorId}
                        className="flex items-center gap-4 rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.05)]"
                      >
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-cairo text-[15px] font-black leading-[20px] text-[#111827]">
                            {(doctorUser?.fullName as string | undefined) || "—"}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-cairo text-[11px] font-bold text-[#98A2B3]">
                            <span>{doctorId || "—"}</span>
                            {doctor.specialization && (
                              <span>{doctor.specialization as string}</span>
                            )}
                            {doctor.approvalStatus && (
                              <span>
                                {DOCTOR_APPROVAL_STATUS_LABELS[doctor.approvalStatus as string] ||
                                  (doctor.approvalStatus as string)}
                              </span>
                            )}
                          </div>
                          {doctorUser?.email && (
                            <div
                              dir="ltr"
                              className="mt-1 font-cairo text-[11px] font-semibold text-[#667085]"
                            >
                              {doctorUser.email as string}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-[#EEF2F6] px-8 py-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-[48px] w-full items-center justify-center rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary"
              >
                {t('common.close')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
