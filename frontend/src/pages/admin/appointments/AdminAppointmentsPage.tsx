import { Helmet } from "react-helmet-async";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock,
  RefreshCw,
  Stethoscope,
  User,
  Eye,
  AlertCircle,
} from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import { ConfirmActionDialog } from "@/components/admin/dialogs";
import StyledSelect from "@/components/ui/styled-select";
import AdminAppointmentDetailsDialog from "@/components/admin/appointments/dialogs/AdminAppointmentDetailsDialog";
import AppointmentCardSkeleton from "@/components/admin/appointments/AppointmentCardSkeleton";
import {
  formatDateLabel,
  formatPatientLabel,
  statusLabel,
  statusPill,
  type UiAppointmentCard,
} from "@/components/admin/appointments/appointmentListUtils";
import { useAdminAppointments } from "@/hooks/admin/appointments/useAdminAppointments";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import type { AppointmentStatus } from "@/lib/admin/types";
import { useI18n } from "@/i18n/provider";

export default function AdminAppointmentsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [filters, setFilters] = useState<{
    page: number;
    limit: number;
    status: AppointmentStatus | "";
    date: string;
  }>({
    page: 1,
    limit: 10,
    status: "",
    date: "",
  });

  const { appointments, results, total, isAwaitingData, isRefetching, error, refetch } =
    useAdminAppointments({
      page: filters.page,
      limit: filters.limit,
      status: filters.status || undefined,
      date: filters.date || undefined,
    });

  const totalPages = useMemo(() => {
    const safeLimit = Math.max(1, filters.limit);
    const pages = Math.ceil((total || 0) / safeLimit);
    return pages || 1;
  }, [filters.limit, total]);

  const handleStatusChange = useCallback((v: string) => {
    setFilters((prev) => ({
      ...prev,
      status: (v as AppointmentStatus | "") || "",
      page: 1,
    }));
  }, []);

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({
        ...prev,
        date: e.target.value,
        page: 1,
      }));
    },
    [],
  );

  const handleReset = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      status: "",
      date: "",
    });
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setFilters((prev) => ({
      ...prev,
      limit: newLimit,
      page: 1,
    }));
  }, []);

  // No name/ID search here: `GET /appointments` has no `search`/`q` param,
  // and filtering only the current server page would silently hide matches
  // sitting on other pages. Use status/date, which the backend supports.
  const hasActiveFilters = filters.status !== "" || filters.date !== "";

  const uiAppointments = useMemo(() => {
    return appointments.map<UiAppointmentCard>((a) => {
      const doctorName = a.doctor?.userId?.fullName ?? "—";

      return {
        id: a._id,
        status: a.status,
        typeLabel: "clinic",
        code: a._id,
        doctorName,
        doctorSpecialization: a.doctor?.specialization,
        dateLabel: formatDateLabel(a),
        patientLabel: formatPatientLabel(a.patient),
        time: a.startTime ?? "—",
      };
    });
  }, [appointments]);

  const statusCounts = useMemo(() => {
    const counts: Record<AppointmentStatus, number> = {
      scheduled: 0,
      rescheduled: 0,
      completed: 0,
      cancelled: 0,
      "no-show": 0,
    };

    for (const a of appointments) {
      counts[a.status] += 1;
    }
    return counts;
  }, [appointments]);

  const stats = [
    {
      title: tr("ملغية", "Cancelled"),
      value: isAwaitingData ? "—" : String(statusCounts.cancelled),
      icon: Ban,
      tone: {
        border: "border-[#FECACA]",
        bg: "bg-[#FEF2F2]",
        iconBg: "bg-[#EF4444]",
        iconFg: "text-white",
        valueFg: "text-[#EF4444]",
      },
    },
    {
      title: tr("عدم حضور", "No-show"),
      value: isAwaitingData ? "—" : String(statusCounts["no-show"]),
      icon: AlertCircle,
      tone: {
        border: "border-[#E5E7EB]",
        bg: "bg-white",
        iconBg: "bg-[#4B5563]",
        iconFg: "text-white",
        valueFg: "text-[#111827]",
      },
    },
    {
      title: tr("مكتملة", "Completed"),
      value: isAwaitingData ? "—" : String(statusCounts.completed),
      icon: CheckCircle2,
      tone: {
        border: "border-[#BBF7D0]",
        bg: "bg-[#F0FDF4]",
        iconBg: "bg-[#16A34A]",
        iconFg: "text-white",
        valueFg: "text-[#16A34A]",
      },
    },
    {
      title: tr("مجدولة", "Scheduled"),
      value:
        isAwaitingData
          ? "—"
          : String(statusCounts.scheduled + statusCounts.rescheduled),
      icon: Clock,
      tone: {
        border: "border-[#99F6E4]",
        bg: "bg-[#ECFEFF]",
        iconBg: "bg-primary",
        iconFg: "text-white",
        valueFg: "text-primary",
      },
    },
  ] as const;

  return (
    <>
      <Helmet>
        <title>{tr("إدارة المواعيد", "Appointments")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant="appointments"
          surface="mint"
          title={tr("إدارة المواعيد", "Appointments management")}
          subtitle={tr(
            "متابعة وجدولة مواعيد المرضى مع الأطباء",
            "Monitor and schedule patient appointments with doctors",
          )}
          headerIcon={<CalendarDays className="h-8 w-8 text-white" />}
          kpiColumns={4}
          kpis={stats.map((s) => {
            const Icon = s.icon;
            return {
              key: s.title,
              icon: <Icon className="h-5 w-5 shrink-0" />,
              value: s.value,
              label: s.title,
            };
          })}
        />

        <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#D1E9FF] bg-[#F5FAFF] px-4 py-3 text-start">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#175CD3]" />
          <div className="font-cairo text-[12px] font-bold leading-6 text-[#175CD3]">
            {tr(
              "هذه الشاشة مخصّصة لمتابعة سجل المواعيد وفتح التفاصيل المرجعية لكل موعد. البحث بالاسم غير متاح لأن الخادم لا يدعمه؛ استخدم الحالة والتاريخ للفرز. الفلاتر هنا تغيّر العرض فقط، ولا تنفّذ تعديلًا مباشرًا على بيانات الموعد من قائمة البطاقات.",
              "This page is for monitoring the appointment record and opening each appointment’s reference details. Name search isn't available because the server doesn't support it; use status and date to narrow results. The filters here only change the view and do not directly modify appointment data from the cards list.",
            )}
          </div>
        </div>

        <section className="mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-[168px] shrink-0">
                <StyledSelect
                  size="sm"
                  tone="muted"
                  value={filters.status}
                  onChange={handleStatusChange}
                  disabled={isAwaitingData}
                  options={[
                    { value: "", label: tr("كل الحالات", "All statuses") },
                    { value: "scheduled", label: tr("مجدولة", "Scheduled") },
                    {
                      value: "rescheduled",
                      label: tr("معاد جدولتها", "Rescheduled"),
                    },
                    { value: "completed", label: tr("مكتملة", "Completed") },
                    { value: "cancelled", label: tr("ملغية", "Cancelled") },
                    { value: "no-show", label: tr("عدم حضور", "No-show") },
                  ]}
                  listboxAriaLabel={tr("حالة الموعد", "Appointment status")}
                />
              </div>

              <input
                type="date"
                value={filters.date}
                onChange={handleDateChange}
                disabled={isAwaitingData}
                className="h-[42px] w-[170px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-start font-cairo text-[12px] font-bold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(true)}
                disabled={isAwaitingData}
                className="inline-flex h-[34px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {tr("إعادة تعيين", "Reset")}
              </button>
              <div className="font-cairo text-[12px] font-bold text-[#667085]">
                {isAwaitingData ? "—" : results} {tr("نتيجة", "results")}
              </div>
              {isRefetching ? (
                <div className="inline-flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                  {tr("يتم تحديث النتائج", "Refreshing results")}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-5 space-y-4">
          {isAwaitingData ? (
            <>
              <AppointmentCardSkeleton />
              <AppointmentCardSkeleton />
              <AppointmentCardSkeleton />
            </>
          ) : error ? (
            <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-5 font-cairo text-[12px] font-semibold text-[#B42318] shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div className="text-start">
                  {userFacingErrorMessage(
                    error,
                    tr("تعذّر تحميل المواعيد.", "Failed to load appointments."),
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  disabled={isRefetching}
                  className="inline-flex h-[32px] shrink-0 items-center justify-center rounded-[10px] border border-[#FECACA] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#B42318] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {tr("إعادة المحاولة", "Retry")}
                </button>
              </div>
            </div>
          ) : uiAppointments.length === 0 ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 font-cairo text-[12px] font-semibold text-[#667085] shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
              {hasActiveFilters
                ? tr(
                    "لا توجد مواعيد مطابقة للفلاتر الحالية.",
                    "No appointments match the current filters.",
                  )
                : tr(
                    "لا توجد مواعيد متاحة حالياً.",
                    "No appointments are available right now.",
                  )}
            </div>
          ) : (
            uiAppointments.map((a) => (
              <div
                key={a.id}
                className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]"
              >
                <div className="flex gap-4">
                  <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_12px_24px_rgba(15,143,139,0.25)]">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-6">
                    <div className="text-start">
                      <div className="flex items-center justify-start gap-2">
                        <div className="font-cairo text-[14px] font-black text-[#111827]">
                          {a.typeLabel}
                        </div>
                        <span
                          className={`flex gap-1 items-center h-[22px] rounded-[6px] px-3 font-cairo text-[11px] font-extrabold ${statusPill[a.status]}`}
                        >
                          <Clock className="h-3 w-3" />
                          {statusLabel[a.status]}
                        </span>
                      </div>
                      <div className="mt-1 font-cairo text-[12px] font-bold text-[#98A2B3]">
                        {tr("موعد:", "Appointment:")} {a.code}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-start">
                          <div className="flex flex-col items-start gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" />
                              <span>{tr("المريض:", "Patient:")}</span>
                              <span className="text-[#111827]">{a.patientLabel}</span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                            <Clock className="h-4 w-4 text-primary" />
                            {a.time}
                          </div>
                        </div>

                        <div className="text-start">
                          <div className="flex flex-col items-start gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                            <div className="flex items-center gap-2">
                              <Stethoscope className="h-4 w-4 text-primary" />
                              <span>{tr("الطبيب:", "Doctor:")}</span>
                              <span className="text-[#111827]">{a.doctorName}</span>
                            </div>
                            {a.doctorSpecialization ? (
                              <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-primary" />
                                <span>{tr("التخصص:", "Specialization:")}</span>
                                <span className="text-[#111827]">
                                  {a.doctorSpecialization}
                                </span>
                              </div>
                            ) : null}
                          </div>
                          <div className="mt-2 flex items-center gap-2 font-cairo text-[12px] font-bold text-[#667085]">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            {a.dateLabel}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAppointmentId(a.id);
                            setDetailsOpen(true);
                          }}
                          className="inline-flex h-[32px] items-center gap-2 rounded-[10px] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-extrabold text-[#4B5563]"
                        >
                          <Eye className="h-4 w-4" />
                          {tr("عرض التفاصيل", "View details")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="mt-5 flex items-center justify-between rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="font-cairo text-[12px] font-bold text-[#667085]">
            {tr("الصفحة", "Page")} {filters.page} {tr("من", "of")} {totalPages}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-[128px] shrink-0">
              <StyledSelect
                size="xs"
                tone="emphasis"
                value={String(filters.limit)}
                onChange={(v) => handleLimitChange(Number(v))}
                disabled={isAwaitingData}
                options={[10, 20, 50, 100].map((v) => ({
                  value: String(v),
                  label: String(v),
                }))}
                listboxAriaLabel={tr(
                  "عدد العناصر في الصفحة",
                  "Items per page",
                )}
              />
            </div>

            <button
              type="button"
              onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
              disabled={filters.page <= 1}
              className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {tr("السابق", "Previous")}
            </button>

            <button
              type="button"
              onClick={() =>
                handlePageChange(Math.min(totalPages, filters.page + 1))
              }
              disabled={filters.page >= totalPages}
              className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {tr("التالي", "Next")}
            </button>
          </div>
        </section>

        <ConfirmActionDialog
          open={confirmResetOpen}
          onOpenChange={setConfirmResetOpen}
          title={tr("إعادة تعيين عرض المواعيد", "Reset appointments view")}
          description={tr(
            "سيتم إرجاع التصفية والتاريخ وعدد النتائج في الصفحة إلى الوضع الافتراضي. لا يُعدّل ذلك بيانات المواعيد المخزّنة.",
            "Filters, date, and page size will reset to defaults. Stored appointment data is not changed.",
          )}
          confirmLabel={tr("إعادة التعيين", "Reset")}
          onConfirm={handleReset}
          successToast={{
            title: tr("تمت إعادة التعيين", "Reset complete"),
            message: tr(
              "أُعيد ضبط عرض التصفية والتاريخ. لم تتغيّر المواعيد نفسها.",
              "Filters and date view were reset. Appointments themselves were not changed.",
            ),
            variant: "info",
          }}
        />

        <AdminAppointmentDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          appointmentId={selectedAppointmentId}
        />
      </div>
    </>
  );
}
