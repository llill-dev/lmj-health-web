import { Helmet } from "react-helmet-async";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock,
  Search,
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
  statusLabel,
  statusPill,
  type UiAppointmentCard,
} from "@/components/admin/appointments/appointmentListUtils";
import { useAdminAppointments } from "@/hooks/admin/appointments/useAdminAppointments";
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
    search: string;
  }>({
    page: 1,
    limit: 10,
    status: "",
    date: "",
    search: "",
  });

  const { appointments, results, total, isAwaitingData, error } =
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

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({
        ...prev,
        search: e.target.value,
        page: 1,
      }));
    },
    [],
  );

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
      search: "",
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

  const filteredAppointments = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return appointments;

    return appointments.filter((a) => {
      const doctorName = a.doctor?.userId?.fullName ?? "";
      const patientName = a.patient?.userId?.fullName ?? "";
      const patientPublicId = a.patient?.publicId ?? "";
      return (
        doctorName.toLowerCase().includes(q) ||
        patientName.toLowerCase().includes(q) ||
        patientPublicId.toLowerCase().includes(q)
      );
    });
  }, [appointments, filters.search]);

  const uiAppointments = useMemo(() => {
    return filteredAppointments.map<UiAppointmentCard>((a) => {
      const doctorName = a.doctor?.userId?.fullName ?? "—";
      const patientLabel =
        a.patient?.userId?.fullName ?? a.patient?.publicId ?? "—";

      return {
        id: a._id,
        status: a.status,
        typeLabel: "clinic",
        code: a._id,
        doctorName,
        doctorSpecialization: a.doctor?.specialization,
        dateLabel: formatDateLabel(a),
        patientLabel,
        time: a.startTime ?? "—",
      };
    });
  }, [filteredAppointments]);

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
      value: String(statusCounts.cancelled),
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
      value: String(statusCounts["no-show"]),
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
      value: String(statusCounts.completed),
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
      value: String(statusCounts.scheduled + statusCounts.rescheduled),
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

        <section className="mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <input
                placeholder={tr(
                  "بحث بالطبيب او المريض...",
                  "Search by doctor or patient...",
                )}
                className="h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-12 ps-4 text-start font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]"
                value={filters.search}
                onChange={handleSearchChange}
              />
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]">
                <Search className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-[168px] shrink-0">
                <StyledSelect
                  size="sm"
                  tone="muted"
                  value={filters.status}
                  onChange={handleStatusChange}
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
                className="h-[42px] w-[170px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-start font-cairo text-[12px] font-bold text-[#111827]"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(true)}
                className="inline-flex h-[34px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]"
              >
                {tr("إعادة تعيين", "Reset")}
              </button>
              <div className="font-cairo text-[12px] font-bold text-[#667085]">
                {results} {tr("نتيجة", "results")}
              </div>
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
              {tr("تعذّر تحميل المواعيد.", "Failed to load appointments.")}
            </div>
          ) : uiAppointments.length === 0 ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 font-cairo text-[12px] font-semibold text-[#667085] shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
              {tr("لا توجد مواعيد مطابقة.", "No matching appointments.")}
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
                              {a.patientLabel}
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
                              <User className="h-4 w-4 text-primary" />
                              {a.doctorName}
                            </div>
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
            "سيتم إرجاع البحث والتصفية والتاريخ وعدد النتائج في الصفحة إلى الوضع الافتراضي. لا يُعدّل ذلك بيانات المواعيد المخزّنة.",
            "Search, filters, date, and page size will reset to defaults. Stored appointment data is not changed.",
          )}
          confirmLabel={tr("إعادة التعيين", "Reset")}
          onConfirm={handleReset}
          successToast={{
            title: tr("تمت إعادة التعيين", "Reset complete"),
            message: tr(
              "أُعيد ضبط عرض البحث والتصفية والتاريخ. لم تتغيّر المواعيد نفسها.",
              "Search, filters, and date view were reset. Appointments themselves were not changed.",
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
