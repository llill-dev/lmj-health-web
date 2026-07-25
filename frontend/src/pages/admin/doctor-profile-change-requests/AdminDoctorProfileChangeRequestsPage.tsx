import { Helmet } from "react-helmet-async";
import {
  FileText,
  RefreshCw,
  Loader2,
  User,
} from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import ReviewProfileChangeDialog from "@/components/admin/doctor-profile-change-requests/dialogs/ReviewProfileChangeDialog";
import StyledSelect from "@/components/ui/styled-select";
import { useI18n } from "@/i18n/provider";

interface ProfileChangeRequest {
  _id: string;
  status?: string;
  items?: Array<{
    field: string;
    oldValue?: any;
    newValue?: any;
  }>;
  doctor?: {
    _id: string;
    specialization?: string;
    medicalLicenseNumber?: string;
    userId?: {
      fullName?: string;
    };
  };
  requestedBy?: {
    _id: string;
    fullName?: string;
    email?: string;
  };
  createdAt?: string;
}

export default function AdminDoctorProfileChangeRequestsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const numberLocale = locale === "ar" ? "ar-EG" : "en-US";

  const statusOptions = useMemo(
    () => [
      { value: "", label: tr("الكل", "All") },
      { value: "pending", label: tr("قيد الانتظار", "Pending") },
      { value: "approved", label: tr("موافق عليه", "Approved") },
      { value: "denied", label: tr("مرفوض", "Denied") },
    ],
    [locale],
  );

  const statusLabels: Record<string, string> = {
    pending: tr("قيد الانتظار", "Pending"),
    approved: tr("موافق عليه", "Approved"),
    denied: tr("مرفوض", "Denied"),
  };

  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<ProfileChangeRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [requests, setRequests] = useState<ProfileChangeRequest[]>([]);

  const openReview = useCallback((request: ProfileChangeRequest) => {
    setSelectedRequest(request);
    setReviewOpen(true);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <>
      <Helmet>
        <title>
          {tr(
            "طلبات تغيير بيانات الأطباء",
            "Doctor profile change requests",
          )}{" "}
          • LMJ Health
        </title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={tr(
            "طلبات تغيير بيانات الأطباء",
            "Doctor profile change requests",
          )}
          subtitle={tr(
            "مراجعة طلبات تغيير البيانات الشخصية للأطباء",
            "Review doctor personal profile change requests",
          )}
          headerIcon={<FileText className="h-8 w-8 text-white" />}
          kpis={[
            {
              key: "pending",
              icon: <FileText className="h-5 w-5 shrink-0" />,
              value: pendingCount.toLocaleString(numberLocale),
              label: tr("طلبات قيد الانتظار", "Pending requests"),
            },
            {
              key: "total",
              icon: <User className="h-5 w-5 shrink-0" />,
              value: requests.length.toLocaleString(numberLocale),
              label: tr("إجمالي الطلبات", "Total requests"),
            },
          ]}
        />

        <section className="mt-4 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <div className="mb-2 font-cairo text-[12px] font-extrabold text-[#667085]">
                {tr("تصفية حسب الحالة", "Filter by status")}
              </div>
              <StyledSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                placeholder={tr("اختر الحالة", "Select status")}
                size="sm"
                tone="muted"
              />
            </div>
            <div className="lg:col-span-8 flex justify-end">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054] disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                {tr("تحديث", "Refresh")}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              {tr(
                "لا توجد طلبات تغيير بيانات حالياً.",
                "No profile change requests right now.",
              )}
            </div>
          ) : (
            requests
              .filter((r) => !statusFilter || r.status === statusFilter)
              .map((request) => (
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
                          {tr("طلب بواسطة:", "Requested by:")}{" "}
                          {request.requestedBy?.fullName || "—"}
                        </div>
                        <div className="font-cairo text-[12px] font-bold text-[#667085]">
                          {tr("عدد التغييرات:", "Changes:")}{" "}
                          {request.items?.length || 0}
                        </div>
                        <div className="inline-flex items-center rounded-[6px] border px-2 py-1 font-cairo text-[11px] font-bold">
                          {statusLabels[request.status || ""] ||
                            request.status ||
                            "—"}
                        </div>
                      </div>
                    </div>
                    {request.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => openReview(request)}
                        title={tr("مراجعة الطلب", "Review request")}
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-primary bg-primary px-3 font-cairo text-[11px] font-extrabold text-white transition hover:bg-primary/90"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {tr("مراجعة", "Review")}
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
            // TODO: Refetch requests
          }}
        />
      </div>
    </>
  );
}
