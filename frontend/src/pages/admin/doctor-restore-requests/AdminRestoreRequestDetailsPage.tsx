import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileText,
  RefreshCw,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import { ConfirmActionDialog } from "@/components/admin/dialogs";
import { adminApi } from "@/lib/admin/client";
import { useI18n } from "@/i18n/provider";

interface RestoreRequest {
  _id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  doctorEmail?: string;
  doctorPhone?: string;
  specialization?: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
  deletionReason?: string;
}

function formatRestoreRequestDate(value: string | undefined, locale: string) {
  if (!value) return "?";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "?";
  return parsed.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminRestoreRequestDetailsPage() {
  const { t, locale, dir } = useI18n();

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const request = location.state?.request as RestoreRequest | undefined;

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected">(
    "approved",
  );
  const [reviewNote, setReviewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-[#DC2626]" />
          <h2 className="mt-4 font-cairo text-[16px] font-extrabold text-[#111827]">
            {t("admin.doctorRestoreRequestDetails.requestNotFound")}
          </h2>
          <button
            onClick={() => navigate("/admin/doctor-restore-requests")}
            className="mt-4 rounded-[8px] border border-[#E5E7EB] bg-white px-5 py-2 font-cairo text-[12px] font-extrabold text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            {t("admin.doctorRestoreRequestDetails.backToRequests")}
          </button>
        </div>
      </div>
    );
  }

  const handleReview = async () => {
    setIsSubmitting(true);
    try {
      await adminApi.users.reviewRestoreRequest(request.userId, {
        decision: reviewAction,
        reviewNote: reviewNote || undefined,
      });

      toast(
        reviewAction === "approved"
          ? t("admin.doctorRestoreRequestDetails.approvedMessage").replace(
              "{name}",
              request.doctorName,
            )
          : t("admin.doctorRestoreRequestDetails.rejectedMessage").replace(
              "{name}",
              request.doctorName,
            ),
        {
          title:
            reviewAction === "approved"
              ? t("admin.doctorRestoreRequestDetails.approved")
              : t("admin.doctorRestoreRequestDetails.rejected"),
          variant: "success",
          durationMs: 4200,
        },
      );

      setReviewOpen(false);
      setReviewNote("");
      navigate("/admin/doctor-restore-requests");
    } catch (error) {
      toast(t("admin.doctorRestoreRequestDetails.processingError"), {
        title: t("admin.doctorRestoreRequestDetails.operationFailed"),
        variant: "error",
        durationMs: 4200,
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConfig = {
    pending: {
      label: t("admin.doctorRestoreRequestDetails.status.pending"),
      icon: Clock,
      color: "text-[#92400E]",
      bgColor: "bg-[#FEF3C7]",
      borderColor: "border-[#FCD34D]",
    },
    approved: {
      label: t("admin.doctorRestoreRequestDetails.status.approved"),
      icon: CheckCircle2,
      color: "text-[#166534]",
      bgColor: "bg-[#F0FDF4]",
      borderColor: "border-[#BBF7D0]",
    },
    rejected: {
      label: t("admin.doctorRestoreRequestDetails.status.rejected"),
      icon: XCircle,
      color: "text-[#991B1B]",
      bgColor: "bg-[#FEF2F2]",
      borderColor: "border-[#FECACA]",
    },
  };

  const config = statusConfig[request.status];
  const StatusIcon = config.icon;

  return (
    <>
      <Helmet>
        <title>
          {t("admin.doctorRestoreRequestDetails.page.title")} • LMJ Health
        </title>
      </Helmet>

      <div dir={dir} lang={locale} className="space-y-5">
        <button
          onClick={() => navigate("/admin/doctor-restore-requests")}
          className="inline-flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#667085] transition hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("admin.doctorRestoreRequestDetails.backToRestoreRequests")}
        </button>

        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={t("admin.doctorRestoreRequestDetails.pageTitle")}
          subtitle={t("admin.doctorRestoreRequestDetails.pageSubtitle")}
          headerIcon={<ShieldCheck className="h-8 w-8 text-white" />}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
            <div className="mb-2 font-cairo text-[11px] font-bold text-[#667085]">
              {t("admin.doctorRestoreRequestDetails.requestType")}
            </div>
            <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
              {t("admin.doctorRestoreRequestDetails.doctorAccountRestore")}
            </div>
          </div>
          <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
            <div className="mb-2 font-cairo text-[11px] font-bold text-[#667085]">
              {t("admin.doctorRestoreRequestDetails.doctor")}
            </div>
            <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
              {request.doctorName || "—"}
            </div>
          </div>
          <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
            <div className="mb-2 font-cairo text-[11px] font-bold text-[#667085]">
              {t("admin.doctorRestoreRequestDetails.currentStatus")}
            </div>
            <div
              className={`font-cairo text-[13px] font-extrabold ${config.color}`}
            >
              {config.label}
            </div>
          </div>
          <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
            <div className="mb-2 font-cairo text-[11px] font-bold text-[#667085]">
              {t("admin.doctorRestoreRequestDetails.currentAction")}
            </div>
            <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
              {request.status === "pending"
                ? t("admin.doctorRestoreRequestDetails.actionApproveReject")
                : request.status === "approved"
                  ? t("admin.doctorRestoreRequestDetails.actionTrack")
                  : t("admin.doctorRestoreRequestDetails.actionReviewContext")}
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-[#D6EEEC] bg-[#F3FBFA] px-4 py-4 sm:px-5">
          <p className="font-cairo text-[13px] font-semibold leading-6 text-[#215A57]">
            {t("admin.doctorRestoreRequestDetails.disclaimer")}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Main Details Card */}
          <div className="lg:col-span-2 space-y-5">
            {/* Status Card */}
            <div
              className={`overflow-hidden rounded-[12px] border ${config.borderColor} ${config.bgColor} px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${config.bgColor} ${config.color}`}
                  >
                    <StatusIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-cairo text-[14px] font-extrabold text-[#111827]">
                      {t("admin.doctorRestoreRequestDetails.requestStatus")}
                    </div>
                    <div
                      className={`font-cairo text-[12px] font-bold ${config.color}`}
                    >
                      {config.label}
                    </div>
                  </div>
                </div>
                {request.status === "pending" && (
                  <button
                    onClick={() => {
                      setReviewAction("approved");
                      setReviewOpen(true);
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-primary bg-primary px-4 font-cairo text-[11px] font-extrabold text-white transition hover:bg-primary/90"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t("admin.doctorRestoreRequestDetails.reviewRequest")}
                  </button>
                )}
              </div>
            </div>

            {/* Doctor Information */}
            <div className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
              <h3 className="mb-4 font-cairo text-[14px] font-extrabold text-[#111827]">
                {t("admin.doctorRestoreRequestDetails.doctorInformation")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-cairo text-[16px] font-black text-[#111827]">
                      {request.doctorName}
                    </div>
                    <div className="font-cairo text-[12px] font-bold text-[#98A2B3]">
                      {request.doctorId}
                    </div>
                  </div>
                </div>

                {request.specialization && (
                  <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>
                      {t("admin.doctorRestoreRequestDetails.specialization")}{" "}
                      {request.specialization}
                    </span>
                  </div>
                )}

                {request.doctorEmail && (
                  <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                    <span>
                      {t("admin.doctorRestoreRequestDetails.email")}{" "}
                      {request.doctorEmail}
                    </span>
                  </div>
                )}

                {request.doctorPhone && (
                  <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                    <span>
                      {t("admin.doctorRestoreRequestDetails.phoneNumber")}{" "}
                      {request.doctorPhone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Request Details */}
            <div className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
              <h3 className="mb-4 font-cairo text-[14px] font-extrabold text-[#111827]">
                {t("admin.doctorRestoreRequestDetails.requestDetails")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span>
                    {t("admin.doctorRestoreRequestDetails.requestedAt")}{" "}
                    {formatRestoreRequestDate(request.requestedAt, locale)}
                  </span>
                </div>

                {request.reviewedAt && (
                  <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    <span>
                      {t("admin.doctorRestoreRequestDetails.reviewedAt")}{" "}
                      {formatRestoreRequestDate(request.reviewedAt, locale)}
                    </span>
                  </div>
                )}

                {request.reviewedBy && (
                  <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>
                      {t("admin.doctorRestoreRequestDetails.reviewedBy")}{" "}
                      {request.reviewedBy}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Deletion Reason */}
            {request.deletionReason && (
              <div className="overflow-hidden rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
                <h3 className="mb-3 font-cairo text-[14px] font-extrabold text-[#991B1B]">
                  {t("admin.doctorRestoreRequestDetails.accountDeletionReason")}
                </h3>
                <div className="font-cairo text-[13px] font-semibold text-[#7F1D1D] leading-relaxed">
                  {request.deletionReason}
                </div>
              </div>
            )}

            {/* Review Note */}
            {request.reviewNote && (
              <div className="overflow-hidden rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
                <h3 className="mb-3 font-cairo text-[14px] font-extrabold text-[#166534]">
                  {t("admin.doctorRestoreRequestDetails.reviewNote")}
                </h3>
                <div className="font-cairo text-[13px] font-semibold text-[#14532D] leading-relaxed">
                  {request.reviewNote}
                </div>
              </div>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-5">
            {request.status === "pending" && (
              <>
                <div className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
                  <h3 className="mb-4 font-cairo text-[14px] font-extrabold text-[#111827]">
                    {t("admin.doctorRestoreRequestDetails.quickActions")}
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setReviewAction("approved");
                        setReviewOpen(true);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 font-cairo text-[12px] font-extrabold text-[#166534] transition hover:bg-[#DCFCE7]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {t("admin.doctorRestoreRequestDetails.approveRequest")}
                    </button>
                    <button
                      onClick={() => {
                        setReviewAction("rejected");
                        setReviewOpen(true);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[12px] font-extrabold text-[#991B1B] transition hover:bg-[#FEE2E2]"
                    >
                      <XCircle className="h-4 w-4" />
                      {t("admin.doctorRestoreRequestDetails.rejectRequest")}
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-6 py-5">
                  <h3 className="mb-3 font-cairo text-[14px] font-extrabold text-[#667085]">
                    {t("admin.doctorRestoreRequestDetails.importantNotes")}
                  </h3>
                  <div className="space-y-2 font-cairo text-[12px] font-semibold text-[#475469] leading-relaxed">
                    <p>{t("admin.doctorRestoreRequestDetails.noteApprove")}</p>
                    <p>{t("admin.doctorRestoreRequestDetails.noteReject")}</p>
                    <p>
                      {t(
                        "admin.doctorRestoreRequestDetails.noteReviewDeletion",
                      )}
                    </p>
                  </div>
                </div>
              </>
            )}

            {request.status !== "pending" && (
              <div className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
                <h3 className="mb-4 font-cairo text-[14px] font-extrabold text-[#111827]">
                  {t("admin.doctorRestoreRequestDetails.requestStatus")}
                </h3>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bgColor} ${config.color}`}
                  >
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div
                      className={`font-cairo text-[13px] font-bold ${config.color}`}
                    >
                      {config.label}
                    </div>
                    <div className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                      {request.reviewedAt
                        ? t(
                            "admin.doctorRestoreRequestDetails.reviewedAtDate",
                          ).replace(
                            "{date}",
                            formatRestoreRequestDate(
                              request.reviewedAt,
                              locale,
                            ),
                          )
                        : t("admin.doctorRestoreRequestDetails.notReviewedYet")}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-8" />
      </div>

      {/* Review Dialog */}
      <ConfirmActionDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        variant={reviewAction === "approved" ? "primary" : "destructive"}
        title={
          reviewAction === "approved"
            ? t("admin.doctorRestoreRequestDetails.confirmApprove")
            : t("admin.doctorRestoreRequestDetails.confirmReject")
        }
        icon={
          reviewAction === "approved" ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <XCircle className="w-6 h-6" />
          )
        }
        description={
          <>
            <p className="mb-3 font-cairo text-[13px] font-semibold text-[#344054]">
              {reviewAction === "approved"
                ? t("admin.doctorRestoreRequestDetails.sureApprove")
                : t("admin.doctorRestoreRequestDetails.sureReject")}
            </p>
            <div className="rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] p-3 mb-3">
              <div className="font-cairo text-[12px] font-bold text-[#667085]">
                {t("admin.doctorRestoreRequestDetails.doctor")}{" "}
                {request.doctorName}
              </div>
              <div className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                {request.doctorId}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block font-cairo text-[12px] font-extrabold text-[#111827]">
                {t("admin.doctorRestoreRequestDetails.reviewNoteOptional")}
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder={t(
                  "admin.doctorRestoreRequestDetails.addNotePlaceholder",
                )}
                rows={3}
                className="w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-start font-cairo text-[12px] font-semibold text-[#111827] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-[#98A2B3]"
              />
            </div>
          </>
        }
        confirmLabel={
          reviewAction === "approved"
            ? t("admin.doctorRestoreRequestDetails.approveRequest")
            : t("admin.doctorRestoreRequestDetails.rejectRequest")
        }
        confirmDisabled={isSubmitting}
        onConfirm={handleReview}
      />
    </>
  );
}
