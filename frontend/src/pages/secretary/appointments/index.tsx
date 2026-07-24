import { memo, useMemo, useState } from "react";
import { Search, Calendar, Clock, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useDoctorAppointmentsApi } from "@/hooks/doctor/appointments/useDoctorAppointmentsApi";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import type { DoctorAppointmentStatus } from "@/lib/doctor/types";
import { useI18n } from "@/i18n/provider";

function formatIsoDate(value: string | null | undefined, locale: "ar" | "en"): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US");
}

function patientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "م";
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
        <h2 className="text-right font-cairo text-[23px] font-black leading-none text-[#243044]">
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
        placeholder={tr("ابحث بالاسم، التاريخ، أو الحالة…", "Search by name, date, or status…")}
        aria-label={tr("بحث عن موعد", "Search appointment")}
        className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white pr-10 pl-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none placeholder:font-cairo placeholder:text-[14px] placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary"
      />
      <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[#98A2B3]">
        <Search className="h-5 w-5" />
      </div>
    </div>
  );
}

const AppointmentTableRow = memo<{
  appointment: {
    id: string;
    patientName: string;
    patientId: string;
    date: string;
    time: string;
    status: string;
  };
  onOpen: (appointmentId: string) => void;
  locale: "ar" | "en";
}>(function AppointmentTableRow({ appointment, onOpen, locale }) {
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const status = appointmentStatusPresentation(appointment.status, locale);

  return (
    <div className="grid grid-cols-1 gap-4 border-b border-[#EEF2F6] px-4 py-4 last:border-b-0 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8 lg:py-5">
      <div className="flex items-center gap-4 lg:col-span-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary text-white shadow-[0_14px_28px_rgba(15,143,139,0.22)]">
          <span className="font-cairo text-[20px] font-black">
            {patientInitials(appointment.patientName)}
          </span>
        </div>
        <div className="min-w-0 text-right">
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

      <div className="text-right lg:col-span-1 lg:text-left">
        <button
          type="button"
          onClick={() => onOpen(appointment.id)}
          className="inline-flex items-center gap-2 font-cairo text-[15px] font-black text-primary transition-colors hover:text-[#0A7A77]"
        >
          {tr("عرض", "View")}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

export default function SecretaryAppointmentsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";
  const { hasPermission } = useSecretaryPermissions();
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState<
    "all" | "scheduled" | "completed" | "postponed" | "cancelled"
  >("all");
  const selectedStatus: DoctorAppointmentStatus | undefined =
    filter === "all"
      ? undefined
      : filter === "postponed"
        ? "rescheduled"
        : filter;
  const appointmentsQuery = useDoctorAppointmentsApi({
    page: 1,
    limit: 50,
    status: selectedStatus,
  });

  const appointments = useMemo(
    () =>
      (appointmentsQuery.appointments ?? []).map((row) => ({
        id: row._id,
        patientName: row.patient?.userId?.fullName || tr("مريض", "Patient"),
        patientId: row.patient?.publicId || row.patient?._id || "—",
        date: row.date || row.startDateTime || "",
        time: row.startTime || "—",
        status: row.status === "rescheduled" ? "postponed" : row.status,
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
    ],
    [tr],
  );

  const filteredAppointments = useMemo(() => {
    if (filter === "all") return appointments;
    return appointments.filter((a) => a.status === filter);
  }, [appointments, filter]);

  const searchedAppointments = useMemo(() => {
    if (!searchInput.trim()) return filteredAppointments;
    const search = searchInput.toLowerCase();
    return filteredAppointments.filter(
      (a) =>
        a.patientName.toLowerCase().includes(search) ||
        a.patientId.includes(search) ||
        a.date.includes(search),
    );
  }, [filteredAppointments, searchInput]);

  return (
    <div dir={dir} lang={locale} className="space-y-6 pb-6 sm:space-y-7 sm:pb-8">
      <SurfaceSection title={tr("المواعيد", "Appointments")}>
        <div className="flex flex-col gap-4 border-b border-[#EEF2F6] px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
          <div className="text-right">
            <h2 className="font-cairo text-[23px] font-black text-[#243044]">
              {tr("المواعيد", "Appointments")}
            </h2>
            <p className="mt-1 font-cairo text-[13px] font-semibold text-[#98A2B3]">
              {(appointmentsQuery.total || appointments.length).toLocaleString(numberLocale)} {tr("موعد", "appointments")}
              {searchInput ? tr(" مطابق للبحث", " matching search") : ""}
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

        <div className="px-4 py-5 sm:px-5 sm:py-6">
          <AppointmentsSearchInput
            value={searchInput}
            onChange={setSearchInput}
            locale={locale}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#EEF2F6] px-4 py-4 sm:px-6 lg:px-8">
          {filterTabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
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
          <div className="grid grid-cols-12 gap-4 text-right font-cairo text-[14px] font-bold text-[#A1AAB9]">
            <div className="col-span-4">{tr("المريض", "Patient")}</div>
            <div className="col-span-3">{tr("التاريخ", "Date")}</div>
            <div className="col-span-2">{tr("الوقت", "Time")}</div>
            <div className="col-span-2">{tr("الحالة", "Status")}</div>
            <div className="col-span-1">{tr("الإجراءات", "Actions")}</div>
          </div>
        </div>

        {appointmentsQuery.isAwaitingData ? (
          <div className="flex min-h-[220px] items-center justify-center px-4 py-10 text-center">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {tr("جاري تحميل المواعيد...", "Loading appointments...")}
            </p>
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
                onOpen={() => {}}
              />
            ))}
          </>
        )}
      </SurfaceSection>
    </div>
  );
}
