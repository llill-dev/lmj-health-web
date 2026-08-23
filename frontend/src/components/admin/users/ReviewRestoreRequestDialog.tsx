"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X, FileText, User, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import StyledSelect from "@/components/ui/styled-select";
import { adminApi } from "@/lib/admin/client";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import { useI18n } from "@/i18n/provider";

interface RestoreRequest {
  _id: string;
  status?: string;
  userId?: string;
  doctorId?: string;
  doctorName?: string;
  doctorEmail?: string;
  requestedAt?: string;
  reason?: string;
  deletionReason?: string;
}

interface ReviewRestoreRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: RestoreRequest | null;
  onSuccess?: () => void;
}

export default function ReviewRestoreRequestDialog({
  open,
  onOpenChange,
  request,
  onSuccess,
}: ReviewRestoreRequestDialogProps) {
  const { locale, t } = useI18n();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decision, setDecision] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  const DECISION_OPTIONS = [
    { value: "approved", label: t("adminUsersDialog.restore.decisionOption.approved") },
    { value: "rejected", label: t("adminUsersDialog.restore.decisionOption.rejected") },
  ];

  const requestedAtLabel = useMemo(() => {
    if (!request?.requestedAt) return null;
    const date = new Date(request.requestedAt);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }, [request?.requestedAt, locale]);

  const handleClose = (nextOpen: boolean) => {
    if (isSubmitting) return;
    if (!nextOpen) {
      setDecision("");
      setReviewNote("");
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!decision) {
      toast(t("adminUsersDialog.restore.toast.selectDecision"), {
        title: t("adminUsersDialog.restore.toast.validationErrorTitle"),
        variant: "error",
        durationMs: 4200,
      });
      return;
    }

    if (decision === "rejected" && !reviewNote.trim()) {
      toast(t("adminUsersDialog.restore.toast.noteRequired"), {
        title: t("adminUsersDialog.restore.toast.validationErrorTitle"),
        variant: "error",
        durationMs: 4200,
      });
      return;
    }

    const userId = request?.userId?.trim();
    if (!userId) {
      toast(t("adminUsersDialog.restore.toast.noRequest"), {
        title: t("adminUsersDialog.restore.toast.cannotCompleteTitle"),
        variant: "error",
        durationMs: 4200,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await adminApi.users.reviewRestoreRequest(userId, {
        decision: decision as "approved" | "rejected",
        reviewNote: reviewNote.trim() || undefined,
      });

      toast(
        decision === "approved"
          ? t("adminUsersDialog.restore.toast.approvedBody")
          : t("adminUsersDialog.restore.toast.rejectedBody"),
        {
          title: decision === "approved" ? t("adminUsersDialog.restore.toast.approvedTitle") : t("adminUsersDialog.restore.toast.rejectedTitle"),
          variant: "success",
          durationMs: 4200,
        },
      );

      setDecision("");
      setReviewNote("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast(userFacingErrorMessage(error, t("adminUsersDialog.restore.toast.reviewFailedFallback")), {
        title: t("common.operationFailed"),
        variant: "error",
        durationMs: 4200,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2"
          >
            <div className="overflow-hidden rounded-[16px] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#EEF2F6] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <Dialog.Title className="font-cairo text-[16px] font-extrabold text-[#111827]">
                      {t("adminUsersDialog.restore.title")}
                    </Dialog.Title>
                    <Dialog.Description className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                      {request.doctorName || request.doctorEmail || "—"}
                    </Dialog.Description>
                  </div>
                </div>
                <Dialog.Close
                  disabled={isSubmitting}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#667085] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                <div className="rounded-[8px] border border-[#EEF2F6] bg-[#F9FAFB] p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-cairo text-[13px] font-black text-[#111827]">
                        {request.doctorName || "—"}
                      </div>
                      <div className="font-cairo text-[11px] font-bold text-[#98A2B3]">
                        {request.doctorEmail || "—"}
                      </div>
                    </div>
                  </div>

                  {requestedAtLabel ? (
                    <div className="mt-3 border-t border-[#EEF2F6] pt-3">
                      <div className="mb-1 font-cairo text-[11px] font-extrabold text-[#667085]">
                        {t("adminUsersDialog.restore.requestDatePrefix")}
                      </div>
                      <div className="font-cairo text-[12px] font-semibold text-[#111827]">
                        {requestedAtLabel}
                      </div>
                    </div>
                  ) : null}

                  {request.reason ? (
                    <div className="mt-3 border-t border-[#EEF2F6] pt-3">
                      <div className="mb-1 font-cairo text-[11px] font-extrabold text-[#667085]">
                        {t("adminUsersDialog.restore.reasonPrefix")}
                      </div>
                      <div className="font-cairo text-[12px] font-semibold text-[#111827]">
                        {request.reason}
                      </div>
                    </div>
                  ) : null}

                  {request.deletionReason ? (
                    <div className="mt-3 border-t border-[#EEF2F6] pt-3">
                      <div className="mb-1 font-cairo text-[11px] font-extrabold text-[#DC2626]">
                        {t("adminUsersDialog.restore.deletionReasonPrefix")}
                      </div>
                      <div className="font-cairo text-[12px] font-semibold text-[#991B1B]">
                        {request.deletionReason}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block font-cairo text-[12px] font-extrabold text-[#111827]">
                    {t("adminUsersDialog.restore.decisionLabel")}
                  </label>
                  <StyledSelect
                    value={decision}
                    onChange={setDecision}
                    options={DECISION_OPTIONS}
                    placeholder={t("adminUsersDialog.restore.field.decision.placeholder")}
                    size="sm"
                    tone="muted"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="mb-2 block font-cairo text-[12px] font-extrabold text-[#111827]">
                    {t("adminUsersDialog.restore.noteLabel")} {decision === "rejected" && "*"}
                  </label>
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder={t("adminUsersDialog.restore.field.note.placeholder")}
                    rows={3}
                    disabled={isSubmitting}
                    className="w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2.5 font-cairo text-[12px] font-semibold text-[#111827] placeholder:text-[#98A2B3] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-[#F9FAFB]"
                  />
                </div>

                {decision === "approved" ? (
                  <div className="flex items-start gap-3 rounded-[8px] border border-[#FDE68A] bg-[#FFFBEB] p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#D97706]" />
                    <div className="font-cairo text-[11px] font-bold text-[#92400E]">
                      {t("adminUsersDialog.restore.approveWarning")}
                    </div>
                  </div>
                ) : null}
              </form>

              <div className="flex items-center justify-end gap-3 border-t border-[#EEF2F6] px-6 py-4">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className="inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054] transition hover:bg-[#F9FAFB] disabled:opacity-50"
                  >
                    {t("common.cancel")}
                  </button>
                </Dialog.Close>
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={isSubmitting || !decision}
                  className="inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? t("adminUsersDialog.restore.sending") : t("adminUsersDialog.restore.submitDecision")}
                </button>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
