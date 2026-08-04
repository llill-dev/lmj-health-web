import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  BookOpen,
  ChevronLeft,
  FileBadge2,
  FileSearch,
  MapPinned,
  Stethoscope,
  User,
  ShieldCheck,
} from "lucide-react";
import { DoctorSpecializationReviewBanner } from "@/components/admin/verification-requests/DoctorSpecializationReviewBanner";
import ReviewVerificationRequestDialog from "@/components/admin/verification-requests/dialogs/ReviewVerificationRequestDialog";
import { resolveDoctorSpecializationReviewState } from "@/lib/admin/doctors/doctorSpecializationReview";
import { resolveDoctorSpecialtyLookupCategory } from "@/lib/admin/doctors/doctorSpecialtyLookupCategory";
import { useAdminLookups } from "@/hooks/admin/lookups/useAdminLookups";
import {
  buildChangeRows,
  extractRequestFromDetails,
  formatRequestedAt,
} from "@/components/admin/verification-requests/verificationRequestDetailsUtils";
import { adminApi } from "@/lib/admin/client";
import { isAwaitingInitialQueryData } from "@/lib/query/queryUi";
import { useI18n } from "@/i18n/provider";

export default function AdminVerificationRequestDetailsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);

  const navigate = useNavigate();
  const { requestId } = useParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"approve" | "reject" | "map">(
    "map",
  );

  const requestQuery = useQuery({
    queryKey: ["admin", "verification-request", requestId],
    queryFn: async () => {
      if (!requestId) return null;
      try {
        const details = await adminApi.verificationRequests.getById(requestId);
        const direct = extractRequestFromDetails(details);
        if (direct?._id) return direct;
      } catch {
        // Fall through to list-based fallback.
      }

      const listFallback = await adminApi.verificationRequests.list({
        page: 1,
        limit: 200,
      });
      return (
        listFallback.requests.find((item) => item._id === requestId) ?? null
      );
    },
    enabled: Boolean(requestId),
    staleTime: 15_000,
  });
  const requestAwaiting = isAwaitingInitialQueryData(
    requestQuery.data,
    requestQuery.isError,
  );

  const cardData = useMemo(() => {
    const request = requestQuery.data;
    if (!request) {
      return {
        id: requestId ?? "",
        doctorId: "",
        statusKey: "pending" as const,
        doctor: "—",
        specialty: "—",
        address: "—",
        requestedAt: "—",
        status: tr("معلق", "Pending"),
        lat: "—",
        lng: "—",
        changeRows: buildChangeRows(null),
      };
    }

    const requestAny = request as any;
    const coords = request.doctor?.clinicLocation?.coordinates ?? [];
    const lng = typeof coords[0] === "number" ? coords[0].toFixed(4) : "—";
    const lat = typeof coords[1] === "number" ? coords[1].toFixed(4) : "—";
    const requestedChanges =
      requestAny?.requestedChanges ??
      requestAny?.changes ??
      requestAny?.profileChanges ??
      {};
    const doctorName =
      request.doctor?.userId?.fullName || request.requestedBy?.fullName || "—";
    const addressParts = [
      request.doctor?.clinicAddress,
      request.doctor?.locationCity,
      request.doctor?.locationCountry,
    ].filter(Boolean);

    return {
      id: request._id,
      doctorId: request.doctor?._id ?? "",
      statusKey: request.status,
      requestType: tr("تحقق الطبيب", "Doctor verification"),
      doctor: doctorName,
      specialty: request.doctor?.specialization || "—",
      address: addressParts.length > 0 ? addressParts.join("، ") : "—",
      requestedAt: formatRequestedAt(request.createdAt),
      adminNote: request.adminNote?.trim() || "—",
      requestedBy: request.requestedBy?.fullName || "—",
      status:
        request.status === "pending"
          ? tr("معلق", "Pending")
          : request.status === "approved"
            ? tr("مقبول", "Approved")
            : tr("مرفوض", "Rejected"),
      lat,
      lng,
      changeRows: buildChangeRows({
        ...request,
        requestedChanges,
      }),
    };
  }, [requestId, requestQuery.data]);

  const lookupCategory = resolveDoctorSpecialtyLookupCategory();
  const lookupsQuery = useAdminLookups({
    category: lookupCategory,
    includeInactive: false,
  });

  const specializationState = useMemo(
    () =>
      resolveDoctorSpecializationReviewState(
        requestQuery.data?.doctor,
        lookupsQuery.data?.lookups,
      ),
    [requestQuery.data?.doctor, lookupsQuery.data?.lookups],
  );
  const isPendingRequest = cardData.statusKey === "pending";

  return (
    <>
      <Helmet>
        <title>
          {tr("تفاصيل طلب التحقق", "Verification request details")} • LMJ Health
        </title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <div className="my-8 flex items-center justify-between">
          <div className="text-start">
            <div className="font-cairo text-[28px] font-black leading-[34px] text-[#1F2937]">
              {tr("تفاصيل طلب التحقق", "Verification request details")}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/verification-requests")}
            className="inline-flex h-[34px] items-center gap-1 rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-bold text-[#344054]"
          >
            {tr("العودة إلى قائمة طلبات التحقق", "Back to verification requests")}
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {requestAwaiting ? (
          <div className="rounded-[10px] border border-[#D1E9E6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
            {tr("جارِ تحميل تفاصيل الطلب...", "Loading request details…")}
          </div>
        ) : requestQuery.error ? (
          <div className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#B42318]">
            {tr("تعذر تحميل تفاصيل الطلب.", "Failed to load request details.")}
          </div>
        ) : (
          <section className="rounded-[10px] border border-[#B9D8D6] bg-white px-6 py-5 shadow-[0_6px_14px_rgba(16,24,40,0.05)]">
            <div className="flex  items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDialogMode("map");
                      setDialogOpen(true);
                    }}
                    className="flex h-[58px] w-[58px] items-center justify-center rounded-[6px] bg-[#129692] text-white"
                    aria-label={tr("عرض الخريطة", "Open map")}
                  >
                    <Stethoscope className="h-6 w-6" />
                  </button>
                  <div className="text-start">
                    <div className="mb-2">
                      <div className="font-cairo text-[20px] font-bold leading-[28px] text-[#1F2937]">
                        {cardData.doctor}
                      </div>
                      <div className="font-cairo text-[18px] font-semibold leading-[20px] text-[#1F2937]">
                        {cardData.specialty}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="inline-flex h-[24px] items-center gap-1 rounded-[8px] border border-[#0F8F89] bg-[#0F8F89] px-2.5 font-cairo text-[11px] font-bold text-white">
                <BadgeCheck className="h-3.5 w-3.5" />
                {cardData.status}
              </div>
            </div>
            <div className="flex  items-center justify-between my-5">
              <div className="mt-1 font-cairo text-[16px] font-semibold leading-[20px] text-[#4A5565]">
                {cardData.address}
              </div>
              <div className="font-cairo text-[14px] font-semibold leading-[20px] text-[#99A1AF]">
                {cardData.requestedAt}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 my-4">
              <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                <div className="flex items-center gap-2 text-primary">
                  <FileSearch className="h-4 w-4" />
                  <div className="font-cairo text-[11px] font-extrabold">
                    {tr("نوع الطلب", "Request type")}
                  </div>
                </div>
                <div className="mt-2 font-cairo text-[13px] font-black text-[#111827]">
                  {cardData.requestType}
                </div>
              </div>
              <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  <div className="font-cairo text-[11px] font-extrabold">
                    {tr("الإجراء المتاح", "Available action")}
                  </div>
                </div>
                <div className="mt-2 font-cairo text-[13px] font-black text-[#111827]">
                  {isPendingRequest
                    ? tr("قبول أو رفض الطلب", "Approve or reject request")
                    : tr("تمت المراجعة", "Already reviewed")}
                </div>
              </div>
              <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                <div className="flex items-center gap-2 text-primary">
                  <User className="h-4 w-4" />
                  <div className="font-cairo text-[11px] font-extrabold">
                    {tr("مقدم الطلب", "Requested by")}
                  </div>
                </div>
                <div className="mt-2 font-cairo text-[13px] font-black text-[#111827]">
                  {cardData.requestedBy}
                </div>
              </div>
              <div className="rounded-[10px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                <div className="flex items-center gap-2 text-primary">
                  <FileBadge2 className="h-4 w-4" />
                  <div className="font-cairo text-[11px] font-extrabold">
                    {tr("ملاحظة المراجعة", "Review note")}
                  </div>
                </div>
                <div className="mt-2 font-cairo text-[13px] font-black text-[#111827]">
                  {cardData.adminNote}
                </div>
              </div>
            </div>

            <div className="rounded-[10px] border border-[#D6EEEC] bg-[#F3FBFA] px-4 py-4">
              <p className="font-cairo text-[13px] font-semibold leading-6 text-[#215A57]">
                {isPendingRequest
                  ? tr(
                      "هذه الصفحة مخصّصة لمراجعة طلب التحقق قبل اتخاذ القرار. يمكنك من هنا فحص بيانات الطبيب، مراجعة الحقول المتغيرة، ثم قبول الطلب أو رفضه.",
                      "This page is used to review the verification request before making a decision. From here you can inspect the doctor data, review the changed fields, then approve or reject the request.",
                    )
                  : tr(
                      "تمت مراجعة هذا الطلب سابقًا، لذلك تُعرض هذه الصفحة الآن كمرجع للحالة النهائية والبيانات التي كانت ضمن طلب التحقق.",
                      "This request has already been reviewed, so this page now serves as a reference for the final status and the data included in the verification request.",
                    )}
              </p>
            </div>

            <DoctorSpecializationReviewBanner state={specializationState} />

            <div className="mt-3 border-t border-[#B9D8D6] pt-2" />

            <div className="my-6 text-start font-cairo text-[20px] font-semibold leading-[20px] text-[#000000]">
              {tr(
                `طلب الدكتور ${cardData.doctor} تعديل الحقول التالية:`,
                `Dr. ${cardData.doctor} requested changes for the following fields:`,
              )}
            </div>

            <div className="mt-3 overflow-hidden rounded-[6px] border border-[#0F8F89]">
              <table className="w-full border-collapse text-start">
                <thead>
                  <tr className="bg-[#F8FAFA]">
                    <th className="w-1/3 border border-[#0F8F89] px-4 py-3 font-cairo text-[16px] font-extrabold text-[#0F8F89]">
                      {tr("طلب التعديل", "Requested change")}
                    </th>
                    <th className="w-1/3 border border-[#0F8F89] px-4 py-3 font-cairo text-[16px] font-extrabold text-[#0F8F89]">
                      {tr("قبل التعديل", "Before")}
                    </th>
                    <th className="w-1/3 border border-[#0F8F89] px-4 py-3 font-cairo text-[16px] font-extrabold text-[#0F8F89]">
                      {tr("بعد التعديل", "After")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cardData.changeRows.length > 0 ? (
                    cardData.changeRows.map((row) => (
                      <tr key={row.key}>
                        <td className="border border-[#0F8F89] px-4 py-3 font-cairo text-[16px] font-extrabold text-[#0F8F89]">
                          {row.label}
                        </td>
                        <td className="border border-[#0F8F89] px-4 py-3 font-cairo text-[16px] font-semibold text-[#1F2937]">
                          {row.before}
                        </td>
                        <td className="border border-[#0F8F89] px-4 py-3 font-cairo text-[16px] font-semibold text-[#1F2937]">
                          {row.after}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="border border-[#0F8F89] px-4 py-6 text-center font-cairo text-[14px] font-semibold text-[#6B7280]"
                      >
                        {tr(
                          "لا توجد حقول تعديل مرسلة من الخادم لهذا الطلب.",
                          "No changed fields were sent by the server for this request.",
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {specializationState.needsAdminResolve ? (
              <p className="mt-4 text-center font-cairo text-[12px] font-semibold text-[#92400E]">
                {tr(
                  "عند «قبول التعديلات» يجب اختيار تخصص مُدار من القائمة أو إنشاء تخصص جديد في نافذة التأكيد.",
                  "When choosing “Approve changes”, select a managed specialization from the list or create a new one in the confirmation dialog.",
                )}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (cardData.doctorId) {
                    navigate(
                      `/admin/doctors/${encodeURIComponent(cardData.doctorId)}`,
                    );
                  }
                }}
                disabled={!cardData.doctorId}
                className="inline-flex h-[50px] items-center gap-2 rounded-[8px] bg-[#129692] px-5 font-cairo text-[16px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-55"
              >
                <MapPinned className="h-4 w-4" />
                {tr("الملف الشخصي", "Profile")}
              </button>
              {isPendingRequest ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setDialogMode("approve");
                      setDialogOpen(true);
                    }}
                    className="inline-flex h-[50px] items-center gap-2 rounded-[8px] bg-[#16A34A] px-5 font-cairo text-[16px] font-bold text-white"
                  >
                    <BookOpen className="h-4 w-4" />
                    {tr("قبول التعديلات", "Approve changes")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDialogMode("reject");
                      setDialogOpen(true);
                    }}
                    className="inline-flex h-[50px] items-center gap-2 rounded-[8px] bg-[#EF4444] px-5 font-cairo text-[16px] font-bold text-white"
                  >
                    <FileBadge2 className="h-4 w-4" />
                    {tr("رفض التعديلات", "Reject changes")}
                  </button>
                </>
              ) : null}
            </div>
          </section>
        )}
      </div>

      <ReviewVerificationRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onReviewed={async () => {
          await requestQuery.refetch();
        }}
        requestId={cardData.id}
        doctorName={cardData.doctor}
        doctorProfile={
          (requestQuery.data?.doctor ?? null) as Record<string, unknown> | null
        }
        lat={cardData.lat}
        lng={cardData.lng}
        mode={dialogMode}
      />
    </>
  );
}
