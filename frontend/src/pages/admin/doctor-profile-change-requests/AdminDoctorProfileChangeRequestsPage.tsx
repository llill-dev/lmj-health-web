import { Helmet } from "react-helmet-async";
import { FileText, RefreshCw, Loader2, User, ShieldCheck } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import ReviewProfileChangeDialog from "@/components/admin/doctor-profile-change-requests/dialogs/ReviewProfileChangeDialog";
import StyledSelect from "@/components/ui/styled-select";
import { useI18n } from "@/i18n/provider";
import {
  useAdminDoctorProfileChangeRequests,
  type AdminDoctorProfileChangeRequest,
} from "@/hooks/admin/doctors/useAdminDoctorProfileChangeRequests";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";

export default function AdminDoctorProfileChangeRequestsPage() {
  const { t, locale, dir } = useI18n();
  const numberLocale = locale === "ar" ? "ar-EG" : "en-US";
  const dateLocale = locale === "ar" ? "ar-EG" : "en-US";

  const statusOptions = useMemo(
    () => [
      { value: "", label: t("admin.doctorProfileChangeRequests.status.all") },
      {
        value: "pending",
        label: t("admin.doctorProfileChangeRequests.status.pending"),
      },
      {
        value: "approved",
        label: t("admin.doctorProfileChangeRequests.status.approved"),
      },
      {
        value: "denied",
        label: t("admin.doctorProfileChangeRequests.status.denied"),
      },
    ],
    [locale],
  );

  const statusLabels: Record<string, string> = {
    pending: t("admin.doctorProfileChangeRequests.status.pending"),
    approved: t("admin.doctorProfileChangeRequests.status.approved"),
    denied: t("admin.doctorProfileChangeRequests.status.denied"),
  };
  const fieldLabels: Record<string, string> = {
    specialization: t("admin.doctorProfileChangeRequests.field.specialization"),
    medicalLicenseNumber: t(
      "admin.doctorProfileChangeRequests.field.medicalLicenseNumber",
    ),
    education: t("admin.doctorProfileChangeRequests.field.education"),
    clinicAddress: t("admin.doctorProfileChangeRequests.field.clinicAddress"),
    locationCity: t("admin.doctorProfileChangeRequests.field.locationCity"),
    locationCountry: t(
      "admin.doctorProfileChangeRequests.field.locationCountry",
    ),
    bio: t("admin.doctorProfileChangeRequests.field.bio"),
    consultationFee: t(
      "admin.doctorProfileChangeRequests.field.consultationFee",
    ),
    clinicLat: t("admin.doctorProfileChangeRequests.field.clinicLat"),
    clinicLng: t("admin.doctorProfileChangeRequests.field.clinicLng"),
  };

  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<AdminDoctorProfileChangeRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const { requests, isAwaitingData, isError, error, refetch, isRefetching } =
    useAdminDoctorProfileChangeRequests({
      status: statusFilter || undefined,
    });

  const openReview = useCallback((request: AdminDoctorProfileChangeRequest) => {
    setSelectedRequest(request);
    setReviewOpen(true);
  }, []);

  const handleRefresh = () => {
    void refetch();
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const activeStatusLabel =
    statusLabels[statusFilter] ??
    statusOptions.find((option) => option.value === statusFilter)?.label;
  const formatDate = (value?: string) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return new Intl.DateTimeFormat(dateLocale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(parsed);
  };

  const statusToneClassName: Record<
    AdminDoctorProfileChangeRequest["status"],
    string
  > = {
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    denied: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <>
      <Helmet>
        <title>
          {t("admin.doctorProfileChangeRequests.page.title")} • LMJ Health
        </title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={t("admin.doctorProfileChangeRequests.page.title")}
          subtitle={t("admin.doctorProfileChangeRequests.subtitle")}
          headerIcon={<FileText className="h-8 w-8 text-white" />}
          kpis={[
            {
              key: "pending",
              icon: <FileText className="h-5 w-5 shrink-0" />,
              value: isAwaitingData
                ? "—"
                : pendingCount.toLocaleString(numberLocale),
              label: t("admin.doctorProfileChangeRequests.pendingRequests"),
            },
            {
              key: "total",
              icon: <User className="h-5 w-5 shrink-0" />,
              value: isAwaitingData
                ? "—"
                : requests.length.toLocaleString(numberLocale),
              label: t("admin.doctorProfileChangeRequests.totalRequests"),
            },
          ]}
        />

        <section className="mt-4 rounded-[12px] border border-[#D6EEEC] bg-[#F3FBFA] px-6 py-4 shadow-[0_10px_24px_rgba(20,130,131,0.08)]">
          <div className="font-cairo text-[13px] font-extrabold text-[#0F766E]">
            {t("admin.doctorProfileChangeRequests.disclaimer")}
          </div>
        </section>

        <section className="mt-4 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <div className="mb-2 font-cairo text-[12px] font-extrabold text-[#667085]">
                {t("admin.doctorProfileChangeRequests.filterByStatus")}
              </div>
              <StyledSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                placeholder={t(
                  "admin.doctorProfileChangeRequests.selectStatus",
                )}
                size="sm"
                tone="muted"
              />
            </div>
            <div className="lg:col-span-8 flex justify-end">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefetching}
                className="inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054] disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
                />
                {t("admin.doctorProfileChangeRequests.refresh")}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-4 space-y-3">
          {!isAwaitingData && !isError && isRefetching ? (
            <div className="inline-flex items-center gap-2 rounded-[10px] border border-[#D5E8E6] bg-white px-4 py-2 font-cairo text-[12px] font-bold text-primary">
              {t("admin.doctorProfileChangeRequests.refreshing")}
            </div>
          ) : null}
          {isError ? (
            <div className="rounded-[12px] border border-red-200 bg-red-50 px-6 py-6 text-start">
              <p className="font-cairo text-[13px] font-bold text-red-800">
                {t("admin.doctorProfileChangeRequests.loadError")}
              </p>
              <p className="mt-1 font-cairo text-[12px] font-semibold text-red-700">
                {userFacingErrorMessage(
                  error,
                  t("admin.doctorProfileChangeRequests.checkConnection"),
                )}
              </p>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefetching}
                className="mt-3 font-cairo text-[12px] font-extrabold text-primary underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRefetching
                  ? t("admin.doctorProfileChangeRequests.retrying")
                  : t("admin.doctorProfileChangeRequests.retry")}
              </button>
            </div>
          ) : isAwaitingData ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              {statusFilter
                ? t(
                    "admin.doctorProfileChangeRequests.noRequestsStatus",
                  ).replace(
                    "{status}",
                    (activeStatusLabel ?? locale === "ar")
                      ? "المحددة"
                      : "selected",
                  )
                : t("admin.doctorProfileChangeRequests.noRequests")}
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request._id}
                className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.05)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="mb-1 inline-flex items-center rounded-[999px] border border-[#D5E8E6] bg-[#F8FAFC] px-2.5 py-1 font-cairo text-[10px] font-extrabold text-primary">
                          {t(
                            "admin.doctorProfileChangeRequests.doctorProfileChange",
                          )}
                        </div>
                        <div className="font-cairo text-[16px] font-black leading-[22px] text-[#111827]">
                          {request.doctor?.userId?.fullName ||
                            request.doctor?._id}
                        </div>
                        <div className="mt-0.5 font-cairo text-[11px] font-bold text-[#98A2B3]">
                          {request.doctor?.specialization || "—"} ·{" "}
                          {request.doctor?.medicalLicenseNumber || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center mt-3">
                      <div className="font-cairo text-[12px] font-bold text-[#667085]">
                        {t("admin.doctorProfileChangeRequests.requestedBy")}{" "}
                        {request.requestedBy?.fullName || "—"}
                      </div>
                      {request.requestedBy?.email ? (
                        <div className="font-cairo text-[12px] font-bold text-[#667085]">
                          {t("admin.doctorProfileChangeRequests.email")}{" "}
                          {request.requestedBy.email}
                        </div>
                      ) : null}
                      <div className="font-cairo text-[12px] font-bold text-[#667085]">
                        {t("admin.doctorProfileChangeRequests.changes")}{" "}
                        {request.items?.length || 0}
                      </div>
                      <div className="font-cairo text-[12px] font-bold text-[#667085]">
                        {t("admin.doctorProfileChangeRequests.requestedOn")}{" "}
                        {formatDate(request.createdAt)}
                      </div>
                      <div
                        className={`inline-flex items-center rounded-[999px] border px-2.5 py-1 font-cairo text-[11px] font-bold ${
                          statusToneClassName[request.status]
                        }`}
                      >
                        {statusLabels[request.status || ""] ||
                          request.status ||
                          "—"}
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-[999px] border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1 font-cairo text-[11px] font-bold text-[#475467]">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {request.status === "pending"
                          ? t("admin.doctorProfileChangeRequests.actionReview")
                          : t(
                              "admin.doctorProfileChangeRequests.actionCompleted",
                            )}
                      </div>
                    </div>
                    {request.items.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {request.items.slice(0, 4).map((item, index) => (
                          <span
                            key={`${request._id}-${item.field}-${index}`}
                            className="inline-flex items-center rounded-[999px] bg-[#F4F7FB] px-2.5 py-1 font-cairo text-[11px] font-bold text-[#475467]"
                          >
                            {fieldLabels[item.field] || item.field}
                          </span>
                        ))}
                        {request.items.length > 4 ? (
                          <span className="inline-flex items-center rounded-[999px] bg-[#EEF2FF] px-2.5 py-1 font-cairo text-[11px] font-bold text-primary">
                            {t(
                              "admin.doctorProfileChangeRequests.more",
                            ).replace(
                              "{count}",
                              String(request.items.length - 4),
                            )}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  {request.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => openReview(request)}
                      title={t(
                        "admin.doctorProfileChangeRequests.reviewRequest",
                      )}
                      className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-primary bg-primary px-3 font-cairo text-[11px] font-extrabold text-white transition hover:bg-primary/90"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {t("admin.doctorProfileChangeRequests.review")}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        <ReviewProfileChangeDialog
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          request={selectedRequest}
          onSuccess={() => {
            void refetch();
          }}
        />
      </div>
    </>
  );
}
