import { Helmet } from "react-helmet-async";
import {
  AlertCircle,
  ChevronLeft,
  Stethoscope,
  Clock,
  Filter,
  BadgeCheck,
  FileSearch,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReviewVerificationRequestDialog from "@/components/admin/verification-requests/dialogs/ReviewVerificationRequestDialog";
import { VerificationRequestCardSkeleton } from "@/components/admin/skeletons/VerificationRequestCardSkeleton";
import { SkeletonList } from "@/components/admin/skeletons/SkeletonList";
import { adminApi } from "@/lib/admin/client";
import { isAwaitingInitialQueryDataWithPlaceholder } from "@/lib/query/queryUi";
import StyledSelect from "@/components/ui/styled-select";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import { useI18n } from "@/i18n/provider";

export default function AdminVerificationRequestsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const numberLocale = locale === "ar" ? "ar-SY" : "en-US";
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"approve" | "reject" | "map">(
    "map",
  );
  const [selected, setSelected] = useState<{
    id: string;
    doctor: string;
    lat: string;
    lng: string;
    doctorProfile: Record<string, unknown> | null;
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const verificationQuery = useQuery({
    queryKey: ["admin", "verification-requests", statusFilter, page, limit],
    queryFn: () =>
      adminApi.verificationRequests.list({
        ...(statusFilter === "all" ? {} : { status: statusFilter }),
        page,
        limit,
      }),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });

  const verificationAwaiting = isAwaitingInitialQueryDataWithPlaceholder(
    verificationQuery.data,
    verificationQuery.isError,
    undefined,
  );

  function formatRequestedAt(value?: string) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    const time = d.toLocaleTimeString(numberLocale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return sameDay
      ? tr(`اليوم ${time}`, `Today ${time}`)
      : d.toLocaleDateString(numberLocale);
  }

  const locationRequests = useMemo(() => {
    return (verificationQuery.data?.requests ?? []).map((request) => {
      const coords = request.doctor?.clinicLocation?.coordinates ?? [];
      const lng = typeof coords[0] === "number" ? coords[0].toFixed(4) : "—";
      const lat = typeof coords[1] === "number" ? coords[1].toFixed(4) : "—";
      const doctorName =
        request.doctor?.userId?.fullName ||
        request.requestedBy?.fullName ||
        "—";
      const addressParts = [
        request.doctor?.clinicAddress,
        request.doctor?.locationCity,
        request.doctor?.locationCountry,
      ].filter(Boolean);
      const address = addressParts.length > 0 ? addressParts.join("، ") : "—";

      return {
        id: request._id,
        requestType: tr("تحقق الطبيب", "Doctor verification"),
        doctor: doctorName,
        specialty: request.doctor?.specialization || "—",
        address,
        requestedAt: formatRequestedAt(request.createdAt),
        statusKey: request.status,
        status:
          request.status === "pending"
            ? tr("معلق", "Pending")
            : request.status === "approved"
              ? tr("مقبول", "Approved")
              : tr("مرفوض", "Rejected"),
        lat,
        lng,
        doctorProfile: (request.doctor ?? null) as Record<
          string,
          unknown
        > | null,
      };
    });
  }, [verificationQuery.data?.requests]);

  const total = verificationQuery.data?.total ?? 0;
  const currentPage = verificationQuery.data?.page ?? page;
  const currentLimit = verificationQuery.data?.limit ?? limit;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(currentLimit, 1)));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <>
      <Helmet>
        <title>{tr("طلبات التحقق", "Verification requests")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={tr("طلبات التحقق", "Verification requests")}
          subtitle={tr(
            "مراجعة طلبات التحقق من موقع العيادة وتخصص الأطباء",
            "Review clinic location and doctor specialization verification requests",
          )}
          headerIcon={<Stethoscope className="h-8 w-8 text-white" />}
          kpis={[
            {
              key: "pending",
              icon: <AlertCircle className="h-5 w-5 shrink-0" />,
              value: verificationAwaiting ? "—" : total,
              label: tr("طلبات في القائمة", "Requests in list"),
            },
            {
              key: "page",
              icon: <Clock className="h-5 w-5 shrink-0" />,
              value: verificationAwaiting ? "—" : locationRequests.length,
              label: tr("معروضة الآن", "Shown now"),
            },
            {
              key: "pages",
              icon: <Filter className="h-5 w-5 shrink-0" />,
              value: verificationAwaiting ? "—" : totalPages,
              label: tr("عدد الصفحات", "Total pages"),
            },
          ]}
        />

        <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#D1E9FF] bg-[#F5FAFF] px-4 py-3 text-start">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#175CD3]" />
          <div className="font-cairo text-[12px] font-bold leading-6 text-[#175CD3]">
            {tr(
              "هذه القائمة مخصّصة لفرز طلبات التحقق والانتقال إلى صفحة التفاصيل أو الخريطة عند الحاجة. قرار القبول أو الرفض النهائي يتم من شاشة المراجعة المرتبطة بكل طلب، وليس من بطاقة القائمة نفسها.",
              "This list is for triaging verification requests and opening the related details or map when needed. The final approve or reject decision is made from each request’s review flow, not directly from the list card itself.",
            )}
          </div>
        </div>

        <section className="mt-4 rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="inline-flex items-center gap-2 text-[#475467]">
              <Filter className="h-4 w-4" />
              <span className="font-cairo text-[12px] font-extrabold">
                {tr("تصفية الطلبات", "Filter requests")}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {(
                [
                  { id: "all", label: tr("الكل", "All") },
                  { id: "pending", label: tr("معلق", "Pending") },
                  { id: "approved", label: tr("مقبول", "Approved") },
                  { id: "rejected", label: tr("مرفوض", "Rejected") },
                ] as const
              ).map((option) => {
                const active = statusFilter === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(option.id);
                      setPage(1);
                    }}
                    className={
                      active
                        ? "inline-flex h-[32px] items-center rounded-[8px] border border-primary bg-[#E6FFFB] px-3 font-cairo text-[12px] font-extrabold text-primary"
                        : "inline-flex h-[32px] items-center rounded-[8px] border border-[#EAECF0] bg-white px-3 font-cairo text-[12px] font-bold text-[#667085] hover:bg-[#F9FAFB]"
                    }
                  >
                    {option.label}
                  </button>
                );
              })}
              <StyledSelect
                className="min-w-[4.5rem]"
                size="xs"
                tone="muted"
                value={String(limit)}
                onChange={(v) => {
                  setLimit(Number(v));
                  setPage(1);
                }}
                options={[10, 20, 50, 100].map((v) => ({
                  value: String(v),
                  label: tr(`${v} / صفحة`, `${v} / page`),
                }))}
                listboxAriaLabel={tr(
                  "عدد العناصر في الصفحة",
                  "Items per page",
                )}
              />
            </div>
          </div>
        </section>

        <section className="mt-6">
          {verificationAwaiting ? (
            <SkeletonList
              count={5}
              SkeletonComponent={VerificationRequestCardSkeleton}
              className="space-y-3"
            />
          ) : verificationQuery.error ? (
            <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-8 text-center font-cairo text-[13px] font-semibold text-[#B42318]">
              {tr(
                "تعذّر تحميل طلبات التحقق من الخادم.",
                "Failed to load verification requests from server.",
              )}
            </div>
          ) : locationRequests.length === 0 ? (
            <div className="rounded-[12px] border border-[#D1E9FF] bg-white px-6 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              {tr(
                "لا توجد طلبات تحقق معلّقة حاليًا.",
                "No pending verification requests right now.",
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {locationRequests.map((r) => (
                  <article
                    key={r.id}
                    className="min-h-[122px] flex justify-between  overflow-hidden rounded-[8px] border border-[#B9D8D6] bg-[#F8FAFA]"
                  >
                    <div className="px-4 py-3 flex items-center justify-between flex-1">
                      <div className="flex items-start justify-start gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(r);
                            setDialogMode("map");
                            setDialogOpen(true);
                          }}
                          className="flex h-[58px] w-[58px] items-center justify-center rounded-[8px] bg-[#129692] text-white"
                          aria-label={tr("عرض الخريطة", "Open map")}
                        >
                          <Stethoscope className="h-6 w-6" />
                        </button>
                        <div className="text-start">
                          <div className="mb-1 inline-flex items-center gap-1 rounded-full border border-[#D5E8E6] bg-white px-2 py-0.5 font-cairo text-[10px] font-extrabold text-primary">
                            <FileSearch className="h-3 w-3" />
                            {r.requestType}
                          </div>
                          <div className="font-cairo text-[14px] font-black leading-[24px] text-[#1F2937]">
                            {r.doctor}
                          </div>
                          <div className="mt-1 font-cairo text-[12px] font-bold leading-[22px] text-[#1F2937]">
                            {r.specialty}
                          </div>
                          <div className="mt-1 font-cairo text-[12px] font-semibold leading-[20px] text-[#4B5563]">
                            {r.address}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-col items-end justify-between h-full">
                        <div
                          className={`inline-flex h-[22px] items-center gap-1 rounded-full px-2.5 font-cairo text-[11px] font-bold text-white ${
                            r.statusKey === "pending"
                              ? "bg-[#F59E0B]"
                              : r.statusKey === "approved"
                                ? "bg-[#129692]"
                                : "bg-[#EF4444]"
                          }`}
                        >
                          <BadgeCheck className="h-3 w-3" />
                          {r.status}
                        </div>
                        <div className="font-cairo text-[12px] font-semibold leading-[20px] text-[#A0A7B0]">
                          {r.requestedAt}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={tr(
                        "فتح صفحة تفاصيل طلب التحقق",
                        "Open verification request details page",
                      )}
                      onClick={() => {
                        navigate(
                          `/admin/verification-requests/${encodeURIComponent(r.id)}`,
                        );
                      }}
                      className="flex w-[58px] self-stretch items-center justify-center bg-[#129692] text-white transition hover:bg-[#0F8885]"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                  </article>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-[#F2F4F7] pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="text-center font-cairo text-[11px] font-semibold text-[#667085] sm:text-start sm:text-[12px]">
                  {tr("الصفحة", "Page")} {currentPage} {tr("من", "of")}{" "}
                  {totalPages}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end sm:gap-3">
                  <StyledSelect
                    className="w-full min-w-[110px] sm:w-[120px]"
                    size="sm"
                    tone="muted"
                    value={String(limit)}
                    onChange={(v) => {
                      const nextLimit = Number(v) || 10;
                      setLimit(nextLimit);
                      setPage(1);
                    }}
                    options={[
                      {
                        value: "10",
                        label: tr("10 / صفحة", "10 / page"),
                      },
                      {
                        value: "20",
                        label: tr("20 / صفحة", "20 / page"),
                      },
                      {
                        value: "50",
                        label: tr("50 / صفحة", "50 / page"),
                      },
                      {
                        value: "100",
                        label: tr("100 / صفحة", "100 / page"),
                      },
                    ]}
                    listboxAriaLabel={tr(
                      "عدد النتائج في الصفحة",
                      "Results per page",
                    )}
                  />

                  <button
                    type="button"
                    disabled={verificationAwaiting || currentPage <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className={
                      verificationAwaiting || currentPage <= 1
                        ? "h-[38px] flex-1 rounded-[10px] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-bold text-[#98A2B3] sm:flex-none"
                        : "h-[38px] flex-1 rounded-[10px] bg-white px-4 font-cairo text-[12px] font-bold text-[#111827] shadow-[0_10px_20px_rgba(0,0,0,0.06)] sm:flex-none"
                    }
                  >
                    {tr("السابق", "Previous")}
                  </button>
                  <button
                    type="button"
                    disabled={verificationAwaiting || currentPage >= totalPages}
                    onClick={() =>
                      setPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    className={
                      verificationAwaiting || currentPage >= totalPages
                        ? "h-[38px] flex-1 rounded-[10px] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-bold text-[#98A2B3] sm:flex-none"
                        : "h-[38px] flex-1 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(15,143,139,0.25)] sm:flex-none"
                    }
                  >
                    {tr("التالي", "Next")}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <ReviewVerificationRequestDialog
          open={dialogOpen}
          onOpenChange={(next) => {
            setDialogOpen(next);
            if (!next) setSelected(null);
          }}
          onReviewed={async () => {
            await verificationQuery.refetch();
          }}
          requestId={selected?.id ?? null}
          doctorName={selected?.doctor ?? ""}
          doctorProfile={selected?.doctorProfile}
          lat={selected?.lat}
          lng={selected?.lng}
          mode={dialogMode}
        />
      </div>
    </>
  );
}
