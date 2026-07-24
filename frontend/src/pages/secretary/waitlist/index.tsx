import { memo, useMemo, useState } from "react";
import { Search, Clock, Phone, ChevronRight, Calendar } from "lucide-react";
import { useDoctorWaitlist } from "@/hooks/doctor/waitlist/useDoctorWaitlist";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import { useI18n } from "@/i18n/provider";

function patientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "م";
}

function priorityPresentation(priority: string, locale: "ar" | "en"): {
  label: string;
  className: string;
} {
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  if (priority === "high") {
    return {
      label: tr("عالية", "High"),
      className: "bg-[#FEE2E2] text-[#B42318]",
    };
  }

  if (priority === "medium") {
    return {
      label: tr("متوسطة", "Medium"),
      className: "bg-[#FFF2E8] text-[#FF6A00]",
    };
  }

  return {
    label: tr("منخفضة", "Low"),
    className: "bg-[#EAFBF0] text-[#22C55E]",
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

function WaitlistSearchInput({
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
        placeholder={tr("ابحث بالاسم أو رقم الهاتف…", "Search by name or phone number…")}
        aria-label={tr("بحث في قائمة الانتظار", "Search waitlist")}
        className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white pr-10 pl-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none placeholder:font-cairo placeholder:text-[14px] placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary"
      />
      <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[#98A2B3]">
        <Search className="h-5 w-5" />
      </div>
    </div>
  );
}

const WaitlistRow = memo<{
  patient: {
    id: string;
    patientName: string;
    patientId: string;
    phone: string;
    waitTime: string;
    priority: string;
  };
  onBookAppointment?: (patientId: string) => void;
  locale: "ar" | "en";
}>(function WaitlistRow({ patient, onBookAppointment, locale }) {
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const priority = priorityPresentation(patient.priority, locale);

  return (
    <div className="grid grid-cols-1 gap-4 border-b border-[#EEF2F6] px-4 py-4 last:border-b-0 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8 lg:py-5">
      <div className="flex items-center gap-4 lg:col-span-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary text-white shadow-[0_14px_28px_rgba(15,143,139,0.22)]">
          <span className="font-cairo text-[20px] font-black">
            {patientInitials(patient.patientName)}
          </span>
        </div>
        <div className="min-w-0 text-right">
          <div className="truncate font-cairo text-[18px] font-black text-[#243044]">
            {patient.patientName}
          </div>
          <div className="truncate font-cairo text-[14px] font-semibold text-[#98A2B3]">
            {patient.patientId}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 font-cairo text-[16px] font-bold text-[#243044] lg:col-span-3">
        <Phone className="h-4 w-4 text-[#98A2B3]" />
        {patient.phone}
      </div>

      <div className="flex items-center gap-2 font-cairo text-[16px] font-bold text-[#243044] lg:col-span-2">
        <Clock className="h-4 w-4 text-[#98A2B3]" />
        {patient.waitTime}
      </div>

      <div className="lg:col-span-2">
        <span
          className={`inline-flex rounded-[8px] px-3 py-1.5 font-cairo text-[13px] font-black ${priority.className}`}
        >
          {priority.label}
        </span>
      </div>

      <div className="text-right lg:col-span-1 lg:text-left">
        {onBookAppointment ? (
          <button
            type="button"
            onClick={() => onBookAppointment(patient.id)}
            className="inline-flex items-center gap-2 font-cairo text-[15px] font-black text-primary transition-colors hover:text-[#0A7A77]"
          >
            {tr("حجز موعد", "Book appointment")}
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
});

export default function SecretaryWaitlistPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";
  const { hasPermission } = useSecretaryPermissions();
  const [searchInput, setSearchInput] = useState("");
  const waitlistQuery = useDoctorWaitlist({
    page: 1,
    limit: 100,
  });

  const waitlistPatients = useMemo(
    () =>
      (waitlistQuery.requests ?? []).map((request) => ({
        id: request._id,
        patientName:
          (request.patient &&
          typeof request.patient === "object" &&
          request.patient.userId?.fullName) ||
          tr("مريض", "Patient"),
        patientId:
          (request.patient &&
          typeof request.patient === "object" &&
          (request.patient.publicId || request.patient._id)) ||
          "—",
        phone:
          (request.patient &&
          typeof request.patient === "object" &&
          request.patient.userId?.phone) ||
          "—",
        waitTime: request.createdAt
          ? `${Math.max(
              1,
              Math.round(
                (Date.now() - new Date(request.createdAt).getTime()) /
                  (1000 * 60),
              ),
            )} ${tr("دقيقة", "min")}`
          : "—",
        priority: request.urgencyLevel || "low",
      })),
    [tr, waitlistQuery.requests],
  );

  const searchedPatients = useMemo(() => {
    if (!searchInput.trim()) return waitlistPatients;
    const search = searchInput.toLowerCase();
    return waitlistPatients.filter(
      (p) =>
        p.patientName.toLowerCase().includes(search) ||
        p.patientId.includes(search) ||
        p.phone.includes(search),
    );
  }, [waitlistPatients, searchInput]);

  return (
    <div dir={dir} lang={locale} className="space-y-6 pb-6 sm:space-y-7 sm:pb-8">
      <SurfaceSection title={tr("قائمة الانتظار", "Waitlist")}>
        <div className="flex flex-col gap-4 border-b border-[#EEF2F6] px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
          <div className="text-right">
            <h2 className="font-cairo text-[23px] font-black text-[#243044]">
              {tr("قائمة الانتظار", "Waitlist")}
            </h2>
            <p className="mt-1 font-cairo text-[13px] font-semibold text-[#98A2B3]">
              {waitlistPatients.length.toLocaleString(numberLocale)} {tr("مريض", "patients")}
              {searchInput ? tr(" مطابق للبحث", " matching search") : ""}
            </p>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-5 sm:py-6">
          <WaitlistSearchInput value={searchInput} onChange={setSearchInput} locale={locale} />
        </div>

        <div className="hidden border-b border-[#EEF2F6] px-8 py-4 lg:block">
          <div className="grid grid-cols-12 gap-4 text-right font-cairo text-[14px] font-bold text-[#A1AAB9]">
            <div className="col-span-4">{tr("المريض", "Patient")}</div>
            <div className="col-span-3">{tr("رقم الهاتف", "Phone number")}</div>
            <div className="col-span-2">{tr("وقت الانتظار", "Wait time")}</div>
            <div className="col-span-2">{tr("الأولوية", "Priority")}</div>
            <div className="col-span-1">{tr("الإجراءات", "Actions")}</div>
          </div>
        </div>

        {waitlistQuery.isAwaitingData ? (
          <div className="flex min-h-[220px] items-center justify-center px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {tr("جاري تحميل قائمة الانتظار...", "Loading waitlist...")}
            </p>
          </div>
        ) : searchedPatients.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {searchInput
                ? tr("لا توجد نتائج مطابقة لبحثك.", "No results match your search.")
                : tr("قائمة الانتظار فارغة حالياً.", "Waitlist is currently empty.")}
            </p>
          </div>
        ) : (
          <>
            {searchedPatients.map((patient) => (
              <WaitlistRow
                key={patient.id}
                patient={patient}
                locale={locale}
                onBookAppointment={hasPermission("waitlist:book") ? () => {} : undefined}
              />
            ))}
          </>
        )}
      </SurfaceSection>
    </div>
  );
}
