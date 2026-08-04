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

function formatRestoreRequestDate(
  value: string | undefined,
  locale: string,
) {
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
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);

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
            {tr("لم يُعثر على الطلب", "Request not found")}
          </h2>
          <button
            onClick={() => navigate("/admin/doctor-restore-requests")}
            className="mt-4 rounded-[8px] border border-[#E5E7EB] bg-white px-5 py-2 font-cairo text-[12px] font-extrabold text-[#111827] transition hover:bg-[#F9FAFB]"
          >
            {tr("العودة إلى قائمة الطلبات", "Back to requests list")}
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
          ? tr(
              `تم قبول طلب استعادة حساب الطبيب "${request.doctorName}"`,
              `Restore request for "${request.doctorName}" was approved`,
            )
          : tr(
              `تم رفض طلب استعادة حساب الطبيب "${request.doctorName}"`,
              `Restore request for "${request.doctorName}" was rejected`,
            ),
        {
          title:
            reviewAction === "approved"
              ? tr("تم القبول", "Approved")
              : tr("تم الرفض", "Rejected"),
          variant: "success",
          durationMs: 4200,
        },
      );

      setReviewOpen(false);
      setReviewNote("");
      navigate("/admin/doctor-restore-requests");
    } catch (error) {
      toast(
        tr(
          "حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.",
          "An error occurred while processing the request. Please try again.",
        ),
        {
          title: tr("فشلت العملية", "Operation failed"),
          variant: "error",
          durationMs: 4200,
        },
      );
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConfig = {
    pending: {
      label: tr("معلق", "Pending"),
      icon: Clock,
      color: "text-[#92400E]",
      bgColor: "bg-[#FEF3C7]",
      borderColor: "border-[#FCD34D]",
    },
    approved: {
      label: tr("مقبول", "Approved"),
      icon: CheckCircle2,
      color: "text-[#166534]",
      bgColor: "bg-[#F0FDF4]",
      borderColor: "border-[#BBF7D0]",
    },
    rejected: {
      label: tr("مرفوض", "Rejected"),
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
        <title>{tr("تفاصيل طلب الاستعادة", "Restore request details")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale} className="space-y-5">
        <button
          onClick={() => navigate("/admin/doctor-restore-requests")}
          className="inline-flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#667085] transition hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          {tr(
            "العودة إلى قائمة طلبات استعادة الحساب",
            "Back to restore requests",
          )}
        </button>

        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={tr("تفاصيل طلب استعادة الحساب", "Account restore request details")}
          subtitle={tr(
            "مراجعة تفاصيل طلب استعادة حساب الطبيب المحذوف",
            "Review details for a deleted doctor account restore request",
          )}
          headerIcon={<ShieldCheck className="h-8 w-8 text-white" />}
        />

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
                      {tr("حالة الطلب", "Request status")}
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
                    {tr("مراجعة الطلب", "Review request")}
                  </button>
                )}
              </div>
            </div>

            {/* Doctor Information */}
            <div className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
              <h3 className="mb-4 font-cairo text-[14px] font-extrabold text-[#111827]">
                {tr("معلومات الطبيب", "Doctor information")}
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
                      {tr("الاختصاص:", "Specialization:")} {request.specialization}
                    </span>
                  </div>
                )}

                {request.doctorEmail && (
                  <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                    <span>
                      {tr("البريد الإلكتروني:", "Email:")} {request.doctorEmail}
                    </span>
                  </div>
                )}

                {request.doctorPhone && (
                  <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                    <span>
                      {tr("رقم الهاتف:", "Phone number:")} {request.doctorPhone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Request Details */}
            <div className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
              <h3 className="mb-4 font-cairo text-[14px] font-extrabold text-[#111827]">
                {tr("تفاصيل الطلب", "Request details")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span>
                    {tr("تاريخ تقديم الطلب:", "Requested at:")}{" "}
                    {formatRestoreRequestDate(request.requestedAt, locale)}
                  </span>
                </div>

                {request.reviewedAt && (
                  <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    <span>
                      {tr("تاريخ المراجعة:", "Reviewed at:")}{" "}
                      {formatRestoreRequestDate(request.reviewedAt, locale)}
                    </span>
                  </div>
                )}

                {request.reviewedBy && (
                  <div className="flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>
                      {tr("تمت المراجعة بواسطة:", "Reviewed by:")} {request.reviewedBy}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Deletion Reason */}
            {request.deletionReason && (
              <div className="overflow-hidden rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
                <h3 className="mb-3 font-cairo text-[14px] font-extrabold text-[#991B1B]">
                  {tr("سبب حذف الحساب", "Account deletion reason")}
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
                  {tr("ملاحظة المراجعة", "Review note")}
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
                    {tr("إجراءات سريعة", "Quick actions")}
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
                      {tr("قبول الطلب", "Approve request")}
                    </button>
                    <button
                      onClick={() => {
                        setReviewAction("rejected");
                        setReviewOpen(true);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 font-cairo text-[12px] font-extrabold text-[#991B1B] transition hover:bg-[#FEE2E2]"
                    >
                      <XCircle className="h-4 w-4" />
                      {tr("رفض الطلب", "Reject request")}
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] px-6 py-5">
                  <h3 className="mb-3 font-cairo text-[14px] font-extrabold text-[#667085]">
                    {tr("معلومات هامة", "Important notes")}
                  </h3>
                  <div className="space-y-2 font-cairo text-[12px] font-semibold text-[#475469] leading-relaxed">
                    <p>
                      {tr(
                        "• قبول الطلب سيقوم باستعادة حساب الطبيب وجميع بياناته",
                        "• Approving restores the doctor account and all its data",
                      )}
                    </p>
                    <p>
                      {tr(
                        "• رفض الطلب سيبقي الحساب محذوفاً ولن يمكن استعادته",
                        "• Rejecting keeps the account deleted and non-restorable",
                      )}
                    </p>
                    <p>
                      {tr(
                        "• يُنصح بمراجعة سبب الحذف قبل اتخاذ القرار",
                        "• Review deletion reason before making a decision",
                      )}
                    </p>
                  </div>
                </div>
              </>
            )}

            {request.status !== "pending" && (
              <div className="overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
                <h3 className="mb-4 font-cairo text-[14px] font-extrabold text-[#111827]">
                  {tr("حالة الطلب", "Request status")}
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
                        ? tr(
                            `تمت المراجعة في ${formatRestoreRequestDate(request.reviewedAt, locale)}`,
                            `Reviewed at ${formatRestoreRequestDate(request.reviewedAt, locale)}`,
                          )
                        : tr("لم تتم المراجعة بعد", "Not reviewed yet")}
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
            ? tr("تأكيد قبول طلب الاستعادة", "Confirm approving restore request")
            : tr("تأكيد رفض طلب الاستعادة", "Confirm rejecting restore request")
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
                ? tr(
                    "هل أنت متأكد من قبول طلب استعادة حساب الطبيب؟",
                    "Are you sure you want to approve this doctor account restore request?",
                  )
                : tr(
                    "هل أنت متأكد من رفض طلب استعادة حساب الطبيب؟",
                    "Are you sure you want to reject this doctor account restore request?",
                  )}
            </p>
            <div className="rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] p-3 mb-3">
              <div className="font-cairo text-[12px] font-bold text-[#667085]">
                {tr("الطبيب:", "Doctor:")} {request.doctorName}
              </div>
              <div className="font-cairo text-[11px] font-semibold text-[#98A2B3]">
                {request.doctorId}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block font-cairo text-[12px] font-extrabold text-[#111827]">
                {tr("ملاحظة المراجعة (اختياري)", "Review note (optional)")}
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder={tr("أضف ملاحظة حول قرارك...", "Add a note about your decision…")}
                rows={3}
                className="w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-start font-cairo text-[12px] font-semibold text-[#111827] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-[#98A2B3]"
              />
            </div>
          </>
        }
        confirmLabel={
          reviewAction === "approved"
            ? tr("قبول الطلب", "Approve request")
            : tr("رفض الطلب", "Reject request")
        }
        confirmDisabled={isSubmitting}
        onConfirm={handleReview}
      />
    </>
  );
}

