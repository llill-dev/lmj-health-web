"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X, FileText, User, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import StyledSelect from "@/components/ui/styled-select";
import { adminApi } from "@/lib/admin/client";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import type { AdminDoctorProfileChangeRequest } from "@/hooks/admin/doctors/useAdminDoctorProfileChangeRequests";
import {
  AdminFormField,
  adminTextareaClass,
} from "@/components/admin/form-field";
import { useI18n } from "@/i18n/provider";
import { getCurrentLocale } from "@/i18n/runtime";

interface ReviewProfileChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: AdminDoctorProfileChangeRequest | null;
  onSuccess?: () => void;
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  if (Array.isArray(value)) {
    const separator = getCurrentLocale() === "ar" ? "، " : ", ";
    return value.map((item) => renderValue(item)).join(separator);
  }
  if (typeof value === "object") {
    const localized = value as { ar?: unknown; en?: unknown; label?: unknown };
    const locale = getCurrentLocale();
    const primary = locale === "ar" ? localized.ar : localized.en;
    const secondary = locale === "ar" ? localized.en : localized.ar;
    if (typeof primary === "string" && primary.trim()) {
      return primary;
    }
    if (typeof secondary === "string" && secondary.trim()) {
      return secondary;
    }
    if (typeof localized.label === "string" && localized.label.trim()) {
      return localized.label;
    }
  }
  return "—";
}

export default function ReviewProfileChangeDialog({
  open,
  onOpenChange,
  request,
  onSuccess,
}: ReviewProfileChangeDialogProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decision, setDecision] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const DECISION_OPTIONS = [
    { value: "approved", label: t("adminUsersDialog.restore.decisionOption.approved") },
    { value: "denied", label: t("adminUsersDialog.restore.decisionOption.rejected") },
  ];

  const FIELD_LABELS: Record<string, string> = {
    specialization: t("adminDoctorProfileChangeRequests.field.specialization"),
    medicalLicenseNumber: t("adminDoctorProfileChangeRequests.field.medicalLicenseNumber"),
    education: t("adminDoctorProfileChangeRequests.field.education"),
    clinicAddress: t("adminDoctorProfileChangeRequests.field.clinicAddress"),
    locationCity: t("adminFacilityDialog.field.city.label"),
    locationCountry: t("adminDoctorProfileChangeRequests.field.locationCountry"),
    bio: t("adminDoctorProfileChangeRequests.field.bio"),
    consultationFee: t("adminDoctorProfileChangeRequests.field.consultationFee"),
    clinicLat: t("adminDoctorProfileChangeRequests.field.clinicLat"),
    clinicLng: t("adminDoctorProfileChangeRequests.field.clinicLng"),
  };

  useEffect(() => {
    setDecision("");
    setAdminNote("");
  }, [open, request?._id]);

  if (!request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!decision) {
      toast(t("adminDoctorProfileChangeRequests.toast.decisionRequired"), {
        title: t("adminUsersDialog.restore.toast.validationErrorTitle"),
        variant: "error",
        durationMs: 4200,
      });
      return;
    }

    if (decision === "denied" && !adminNote.trim()) {
      toast(t("adminDoctorProfileChangeRequests.toast.noteRequired"), {
        title: t("adminUsersDialog.restore.toast.validationErrorTitle"),
        variant: "error",
        durationMs: 4200,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await adminApi.doctorProfileChangeRequests.review(request._id, {
        decision: decision as "approved" | "denied",
        adminNote: adminNote || undefined,
      });

      const doctorLabel = request.doctor?.userId?.fullName || request.doctor?._id || "—";
      const message =
        decision === "approved"
          ? t("adminDoctorProfileChangeRequests.toast.approvedBody").replace("{name}", doctorLabel)
          : t("adminDoctorProfileChangeRequests.toast.rejectedBody").replace("{name}", doctorLabel);
      toast(message, {
        title: decision === "approved" ? t("adminUsersDialog.restore.toast.approvedTitle") : t("adminUsersDialog.restore.toast.rejectedTitle"),
        variant: "success",
        durationMs: 4200,
      });

      setDecision("");
      setAdminNote("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast(
        userFacingErrorMessage(
          error,
          t("adminDoctorProfileChangeRequests.toast.genericError"),
        ),
        {
        title: t("common.operationFailed"),
        variant: "error",
        durationMs: 4200,
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (!isSubmitting && e.target === e.currentTarget) onOpenChange(false);
          }}
        >
          <motion.div
            className="relative w-full max-w-3xl overflow-hidden rounded-[16px] bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-cairo text-[16px] font-extrabold text-[#111827]">
                    {t("adminDoctorProfileChangeRequests.title")}
                  </h3>
                  <p className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                    {t("adminDoctorProfileChangeRequests.subtitle")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#667085] transition hover:bg-[#F9FAFB]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              {/* Doctor Info */}
              <div className="rounded-[10px] bg-[#F9FAFB] border border-[#E5E7EB] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                      {request.doctor?.userId?.fullName || request.doctor?._id}
                    </div>
                    <div className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                      {request.doctor?.specialization || "—"}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="font-cairo font-semibold text-[#667085]">
                    {t("adminDoctorProfileChangeRequests.licenseNumberPrefix")}{request.doctor?.medicalLicenseNumber || "—"}
                  </div>
                  <div className="font-cairo font-semibold text-[#667085]">
                    {t("adminDoctorProfileChangeRequests.requestedByPrefix")}{request.requestedBy?.fullName || "—"}
                  </div>
                </div>
              </div>

              {/* Changes List */}
              {request.items && request.items.length > 0 ? (
                <div>
                  <label className="block mb-3 font-cairo text-[12px] font-extrabold text-[#111827]">
                    {t("adminDoctorProfileChangeRequests.requestedChanges")}
                  </label>
                  <div className="space-y-3">
                    {request.items.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-[10px] border border-[#E5E7EB] bg-white p-4"
                      >
                        <div className="font-cairo text-[12px] font-extrabold text-[#111827] mb-2">
                          {FIELD_LABELS[item.field] || item.field}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="font-cairo text-[10px] font-semibold text-[#98A2B3] mb-1">
                              {t("adminDoctorProfileChangeRequests.currentValue")}
                            </div>
                            <div className="font-cairo text-[11px] font-bold text-[#667085] bg-[#F9FAFB] p-2 rounded-[6px]">
                              {renderValue(item.oldValue)}
                            </div>
                          </div>
                          <div>
                            <div className="font-cairo text-[10px] font-semibold text-[#16A34A] mb-1">
                              {t("adminDoctorProfileChangeRequests.newValue")}
                            </div>
                            <div className="font-cairo text-[11px] font-bold text-[#16A34A] bg-[#F0FDF4] p-2 rounded-[6px]">
                              {renderValue(item.newValue)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-[#D97706] shrink-0 mt-0.5" />
                  <div className="font-cairo text-[12px] font-semibold text-[#92400E]">
                    {t("adminDoctorProfileChangeRequests.noChangeDetails")}
                  </div>
                </div>
              )}

              {/* Decision */}
              <div>
                <label className="block mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                  {t("adminDoctorProfileChangeRequests.field.decision.placeholder")} *
                </label>
                <StyledSelect
                  value={decision}
                  onChange={setDecision}
                  options={DECISION_OPTIONS}
                  placeholder={t("adminDoctorProfileChangeRequests.field.decision.placeholder")}
                  size="sm"
                  tone="muted"
                  disabled={isSubmitting}
                />
              </div>

              {/* Admin Note */}
              <AdminFormField
                label={t("adminDoctorProfileChangeRequests.adminNoteLabel")}
                required={decision === "denied"}
              >
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  disabled={isSubmitting}
                  placeholder={
                    decision === "denied"
                      ? t("adminDoctorProfileChangeRequests.field.note.denyPlaceholder")
                      : t("adminDoctorProfileChangeRequests.field.note.optionalPlaceholder")
                  }
                  rows={3}
                  className={adminTextareaClass}
                />
              </AdminFormField>

              {/* Warning for approval */}
              {decision === "approved" && (
                <div className="rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] p-3 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-[#D97706] shrink-0 mt-0.5" />
                  <div className="font-cairo text-[11px] font-semibold text-[#92400E]">
                    {t("adminDoctorProfileChangeRequests.approveWarning")}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="flex-1 h-[44px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white font-cairo text-[12px] font-extrabold text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !decision}
                  className="flex-1 h-[44px] items-center justify-center rounded-[10px] border border-primary bg-primary font-cairo text-[12px] font-extrabold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? t("adminDoctorProfileChangeRequests.processing")
                    : decision === "approved"
                      ? t("adminDoctorProfileChangeRequests.approveAndUpdate")
                      : t("adminDoctorProfileChangeRequests.rejectRequest")}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
