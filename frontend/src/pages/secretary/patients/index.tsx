import { memo, useMemo, useState } from "react";
import { Search, ChevronRight, UserPlus, Loader2 } from "lucide-react";
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

function accountStatusPresentation(patient: {
  isTemporary?: boolean;
  accountStatus?: string;
}): {
  label: string;
  className: string;
} {
  const status =
    patient.accountStatus ?? (patient.isTemporary ? "temporary" : "active");

  if (status === "temporary" || patient.isTemporary) {
    return {
      label: "مؤقت",
      className: "bg-[#FFF7ED] text-[#C2410C]",
    };
  }

  if (status === "suspended") {
    return {
      label: "معلّق",
      className: "bg-[#FEE2E2] text-[#B42318]",
    };
  }

  return {
    label: "نشط",
    className: "bg-[#ECFDF3] text-[#16A34A]",
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

function PatientsSearchInput({
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
        placeholder="ابحث بالاسم، الهاتف، البريد، أو رقم الملف…"
        aria-label="بحث عن مريض"
        className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white pr-10 pl-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none placeholder:font-cairo placeholder:text-[14px] placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary"
      />
      <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[#98A2B3]">
        <Search className="h-5 w-5" />
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
}>(function PatientTableRow({ patient, onOpen }) {
  const status = accountStatusPresentation(patient);

  return (
    <div className="grid grid-cols-1 gap-4 border-b border-[#EEF2F6] px-4 py-4 last:border-b-0 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8 lg:py-5">
      <div className="flex items-center gap-4 lg:col-span-4">
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
        {formatIsoDate(patient.registrationDate)}
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
          عرض التفاصيل
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

export default function SecretaryPatientsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "temporary">("all");

  const patients = [
    {
      id: "1234567890",
      name: "سارة علي",
      phone: "+966506789012",
      email: "sara@example.com",
      registrationDate: "2024-01-15",
      accountStatus: "active",
    },
    {
      id: "0987654321",
      name: "أحمد نور",
      phone: "+966598765432",
      email: "ahmed@example.com",
      registrationDate: "2024-02-20",
      accountStatus: "active",
    },
    {
      id: "1122334455",
      name: "ليلى محمد",
      phone: "+966511223344",
      email: "layla@example.com",
      registrationDate: "2024-03-10",
      isTemporary: true,
    },
  ];

  const filterTabs = useMemo(
    () => [
      { key: "all" as const, label: "الكل" },
      { key: "active" as const, label: "نشط" },
      { key: "temporary" as const, label: "مؤقت" },
    ],
    [],
  );

  const filteredPatients = useMemo(() => {
    if (filter === "all") return patients;
    return patients.filter((p) =>
      filter === "temporary" ? p.isTemporary : !p.isTemporary,
    );
  }, [patients, filter]);

  const searchedPatients = useMemo(() => {
    if (!searchInput.trim()) return filteredPatients;
    const search = searchInput.toLowerCase();
    return filteredPatients.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.phone.includes(search) ||
        p.email.toLowerCase().includes(search),
    );
  }, [filteredPatients, searchInput]);

  return (
    <div dir="rtl" lang="ar" className="space-y-6 pb-6 sm:space-y-7 sm:pb-8">
      <SurfaceSection title="المرضى">
        <div className="flex flex-col gap-4 border-b border-[#EEF2F6] px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
          <div className="text-right">
            <h2 className="font-cairo text-[23px] font-black text-[#243044]">
              المرضى
            </h2>
            <p className="mt-1 font-cairo text-[13px] font-semibold text-[#98A2B3]">
              {patients.length} مريض
              {searchInput ? " مطابق للبحث" : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/secretary/create-temporary-patient"
              className="flex h-[42px] items-center gap-2 rounded-[10px] bg-primary px-5 font-cairo text-[15px] font-black text-white shadow-[0_10px_20px_rgba(15,143,139,0.30)] transition-colors hover:bg-primary/90"
            >
              <UserPlus className="h-4 w-4" />
              إضافة مريض مؤقت
            </Link>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-5 sm:py-6">
          <PatientsSearchInput value={searchInput} onChange={setSearchInput} />
        </div>

        <div className="hidden border-b border-[#EEF2F6] px-8 py-4 lg:block">
          <div className="grid grid-cols-12 gap-4 text-right font-cairo text-[14px] font-bold text-[#A1AAB9]">
            <div className="col-span-4">اسم المريض</div>
            <div className="col-span-3">رقم الهاتف</div>
            <div className="col-span-2">تاريخ التسجيل</div>
            <div className="col-span-1">الحالة</div>
            <div className="col-span-2">الإجراءات</div>
          </div>
        </div>

        {searchedPatients.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {searchInput
                ? "لا توجد نتائج مطابقة لبحثك."
                : "لا يوجد مرضى في هذه الفئة."}
            </p>
          </div>
        ) : (
          <>
            {searchedPatients.map((patient) => (
              <PatientTableRow
                key={patient.id}
                patient={patient}
                onOpen={(patientId) => console.log("Open patient", patientId)}
              />
            ))}
          </>
        )}
      </SurfaceSection>
    </div>
  );
}
