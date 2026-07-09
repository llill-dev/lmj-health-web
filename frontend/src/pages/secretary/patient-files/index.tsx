import { memo, useMemo, useState } from "react";
import {
  Search,
  FileText,
  Calendar,
  Download,
  Eye,
  ChevronRight,
} from "lucide-react";

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

function FilesSearchInput({
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
        placeholder="ابحث بالاسم، نوع الملف، أو التاريخ…"
        aria-label="بحث عن ملف"
        className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white pr-10 pl-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none placeholder:font-cairo placeholder:text-[14px] placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary"
      />
      <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[#98A2B3]">
        <Search className="h-5 w-5" />
      </div>
    </div>
  );
}

const PatientFileRow = memo<{
  file: {
    id: string;
    patientName: string;
    patientId: string;
    fileType: string;
    date: string;
  };
  onView: (fileId: string) => void;
  onDownload: (fileId: string) => void;
}>(function PatientFileRow({ file, onView, onDownload }) {
  return (
    <div className="grid grid-cols-1 gap-4 border-b border-[#EEF2F6] px-4 py-4 last:border-b-0 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8 lg:py-5">
      <div className="flex items-center gap-4 lg:col-span-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary text-white shadow-[0_14px_28px_rgba(15,143,139,0.22)]">
          <span className="font-cairo text-[20px] font-black">
            {patientInitials(file.patientName)}
          </span>
        </div>
        <div className="min-w-0 text-right">
          <div className="truncate font-cairo text-[18px] font-black text-[#243044]">
            {file.patientName}
          </div>
          <div className="truncate font-cairo text-[14px] font-semibold text-[#98A2B3]">
            {file.patientId}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 font-cairo text-[16px] font-bold text-[#243044] lg:col-span-3">
        <FileText className="h-4 w-4 text-[#98A2B3]" />
        {file.fileType}
      </div>

      <div className="flex items-center gap-2 font-cairo text-[16px] font-bold text-[#243044] lg:col-span-3">
        <Calendar className="h-4 w-4 text-[#98A2B3]" />
        {formatIsoDate(file.date)}
      </div>

      <div className="flex items-center gap-2 lg:col-span-2">
        <button
          type="button"
          onClick={() => onView(file.id)}
          className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-primary text-white transition hover:bg-[#0A7A77]"
          title="عرض"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDownload(file.id)}
          className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#1F2937] transition hover:bg-[#F8FAFC]"
          title="تحميل"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

export default function SecretaryPatientFilesPage() {
  const [searchInput, setSearchInput] = useState("");

  const files = [
    {
      id: "file-001",
      patientName: "سارة علي",
      patientId: "1234567890",
      fileType: "تقرير طبي",
      date: "2024-01-15",
    },
    {
      id: "file-002",
      patientName: "أحمد نور",
      patientId: "0987654321",
      fileType: "وصفة طبية",
      date: "2024-01-15",
    },
  ];

  const searchedFiles = useMemo(() => {
    if (!searchInput.trim()) return files;
    const search = searchInput.toLowerCase();
    return files.filter(
      (f) =>
        f.patientName.toLowerCase().includes(search) ||
        f.patientId.includes(search) ||
        f.fileType.toLowerCase().includes(search),
    );
  }, [files, searchInput]);

  return (
    <div dir="rtl" lang="ar" className="space-y-6 pb-6 sm:space-y-7 sm:pb-8">
      <SurfaceSection title="ملفات المرضى">
        <div className="flex flex-col gap-4 border-b border-[#EEF2F6] px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
          <div className="text-right">
            <h2 className="font-cairo text-[23px] font-black text-[#243044]">
              ملفات المرضى
            </h2>
            <p className="mt-1 font-cairo text-[13px] font-semibold text-[#98A2B3]">
              {files.length} ملف
              {searchInput ? " مطابق للبحث" : ""}
            </p>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-5 sm:py-6">
          <FilesSearchInput value={searchInput} onChange={setSearchInput} />
        </div>

        <div className="hidden border-b border-[#EEF2F6] px-8 py-4 lg:block">
          <div className="grid grid-cols-12 gap-4 text-right font-cairo text-[14px] font-bold text-[#A1AAB9]">
            <div className="col-span-4">المريض</div>
            <div className="col-span-3">نوع الملف</div>
            <div className="col-span-3">التاريخ</div>
            <div className="col-span-2">الإجراءات</div>
          </div>
        </div>

        {searchedFiles.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {searchInput
                ? "لا توجد نتائج مطابقة لبحثك."
                : "لا يوجد ملفات للمرضى."}
            </p>
          </div>
        ) : (
          <>
            {searchedFiles.map((file) => (
              <PatientFileRow
                key={file.id}
                file={file}
                onView={(fileId) => console.log("View file", fileId)}
                onDownload={(fileId) => console.log("Download file", fileId)}
              />
            ))}
          </>
        )}
      </SurfaceSection>
    </div>
  );
}
