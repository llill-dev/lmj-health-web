import { memo, useMemo, useState } from "react";
import { Search, ChevronRight, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useDoctorPatients } from "@/hooks/doctor/patients/useDoctorPatients";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
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

function accountStatusPresentation(
  patient: {
  isTemporary?: boolean;
  accountStatus?: string;
},
  locale: "ar" | "en",
): {
  label: string;
  className: string;
} {
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const status =
    patient.accountStatus ?? (patient.isTemporary ? "temporary" : "active");

  if (status === "temporary" || patient.isTemporary) {
    return {
      label: "مؤقت",
      label: tr("مؤقت", "Temporary"),
      className: "bg-[#FFF7ED] text-[#C2410C]",
    };
  }

  if (status === "suspended") {
    return {
      label: tr("معلّق", "Suspended"),
      className: "bg-[#FEE2E2] text-[#B42318]",
    };
  }

  return {
    label: tr("نشط", "Active"),
    className: "bg-[#ECFDF3] text-[#16A34A]",
  };
}

function SurfaceSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E8EEF6] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      {children}
    </section>
  );
}

function PatientsSearchInput({
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
        placeholder={tr("ابحث بالاسم، الهاتف، البريد، أو رقم الملف…", "Search by name, phone, email, or file number…")}
        aria-label={tr("بحث عن مريض", "Search patient")}
        className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white pr-10 pl-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none placeholder:font-cairo placeholder:text-[14px] placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary"
      />
      <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[#98A2B3]">
        <Search className="w-5 h-5" />
      </div>
    </div>
  );
}

const PatientTableRow = memo<{
  patient: {
    id: string;
    name: string;
    phone: string;
    email: string;
    registrationDate: string;
    isTemporary?: boolean;
    accountStatus?: string;
  };
  onOpen: (patientId: string) => void;
  locale: "ar" | "en";
}>(function PatientTableRow({ patient, onOpen, locale }) {
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const status = accountStatusPresentation(patient, locale);

  return (
    <div className="grid grid-cols-1 gap-4 border-b border-[#EEF2F6] px-4 py-4 last:border-b-0 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8 lg:py-5">
      <div className="flex gap-4 items-center lg:col-span-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary text-white shadow-[0_14px_28px_rgba(15,143,139,0.22)]">
          <span className="font-cairo text-[20px] font-black">
            {patientInitials(patient.name)}
          </span>
        </div>
        <div className="min-w-0 text-right">
          <div className="truncate font-cairo text-[18px] font-black text-[#243044]">
            {patient.name}
          </div>
          <div className="truncate font-cairo text-[14px] font-semibold text-[#98A2B3]">
            {patient.email}
          </div>
        </div>
      </div>

      <div className="truncate font-cairo text-[16px] font-bold text-[#243044] lg:col-span-3">
        {patient.phone}
      </div>
      <div className="font-cairo text-[16px] font-extrabold text-[#243044] lg:col-span-2">
        {formatIsoDate(patient.registrationDate, locale)}
      </div>
      <div className="lg:col-span-1">
        <span
          className={`inline-flex rounded-[8px] px-3 py-1.5 font-cairo text-[13px] font-black ${status.className}`}
        >
          {status.label}
        </span>
      </div>
      <div className="text-right lg:col-span-2 lg:text-left">
        <button
          type="button"
          onClick={() => onOpen(patient.id)}
          className="inline-flex items-center gap-2 font-cairo text-[15px] font-black text-primary transition-colors hover:text-[#0A7A77]"
        >
          {tr("عرض التفاصيل", "View details")}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

export default function SecretaryPatientsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";
  const { hasPermission } = useSecretaryPermissions();
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "temporary">("all");
  const patientsQuery = useDoctorPatients({
    page: 1,
    limit: 100,
    search: searchInput.trim() || undefined,
  });

  const patients = useMemo(
    () =>
      (patientsQuery.patients ?? []).map((p) => ({
        id: p._id,
        name: p.user?.fullName || tr("مريض", "Patient"),
        phone: p.user?.phone || "—",
        email: p.user?.email || "—",
        registrationDate: p.lastVisitAt || "",
        isTemporary: p.isTemporary,
        accountStatus: p.user?.accountStatus,
      })),
    [patientsQuery.patients, tr],
  );

  const filterTabs = useMemo(
    () => [
      { key: "all" as const, label: "الكل" },
      { key: "all" as const, label: tr("الكل", "All") },
      { key: "active" as const, label: tr("نشط", "Active") },
      { key: "temporary" as const, label: tr("مؤقت", "Temporary") },
    ],
    [tr],
  );

  const filteredPatients = useMemo(() => {
    if (filter === "all") return patients;
    return patients.filter((p) =>
      filter === "temporary" ? p.isTemporary : !p.isTemporary,
    );
  }, [patients, filter]);

  const searchedPatients = filteredPatients;

  return (
    <div dir={dir} lang={locale} className="pb-6 space-y-6 sm:space-y-7 sm:pb-8">
      <SurfaceSection>
        <div className="flex flex-col gap-4 border-b border-[#EEF2F6] px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
          <div className="text-right">
            <h2 className="font-cairo text-[23px] font-black text-[#243044]">
              {tr("المرضى", "Patients")}
            </h2>
            <p className="mt-1 font-cairo text-[13px] font-semibold text-[#98A2B3]">
              {(patientsQuery.total || patients.length).toLocaleString(numberLocale)} {tr("مريض", "patients")}
              {searchInput ? tr(" مطابق للبحث", " matching search") : ""}
            </p>
          </div>

          {hasPermission("patients:temporary:create") ? (
            <div className="flex flex-wrap gap-2 items-center">
              <Link
                to="/secretary/create-temporary-patient"
                className="flex h-[42px] items-center gap-2 rounded-[10px] bg-primary px-5 font-cairo text-[15px] font-black text-white shadow-[0_10px_20px_rgba(15,143,139,0.30)] transition-colors hover:bg-primary/90"
              >
                <UserPlus className="w-4 h-4" />
                {tr("إضافة مريض مؤقت", "Add temporary patient")}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="px-4 py-5 sm:px-5 sm:py-6">
          <PatientsSearchInput value={searchInput} onChange={setSearchInput} locale={locale} />
        </div>

        <div className="hidden border-b border-[#EEF2F6] px-8 py-4 lg:block">
          <div className="grid grid-cols-12 gap-4 text-right font-cairo text-[14px] font-bold text-[#A1AAB9]">
            <div className="col-span-4">{tr("اسم المريض", "Patient name")}</div>
            <div className="col-span-3">{tr("رقم الهاتف", "Phone number")}</div>
            <div className="col-span-2">{tr("تاريخ التسجيل", "Registration date")}</div>
            <div className="col-span-1">{tr("الحالة", "Status")}</div>
            <div className="col-span-2">{tr("الإجراءات", "Actions")}</div>
          </div>
        </div>

        {patientsQuery.isAwaitingData ? (
          <div className="flex min-h-[220px] items-center justify-center px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {tr("جاري تحميل بيانات المرضى...", "Loading patient data...")}
            </p>
          </div>
        ) : searchedPatients.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {searchInput
                ? tr("لا توجد نتائج مطابقة لبحثك.", "No results match your search.")
                : tr("لا يوجد مرضى في هذه الفئة.", "No patients in this category.")}
            </p>
          </div>
        ) : (
          <>
            {searchedPatients.map((patient) => (
              <PatientTableRow
                key={patient.id}
                patient={patient}
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
