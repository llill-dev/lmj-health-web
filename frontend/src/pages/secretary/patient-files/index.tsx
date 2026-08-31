import { memo, useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Search,
  FileText,
  Calendar,
  Download,
  Eye,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import {
  useDeleteDoctorPatientFile,
  useDoctorPatientFiles,
  useDoctorPatients,
  useUploadDoctorPatientFile,
} from "@/hooks/doctor/patients/useDoctorPatients";
import { useSecretaryAssignedDoctor } from "@/hooks/secretary/useSecretaryAssignedDoctor";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import { doctorApi } from "@/lib/doctor/client";
import { ApiError } from "@/lib/api";
import {
  getPatientFileAccessErrorMessage,
  getPatientFileMutationErrorMessage,
} from "@/lib/doctor/writeFlowErrors";
import {
  triggerBrowserFileDownload,
  triggerBrowserFileDownloadAndOpen,
} from "@/lib/files/triggerBrowserFileDownload";
import { useI18n } from "@/i18n/provider";
import StyledSelect from "@/components/ui/styled-select";
import { MedicalRecordsPagination } from "@/components/doctor/medical-records/medical-records-pagination";
import ConfirmActionDialog from "@/components/doctor/confirm-action-dialog";

function formatIsoDate(
  value: string | null | undefined,
  locale: "ar" | "en",
): string {
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
  const { t, locale } = useI18n();
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#E8EEF6] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <header className="border-b border-[#EDF2F7] px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <h2 className="text-start font-cairo text-[23px] font-black leading-none text-[#243044]">
          {title}
        </h2>
        {count !== undefined && (
          <p className="mt-1 font-cairo text-[13px] font-semibold text-[#98A2B3]">
            {locale === "ar" ? `${count} ملفات` : `${count} files`}
            {searchMatch ? t("secretary.patientFiles.matchingSearch") : ""}
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
  t,
}: {
  value: string;
  onChange: (value: string) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="relative min-w-0">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("secretary.patientFiles.searchPlaceholder")}
        aria-label={t("secretary.patientFiles.searchAriaLabel")}
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
  onDelete?: (fileId: string) => void;
  locale: "ar" | "en";
  disabled?: boolean;
  deleting?: boolean;
  t: (key: string) => string;
}>(function PatientFileRow({
  file,
  onView,
  onDownload,
  onDelete,
  locale,
  disabled,
  deleting,
  t,
}) {
  return (
    <div className="grid grid-cols-1 gap-4 border-b border-[#EEF2F6] px-4 py-4 last:border-b-0 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8 lg:py-5">
      <div className="flex items-center gap-4 lg:col-span-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary text-white shadow-[0_14px_28px_rgba(15,143,139,0.22)]">
          <span className="font-cairo text-[20px] font-black">
            {patientInitials(file.patientName, locale)}
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
          title={t("secretary.patientFiles.view")}
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDownload(file.id)}
          disabled={disabled}
          className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#1F2937] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
          title={t("secretary.patientFiles.download")}
        >
          <Download className="h-4 w-4" />
        </button>
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(file.id)}
            disabled={disabled || deleting}
            className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#F04438] bg-white text-[#D92D20] transition hover:bg-[#FEF3F2] disabled:cursor-not-allowed disabled:opacity-60"
            title={t("secretary.patientFiles.delete")}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
});

export default function SecretaryPatientFilesPage() {
  const { t, locale, dir } = useI18n();
  const [searchInput, setSearchInput] = useState("");
  const [patientId, setPatientId] = useState("");
  const [category, setCategory] = useState("");
  const [archived, setArchived] = useState<"all" | "active" | "archived">(
    "active",
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { toast } = useToast();
  const assignedDoctorQuery = useSecretaryAssignedDoctor();
  const { hasPermission } = useSecretaryPermissions();
  const canViewFiles = hasPermission("patients:files:view");
  const canManageFiles = hasPermission("patients:files:upload");
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
      page,
      limit: pageSize,
    },
  );
  const uploadFile = useUploadDoctorPatientFile(patientId);
  const deleteFile = useDeleteDoctorPatientFile(patientId);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    filename: string;
  } | null>(null);

  useEffect(() => {
    setPage(1);
  }, [patientId, searchInput, category, archived, pageSize]);
  // The backend enforces a per-patient profile-access guard in addition to the
  // secretary's global patients:files:view + assigned-doctor check — a patient
  // can be selectable in the dropdown yet still 403 once files are requested.
  const filesAccessDenied =
    filesQuery.error instanceof ApiError && filesQuery.error.status === 403;
  const fileActionsDisabledReason = useMemo(() => {
    if (!canViewFiles) {
      return t("secretary.patientFiles.noPermission");
    }
    if (assignedDoctorQuery.isLoading) {
      return t("secretary.patientFiles.loadingDoctor");
    }
    if (assignedDoctorQuery.isForbidden) {
      return t("secretary.patientFiles.doctorForbidden");
    }
    if (assignedDoctorQuery.isUnassigned) {
      return t("secretary.patientFiles.doctorNotFound");
    }
    if (assignedDoctorQuery.isError) {
      return t("secretary.patientFiles.doctorLoadError");
    }
    if (!doctorId) {
      return t("secretary.patientFiles.noAssignedDoctor");
    }
    return null;
  }, [
    assignedDoctorQuery.isError,
    assignedDoctorQuery.isForbidden,
    assignedDoctorQuery.isLoading,
    assignedDoctorQuery.isUnassigned,
    canViewFiles,
    doctorId,
    t,
  ]);

  const patientDirectory = useMemo(
    () =>
      new Map(
        (patientsQuery.patients ?? []).map((patient) => [patient._id, patient]),
      ),
    [patientsQuery.patients],
  );
  const files = useMemo(
    () =>
      (filesQuery.files ?? []).map((file) => ({
        id: file.id || file._id || "",
        patientName:
          patientDirectory.get(patientId)?.user?.fullName ||
          t("secretary.patientFiles.patient"),
        patientId:
          patientDirectory.get(patientId)?.publicId || patientId || "—",
        fileType:
          file.mimeType ||
          file.originalName ||
          t("secretary.patientFiles.file"),
        date: file.createdAt || "",
        filename: file.originalName || t("secretary.patientFiles.file"),
      })),
    [filesQuery.files, patientDirectory, patientId, t],
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
        title: t("secretary.patientFiles.downloadFailed"),
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
        title: t("secretary.patientFiles.openFailed"),
        variant: "error",
      });
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !patientId) return;
    try {
      await uploadFile.mutateAsync({ file });
      toast(t("secretary.patientFiles.uploadSuccess"), {
        variant: "success",
      });
    } catch (error) {
      toast(getPatientFileMutationErrorMessage(error, "upload", locale), {
        title: t("secretary.patientFiles.uploadFailed"),
        variant: "error",
      });
    }
  }

  function requestDelete(fileId: string, filename: string) {
    setDeleteTarget({ id: fileId, filename });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const fileId = deleteTarget.id;
    setDeletingFileId(fileId);
    try {
      await deleteFile.mutateAsync(fileId);
      toast(t("secretary.patientFiles.deleteSuccess"), {
        variant: "success",
      });
    } catch (error) {
      toast(getPatientFileMutationErrorMessage(error, "delete", locale), {
        title: t("secretary.patientFiles.deleteFailed"),
        variant: "error",
      });
      throw error;
    } finally {
      setDeletingFileId(null);
    }
  }

  // search/category/archived are now sent to the backend via useDoctorPatientFiles params.
  const searchedFiles = files;

  return (
    <div
      dir={dir}
      lang={locale}
      className="space-y-6 pb-6 sm:space-y-7 sm:pb-8"
    >
      <SurfaceSection
        title={t("secretary.patientFiles.title")}
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
            <option value="">
              {t("secretary.patientFiles.choosePatient")}
            </option>
            {(patientsQuery.patients ?? []).map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.user?.fullName || t("secretary.patientFiles.patient")}{" "}
                - {patient.publicId || patient._id}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-3 px-4 py-5 sm:px-5 sm:py-6 lg:flex-row lg:items-center">
          <div className="flex-1">
            <FilesSearchInput
              value={searchInput}
              onChange={setSearchInput}
              t={t}
            />
          </div>
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder={t("secretary.patientFiles.category")}
            className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 font-cairo text-[14px] font-bold text-[#111827] outline-none focus:border-primary lg:w-[160px]"
          />
          <div className="w-full lg:w-[150px]">
            <StyledSelect
              value={archived}
              onChange={(value) =>
                setArchived(value as "all" | "active" | "archived")
              }
              options={[
                {
                  value: "active",
                  label: t("secretary.patientFiles.archiveActive"),
                },
                {
                  value: "archived",
                  label: t("secretary.patientFiles.archiveArchived"),
                },
                { value: "all", label: t("secretary.patientFiles.archiveAll") },
              ]}
              listboxAriaLabel={t("secretary.patientFiles.archiveStatus")}
            />
          </div>
          {canManageFiles && patientId ? (
            <label className="inline-flex h-[40px] cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-primary px-4 font-cairo text-[13px] font-extrabold text-white shadow-[0_10px_20px_rgba(15,143,139,0.24)] transition-colors hover:bg-primary/90 lg:shrink-0">
              {uploadFile.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {t("secretary.patientFiles.uploadFile")}
              <input
                type="file"
                className="hidden"
                onChange={(event) => void handleUpload(event)}
              />
            </label>
          ) : null}
        </div>

        <div className="hidden border-b border-[#EEF2F6] px-8 py-4 lg:block">
          <div className="grid grid-cols-12 gap-4 text-start font-cairo text-[14px] font-bold text-[#A1AAB9]">
            <div className="col-span-4">
              {t("secretary.patientFiles.patientColumn")}
            </div>
            <div className="col-span-3">
              {t("secretary.patientFiles.fileType")}
            </div>
            <div className="col-span-3">
              {t("secretary.patientFiles.dateColumn")}
            </div>
            <div className="col-span-2">
              {t("secretary.patientFiles.actionsColumn")}
            </div>
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
              {t("secretary.patientFiles.loadingPatients")}
            </p>
          </div>
        ) : patientsQuery.isError ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="max-w-[560px] font-cairo text-[15px] font-semibold text-[#64748B]">
              {t("secretary.patientFiles.patientListError")}
            </p>
            <button
              type="button"
              onClick={() => void patientsQuery.refetch()}
              disabled={patientsQuery.isRefetching}
              className="rounded-[10px] border border-[#D0D5DD] bg-white px-4 py-2 font-cairo text-[14px] font-black text-[#344054] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {patientsQuery.isRefetching
                ? t("secretary.patientFiles.retrying")
                : t("secretary.patientFiles.retry")}
            </button>
          </div>
        ) : !patientId ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {t("secretary.patientFiles.choosePatientFirst")}
            </p>
          </div>
        ) : filesQuery.isAwaitingData ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {t("secretary.patientFiles.loadingFiles")}
            </p>
          </div>
        ) : filesAccessDenied ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="max-w-[560px] font-cairo text-[15px] font-semibold text-[#64748B]">
              {t("secretary.patientFiles.patientAccessDenied")}
            </p>
          </div>
        ) : filesQuery.isError ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="max-w-[560px] font-cairo text-[15px] font-semibold text-[#64748B]">
              {t("secretary.patientFiles.loadError")}
            </p>
            <button
              type="button"
              onClick={() => void filesQuery.refetch()}
              disabled={filesQuery.isRefetching}
              className="rounded-[10px] border border-[#D0D5DD] bg-white px-4 py-2 font-cairo text-[14px] font-black text-[#344054] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {filesQuery.isRefetching
                ? t("secretary.patientFiles.retrying")
                : t("secretary.patientFiles.retry")}
            </button>
          </div>
        ) : searchedFiles.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {searchInput
                ? t("secretary.patientFiles.noSearchResults")
                : t("secretary.patientFiles.noFilesFound")}
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
                onDelete={
                  canManageFiles
                    ? (fileId) => requestDelete(fileId, file.filename)
                    : undefined
                }
                deleting={deletingFileId === file.id}
                disabled={Boolean(fileActionsDisabledReason)}
                t={t}
              />
            ))}
            {filesQuery.total > filesQuery.files.length || page > 1 ? (
              <div className="px-4 py-4 sm:px-6 lg:px-8">
                <MedicalRecordsPagination
                  page={page}
                  totalPages={Math.max(
                    1,
                    Math.ceil(filesQuery.total / pageSize),
                  )}
                  showingFrom={
                    filesQuery.total === 0 ? 0 : (page - 1) * pageSize + 1
                  }
                  showingTo={Math.min(page * pageSize, filesQuery.total)}
                  total={filesQuery.total}
                  pageSize={pageSize}
                  itemLabel={t("secretary.patientFiles.fileLabel")}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                />
              </div>
            ) : null}
          </>
        )}
      </SurfaceSection>

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
        title={t("secretary.patientFiles.deleteFileTitle")}
        description={t("secretary.patientFiles.deleteFileDescription").replace(
          "{filename}",
          deleteTarget?.filename ?? "",
        )}
        confirmLabel={t("secretary.patientFiles.delete")}
        confirmDisabled={deletingFileId === deleteTarget?.id}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
