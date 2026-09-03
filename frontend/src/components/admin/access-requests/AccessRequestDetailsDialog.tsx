"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { useEffect } from "react";
import { useI18n } from "@/i18n/provider";

function hasMissingAccessRequestIdentity(request: any) {
  const doctorName = request.doctor?.fullName || request.doctorName;
  const doctorEmail = request.doctor?.email || request.doctorEmail;
  const patientName = request.patient?.fullName || request.patientName;
  const patientId = request.patient?.publicId || request.patientId;

  return !doctorName || !doctorEmail || !patientName || !patientId;
}

interface AccessRequestDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string | null;
  request: any;
  isAwaitingData: boolean;
}

export default function AccessRequestDetailsDialog({
  open,
  onOpenChange,
  requestId,
  request,
  isAwaitingData,
}: AccessRequestDetailsDialogProps) {
  const { locale, t } = useI18n();
  const statusLabels: Record<string, string> = {
    pending: t("adminAccessRequests.status.pending"),
    approved: t("adminAccessRequests.status.approved"),
    rejected: t("adminAccessRequests.status.rejected"),
  };

  const statusColors: Record<string, string> = {
    pending: "bg-[#FEF3C7] text-[#B45309]",
    approved: "bg-[#ECFDF3] text-[#16A34A]",
    rejected: "bg-[#FEF2F2] text-[#B42318]",
  };

  const statusIcons: Record<string, any> = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
  };

  const dateLocale = locale === "ar" ? "ar-SY" : "en-US";

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
          aria-label={t("adminAccessRequests.details.ariaLabel")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onOpenChange(false);
          }}
        >
          <motion.div
            className="relative max-h-[min(92vh,860px)] w-full max-w-2xl overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
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
                className="absolute end-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
                aria-label={t("common.close")}
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
              <div className="relative text-start">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  {t("adminAccessRequests.details.ariaLabel")}
                </h2>
                <p className="mt-1 font-cairo text-[13px] font-semibold text-[#5B7B79]">
                  {requestId || "—"}
                </p>
              </div>
            </div>

            <div className="max-h-[calc(92vh-200px)] overflow-y-auto px-8 py-6">
              {isAwaitingData ? (
                <div className="py-12 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                  {t("adminAccessRequests.loadingDetails")}
                </div>
              ) : !request ? (
                <div className="py-12 text-center font-cairo text-[13px] font-semibold text-[#B42318]">
                  {t("adminAccessRequests.loadError")}
                </div>
              ) : (
                <div className="space-y-5">
                  {hasMissingAccessRequestIdentity(request) ? (
                    <div className="rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-[#D97706]" />
                        <div className="font-cairo text-[12px] font-bold text-[#92400E]">
                          {t("adminAccessRequests.incompleteData.title")}
                        </div>
                      </div>
                      <div className="font-cairo text-[11px] font-semibold leading-5 text-[#B45309]">
                        {t("adminAccessRequests.incompleteData.body")}
                      </div>
                    </div>
                  ) : null}

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                      {t("adminAccessRequests.requestStatusLabel")}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-cairo text-[11px] font-extrabold ${statusColors[request.status || "pending"]}`}
                    >
                      {(() => {
                        const StatusIcon =
                          statusIcons[request.status || "pending"];
                        return <StatusIcon className="h-3.5 w-3.5" />;
                      })()}
                      {statusLabels[request.status || "pending"]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-[12px] border border-[#EEF2F6] bg-[#F8FAFC] p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <div className="font-cairo text-[11px] font-bold text-[#667085]">
                          {t("adminAccessRequests.requestType.label")}
                        </div>
                      </div>
                      <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
                        {t("adminAccessRequests.requestType.value")}
                      </div>
                    </div>
                    <div className="rounded-[12px] border border-[#EEF2F6] bg-[#F8FAFC] p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <div className="font-cairo text-[11px] font-bold text-[#667085]">
                          {t("adminAccessRequests.currentAction.label")}
                        </div>
                      </div>
                      <div className="font-cairo text-[12px] font-extrabold text-[#111827]">
                        {request.status === "pending"
                          ? t("adminAccessRequests.currentAction.pending")
                          : request.status === "approved"
                            ? t("adminAccessRequests.currentAction.approved")
                            : t("adminAccessRequests.currentAction.rejected")}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[12px] border border-[#D6EEEC] bg-[#F3FBFA] p-4">
                    <div className="font-cairo text-[12px] font-semibold leading-6 text-[#215A57]">
                      {request.status === "pending"
                        ? t("adminAccessRequests.contextNote.pending")
                        : request.status === "approved"
                          ? t("adminAccessRequests.contextNote.approved")
                          : t("adminAccessRequests.contextNote.rejected")}
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <div className="font-cairo text-[12px] font-bold text-[#111827]">
                        {t("adminAccessRequests.doctorInfo.title")}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          {t("common.fullNameLabel")}
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.doctor?.fullName ||
                            request.doctorName ||
                            "—"}
                        </div>
                      </div>
                      <div>
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          {t("adminSecretaryDialog.field.email.label")}
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.doctor?.email || request.doctorEmail || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          {t("adminAccessRequests.phoneLabel")}
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.doctor?.phone || request.doctorPhone || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          {t("adminDoctorProfileChangeRequests.field.specialization")}
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.doctor?.specialization || "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <div className="font-cairo text-[12px] font-bold text-[#111827]">
                        {t("adminAccessRequests.patientInfo.title")}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          {t("common.fullNameLabel")}
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.patient?.fullName ||
                            request.patientName ||
                            "—"}
                        </div>
                      </div>
                      <div>
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          {t("adminAccessRequests.referenceIdLabel")}
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.patient?.publicId ||
                            request.patientId ||
                            "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFAFA] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div className="font-cairo text-[12px] font-bold text-[#111827]">
                        {t("adminAccessRequests.requestDetails.title")}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          {t("adminAccessRequests.requestDateLabel")}
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.createdAt
                            ? new Date(request.createdAt).toLocaleDateString(
                                dateLocale,
                              )
                            : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          {t("adminAccessRequests.requestTimeLabel")}
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.createdAt
                            ? new Date(request.createdAt).toLocaleTimeString(
                                dateLocale,
                              )
                            : "—"}
                        </div>
                      </div>
                    </div>
                    {request.reason && (
                      <div className="mt-3">
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          {t("adminAccessRequests.requestReasonLabel")}
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {request.reason}
                        </div>
                      </div>
                    )}
                    {request.reviewedAt ? (
                      <div className="mt-3">
                        <div className="font-cairo text-[10px] font-semibold text-[#98A2B3]">
                          {t("adminAccessRequests.reviewDateLabel")}
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#111827]">
                          {new Date(request.reviewedAt).toLocaleString(dateLocale)}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Notes */}
                  {request.notes && (
                    <div className="rounded-[12px] border border-[#E5E7EB] bg-[#FFFBEB] p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-[#D97706]" />
                        <div className="font-cairo text-[12px] font-bold text-[#92400E]">
                          {t("adminMedicalOrders.field.notes.label")}
                        </div>
                      </div>
                      <div className="font-cairo text-[11px] font-semibold text-[#B45309]">
                        {request.notes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 border-t border-[#EEF2F6] px-8 py-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary"
              >
                {t("common.close")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
