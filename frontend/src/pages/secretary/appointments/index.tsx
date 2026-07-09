import { memo, useMemo, useState } from "react";
import { Search, Calendar, Clock, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

function formatIsoDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ar-SA");
}

function patientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "م";
}

function appointmentStatusPresentation(status: string): {
  label: string;
  className: string;
} {
  if (status === "completed") {
    return {
      label: "مكتمل",
      className: "bg-[#EAFBF0] text-[#22C55E]",
    };
  }

  if (status === "postponed") {
    return {
      label: "مؤجل",
      className: "bg-[#FFF2E8] text-[#FF6A00]",
    };
  }

  if (status === "cancelled") {
    return {
      label: "ملغي",
      className: "bg-[#FEE2E2] text-[#B42318]",
    };
  }

  return {
    label: "مجدول",
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
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative min-w-0">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="ابحث بالاسم، التاريخ، أو الحالة…"
        aria-label="بحث عن موعد"
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
}>(function AppointmentTableRow({ appointment, onOpen }) {
  const status = appointmentStatusPresentation(appointment.status);

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
        {formatIsoDate(appointment.date)}
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
          عرض
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

export default function SecretaryAppointmentsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState<
    "all" | "scheduled" | "completed" | "postponed"
  >("all");

  const appointments = [
    {
      id: "apt-001",
      patientName: "سارة علي",
      patientId: "1234567890",
      date: "2024-01-15",
      time: "09:00",
      status: "scheduled",
    },
    {
      id: "apt-002",
      patientName: "أحمد نور",
      patientId: "0987654321",
      date: "2024-01-15",
      time: "10:30",
      status: "postponed",
    },
    {
      id: "apt-003",
      patientName: "ليلى محمد",
      patientId: "1122334455",
      date: "2024-01-15",
      time: "11:00",
      status: "completed",
    },
  ];

  const filterTabs = useMemo(
    () => [
      { key: "all" as const, label: "الكل" },
      { key: "scheduled" as const, label: "مجدول" },
      { key: "completed" as const, label: "مكتمل" },
      { key: "postponed" as const, label: "مؤجل" },
    ],
    [],
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
    <div dir="rtl" lang="ar" className="space-y-6 pb-6 sm:space-y-7 sm:pb-8">
      <SurfaceSection title="المواعيد">
        <div className="flex flex-col gap-4 border-b border-[#EEF2F6] px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
          <div className="text-right">
            <h2 className="font-cairo text-[23px] font-black text-[#243044]">
              المواعيد
            </h2>
            <p className="mt-1 font-cairo text-[13px] font-semibold text-[#98A2B3]">
              {appointments.length} موعد
              {searchInput ? " مطابق للبحث" : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/secretary/book-appointment"
              className="flex h-[42px] items-center gap-2 rounded-[10px] bg-primary px-5 font-cairo text-[15px] font-black text-white shadow-[0_10px_20px_rgba(15,143,139,0.30)] transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              حجز موعد جديد
            </Link>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-5 sm:py-6">
          <AppointmentsSearchInput
            value={searchInput}
            onChange={setSearchInput}
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
            <div className="col-span-4">المريض</div>
            <div className="col-span-3">التاريخ</div>
            <div className="col-span-2">الوقت</div>
            <div className="col-span-2">الحالة</div>
            <div className="col-span-1">الإجراءات</div>
          </div>
        </div>

        {searchedAppointments.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {searchInput
                ? "لا توجد نتائج مطابقة لبحثك."
                : "لا يوجد مواعيد في هذه الفئة."}
            </p>
          </div>
        ) : (
          <>
            {searchedAppointments.map((appointment) => (
              <AppointmentTableRow
                key={appointment.id}
                appointment={appointment}
                onOpen={(appointmentId) =>
                  console.log("Open appointment", appointmentId)
                }
              />
            ))}
          </>
        )}
      </SurfaceSection>
    </div>
  );
}
