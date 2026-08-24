import { Calendar, Filter, Search, Stethoscope, Users } from "lucide-react";

import StyledSelect from "@/components/ui/styled-select";
import type { PatientRelationshipState } from "@/lib/doctor/patients/patient-states";
import { useI18n } from "@/i18n/provider";

export type DoctorPatientsFilterStatus =
  | "all"
  | "active"
  | "temporary"
  | "suspended";

export type DoctorPatientsRelationshipFilter =
  | "all"
  | PatientRelationshipState;

export type DoctorPatientsFiltersSectionProps = {
  filters: {
    account_status: DoctorPatientsFilterStatus;
    relationship: DoctorPatientsRelationshipFilter;
    search: string;
    diagnosis: string;
    from: string;
    to: string;
  };
  hasActiveFilters: boolean;
  total: number;
  patientsListFailed: boolean;
  onReset: () => void;
  onSearchChange: (value: string) => void;
  onDiagnosisChange: (value: string) => void;
  onAccountStatusChange: (value: DoctorPatientsFilterStatus) => void;
  onRelationshipChange: (value: DoctorPatientsRelationshipFilter) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

export default function DoctorPatientsFiltersSection({
  filters,
  hasActiveFilters,
  total,
  patientsListFailed,
  onReset,
  onSearchChange,
  onDiagnosisChange,
  onAccountStatusChange,
  onRelationshipChange,
  onFromChange,
  onToChange,
}: DoctorPatientsFiltersSectionProps) {
  const { locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  return (
    <section
      className="my-5 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_20px_50px_rgba(15,143,139,0.08),0_2px_8px_rgba(0,0,0,0.04)]"
      aria-label={tr("تصفية قائمة المرضى", "Filter patients list")}
    >
      <div className="border-b border-[#EEF2F6] bg-gradient-to-l from-primary/[0.07] via-[#F8FAFC] to-white px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3 items-start sm:items-center">
            <div
              className="flex justify-center items-center w-11 h-11 bg-gradient-to-br rounded-xl border shadow-sm shrink-0 border-primary/25 from-primary/15 to-primary/5 text-primary"
              aria-hidden
            >
              <Filter className="h-[18px] w-[18px]" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 text-start">
              <h2 className="font-cairo text-[16px] font-black leading-tight text-[#111827] sm:text-[17px]">
                {tr("تصفية قائمة المرضى", "Filter patients list")}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-end items-center">
            <button
              type="button"
              disabled={!hasActiveFilters}
              onClick={onReset}
              className={
                !hasActiveFilters
                  ? "inline-flex h-[40px] min-w-[132px] cursor-not-allowed items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-extrabold text-[#98A2B3]"
                  : "inline-flex h-[40px] min-w-[132px] items-center justify-center rounded-xl border border-primary/30 bg-white px-4 font-cairo text-[12px] font-extrabold text-primary shadow-[0_1px_2px_rgba(15,143,139,0.12)] transition-all hover:bg-primary/[0.06] hover:shadow-[0_4px_14px_rgba(15,143,139,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              }
            >
              {tr("مسح الفلاتر", "Clear filters")}
            </button>

            <output
              className="inline-flex h-[40px] min-w-[100px] items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-black text-[#344054] shadow-sm tabular-nums"
              aria-live="polite"
            >
              <span className="text-primary">
                {patientsListFailed ? "—" : total || 0}
              </span>
              <span className="font-extrabold text-[#667085]">{tr("نتيجة", "results")}</span>
            </output>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:gap-6">
          <div className="w-full flex-[0_0_auto] xl:w-1/2 xl:max-w-[50%]">
            <label
              htmlFor="doctor-patients-search"
              className="flex gap-2 justify-between items-center mb-2"
            >
              <span className="inline-flex items-center gap-1.5 font-cairo text-[12px] font-extrabold text-[#111827]">
                <Users className="h-3.5 w-3.5 text-primary" aria-hidden />
                {tr("البحث عن المريض", "Search for a patient")}
              </span>
              <span className="hidden font-cairo text-[10px] font-bold uppercase tracking-wider text-[#98A2B3] sm:inline">
                {tr("الاسم · البريد · الهاتف · الرقم العام", "Name · Email · Phone · Public ID")}
              </span>
            </label>
            <div className="relative group">
              <input
                id="doctor-patients-search"
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                placeholder={tr("ابدأ بالكتابة: الاسم، البريد، الهاتف، أو الرقم العام...", "Start typing: name, email, phone, or public ID...")}
                className="h-[48px] w-full rounded-xl border-2 border-[#E8ECF3] bg-gradient-to-b from-[#FBFCFD] to-white pe-12 ps-4 font-cairo text-[13px] font-bold text-[#111827] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-[border-color,box-shadow,background] placeholder:text-[#98A2B3] hover:border-[#D0D8E6] focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(15,143,139,0.12),inset_0_1px_2px_rgba(0,0,0,0.02)]"
                value={filters.search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <div className="pointer-events-none absolute start-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-focus-within:bg-primary/[0.14]">
                <Search className="h-[18px] w-[18px]" strokeWidth={2.25} />
              </div>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-3 min-w-0 sm:grid-cols-2 lg:grid-cols-3">
            <div className="min-w-0 sm:col-span-2 lg:col-span-1">
              <label
                htmlFor="doctor-patients-diagnosis"
                className="mb-2 flex items-center gap-1.5 font-cairo text-[11px] font-extrabold text-[#667085]"
              >
                <Stethoscope className="h-3.5 w-3.5 text-primary/80 shrink-0" aria-hidden />
                {tr("التشخيص / الملاحظات", "Diagnosis / Notes")}
              </label>
              <input
                id="doctor-patients-diagnosis"
                type="text"
                placeholder={tr("كلمة في التشخيص...", "A word in the diagnosis...")}
                value={filters.diagnosis}
                onChange={(e) => onDiagnosisChange(e.target.value)}
                className="h-[42px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-start font-cairo text-[12px] font-bold text-[#111827] shadow-sm outline-none transition-all placeholder:text-[#98A2B3] hover:border-[#D0D5DD] focus:border-primary/45 focus:ring-2 focus:ring-primary/12"
              />
            </div>

            <div className="relative min-w-0">
              <label
                htmlFor="doctor-patients-account-status"
                className="mb-2 block font-cairo text-[11px] font-extrabold text-[#667085]"
              >
                {tr("حالة الحساب", "Account status")}
              </label>
              <StyledSelect
                id="doctor-patients-account-status"
                size="sm"
                tone="muted"
                value={filters.account_status}
                onChange={(v) =>
                  onAccountStatusChange(
                    (v as DoctorPatientsFilterStatus) || "all",
                  )
                }
                options={[
                  { value: "all", label: tr("جميع الحالات", "All statuses") },
                  { value: "active", label: tr("نشط", "Active") },
                  { value: "temporary", label: tr("مؤقت", "Temporary") },
                  { value: "suspended", label: tr("معلق", "Suspended") },
                ]}
                listboxAriaLabel={tr("حالة الحساب", "Account status")}
              />
            </div>

            <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
              <label
                htmlFor="doctor-patients-relationship"
                className="mb-2 block font-cairo text-[11px] font-extrabold text-[#667085]"
              >
                {tr("علاقة الوصول", "Access relationship")}
              </label>
              <StyledSelect
                id="doctor-patients-relationship"
                size="sm"
                tone="muted"
                value={filters.relationship}
                onChange={(v) =>
                  onRelationshipChange(
                    (v as DoctorPatientsRelationshipFilter) || "all",
                  )
                }
                className="lg:min-w-0"
                options={[
                  { value: "all", label: tr("كل العلاقات", "All relationships") },
                  { value: "full-access", label: tr("وصول كامل", "Full access") },
                  { value: "linked-only", label: tr("مرتبط فقط", "Linked only") },
                  { value: "temporary", label: tr("مؤقت", "Temporary") },
                  { value: "access-pending", label: tr("قيد الانتظار", "Pending") },
                  { value: "active-encounter", label: tr("زيارة جارية", "Active encounter") },
                  { value: "restricted", label: tr("محجوب", "Restricted") },
                  {
                    value: "relationship-indeterminate",
                    label: tr("لم تُعرَف بعد (وسّع البطاقة)", "Not determined yet (expand the card)"),
                  },
                ]}
                listboxAriaLabel={tr("علاقة الوصول", "Access relationship")}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFBFC]/90 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap gap-2 items-center mb-3 text-start">
            <Calendar className="w-4 h-4 text-primary shrink-0" aria-hidden />
            <span className="font-cairo text-[12px] font-extrabold text-[#344054]">
              {tr("نطاق تاريخ آخر زيارة", "Last visit date range")}
            </span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-5">
            <div className="flex min-w-[200px] flex-1 flex-col gap-1.5 sm:max-w-xs">
              <span className="font-cairo text-[10px] font-extrabold uppercase tracking-wide text-[#667085]">
                {tr("من تاريخ", "From date")}
              </span>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => onFromChange(e.target.value)}
                className="h-[40px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827] shadow-sm outline-none transition-all focus:border-primary/45 focus:ring-2 focus:ring-primary/12"
              />
            </div>
            <span
              className="hidden shrink-0 pb-2 font-cairo text-[11px] font-bold text-[#D0D5DD] sm:inline sm:self-end"
              aria-hidden
            >
              ···
            </span>
            <div className="flex min-w-[200px] flex-1 flex-col gap-1.5 sm:max-w-xs">
              <span className="font-cairo text-[10px] font-extrabold uppercase tracking-wide text-[#667085]">
                {tr("إلى تاريخ", "To date")}
              </span>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => onToChange(e.target.value)}
                className="h-[40px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827] shadow-sm outline-none transition-all focus:border-primary/45 focus:ring-2 focus:ring-primary/12"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
