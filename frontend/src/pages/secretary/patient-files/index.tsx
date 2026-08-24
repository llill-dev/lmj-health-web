import { memo, useMemo, useState } from "react";
import {
  Search,
  FileText,
  Calendar,
  Download,
  Eye,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useDoctorPatientFiles, useDoctorPatients } from "@/hooks/doctor/patients/useDoctorPatients";
import { useSecretaryAssignedDoctor } from "@/hooks/secretary/useSecretaryAssignedDoctor";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import { doctorApi } from "@/lib/doctor/client";
import { ApiError } from "@/lib/api";
import { getPatientFileAccessErrorMessage } from "@/lib/doctor/writeFlowErrors";
import { triggerBrowserFileDownload, triggerBrowserFileDownloadAndOpen } from "@/lib/files/triggerBrowserFileDownload";
import { useI18n } from "@/i18n/provider";
import StyledSelect from "@/components/ui/styled-select";

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

function SurfaceSection({
  title,
  children,
  count,
  searchMatch,
}: {
  title: string;
  children: React.ReactNode;
  count?: number;
  searchMatch?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E8EEF6] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <header className="border-b border-[#EDF2F7] px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <h2 className="text-start font-cairo text-[23px] font-black leading-none text-[#243044]">
          {title}
        </h2>
        {count !== undefined && (
          <p className="mt-1 font-cairo text-[13px] font-semibold text-[#98A2B3]">
            {count} ملف
            {searchMatch ? " مطابق للبحث" : ""}
          </p>
        )}
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
        className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white pe-10 ps-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none placeholder:font-cairo placeholder:text-[14px] placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary"
      />
      <div className="pointer-events-none absolute end-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[#98A2B3]">
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
  locale: "ar" | "en";
  disabled?: boolean;
}>(function PatientFileRow({ file, onView, onDownload, locale, disabled }) {
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  return (
    <div className="grid grid-cols-1 gap-4 border-b border-[#EEF2F6] px-4 py-4 last:border-b-0 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8 lg:py-5">
      <div className="flex items-center gap-4 lg:col-span-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary text-white shadow-[0_14px_28px_rgba(15,143,139,0.22)]">
          <span className="font-cairo text-[20px] font-black">
            {patientInitials(file.patientName)}
          </span>
        </div>
        <div className="min-w-0 text-start">
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
        {formatIsoDate(file.date, locale)}
      </div>

      <div className="flex items-center gap-2 lg:col-span-2">
        <button
          type="button"
          onClick={() => onView(file.id)}
          disabled={disabled}
          className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-primary text-white transition hover:bg-[#0A7A77] disabled:cursor-not-allowed disabled:opacity-60"
          title={tr("عرض", "View")}
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDownload(file.id)}
          disabled={disabled}
          className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#1F2937] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
          title={tr("تحميل", "Download")}
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

export default function SecretaryPatientFilesPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const [searchInput, setSearchInput] = useState("");
  const [patientId, setPatientId] = useState("");
  const [category, setCategory] = useState("");
  const [archived, setArchived] = useState<"all" | "active" | "archived">("active");
  const { toast } = useToast();
  const assignedDoctorQuery = useSecretaryAssignedDoctor();
  const { hasPermission } = useSecretaryPermissions();
  const canViewFiles = hasPermission("patients:files:view");
  const doctorId = assignedDoctorQuery.assignedDoctor?._id ?? "";
  const canLoadPatientFiles = canViewFiles && Boolean(doctorId);
  const patientsQuery = useDoctorPatients(
    { page: 1, limit: 100 },
    canLoadPatientFiles,
  );
  const filesQuery = useDoctorPatientFiles(
    patientId,
    canLoadPatientFiles && Boolean(patientId),
    {
      search: searchInput.trim() || undefined,
      category: category || undefined,
      archived: archived === "all" ? undefined : archived === "archived",
    },
  );
  // The backend enforces a per-patient profile-access guard in addition to the
  // secretary's global patients:files:view + assigned-doctor check — a patient
  // can be selectable in the dropdown yet still 403 once files are requested.
  const filesAccessDenied =
    filesQuery.error instanceof ApiError && filesQuery.error.status === 403;
  const fileActionsDisabledReason = useMemo(() => {
    if (!canViewFiles) {
      return tr(
        "هذا الحساب لا يملك صلاحية الوصول إلى ملفات المرضى حالياً.",
        "This account is not allowed to access patient files right now.",
      );
    }
    if (assignedDoctorQuery.isLoading) {
      return tr(
        "جاري تحميل الطبيب المسؤول قبل إتاحة فتح الملفات وتنزيلها.",
        "Loading the assigned doctor before file actions become available.",
      );
    }
    if (assignedDoctorQuery.isForbidden) {
      return tr(
        "الباك أعاد 403 على الطبيب المسؤول، لذلك لا يمكن فتح ملفات المرضى أو تنزيلها بهذه الصلاحية.",
        "The backend returned 403 for the assigned doctor, so patient files cannot be opened or downloaded with this permission set.",
      );
    }
    if (assignedDoctorQuery.isUnassigned) {
      return tr(
        "الباك أعاد 404 على الطبيب المسؤول، لذلك لا يوجد طبيب مرتبط حالياً للوصول إلى ملفات المرضى.",
        "The backend returned 404 for the assigned doctor, so no linked doctor is currently available for patient file access.",
      );
    }
    if (assignedDoctorQuery.isError) {
      return tr(
        "تعذر تحميل الطبيب المسؤول، لذلك تم تعطيل فتح الملفات وتنزيلها مؤقتاً.",
        "Could not load the assigned doctor, so file open and download actions are temporarily disabled.",
      );
    }
    if (!doctorId) {
      return tr(
        "لا يمكن فتح ملفات المرضى أو تنزيلها قبل ربط السكرتير بطبيب مسؤول.",
        "Patient files cannot be opened or downloaded until the secretary is linked to an assigned doctor.",
      );
    }
    return null;
  }, [assignedDoctorQuery.isError, assignedDoctorQuery.isForbidden, assignedDoctorQuery.isLoading, assignedDoctorQuery.isUnassigned, canViewFiles, doctorId, tr]);

  const patientDirectory = useMemo(
    () =>
      new Map((patientsQuery.patients ?? []).map((patient) => [patient._id, patient])),
    [patientsQuery.patients],
  );
  const files = useMemo(
    () =>
      (filesQuery.files ?? []).map((file) => ({
        id: file.id || file._id || "",
        patientName:
          patientDirectory.get(patientId)?.user?.fullName || tr("مريض", "Patient"),
        patientId:
          patientDirectory.get(patientId)?.publicId || patientId || "—",
        fileType: file.mimeType || file.originalName || tr("ملف", "File"),
        date: file.createdAt || "",
        filename: file.originalName || tr("ملف", "File"),
      })),
    [filesQuery.files, patientDirectory, patientId, tr],
  );

  async function resolveDownloadUrl(fileId: string) {
    if (!doctorId || !patientId || !fileId || !canViewFiles) return null;
    const response = await doctorApi.patients.getFileDownloadUrl(
      doctorId,
      patientId,
      fileId,
    );
    return response.downloadUrl || response.url || null;
  }

  async function handleDownload(fileId: string, filename: string) {
    try {
      const url = await resolveDownloadUrl(fileId);
      if (!url) throw new Error("missing_url");
      await triggerBrowserFileDownload(url, filename);
    } catch (error) {
      toast(getPatientFileAccessErrorMessage(error, "download", locale), {
        title: tr("فشل التنزيل", "Download failed"),
        variant: "error",
      });
    }
  }

  async function handleView(fileId: string, filename: string) {
    try {
      const url = await resolveDownloadUrl(fileId);
      if (!url) throw new Error("missing_url");
      await triggerBrowserFileDownloadAndOpen(url, filename);
    } catch (error) {
      toast(getPatientFileAccessErrorMessage(error, "open", locale), {
        title: tr("فشل الفتح", "Open failed"),
        variant: "error",
      });
    }
  }

  // search/category/archived are now sent to the backend via useDoctorPatientFiles params.
  const searchedFiles = files;

  return (
    <div dir={dir} lang={locale} className="space-y-6 pb-6 sm:space-y-7 sm:pb-8">
      <SurfaceSection
        title={tr("ملفات المرضى", "Patient files")}
        count={files.length}
        searchMatch={!!searchInput}
      >
        <div className="px-4 pt-5 sm:px-5 sm:pt-6">
          <select
            value={patientId}
            onChange={(event) => setPatientId(event.target.value)}
            disabled={
              !canLoadPatientFiles ||
              patientsQuery.isAwaitingData ||
              patientsQuery.isRefetching
            }
            className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none focus:border-primary"
          >
            <option value="">{tr("اختر مريضاً لعرض ملفاته", "Choose a patient to view files")}</option>
            {(patientsQuery.patients ?? []).map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.user?.fullName || tr("مريض", "Patient")} - {patient.publicId || patient._id}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-3 px-4 py-5 sm:px-5 sm:py-6 lg:flex-row lg:items-center">
          <div className="flex-1">
            <FilesSearchInput value={searchInput} onChange={setSearchInput} />
          </div>
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder={tr("الفئة", "Category")}
            className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 font-cairo text-[14px] font-bold text-[#111827] outline-none focus:border-primary lg:w-[160px]"
          />
          <div className="w-full lg:w-[150px]">
            <StyledSelect
              value={archived}
              onChange={(value) => setArchived(value as "all" | "active" | "archived")}
              options={[
                { value: "active", label: tr("غير مؤرشف", "Active") },
                { value: "archived", label: tr("مؤرشف", "Archived") },
                { value: "all", label: tr("الكل", "All") },
              ]}
              listboxAriaLabel={tr("حالة الأرشفة", "Archive status")}
            />
          </div>
        </div>

        <div className="hidden border-b border-[#EEF2F6] px-8 py-4 lg:block">
          <div className="grid grid-cols-12 gap-4 text-start font-cairo text-[14px] font-bold text-[#A1AAB9]">
            <div className="col-span-4">{tr("المريض", "Patient")}</div>
            <div className="col-span-3">{tr("نوع الملف", "File type")}</div>
            <div className="col-span-3">{tr("التاريخ", "Date")}</div>
            <div className="col-span-2">{tr("الإجراءات", "Actions")}</div>
          </div>
        </div>

        {!canLoadPatientFiles ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="max-w-[560px] font-cairo text-[15px] font-semibold text-[#64748B]">
              {fileActionsDisabledReason}
            </p>
          </div>
        ) : patientsQuery.isAwaitingData ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {tr("جاري تحميل قائمة المرضى...", "Loading patients...")}
            </p>
          </div>
        ) : patientsQuery.isError ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="max-w-[560px] font-cairo text-[15px] font-semibold text-[#64748B]">
              {tr(
                "تعذر تحميل قائمة المرضى المرتبطة بالطبيب المسؤول، لذلك لا يمكن عرض الملفات حالياً.",
                "Could not load the assigned doctor's patient list, so files cannot be shown right now.",
              )}
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
        ) : !patientId ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {tr("اختر مريضاً أولاً لعرض الملفات.", "Choose a patient first to view files.")}
            </p>
          </div>
        ) : filesQuery.isAwaitingData ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {tr("جاري تحميل الملفات...", "Loading files...")}
            </p>
          </div>
        ) : filesAccessDenied ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="max-w-[560px] font-cairo text-[15px] font-semibold text-[#64748B]">
              {tr(
                "لا تملك صلاحية الوصول إلى ملف هذا المريض بعينه. قد تحتاج إلى طلب الوصول أولاً حتى لو كانت لديك صلاحية عرض ملفات المرضى عموماً.",
                "You don't have access to this specific patient's file. You may need to request access first, even though you have general patient-files permission.",
              )}
            </p>
          </div>
        ) : filesQuery.isError ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="max-w-[560px] font-cairo text-[15px] font-semibold text-[#64748B]">
              {tr(
                "تعذر تحميل ملفات المريض حالياً. أعد المحاولة لمتابعة العرض أو التنزيل.",
                "Could not load the patient files right now. Retry to continue viewing or downloading.",
              )}
            </p>
            <button
              type="button"
              onClick={() => void filesQuery.refetch()}
              disabled={filesQuery.isRefetching}
              className="rounded-[10px] border border-[#D0D5DD] bg-white px-4 py-2 font-cairo text-[14px] font-black text-[#344054] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {filesQuery.isRefetching
                ? tr("جاري إعادة المحاولة...", "Retrying...")
                : tr("إعادة المحاولة", "Retry")}
            </button>
          </div>
        ) : searchedFiles.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {searchInput
                ? tr("لا توجد نتائج مطابقة لبحثك.", "No results match your search.")
                : tr("لا يوجد ملفات للمرضى.", "No patient files found.")}
            </p>
            {fileActionsDisabledReason ? (
              <p className="max-w-[520px] font-cairo text-[13px] font-semibold text-[#98A2B3]">
                {fileActionsDisabledReason}
              </p>
            ) : null}
          </div>
        ) : (
          <>
            {searchedFiles.map((file) => (
              <PatientFileRow
                key={file.id}
                file={file}
                locale={locale}
                onView={(fileId) => handleView(fileId, file.filename)}
                onDownload={(fileId) => handleDownload(fileId, file.filename)}
                disabled={Boolean(fileActionsDisabledReason)}
              />
            ))}
          </>
        )}
      </SurfaceSection>
    </div>
  );
}
