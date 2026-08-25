import { memo, useMemo, useState } from "react";
import { Search, ChevronDown, ChevronRight, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useDoctorPatients } from "@/hooks/doctor/patients/useDoctorPatients";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import { useI18n } from "@/i18n/provider";
import DoctorTablePagination from "@/components/doctor/shared/doctor-table-pagination";
import StyledSelect from "@/components/ui/styled-select";
import type { DoctorPatientAccountStatus } from "@/lib/doctor/types";

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
        className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white pe-10 ps-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none placeholder:font-cairo placeholder:text-[14px] placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary"
      />
      <div className="pointer-events-none absolute end-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[#98A2B3]">
        <Search className="w-5 h-5" />
      </div>
    </div>
  );
}

type PatientRowData = {
  id: string;
  fileNo: string;
  name: string;
  phone: string;
  email: string;
  registrationDate: string;
  isTemporary?: boolean;
  accountStatus?: string;
  allergies: string[];
  medicalConditions: string[];
  bloodType: string | null;
};

const PatientTableRow = memo<{
  patient: PatientRowData;
  expanded: boolean;
  onToggle: (patientId: string) => void;
  locale: "ar" | "en";
}>(function PatientTableRow({ patient, expanded, onToggle, locale }) {
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const status = accountStatusPresentation(patient, locale);

  return (
    <div className="border-b border-[#EEF2F6] last:border-b-0">
      <div className="grid grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8 lg:py-5">
        <div className="flex gap-4 items-center lg:col-span-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary text-white shadow-[0_14px_28px_rgba(15,143,139,0.22)]">
            <span className="font-cairo text-[20px] font-black">
              {patientInitials(patient.name, locale)}
            </span>
          </div>
          <div className="min-w-0 text-start">
            <div className="truncate font-cairo text-[18px] font-black text-[#243044]">
              {patient.name}
            </div>
            <div className="truncate font-cairo text-[13px] font-bold text-[#98A2B3]">
              {tr("رقم الملف", "File #")} {patient.fileNo || "—"}
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
        <div className="text-start lg:col-span-2 lg:text-end">
          <button
            type="button"
            onClick={() => onToggle(patient.id)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-2 font-cairo text-[15px] font-black text-primary transition-colors hover:text-[#0A7A77]"
          >
            {tr("عرض التفاصيل", "View details")}
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="grid grid-cols-1 gap-4 border-t border-[#EEF2F6] bg-[#F8FAFC] px-4 py-5 text-start sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          <div>
            <div className="font-cairo text-[12px] font-bold text-[#98A2B3]">
              {tr("البريد الإلكتروني", "Email")}
            </div>
            <div className="font-cairo text-[14px] font-bold text-[#243044]">
              {patient.email || "—"}
            </div>
          </div>
          <div>
            <div className="font-cairo text-[12px] font-bold text-[#98A2B3]">
              {tr("فصيلة الدم", "Blood type")}
            </div>
            <div className="font-cairo text-[14px] font-bold text-[#243044]">
              {patient.bloodType || tr("غير محدد", "Unknown")}
            </div>
          </div>
          <div>
            <div className="font-cairo text-[12px] font-bold text-[#98A2B3]">
              {tr("الحساسية", "Allergies")}
            </div>
            <div className="font-cairo text-[14px] font-bold text-[#243044]">
              {patient.allergies.length ? patient.allergies.join("، ") : tr("لا يوجد", "None")}
            </div>
          </div>
          <div>
            <div className="font-cairo text-[12px] font-bold text-[#98A2B3]">
              {tr("الحالات الطبية", "Medical conditions")}
            </div>
            <div className="font-cairo text-[14px] font-bold text-[#243044]">
              {patient.medicalConditions.length
                ? patient.medicalConditions.join("، ")
                : tr("لا يوجد", "None")}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
});

function buildAccountStatusOptions(
  tr: (ar: string, en: string) => string,
): Array<{ value: DoctorPatientAccountStatus; label: string }> {
  return [
    { value: "all", label: tr("الكل", "All") },
    { value: "active", label: tr("نشط", "Active") },
    { value: "temporary", label: tr("مؤقت", "Temporary") },
    { value: "suspended", label: tr("معلّق", "Suspended") },
  ];
}

export default function SecretaryPatientsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";
  const { hasPermission } = useSecretaryPermissions();
  const canViewPatients = hasPermission("patients:view");
  const [searchInput, setSearchInput] = useState("");
  const [accountStatus, setAccountStatus] = useState<DoctorPatientAccountStatus>("all");
  const [diagnosis, setDiagnosis] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const patientsQuery = useDoctorPatients(
    {
      page,
      limit,
      search: searchInput.trim() || undefined,
      account_status: accountStatus,
      diagnosis: diagnosis.trim() || undefined,
      from: from || undefined,
      to: to || undefined,
    },
    canViewPatients,
  );

  const patients = useMemo<PatientRowData[]>(
    () =>
      (patientsQuery.patients ?? []).map((p) => ({
        id: p._id,
        fileNo: p.publicId,
        name: p.user?.fullName || tr("مريض", "Patient"),
        phone: p.user?.phone || "—",
        email: p.user?.email || "—",
        registrationDate: p.lastVisitAt || "",
        isTemporary: p.isTemporary,
        accountStatus: p.user?.accountStatus,
        allergies: p.allergies ?? [],
        medicalConditions: p.medicalConditions ?? [],
        bloodType: p.bloodType ?? null,
      })),
    [patientsQuery.patients, tr],
  );

  const totalPages = Math.max(1, Math.ceil((patientsQuery.total || patients.length) / limit));

  const handleToggle = (patientId: string) => {
    setExpandedId((current) => (current === patientId ? null : patientId));
  };

  const resetToFirstPage = () => setPage(1);

  return (
    <div dir={dir} lang={locale} className="pb-6 space-y-6 sm:space-y-7 sm:pb-8">
      <SurfaceSection>
        <div className="flex flex-col gap-4 border-b border-[#EEF2F6] px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
          <div className="text-start">
            <h2 className="font-cairo text-[23px] font-black text-[#243044]">
              {tr("المرضى", "Patients")}
            </h2>
            <p className="mt-1 font-cairo text-[13px] font-semibold text-[#98A2B3]">
              {(patientsQuery.total || patients.length).toLocaleString(numberLocale)} {tr("مريض", "patients")}
              {searchInput ? tr(" مطابق للبحث", " matching search") : ""}
              {patientsQuery.isRefetching
                ? tr(" • جاري تحديث البيانات", " • Refreshing data")
                : ""}
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

        <div className="flex flex-col gap-3 px-4 py-5 sm:px-5 sm:py-6 lg:flex-row lg:items-center">
          <div className="flex-1">
            <PatientsSearchInput
              value={searchInput}
              onChange={(value) => {
                setSearchInput(value);
                resetToFirstPage();
              }}
              locale={locale}
            />
          </div>
          <div className="w-full lg:w-[160px]">
            <StyledSelect
              value={accountStatus}
              onChange={(value) => {
                setAccountStatus(value as DoctorPatientAccountStatus);
                resetToFirstPage();
              }}
              options={buildAccountStatusOptions(tr)}
              listboxAriaLabel={tr("حالة الحساب", "Account status")}
            />
          </div>
          <input
            value={diagnosis}
            onChange={(event) => {
              setDiagnosis(event.target.value);
              resetToFirstPage();
            }}
            placeholder={tr("التشخيص", "Diagnosis")}
            className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 font-cairo text-[14px] font-bold text-[#111827] outline-none focus:border-primary lg:w-[160px]"
          />
          <input
            type="date"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              resetToFirstPage();
            }}
            aria-label={tr("من تاريخ", "From date")}
            className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 font-cairo text-[14px] font-bold text-[#111827] outline-none focus:border-primary lg:w-[150px]"
          />
          <input
            type="date"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              resetToFirstPage();
            }}
            aria-label={tr("إلى تاريخ", "To date")}
            className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 font-cairo text-[14px] font-bold text-[#111827] outline-none focus:border-primary lg:w-[150px]"
          />
        </div>

        <div className="hidden border-b border-[#EEF2F6] px-8 py-4 lg:block">
          <div className="grid grid-cols-12 gap-4 text-start font-cairo text-[14px] font-bold text-[#A1AAB9]">
            <div className="col-span-4">{tr("اسم المريض", "Patient name")}</div>
            <div className="col-span-3">{tr("رقم الهاتف", "Phone number")}</div>
            <div className="col-span-2">{tr("تاريخ التسجيل", "Registration date")}</div>
            <div className="col-span-1">{tr("الحالة", "Status")}</div>
            <div className="col-span-2">{tr("الإجراءات", "Actions")}</div>
          </div>
        </div>

        {!canViewPatients ? (
          <div className="flex min-h-[220px] items-center justify-center px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {tr("ليست لديك صلاحية عرض المرضى.", "You do not have permission to view patients.")}
            </p>
          </div>
        ) : patientsQuery.isAwaitingData ? (
          <div className="flex min-h-[220px] items-center justify-center px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {tr("جاري تحميل بيانات المرضى...", "Loading patient data...")}
            </p>
          </div>
        ) : patientsQuery.isError ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {tr("تعذر تحميل بيانات المرضى حالياً.", "Could not load patient data right now.")}
            </p>
            <button
              type="button"
              onClick={() => void patientsQuery.refetch()}
              disabled={patientsQuery.isRefetching}
              className="rounded-[10px] border border-[#D0D5DD] bg-white px-4 py-2 font-cairo text-[14px] font-black text-[#344054] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {patientsQuery.isRefetching
                ? tr("جاري إعادة المحاولة...", "Retrying...")
                : tr("إعادة المحاولة", "Retry")}
            </button>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {searchInput || diagnosis || from || to || accountStatus !== "all"
                ? tr("لا توجد نتائج مطابقة لبحثك.", "No results match your search.")
                : tr("لا يوجد مرضى في هذه الفئة.", "No patients in this category.")}
            </p>
          </div>
        ) : (
          <>
            {patients.map((patient) => (
              <PatientTableRow
                key={patient.id}
                patient={patient}
                locale={locale}
                expanded={expandedId === patient.id}
                onToggle={handleToggle}
              />
            ))}
          </>
        )}
      </SurfaceSection>

      {canViewPatients && !patientsQuery.isAwaitingData && !patientsQuery.isError && patients.length > 0 ? (
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
    </div>
  );
}
