import { memo, useMemo, useState } from "react";
import {
  Search,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  Download,
  Eye,
  FileText,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  useDoctorAppointmentsApi,
  useDoctorAppointmentDetailsApi,
  useDoctorAppointmentFilesApi,
  useCancelDoctorAppointmentApi,
  useRescheduleDoctorAppointmentApi,
} from "@/hooks/doctor/appointments/useDoctorAppointmentsApi";
import { useSecretaryPermissions } from "@/hooks/secretary/useSecretaryPermissions";
import { useSecretaryAssignedDoctor } from "@/hooks/secretary/useSecretaryAssignedDoctor";
import type { DoctorAppointmentStatus } from "@/lib/doctor/types";
import { useI18n } from "@/i18n/provider";
import { useToast } from "@/components/ui/ToastProvider";
import {
  getAppointmentFileAccessErrorMessage,
  getAppointmentWriteErrorMessage,
} from "@/lib/doctor/writeFlowErrors";
import { doctorAppointmentsApi } from "@/lib/doctor/client";
import { triggerBrowserFileDownload } from "@/lib/files/triggerBrowserFileDownload";
import CancelAppointmentDialog from "@/components/admin/appointments/dialogs/CancelAppointmentDialog";
import RescheduleAppointmentDialog from "@/components/doctor/appointments/reschedule-appointment-dialog";
import DoctorTablePagination from "@/components/doctor/shared/doctor-table-pagination";
import { formatAppointmentDate } from "@/lib/shared/formatAppointmentDateTime";

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

function appointmentStatusPresentation(
  status: string,
  t: (key: string) => string,
): {
  label: string;
  className: string;
} {
  if (status === "completed") {
    return {
      label: t("secretary.appointments.status.completed"),
      className: "bg-[#EAFBF0] text-[#22C55E]",
    };
  }

  if (status === "postponed") {
    return {
      label: t("secretary.appointments.status.postponed"),
      className: "bg-[#FFF2E8] text-[#FF6A00]",
    };
  }

  if (status === "cancelled") {
    return {
      label: t("secretary.appointments.status.cancelled"),
      className: "bg-[#FEE2E2] text-[#B42318]",
    };
  }

  if (status === "no-show") {
    return {
      label: t("secretary.appointments.status.noShow"),
      className: "bg-[#F3F4F6] text-[#4B5563]",
    };
  }

  return {
    label: t("secretary.appointments.status.scheduled"),
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
        <h2 className="text-start font-cairo text-[23px] font-black leading-none text-[#243044]">
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
        placeholder={t("secretary.appointments.searchPlaceholder")}
        aria-label={t("secretary.appointments.searchAriaLabel")}
        className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white pe-10 ps-4 font-cairo text-[14px] font-bold text-[#111827] shadow-[0_3px_8px_rgba(15,23,42,0.03)] outline-none placeholder:font-cairo placeholder:text-[14px] placeholder:font-semibold placeholder:text-[#98A2B3] focus:border-primary"
      />
      <div className="pointer-events-none absolute end-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[#98A2B3]">
        <Search className="h-5 w-5" />
      </div>
    </div>
  );
}

type AppointmentRowData = {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  status: string;
  rawStatus: DoctorAppointmentStatus;
};

type AppointmentDetailFile = {
  id: string;
  name: string;
  date: string;
};

const AppointmentTableRow = memo<{
  appointment: AppointmentRowData;
  expanded: boolean;
  onToggle: (appointmentId: string) => void;
  onCancel: (appointment: AppointmentRowData) => void;
  onReschedule: (appointment: AppointmentRowData) => void;
  canCancel: boolean;
  canReschedule: boolean;
  locale: "ar" | "en";
  detailsLoading: boolean;
  detailNotes?: string;
  detailFiles: AppointmentDetailFile[];
  fileActionKey: string | null;
  onOpenFile: (fileId: string) => void;
  onDownloadFile: (fileId: string) => void;
  t: (key: string) => string;
}>(function AppointmentTableRow({
  appointment,
  expanded,
  onToggle,
  onCancel,
  onReschedule,
  canCancel,
  canReschedule,
  locale,
  detailsLoading,
  detailNotes,
  detailFiles,
  fileActionKey,
  onOpenFile,
  onDownloadFile,
  t,
}) {
  const status = appointmentStatusPresentation(appointment.status, t);
  const isActionable =
    appointment.rawStatus === "scheduled" ||
    appointment.rawStatus === "rescheduled";

  return (
    <div className="border-b border-[#EEF2F6] last:border-b-0">
      <div className="grid grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8 lg:py-5">
        <div className="flex items-center gap-4 lg:col-span-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary text-white shadow-[0_14px_28px_rgba(15,143,139,0.22)]">
            <span className="font-cairo text-[20px] font-black">
              {patientInitials(appointment.patientName, locale)}
            </span>
          </div>
          <div className="min-w-0 text-start">
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

        <div className="text-start lg:col-span-1 lg:text-end">
          <button
            type="button"
            onClick={() => onToggle(appointment.id)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-2 font-cairo text-[15px] font-black text-primary transition-colors hover:text-[#0A7A77]"
          >
            {t("secretary.appointments.view")}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-[#EEF2F6] bg-[#F8FAFC] px-4 py-4 sm:px-8">
          <div className="rounded-[10px] border border-[#EEF2F6] bg-white px-3">
            <div className="flex items-start gap-3 border-b border-[#F2F4F7] py-3 last:border-b-0">
              <FileText className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" />
              <div className="flex min-w-0 flex-1 flex-col gap-1 text-start sm:flex-row sm:items-center sm:gap-4">
                <div className="font-cairo text-[14px] font-bold text-primary">
                  {t("secretary.appointments.reasonForVisit")}
                </div>
                <div className="mt-0.5 break-words font-cairo text-[14px] font-normal text-[#1F2937]">
                  {detailsLoading
                    ? t("secretary.appointments.loading")
                    : detailNotes?.trim() ||
                      t("secretary.appointments.noReasonGiven")}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 font-cairo text-[13px] font-extrabold text-[#101828]">
              {t("secretary.appointments.appointmentFiles")}
            </div>
            {detailsLoading ? (
              <p className="rounded-lg border border-dashed border-[#E5E7EB] bg-white px-4 py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                {t("secretary.appointments.loadingFiles")}
              </p>
            ) : detailFiles.length === 0 ? (
              <p className="rounded-lg border border-dashed border-[#E5E7EB] bg-white px-4 py-6 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                {t("secretary.appointments.noFilesAttached")}
              </p>
            ) : (
              <div className="space-y-2">
                {detailFiles.map((file) => {
                  const isBusy = fileActionKey === file.id;
                  return (
                    <div
                      key={file.id}
                      className="flex flex-col gap-3 rounded-lg border border-[#D6F5F3] bg-[#F0FDFC] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 text-start">
                        <div className="font-cairo text-[13px] font-bold text-[#101828]">
                          {file.name}
                        </div>
                        <div className="mt-0.5 font-cairo text-[12px] font-semibold text-[#667085]">
                          {formatAppointmentDate(file.date)}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenFile(file.id)}
                          disabled={isBusy}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-white px-3 font-cairo text-[12px] font-bold text-primary transition-colors hover:bg-[#F0F9F9] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isBusy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                          {t("secretary.appointments.view")}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDownloadFile(file.id)}
                          disabled={isBusy}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-primary bg-white px-3 font-cairo text-[12px] font-bold text-primary transition-colors hover:bg-[#F0F9F9] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {t("secretary.appointments.download")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {isActionable && (canReschedule || canCancel) ? (
            <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-[#EEF2F6] pt-4">
              {canReschedule ? (
                <button
                  type="button"
                  onClick={() => onReschedule(appointment)}
                  className="rounded-[10px] border border-[#D0D5DD] bg-white px-4 py-2 font-cairo text-[13px] font-black text-[#344054] transition-colors hover:bg-[#F8FAFC]"
                >
                  {t("secretary.appointments.reschedule")}
                </button>
              ) : null}
              {canCancel ? (
                <button
                  type="button"
                  onClick={() => onCancel(appointment)}
                  className="rounded-[10px] border border-[#FDA29B] bg-white px-4 py-2 font-cairo text-[13px] font-black text-[#B42318] transition-colors hover:bg-[#FEF3F2]"
                >
                  {t("secretary.appointments.cancelAppointment")}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

export default function SecretaryAppointmentsPage() {
  const { t, locale, dir } = useI18n();
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";
  const { toast } = useToast();
  const { hasPermission } = useSecretaryPermissions();
  const { assignedDoctor } = useSecretaryAssignedDoctor();
  const canViewAppointments = hasPermission("appointments:view");
  const canCancelAppointments = hasPermission("appointments:cancel");
  const canRescheduleAppointments = hasPermission("appointments:edit");
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState<
    "all" | "scheduled" | "completed" | "postponed" | "cancelled" | "no-show"
  >("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fileActionKey, setFileActionKey] = useState<string | null>(null);

  const [cancelTarget, setCancelTarget] = useState<AppointmentRowData | null>(
    null,
  );
  const [rescheduleTarget, setRescheduleTarget] =
    useState<AppointmentRowData | null>(null);

  const detailsQuery = useDoctorAppointmentDetailsApi(expandedId ?? "");
  const appointmentFilesQuery = useDoctorAppointmentFilesApi(
    expandedId ?? "",
    Boolean(expandedId),
  );
  const expandedDetailFiles = useMemo<AppointmentDetailFile[]>(() => {
    const source =
      appointmentFilesQuery.files.length > 0
        ? appointmentFilesQuery.files
        : detailsQuery.files;
    return source.map((file) => ({
      id: file._id,
      name: file.originalName ?? t("secretary.appointments.file"),
      date: (file.linkedAt ?? "").slice(0, 10),
    }));
  }, [appointmentFilesQuery.files, detailsQuery.files, t]);

  async function handleOpenAppointmentFile(fileId: string) {
    if (!expandedId || fileActionKey) return;
    setFileActionKey(fileId);
    try {
      const response = await doctorAppointmentsApi.getFileDownloadUrl(
        expandedId,
        fileId,
      );
      const fileUrl = response.url ?? response.downloadUrl;
      if (!fileUrl) throw new Error("missing download url");
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast(getAppointmentFileAccessErrorMessage(error, "open"), {
        title: t("secretary.appointments.couldNotOpenFile"),
        variant: "error",
      });
    } finally {
      setFileActionKey(null);
    }
  }

  async function handleDownloadAppointmentFile(fileId: string) {
    if (!expandedId || fileActionKey) return;
    setFileActionKey(fileId);
    try {
      const [downloadResponse, fileResponse] = await Promise.all([
        doctorAppointmentsApi.getFileDownloadUrl(expandedId, fileId),
        doctorAppointmentsApi.getFile(expandedId, fileId),
      ]);
      const fileUrl = downloadResponse.url ?? downloadResponse.downloadUrl;
      if (!fileUrl) throw new Error("missing download url");
      await triggerBrowserFileDownload(
        fileUrl,
        fileResponse.file?.originalName ?? "appointment-file",
      );
    } catch (error) {
      toast(getAppointmentFileAccessErrorMessage(error, "download"), {
        title: t("secretary.appointments.couldNotDownloadFile"),
        variant: "error",
      });
    } finally {
      setFileActionKey(null);
    }
  }

  const selectedStatus: DoctorAppointmentStatus | undefined =
    filter === "all"
      ? undefined
      : filter === "postponed"
        ? "rescheduled"
        : filter;

  const appointmentsQuery = useDoctorAppointmentsApi(
    {
      page,
      limit,
      status: selectedStatus,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    canViewAppointments,
  );

  const cancelMutation = useCancelDoctorAppointmentApi();
  const rescheduleMutation = useRescheduleDoctorAppointmentApi();

  const appointments = useMemo<AppointmentRowData[]>(
    () =>
      (appointmentsQuery.appointments ?? []).map((row) => ({
        id: row._id,
        patientName:
          row.patient?.userId?.fullName || t("secretary.appointments.patient"),
        patientId: row.patient?.publicId || row.patient?._id || "—",
        date: row.date || row.startDateTime || "",
        time: row.startTime || "—",
        status: row.status === "rescheduled" ? "postponed" : row.status,
        rawStatus: row.status,
      })),
    [appointmentsQuery.appointments, t],
  );

  const filterTabs = useMemo(
    () => [
      { key: "all" as const, label: t("secretary.appointments.filterAll") },
      {
        key: "scheduled" as const,
        label: t("secretary.appointments.filterScheduled"),
      },
      {
        key: "completed" as const,
        label: t("secretary.appointments.filterCompleted"),
      },
      {
        key: "postponed" as const,
        label: t("secretary.appointments.filterPostponed"),
      },
      {
        key: "cancelled" as const,
        label: t("secretary.appointments.filterCancelled"),
      },
      {
        key: "no-show" as const,
        label: t("secretary.appointments.filterNoShow"),
      },
    ],
    [t],
  );

  // Backend GET /appointments has no free-text search param — filter the current page client-side.
  const searchedAppointments = useMemo(() => {
    if (!searchInput.trim()) return appointments;
    const search = searchInput.toLowerCase();
    return appointments.filter(
      (a) =>
        a.patientName.toLowerCase().includes(search) ||
        a.patientId.toLowerCase().includes(search),
    );
  }, [appointments, searchInput]);

  const totalPages = Math.max(
    1,
    Math.ceil((appointmentsQuery.total || appointments.length) / limit),
  );

  const handleToggle = (appointmentId: string) => {
    setExpandedId((current) =>
      current === appointmentId ? null : appointmentId,
    );
  };

  const resetToFirstPage = () => setPage(1);

  return (
    <div
      dir={dir}
      lang={locale}
      className="space-y-6 pb-6 sm:space-y-7 sm:pb-8"
    >
      <SurfaceSection title={t("secretary.appointments.appointments")}>
        <div className="flex flex-col gap-4 border-b border-[#EEF2F6] px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
          <div className="text-start">
            <p className="font-cairo text-[13px] font-semibold text-[#98A2B3]">
              {(appointmentsQuery.total || appointments.length).toLocaleString(
                numberLocale,
              )}{" "}
              {t("secretary.appointments.appointments")}
              {searchInput ? t("secretary.appointments.matchingSearch") : ""}
              {appointmentsQuery.isRefetching
                ? t("secretary.appointments.refreshingData")
                : ""}
            </p>
          </div>

          {hasPermission("appointments:book") ? (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/secretary/book-appointment"
                className="flex h-[42px] items-center gap-2 rounded-[10px] bg-primary px-5 font-cairo text-[15px] font-black text-white shadow-[0_10px_20px_rgba(15,143,139,0.30)] transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                {t("secretary.appointments.bookNewAppointment")}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 px-4 py-5 sm:px-5 sm:py-6 lg:flex-row lg:items-center">
          <div className="flex-1">
            <AppointmentsSearchInput
              value={searchInput}
              onChange={setSearchInput}
              t={t}
            />
          </div>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value);
              resetToFirstPage();
            }}
            aria-label={t("secretary.appointments.fromDate")}
            className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 font-cairo text-[14px] font-bold text-[#111827] outline-none focus:border-primary lg:w-[150px]"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(event) => {
              setDateTo(event.target.value);
              resetToFirstPage();
            }}
            aria-label={t("secretary.appointments.toDate")}
            className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-4 font-cairo text-[14px] font-bold text-[#111827] outline-none focus:border-primary lg:w-[150px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#EEF2F6] px-4 py-4 sm:px-6 lg:px-8">
          {filterTabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setFilter(key);
                resetToFirstPage();
              }}
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
          <div className="grid grid-cols-12 gap-4 text-start font-cairo text-[14px] font-bold text-[#A1AAB9]">
            <div className="col-span-4">
              {t("secretary.appointments.patientColumn")}
            </div>
            <div className="col-span-3">{t("secretary.appointments.date")}</div>
            <div className="col-span-2">{t("secretary.appointments.time")}</div>
            <div className="col-span-2">
              {t("secretary.appointments.statusLabel")}
            </div>
            <div className="col-span-1">
              {t("secretary.appointments.actions")}
            </div>
          </div>
        </div>

        {!canViewAppointments ? (
          <div className="flex min-h-[220px] items-center justify-center px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {t("secretary.appointments.noPermission")}
            </p>
          </div>
        ) : appointmentsQuery.isAwaitingData ? (
          <div className="flex min-h-[220px] items-center justify-center px-4 py-10 text-center">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {t("secretary.appointments.loadingAppointments")}
            </p>
          </div>
        ) : appointmentsQuery.isError ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {t("secretary.appointments.loadError")}
            </p>
            <button
              type="button"
              onClick={() => void appointmentsQuery.refetch()}
              disabled={appointmentsQuery.isRefetching}
              className="rounded-[10px] border border-[#D0D5DD] bg-white px-4 py-2 font-cairo text-[14px] font-black text-[#344054] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {appointmentsQuery.isRefetching
                ? t("secretary.appointments.retrying")
                : t("secretary.appointments.retry")}
            </button>
          </div>
        ) : searchedAppointments.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:px-8">
            <p className="font-cairo text-[15px] font-semibold text-[#64748B]">
              {searchInput
                ? t("secretary.appointments.noSearchResults")
                : t("secretary.appointments.noAppointmentsInCategory")}
            </p>
          </div>
        ) : (
          <>
            {searchedAppointments.map((appointment) => {
              const isExpanded = expandedId === appointment.id;
              return (
                <AppointmentTableRow
                  key={appointment.id}
                  appointment={appointment}
                  locale={locale}
                  t={t}
                  expanded={isExpanded}
                  onToggle={handleToggle}
                  onCancel={setCancelTarget}
                  onReschedule={setRescheduleTarget}
                  canCancel={canCancelAppointments}
                  canReschedule={canRescheduleAppointments}
                  detailsLoading={
                    isExpanded &&
                    (detailsQuery.isAwaitingData ||
                      appointmentFilesQuery.isAwaitingData)
                  }
                  detailNotes={
                    isExpanded ? detailsQuery.appointment?.notes : undefined
                  }
                  detailFiles={isExpanded ? expandedDetailFiles : []}
                  fileActionKey={isExpanded ? fileActionKey : null}
                  onOpenFile={(fileId) =>
                    void handleOpenAppointmentFile(fileId)
                  }
                  onDownloadFile={(fileId) =>
                    void handleDownloadAppointmentFile(fileId)
                  }
                />
              );
            })}
          </>
        )}
      </SurfaceSection>

      {canViewAppointments &&
      !appointmentsQuery.isAwaitingData &&
      !appointmentsQuery.isError &&
      appointments.length > 0 ? (
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

      <CancelAppointmentDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
        targetName={cancelTarget?.patientName ?? ""}
        confirmDisabled={cancelMutation.isPending}
        confirmLabel={t("secretary.appointments.confirmCancellation")}
        successToast={{
          title: t("secretary.appointments.appointmentCancelled"),
          message: t("secretary.appointments.cancellationSuccess"),
          variant: "success",
        }}
        onConfirm={async (reason) => {
          if (!cancelTarget) return;
          try {
            await cancelMutation.mutateAsync({
              id: cancelTarget.id,
              body: { reason: reason || undefined },
            });
            setCancelTarget(null);
          } catch (error) {
            toast(getAppointmentWriteErrorMessage(error, "cancel"), {
              title: t("secretary.appointments.error"),
              variant: "error",
              durationMs: 4800,
            });
            throw error;
          }
        }}
      />

      <RescheduleAppointmentDialog
        open={Boolean(rescheduleTarget)}
        onOpenChange={(open) => {
          if (!open) setRescheduleTarget(null);
        }}
        patientName={rescheduleTarget?.patientName ?? ""}
        initialDate={rescheduleTarget?.date}
        initialTime={rescheduleTarget?.time}
        doctorId={assignedDoctor?._id}
        confirmDisabled={rescheduleMutation.isPending}
        onConfirm={async (values) => {
          if (!rescheduleTarget) return;
          try {
            await rescheduleMutation.mutateAsync({
              id: rescheduleTarget.id,
              body: {
                date: values.date,
                startTime: values.startTime,
                appointmentTypeId: values.appointmentTypeId || undefined,
                reason: values.reason || undefined,
              },
            });
            toast(t("secretary.appointments.rescheduleSuccess"), {
              title: t("secretary.appointments.rescheduled"),
              variant: "success",
              durationMs: 4200,
            });
            setRescheduleTarget(null);
          } catch (error) {
            toast(getAppointmentWriteErrorMessage(error, "reschedule"), {
              title: t("secretary.appointments.error"),
              variant: "error",
              durationMs: 4800,
            });
            throw error;
          }
        }}
      />
    </div>
  );
}
