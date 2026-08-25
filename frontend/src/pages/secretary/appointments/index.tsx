import { memo, useMemo, useState } from "react";
import { Search, Calendar, Clock, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useDoctorAppointmentsApi,
  useCancelDoctorAppointmentApi,
  useRescheduleDoctorAppointmentApi,
} from "@/hooks/doctor/appointments/useDoctorAppointmentsApi";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import { useSecretaryAssignedDoctor } from "@/hooks/secretary/useSecretaryAssignedDoctor";
import type { DoctorAppointmentStatus } from "@/lib/doctor/types";
import { useI18n } from "@/i18n/provider";
import { useToast } from "@/components/ui/ToastProvider";
import { getAppointmentWriteErrorMessage } from "@/lib/doctor/writeFlowErrors";
import CancelAppointmentDialog from "@/components/admin/appointments/dialogs/CancelAppointmentDialog";
import RescheduleAppointmentDialog from "@/components/doctor/appointments/reschedule-appointment-dialog";
import DoctorTablePagination from "@/components/doctor/shared/doctor-table-pagination";

function formatIsoDate(value: string | null | undefined, locale: "ar" | "en"): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US");
}

function patientInitials(name: string, locale: "ar" | "en" = "ar"): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || (locale === "ar" ? "م" : "P");
}

function appointmentStatusPresentation(
  status: string,
  locale: "ar" | "en",
): {
  label: string;
  className: string;
} {
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  if (status === "completed") {
    return {
      label: tr("مكتمل", "Completed"),
      className: "bg-[#EAFBF0] text-[#22C55E]",
    };
  }

  if (status === "postponed") {
    return {
      label: tr("مؤجل", "Postponed"),
      className: "bg-[#FFF2E8] text-[#FF6A00]",
    };
  }

  if (status === "cancelled") {
    return {
      label: tr("ملغي", "Cancelled"),
      className: "bg-[#FEE2E2] text-[#B42318]",
    };
  }

  if (status === "no-show") {
    return {
      label: tr("لم يحضر", "No-show"),
      className: "bg-[#F3F4F6] text-[#4B5563]",
    };
  }

  return {
    label: tr("مجدول", "Scheduled"),
    className: "bg-[#DDF4F1] text-primary",
  };
}

function SurfaceSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E8EEF6] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <header className="border-b border-[#EDF2F7] px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <h2 className="text-start font-cairo text-[23px] font-black leading-none text-[#243044]">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function AppointmentsSearchInput({
  value,
  onChange,
  locale,
}: {
  value: string;
  onChange: (value: string) => void;
  locale: "ar" | "en";
}) {
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  return (
    <div className="relative min-w-0">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={tr("ابحث بالاسم أو رقم الملف…", "Search by name or file number…")}
        aria-label={tr("بحث عن موعد", "Search appointment")}
        className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white pe-10 ps-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none placeholder:font-cairo placeholder:text-[14px] placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary"
      />
      <div className="pointer-events-none absolute end-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[#98A2B3]">
        <Search className="h-5 w-5" />
      </div>
    </div>
  );
}

type AppointmentRowData = {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  status: string;
  rawStatus: DoctorAppointmentStatus;
};

const AppointmentTableRow = memo<{
  appointment: AppointmentRowData;
  expanded: boolean;
  onToggle: (appointmentId: string) => void;
  onCancel: (appointment: AppointmentRowData) => void;
  onReschedule: (appointment: AppointmentRowData) => void;
  canCancel: boolean;
  canReschedule: boolean;
  locale: "ar" | "en";
}>(function AppointmentTableRow({
  appointment,
  expanded,
  onToggle,
  onCancel,
  onReschedule,
  canCancel,
  canReschedule,
  locale,
}) {
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const status = appointmentStatusPresentation(appointment.status, locale);
  const isActionable =
    appointment.rawStatus === "scheduled" || appointment.rawStatus === "rescheduled";

  return (
    <div className="border-b border-[#EEF2F6] last:border-b-0">
      <div className="grid grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8 lg:py-5">
        <div className="flex items-center gap-4 lg:col-span-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary text-white shadow-[0_14px_28px_rgba(15,143,139,0.22)]">
            <span className="font-cairo text-[20px] font-black">
              {patientInitials(appointment.patientName, locale)}
            </span>
          </div>
          <div className="min-w-0 text-start">
            <div className="truncate font-cairo text-[18px] font-black text-[#243044]">
              {appointment.patientName}
            </div>
            <div className="truncate font-cairo text-[14px] font-semibold text-[#98A2B3]">
              {appointment.patientId}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-cairo text-[16px] font-bold text-[#243044] lg:col-span-3">
          <Calendar className="h-4 w-4 text-[#98A2B3]" />
          {formatIsoDate(appointment.date, locale)}
        </div>

        <div className="flex items-center gap-2 font-cairo text-[16px] font-bold text-[#243044] lg:col-span-2">
          <Clock className="h-4 w-4 text-[#98A2B3]" />
          {appointment.time}
        </div>

        <div className="lg:col-span-2">
          <span
            className={`inline-flex rounded-[8px] px-3 py-1.5 font-cairo text-[13px] font-black ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <div className="text-start lg:col-span-1 lg:text-end">
          <button
            type="button"
            onClick={() => onToggle(appointment.id)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-2 font-cairo text-[15px] font-black text-primary transition-colors hover:text-[#0A7A77]"
          >
            {tr("عرض", "View")}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#EEF2F6] bg-[#F8FAFC] px-4 py-4 sm:px-8">
          {!isActionable ? (
            <p className="font-cairo text-[13px] font-bold text-[#98A2B3]">
              {tr("لا توجد إجراءات متاحة لهذا الموعد.", "No actions available for this appointment.")}
            </p>
          ) : (
            <>
              {canReschedule ? (
                <button
                  type="button"
                  onClick={() => onReschedule(appointment)}
                  className="rounded-[10px] border border-[#D0D5DD] bg-white px-4 py-2 font-cairo text-[13px] font-black text-[#344054] transition-colors hover:bg-[#F8FAFC]"
                >
                  {tr("إعادة جدولة", "Reschedule")}
                </button>
              ) : null}
              {canCancel ? (
                <button
                  type="button"
                  onClick={() => onCancel(appointment)}
                  className="rounded-[10px] border border-[#FDA29B] bg-white px-4 py-2 font-cairo text-[13px] font-black text-[#B42318] transition-colors hover:bg-[#FEF3F2]"
                >
                  {tr("إلغاء الموعد", "Cancel appointment")}
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
});

export default function SecretaryAppointmentsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";
  const { toast } = useToast();
  const { hasPermission } = useSecretaryPermissions();
  const { assignedDoctor } = useSecretaryAssignedDoctor();
  const canViewAppointments = hasPermission("appointments:view");
  const canCancelAppointments = hasPermission("appointments:cancel");
  const canRescheduleAppointments = hasPermission("appointments:edit");
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState<
    "all" | "scheduled" | "completed" | "postponed" | "cancelled" | "no-show"
  >("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [cancelTarget, setCancelTarget] = useState<AppointmentRowData | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentRowData | null>(null);

  const selectedStatus: DoctorAppointmentStatus | undefined =
    filter === "all"
      ? undefined
      : filter === "postponed"
        ? "rescheduled"
        : filter;

  const appointmentsQuery = useDoctorAppointmentsApi(
    {
      page,
      limit,
      status: selectedStatus,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    canViewAppointments,
  );

  const cancelMutation = useCancelDoctorAppointmentApi();
  const rescheduleMutation = useRescheduleDoctorAppointmentApi();

  const appointments = useMemo<AppointmentRowData[]>(
    () =>
      (appointmentsQuery.appointments ?? []).map((row) => ({
        id: row._id,
        patientName: row.patient?.userId?.fullName || tr("مريض", "Patient"),
        patientId: row.patient?.publicId || row.patient?._id || "—",
        date: row.date || row.startDateTime || "",
        time: row.startTime || "—",
        status: row.status === "rescheduled" ? "postponed" : row.status,
        rawStatus: row.status,
      })),
    [appointmentsQuery.appointments, tr],
  );

  const filterTabs = useMemo(
    () => [
      { key: "all" as const, label: tr("الكل", "All") },
      { key: "scheduled" as const, label: tr("مجدول", "Scheduled") },
      { key: "completed" as const, label: tr("مكتمل", "Completed") },
      { key: "postponed" as const, label: tr("مؤجل", "Postponed") },
      { key: "cancelled" as const, label: tr("ملغي", "Cancelled") },
      { key: "no-show" as const, label: tr("لم يحضر", "No-show") },
    ],
    [tr],
  );

  // Backend GET /appointments has no free-text search param — filter the current page client-side.
  const searchedAppointments = useMemo(() => {
    if (!searchInput.trim()) return appointments;
    const search = searchInput.toLowerCase();
    return appointments.filter(
      (a) =>
        a.patientName.toLowerCase().includes(search) ||
        a.patientId.toLowerCase().includes(search),
    );
  }, [appointments, searchInput]);

  const totalPages = Math.max(1, Math.ceil((appointmentsQuery.total || appointments.length) / limit));

  const handleToggle = (appointmentId: string) => {
    setExpandedId((current) => (current === appointmentId ? null : appointmentId));
  };

  const resetToFirstPage = () => setPage(1);

  return (
    <div dir={dir} lang={locale} className="space-y-6 pb-6 sm:space-y-7 sm:pb-8">
      <SurfaceSection title={tr("المواعيد", "Appointments")}>
        <div className="flex flex-col gap-4 border-b border-[#EEF2F6] px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
          <div className="text-start">
            <p className="font-cairo text-[13px] font-semibold text-[#98A2B3]">
              {(appointmentsQuery.total || appointments.length).toLocaleString(numberLocale)} {tr("موعد", "appointments")}
              {searchInput ? tr(" مطابق للبحث", " matching search") : ""}
              {appointmentsQuery.isRefetching
                ? tr(" • جاري تحديث البيانات", " • Refreshing data")
                : ""}
            </p>
          </div>

          {hasPermission("appointments:book") ? (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/secretary/book-appointment"
                className="flex h-[42px] items-center gap-2 rounded-[10px] bg-primary px-5 font-cairo text-[15px] font-black text-white shadow-[0_10px_20px_rgba(15,143,139,0.30)] transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                {tr("حجز موعد جديد", "Book new appointment")}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 px-4 py-5 sm:px-5 sm:py-6 lg:flex-row lg:items-center">
          <div className="flex-1">
            <AppointmentsSearchInput
              value={searchInput}
              onChange={setSearchInput}
              locale={locale}
            />
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value);
              resetToFirstPage();
            }}
            aria-label={tr("من تاريخ", "From date")}
            className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 font-cairo text-[14px] font-bold text-[#111827] outline-none focus:border-primary lg:w-[150px]"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(event) => {
              setDateTo(event.target.value);
              resetToFirstPage();
            }}
            aria-label={tr("إلى تاريخ", "To date")}
            className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 font-cairo text-[14px] font-bold text-[#111827] outline-none focus:border-primary lg:w-[150px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#EEF2F6] px-4 py-4 sm:px-6 lg:px-8">
          {filterTabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setFilter(key);
                resetToFirstPage();
              }}
              className={`h-[42px] rounded-[10px] border px-5 font-cairo text-[15px] font-black transition-colors ${
                filter === key
                  ? "border-primary bg-primary text-white"
                  : "border-[#E5E7EB] bg-white text-[#1F2937] hover:bg-[#F8FAFC]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="hidden border-b border-[#EEF2F6] px-8 py-4 lg:block">
          <div className="grid grid-cols-12 gap-4 text-start font-cairo text-[14px] font-bold text-[#A1AAB9]">
            <div className="col-span-4">{tr("المريض", "Patient")}</div>
            <div className="col-span-3">{tr("التاريخ", "Date")}</div>
            <div className="col-span-2">{tr("الوقت", "Time")}</div>
            <div className="col-span-2">{tr("الحالة", "Status")}</div>
            <div className="col-span-1">{tr("الإجراءات", "Actions")}</div>
          </div>
        </div>

        {!canViewAppointments ? (
          <div className="flex min-h-[220px] items-center justify-center px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {tr("ليست لديك صلاحية عرض المواعيد.", "You do not have permission to view appointments.")}
            </p>
          </div>
        ) : appointmentsQuery.isAwaitingData ? (
          <div className="flex min-h-[220px] items-center justify-center px-4 py-10 text-center">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {tr("جاري تحميل المواعيد...", "Loading appointments...")}
            </p>
          </div>
        ) : appointmentsQuery.isError ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {tr("تعذر تحميل المواعيد حالياً.", "Could not load appointments right now.")}
            </p>
            <button
              type="button"
              onClick={() => void appointmentsQuery.refetch()}
              disabled={appointmentsQuery.isRefetching}
              className="rounded-[10px] border border-[#D0D5DD] bg-white px-4 py-2 font-cairo text-[14px] font-black text-[#344054] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {appointmentsQuery.isRefetching
                ? tr("جاري إعادة المحاولة...", "Retrying...")
                : tr("إعادة المحاولة", "Retry")}
            </button>
          </div>
        ) : searchedAppointments.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {searchInput
                ? tr("لا توجد نتائج مطابقة لبحثك.", "No results match your search.")
                : tr("لا يوجد مواعيد في هذه الفئة.", "No appointments in this category.")}
            </p>
          </div>
        ) : (
          <>
            {searchedAppointments.map((appointment) => (
              <AppointmentTableRow
                key={appointment.id}
                appointment={appointment}
                locale={locale}
                expanded={expandedId === appointment.id}
                onToggle={handleToggle}
                onCancel={setCancelTarget}
                onReschedule={setRescheduleTarget}
                canCancel={canCancelAppointments}
                canReschedule={canRescheduleAppointments}
              />
            ))}
          </>
        )}
      </SurfaceSection>

      {canViewAppointments && !appointmentsQuery.isAwaitingData && !appointmentsQuery.isError && appointments.length > 0 ? (
        <DoctorTablePagination
          page={page}
          totalPages={totalPages}
          pageSize={limit}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setLimit(size);
            resetToFirstPage();
          }}
        />
      ) : null}

      <CancelAppointmentDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        targetName={cancelTarget?.patientName ?? ""}
        confirmDisabled={cancelMutation.isPending}
        confirmLabel={tr("تأكيد إلغاء الموعد", "Confirm cancellation")}
        successToast={{
          title: tr("تم إلغاء الموعد", "Appointment cancelled"),
          message: tr("تم إلغاء الموعد وحفظ السبب بنجاح.", "The appointment was cancelled and the reason was saved."),
          variant: "success",
        }}
        onConfirm={async (reason) => {
          if (!cancelTarget) return;
          try {
            await cancelMutation.mutateAsync({
              id: cancelTarget.id,
              body: { reason: reason || undefined },
            });
            setCancelTarget(null);
          } catch (error) {
            toast(getAppointmentWriteErrorMessage(error, "cancel"), {
              title: tr("خطأ", "Error"),
              variant: "error",
              durationMs: 4800,
            });
            throw error;
          }
        }}
      />

      <RescheduleAppointmentDialog
        open={Boolean(rescheduleTarget)}
        onOpenChange={(open) => {
          if (!open) setRescheduleTarget(null);
        }}
        patientName={rescheduleTarget?.patientName ?? ""}
        initialDate={rescheduleTarget?.date}
        initialTime={rescheduleTarget?.time}
        doctorId={assignedDoctor?._id}
        confirmDisabled={rescheduleMutation.isPending}
        onConfirm={async (values) => {
          if (!rescheduleTarget) return;
          try {
            await rescheduleMutation.mutateAsync({
              id: rescheduleTarget.id,
              body: {
                date: values.date,
                startTime: values.startTime,
                appointmentTypeId: values.appointmentTypeId || undefined,
                reason: values.reason || undefined,
              },
            });
            toast(tr("تم تحديث موعد الحجز بنجاح.", "The appointment was rescheduled successfully."), {
              title: tr("تم إعادة الجدولة", "Rescheduled"),
              variant: "success",
              durationMs: 4200,
            });
            setRescheduleTarget(null);
          } catch (error) {
            toast(getAppointmentWriteErrorMessage(error, "reschedule"), {
              title: tr("خطأ", "Error"),
              variant: "error",
              durationMs: 4800,
            });
            throw error;
          }
        }}
      />
    </div>
  );
}
