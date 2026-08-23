"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X, Building2, MapPin, Phone, FileText, User, Tag } from "lucide-react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin/client";
import { useI18n } from "@/i18n/provider";

function formatFacilityAttributeLabel(value: string): string {
  return value.replace(/_/g, " ");
}

function getFacilityLocationLabel(facility: Record<string, unknown>): string {
  const city =
    typeof facility.city === "string" ? facility.city.trim() : "";
  const country =
    typeof facility.country === "string" ? facility.country.trim() : "";

  if (city && country) return `${city}, ${country}`;
  return city || country || "—";
}

interface FacilityDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string | null;
}

export default function FacilityDetailsDialog({
  open,
  onOpenChange,
  facilityId,
}: FacilityDetailsDialogProps) {
  const { t } = useI18n();

  const FACILITY_TYPE_LABELS: Record<string, string> = {
    hospital: t("adminFacility.type.hospital"),
    clinic: t("adminFacility.type.clinic"),
    polyclinic: t("adminFacility.type.polyclinic"),
    medical_center: t("adminFacility.type.medicalCenter"),
    laboratory: t("adminFacility.type.laboratory"),
    imaging_center: t("adminFacility.type.imagingCenter"),
    pharmacy: t("adminFacility.type.pharmacy"),
    rehabilitation_center: t("adminFacility.type.rehabilitationCenter"),
    dialysis_center: t("adminFacility.type.dialysisCenter"),
    emergency_center: t("adminFacility.type.emergencyCenter"),
    other: t("adminFacility.type.other"),
  };

  const STATUS_LABELS: Record<string, string> = {
    ACTIVE: t("common.active"),
    PENDING: t("adminFacility.status.pending"),
    INACTIVE: t("common.disabled"),
    DELETED: t("adminFacility.status.deleted"),
  };

  const DOCTOR_APPROVAL_STATUS_LABELS: Record<string, string> = {
    approved: t("adminApproval.approved"),
    pending: t("adminFacility.status.pending"),
    rejected: t("adminApproval.rejected"),
  };

  const { data: facilityData, isLoading } = useQuery({
    queryKey: ["admin", "facility", facilityId],
    queryFn: () => adminApi.facilities.getById(facilityId!),
    enabled: !!facilityId && open,
  });

  const facility = facilityData?.facility as
    | Record<string, unknown>
    | undefined;
  const owner =
    facility?.owner && typeof facility.owner === "object"
      ? (facility.owner as Record<string, unknown>)
      : null;
  const ownerUser =
    owner?.user && typeof owner.user === "object"
      ? (owner.user as Record<string, unknown>)
      : null;
  const ownerDisplayName =
    (ownerUser?.fullName as string | undefined) ||
    (owner?.fullName as string | undefined) ||
    (facility?.ownerDoctorId as string | undefined);

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
          aria-label={t('adminFacilityDialog.details.ariaLabel')}
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
                className="absolute left-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
                aria-label={t("common.close")}
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <div className="relative text-right">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  {t('adminFacilityDialog.details.ariaLabel')}
                </h2>
              </div>
            </div>

            <div className="max-h-[calc(92vh-220px)] overflow-y-auto px-8 py-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : facility ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-4 pb-4 border-b border-[#EEF2F6]">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-cairo text-[18px] font-black leading-[24px] text-[#111827]">
                        {(facility.name as string) || "—"}
                      </div>
                      <div className="mt-1 font-cairo text-[12px] font-bold text-[#98A2B3]">
                        {FACILITY_TYPE_LABELS[
                          (facility.facilityType as string) || ""
                        ] ||
                          (facility.facilityType as string) ||
                          "—"}
                      </div>
                    </div>
                    <div className="inline-flex items-center rounded-[6px] border px-3 py-1.5 font-cairo text-[12px] font-bold">
                      {STATUS_LABELS[(facility.status as string) || ""] ||
                        (facility.status as string) ||
                        "—"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {typeof facility.doctorCount === "number" && (
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 mt-0.5 text-[#98A2B3]" />
                        <div className="flex-1">
                          <div className="font-cairo text-[11px] font-bold text-[#98A2B3] mb-1">
                            {t('adminFacilityDialog.details.doctorCount')}
                          </div>
                          <div className="font-cairo text-[14px] font-bold text-[#111827]">
                            {facility.doctorCount as number}
                          </div>
                        </div>
                      </div>
                    )}

                    {facility.city && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 mt-0.5 text-[#98A2B3]" />
                        <div className="flex-1">
                          <div className="font-cairo text-[11px] font-bold text-[#98A2B3] mb-1">
                            {t('adminFacilityDialog.details.location')}
                          </div>
                          <div className="font-cairo text-[14px] font-bold text-[#111827]">
                            {getFacilityLocationLabel(facility)}
                          </div>
                          {facility.address && (
                            <div className="font-cairo text-[12px] font-semibold text-[#667085] mt-0.5">
                              {facility.address as string}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {facility.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 mt-0.5 text-[#98A2B3]" />
                        <div className="flex-1">
                          <div className="font-cairo text-[11px] font-bold text-[#98A2B3] mb-1">
                            {t('adminFacilityDialog.field.phone.label')}
                          </div>
                          <div className="font-cairo text-[14px] font-bold text-[#111827]">
                            {facility.phone as string}
                          </div>
                        </div>
                      </div>
                    )}

                    {facility.description && (
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 mt-0.5 text-[#98A2B3]" />
                        <div className="flex-1">
                          <div className="font-cairo text-[11px] font-bold text-[#98A2B3] mb-1">
                            {t('adminFacilityDialog.field.description.label')}
                          </div>
                          <div className="font-cairo text-[14px] font-semibold text-[#667085]">
                            {facility.description as string}
                          </div>
                        </div>
                      </div>
                    )}

                    {ownerDisplayName && (
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 mt-0.5 text-[#98A2B3]" />
                        <div className="flex-1">
                          <div className="font-cairo text-[11px] font-bold text-[#98A2B3] mb-1">
                            {t('adminFacilityDialog.field.ownerDoctor.label')}
                          </div>
                          <div className="font-cairo text-[14px] font-bold text-[#111827]">
                            {ownerDisplayName}
                          </div>
                          {owner?.specialization && (
                            <div className="font-cairo text-[12px] font-semibold text-[#667085] mt-0.5">
                              {owner.specialization as string}
                            </div>
                          )}
                          {owner?.approvalStatus && (
                            <div className="font-cairo text-[11px] font-bold text-[#98A2B3] mt-1">
                              {t('adminFacilityDialog.details.approvalStatusPrefix')}
                              {DOCTOR_APPROVAL_STATUS_LABELS[owner.approvalStatus as string] ||
                                (owner.approvalStatus as string)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {facility.attributes &&
                      Array.isArray(facility.attributes) &&
                      facility.attributes.length > 0 && (
                        <div className="flex items-start gap-3">
                          <Tag className="h-5 w-5 mt-0.5 text-[#98A2B3]" />
                          <div className="flex-1">
                            <div className="font-cairo text-[11px] font-bold text-[#98A2B3] mb-1">
                              {t('adminFacilityDialog.field.attributes.label')}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {(facility.attributes as string[]).map(
                                (attribute) => (
                                  <span
                                    key={attribute}
                                    className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#E6F4F3] px-3 py-1 font-cairo text-[11px] font-bold text-primary"
                                  >
                                    <Tag className="w-3 h-3" aria-hidden />
                                    {formatFacilityAttributeLabel(attribute)}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 font-cairo text-[13px] font-semibold text-[#667085]">
                  {t('adminFacilityDialog.details.notFound')}
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
