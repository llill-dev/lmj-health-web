import {
  Calendar,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  Clock,
  Filter,
  Loader2,
  Search,
  Settings,
  UserX,
  WifiOff,
  XCircle,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Helmet } from "react-helmet-async";
import StyledSelect from "@/components/ui/styled-select";
import { useToast } from "@/components/ui/ToastProvider";
import DoctorDashboardOverview from "@/components/doctor/dashboard/doctor-dashboard-overview";
import BookAppointmentDialog from "@/components/doctor/appointments/book-appointment-dialog";
import DoctorAppointmentExpandableCard from "@/components/doctor/appointments/doctor-appointment-expandable-card";
import AppointmentsEmptyState from "@/components/doctor/appointments/appointments-empty-state";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { DoctorExpandableCardSkeleton } from "@/components/doctor/shared/skeletons";
import ConfirmActionDialog from "@/components/doctor/confirm-action-dialog";
import CancelAppointmentDialog from "@/components/admin/appointments/dialogs/CancelAppointmentDialog";
import CompleteOrReasonDialog from "@/components/doctor/appointments/cancel-appointment-dialog";
import RescheduleAppointmentDialog from "@/components/doctor/appointments/reschedule-appointment-dialog";
import {
  useBookDoctorAppointmentApi,
  useCancelDoctorAppointmentApi,
  useCompleteDoctorAppointmentApi,
  useDoctorAppointmentDetailsApi,
  useDoctorAppointmentFilesApi,
  useDoctorAppointmentsApi,
  useNoShowDoctorAppointmentApi,
  useRescheduleDoctorAppointmentApi,
  useUnlinkDoctorAppointmentFileApi,
  useUploadDoctorAppointmentFileApi,
  usePatients,
  useDoctorPatients,
} from "@/hooks";
import { readAuthUser } from "@/lib/cookies";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { doctorAppointmentsApi } from "@/lib/doctor/client";
import { useI18n } from "@/i18n/provider";
import {
  getAppointmentBookingErrorMessage,
  getAppointmentFileAccessErrorMessage,
  getAppointmentFileMutationErrorMessage,
  getAppointmentStatusMutationErrorMessage,
  getAppointmentWriteErrorMessage,
} from "@/lib/doctor/writeFlowErrors";
import { triggerBrowserFileDownload } from "@/lib/files/triggerBrowserFileDownload";
import { useNavigate } from "react-router-dom";

/** نص قصير للواجهة + إبقاء الشرح الطويل داخل تفاصيل قابلة للطي. */
function summarizeAppointmentsListError(error: unknown): {
  title: string;
  brief: string;
  detail: string;
  showTechnicalDetail: boolean;
} {
  const detail = error
    ? getUserFacingRequestErrorMessage(error)
    : "حدث خطأ غير متوقع أثناء الاتصال بالخادم.";
  const verbose =
    detail.length > 160 ||
    detail.includes("لم نتمكن من إتمام الطلب") ||
    detail.includes("VPN") ||
    detail.includes("جدار الحماية") ||
    detail.includes("توقيت خاطئ");
  const brief = verbose
    ? "لم نتمكن من جلب المواعيد في هذه المحاولة. تحقّق من اتصالك بالإنترنت ثم أعد المحاولة، أو انتظر قليلاً إن كانت الخدمة مشغولة."
    : detail;
  return {
    title: "تعذّر تحميل المواعيد",
    brief,
    detail,
    showTechnicalDetail: verbose,
  };
}

type MainView = "schedule" | "waiting";
type StatusTab = "scheduled" | "completed" | "cancelled" | "no-show";

type DoctorAppointmentsFiltersState = {
  view: MainView;
  status: StatusTab;
  search: string;
  date: string;
  page: number;
  limit: number;
};

function filterLocalSearch<
  T extends {
    _id: string;
    patient?: {
      userId?: { fullName?: string };
      _id?: string;
      publicId?: string;
    };
    notes?: string;
    date?: string;
    startTime?: string;
  },
>(items: T[], searchTerm: string): T[] {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return items;

  return items.filter((item) => {
    const haystacks = [
      item.patient?.userId?.fullName,
      item.patient?._id,
      item.patient?.publicId,
      item.notes,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());
    return haystacks.some((value) => value.includes(query));
  });
}

function isFutureAppointmentSlot(date?: string, startTime?: string): boolean {
  if (!date || !startTime) return false;
  const slotDateTime = new Date(`${date}T${startTime}:00`);
  if (Number.isNaN(slotDateTime.getTime())) return false;
  return slotDateTime > new Date();
}

export default function DoctorAppointmentsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const { toast } = useToast();
  const navigate = useNavigate();

  const defaultFilters = useMemo<DoctorAppointmentsFiltersState>(() => {
    return {
      view: "schedule",
      status: "scheduled",
      search: "",
      date: "",
      page: 1,
      limit: 20,
    };
  }, []);

  const [filters, setFilters] = useState<DoctorAppointmentsFiltersState>({
    ...defaultFilters,
  });

  const [bookOpen, setBookOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<{
    id: string;
    patientName: string;
  } | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<{
    id: string;
    patientName: string;
  } | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<{
    id: string;
    patientName: string;
    date: string;
    time: string;
  } | null>(null);
  const [noShowOpen, setNoShowOpen] = useState(false);
  const [noShowTarget, setNoShowTarget] = useState<{
    id: string;
    patientName: string;
  } | null>(null);
  const [expandedAppointmentId, setExpandedAppointmentId] = useState<
    string | null
  >(null);
  const [appointmentFileActionKey, setAppointmentFileActionKey] = useState<
    string | null
  >(null);
  const appointmentFileActionKeyRef = useRef<string | null>(null);
  const [unlinkFileConfirmOpen, setUnlinkFileConfirmOpen] = useState(false);
  const [unlinkFileTarget, setUnlinkFileTarget] = useState<{
    fileId: string;
    fileName: string;
  } | null>(null);

  const selectedStatus =
    filters.view === "waiting" ? "scheduled" : filters.status;

  const listQuery = useDoctorAppointmentsApi({
    page: filters.page,
    limit: filters.limit,
    status: selectedStatus,
    date: filters.date || undefined,
  });
  const detailsQuery = useDoctorAppointmentDetailsApi(
    expandedAppointmentId ?? "",
  );
  const appointmentFilesQuery = useDoctorAppointmentFilesApi(
    expandedAppointmentId ?? "",
    Boolean(expandedAppointmentId),
  );

  // KPI counts should come from backend totals per status (not just "today").
  const scheduledTotal = useDoctorAppointmentsApi({
    page: 1,
    limit: 1,
    status: "scheduled",
  });
  const completedTotal = useDoctorAppointmentsApi({
    page: 1,
    limit: 1,
    status: "completed",
  });
  const cancelledTotal = useDoctorAppointmentsApi({
    page: 1,
    limit: 1,
    status: "cancelled",
  });
  const noShowTotal = useDoctorAppointmentsApi({
    page: 1,
    limit: 1,
    status: "no-show",
  });

  const cancelMutation = useCancelDoctorAppointmentApi();
  const completeMutation = useCompleteDoctorAppointmentApi();
  const rescheduleMutation = useRescheduleDoctorAppointmentApi();
  const noShowMutation = useNoShowDoctorAppointmentApi();
  const bookMutation = useBookDoctorAppointmentApi();
  const uploadAppointmentFileMutation = useUploadDoctorAppointmentFileApi(
    expandedAppointmentId ?? "",
  );
  const unlinkAppointmentFileMutation = useUnlinkDoctorAppointmentFileApi(
    expandedAppointmentId ?? "",
  );

  const doctorPatientsQuery = useDoctorPatients({
    page: 1,
    limit: 100, // Get enough patients for the dropdown
  });

  // Choose correct patient source based on mode
  const availablePatients = doctorPatientsQuery.patients.map((p) => ({
    id: p._id,
    name: p.user.fullName,
  }));

  const mergedAppointments = useMemo(() => {
    return listQuery.appointments.map((appointment) => {
      if (
        expandedAppointmentId &&
        expandedAppointmentId === appointment._id &&
        detailsQuery.appointment
      ) {
        const filesSource =
          appointmentFilesQuery.files.length > 0
            ? appointmentFilesQuery.files
            : detailsQuery.files;
        return {
          ...detailsQuery.appointment,
          appointmentFiles: filesSource.map((file) => ({
            id: file._id,
            name: file.originalName ?? "ملف",
            date: (file.linkedAt ?? "").slice(0, 10),
            url: undefined,
          })),
        };
      }
      return appointment;
    });
  }, [
    appointmentFilesQuery.files,
    detailsQuery.appointment,
    detailsQuery.files,
    expandedAppointmentId,
    listQuery.appointments,
  ]);

  const visibleAppointments = useMemo(
    () => filterLocalSearch(mergedAppointments, filters.search),
    [mergedAppointments, filters.search],
  );

  const totalPages = useMemo(() => {
    const safeLimit = Math.max(1, filters.limit);
    const pages = Math.ceil((listQuery.total || 0) / safeLimit);
    return pages || 1;
  }, [filters.limit, listQuery.total]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.view !== defaultFilters.view ||
      filters.status !== defaultFilters.status ||
      Boolean(filters.search.trim()) ||
      Boolean(filters.date.trim()) ||
      filters.page !== defaultFilters.page ||
      filters.limit !== defaultFilters.limit
    );
  }, [defaultFilters, filters]);

  const appointmentsListFailed = listQuery.isError;
  const appointmentsListPending =
    listQuery.isAwaitingData && !appointmentsListFailed;
  const appointmentsListReady =
    !appointmentsListFailed && !appointmentsListPending;
  const { retry: retryAppointmentsList, retrying: retryingAppointmentsList } =
    useRetryAction(() => listQuery.refetch());

  const appointmentsLoadErrorPresentation = useMemo(
    () => summarizeAppointmentsListError(listQuery.error),
    [listQuery.error],
  );

  const beginAppointmentFileAction = useCallback((actionKey: string) => {
    if (appointmentFileActionKeyRef.current) return false;
    appointmentFileActionKeyRef.current = actionKey;
    setAppointmentFileActionKey(actionKey);
    return true;
  }, []);

  const finishAppointmentFileAction = useCallback(() => {
    appointmentFileActionKeyRef.current = null;
    setAppointmentFileActionKey(null);
  }, []);

  const handleAppointmentFileOpen = useCallback(
    async (appointmentId: string, fileId: string) => {
      if (!beginAppointmentFileAction(fileId)) return;
      try {
        const response = await doctorAppointmentsApi.getFileDownloadUrl(
          appointmentId,
          fileId,
        );
        const fileUrl = response.url ?? response.downloadUrl;
        if (!fileUrl) throw new Error("missing download url");
        window.open(fileUrl, "_blank", "noopener,noreferrer");
      } catch (error) {
        toast(getAppointmentFileAccessErrorMessage(error, "open"), {
          title: "تعذر فتح الملف",
          variant: "error",
        });
      } finally {
        finishAppointmentFileAction();
      }
    },
    [beginAppointmentFileAction, finishAppointmentFileAction, toast],
  );

  const handleAppointmentFileDownload = useCallback(
    async (appointmentId: string, fileId: string) => {
      if (!beginAppointmentFileAction(fileId)) return;
      try {
        const [downloadResponse, fileResponse] = await Promise.all([
          doctorAppointmentsApi.getFileDownloadUrl(appointmentId, fileId),
          doctorAppointmentsApi.getFile(appointmentId, fileId),
        ]);
        const fileUrl = downloadResponse.url ?? downloadResponse.downloadUrl;
        if (!fileUrl) throw new Error("missing download url");
        await triggerBrowserFileDownload(
          fileUrl,
          fileResponse.file?.originalName ?? "appointment-file",
        );
      } catch (error) {
        toast(getAppointmentFileAccessErrorMessage(error, "download"), {
          title: "تعذر تحميل الملف",
          variant: "error",
        });
      } finally {
        finishAppointmentFileAction();
      }
    },
    [beginAppointmentFileAction, finishAppointmentFileAction, toast],
  );

  const handleRequestUnlinkAppointmentFile = useCallback(
    (fileId: string, fileName?: string) => {
      setUnlinkFileTarget({
        fileId,
        fileName: fileName?.trim() || "ملف مرفق",
      });
      setUnlinkFileConfirmOpen(true);
    },
    [],
  );

  /** تنفيذ فك الربط بعد التأكيد — يعرض نظام التوست داخلياً */
  const handleAppointmentFileUnlinkConfirmed = useCallback(
    async (fileId: string) => {
      if (!beginAppointmentFileAction(fileId)) return;
      try {
        const response =
          await unlinkAppointmentFileMutation.mutateAsync(fileId);
        toast(response.message ?? "تم فك ربط الملف من الموعد بنجاح.", {
          title: "تم فك الربط",
          variant: "success",
          durationMs: 4200,
        });
      } catch (error) {
        toast(getAppointmentFileMutationErrorMessage(error, "unlink"), {
          title: "تعذّر فك ربط الملف",
          variant: "error",
          durationMs: 4800,
        });
        throw error;
      } finally {
        finishAppointmentFileAction();
      }
    },
    [beginAppointmentFileAction, finishAppointmentFileAction, unlinkAppointmentFileMutation, toast],
  );

  const resetUnlinkDialog = useCallback((open: boolean) => {
    setUnlinkFileConfirmOpen(open);
    if (!open) setUnlinkFileTarget(null);
  }, []);

  const handleAppointmentFileUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !expandedAppointmentId) return;
      if (!beginAppointmentFileAction("upload")) {
        event.target.value = "";
        return;
      }
      try {
        const response = await uploadAppointmentFileMutation.mutateAsync({
          file,
        });
        toast(response.message ?? "تم رفع الملف وربطه بالموعد بنجاح.", {
          title: "تم الرفع",
          variant: "success",
          durationMs: 4200,
        });
      } catch (error) {
        toast(getAppointmentFileMutationErrorMessage(error, "upload"), {
          title: "تعذر رفع الملف",
          variant: "error",
        });
      } finally {
        event.target.value = "";
        finishAppointmentFileAction();
      }
    },
    [beginAppointmentFileAction, expandedAppointmentId, finishAppointmentFileAction, uploadAppointmentFileMutation, toast],
  );

  const handleBookingAction = useCallback(() => {
    // Check if we have patients available
    if (doctorPatientsQuery.isAwaitingData) {
      toast("جارٍ تحميل قائمة المرضى...", {
        title: "انتظر قليلاً",
        variant: "info",
        durationMs: 2000,
      });
      return;
    }

    if (doctorPatientsQuery.patients.length === 0) {
      toast(
        "لا توجد مرضى مرتبطين بحسابك حالياً. يرجى إضافة مرضى أولاً من صفحة المرضى.",
        {
          title: "لا توجد مرضى",
          variant: "warning",
          durationMs: 5000,
        },
      );
      return;
    }

    setBookOpen(true);
  }, [
    doctorPatientsQuery.isAwaitingData,
    doctorPatientsQuery.patients.length,
    toast,
  ]);

  return (
    <>
      <input
        id="doctor-appointment-file-upload"
        type="file"
        accept=".jpg,.jpeg,.png,.pdf,application/pdf,image/jpeg,image/png"
        className="hidden"
        onChange={handleAppointmentFileUpload}
      />
      <Helmet>
        <title>{tr("المواعيد • LMJ Health", "Appointments • LMJ Health")}</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <DoctorDashboardOverview
          variant="appointments"
          surface="mint"
          title={tr("إجمالي المواعيد", "Total appointments")}
          subtitle={
            <span>
              <span className="font-extrabold text-primary">
                {appointmentsListFailed ? "—" : listQuery.total}
              </span>
              <span className="text-primary/90">
                {" "}
                {tr("— إجمالي المواعيد حسب الحالة", "— total appointments by status")}
              </span>
            </span>
          }
          onActionClick={handleBookingAction}
          actionLabel={tr("حجز موعد لمريض", "Book appointment for patient")}
          kpis={[
            {
              key: "scheduled",
              icon: <Clock className="w-5 h-5 shrink-0" />,
              value: scheduledTotal.isAwaitingData ? "—" : scheduledTotal.total,
              label: tr("مجدولة", "Scheduled"),
            },
            {
              key: "completed",
              icon: <CheckCircle className="w-5 h-5 shrink-0" />,
              value: completedTotal.isAwaitingData ? "—" : completedTotal.total,
              label: tr("مكتملة", "Completed"),
            },
            {
              key: "cancelled",
              icon: <XCircle className="w-5 h-5 shrink-0" />,
              value: cancelledTotal.isAwaitingData ? "—" : cancelledTotal.total,
              label: tr("ملغية", "Cancelled"),
            },
            {
              key: "no-show",
              icon: <UserX className="w-5 h-5 shrink-0" />,
              value: noShowTotal.isAwaitingData ? "—" : noShowTotal.total,
              label: tr("عدم حضور", "No-show"),
            },
          ]}
        />

        <BookAppointmentDialog
          open={bookOpen}
          onOpenChange={setBookOpen}
          patients={availablePatients}
          doctorId={readAuthUser()?.actorIds?.doctorId}
          onSubmit={async (values) => {
            const doctorId = readAuthUser()?.actorIds?.doctorId;
            if (!doctorId) {
              toast(
                tr(
                  "تعذّر تحديد هوية الطبيب الحالية لهذا الحجز.",
                  "Could not resolve the current doctor identity for this booking.",
                ),
                {
                title: tr("خطأ", "Error"),
                variant: "error",
              },
              );
              throw new Error(
                tr(
                  "تعذر تحديد هوية الطبيب الحالي لهذا الحجز.",
                  "Could not resolve the current doctor identity for this booking.",
                ),
              );
            }
            try {
              await bookMutation.mutateAsync({
                doctorId,
                patientId: values.patientId,
                date: values.date,
                startTime: values.time,
                appointmentTypeId: values.appointmentTypeId,
                notes: values.notes,
              });
              toast(tr("تم حجز الموعد بنجاح.", "Appointment booked successfully."), {
                title: tr("تم الحجز", "Booked"),
                variant: "success",
                durationMs: 4200,
              });
            } catch (error) {
              toast(getAppointmentBookingErrorMessage(error), {
                title: "فشل حجز الموعد",
                variant: "error",
                durationMs: 5200,
              });
              throw error;
            }
          }}
        />

        <ConfirmActionDialog
          open={unlinkFileConfirmOpen}
          onOpenChange={resetUnlinkDialog}
          title="فك ربط الملف من الموعد"
          confirmLabel="نعم، فك الربط"
          confirmDisabled={
            unlinkAppointmentFileMutation.isPending ||
            Boolean(
              unlinkFileTarget &&
              appointmentFileActionKey === unlinkFileTarget.fileId,
            )
          }
          description={
            <span className="block font-cairo text-[13px] font-semibold leading-[1.65]">
              هل أنت متأكد من فك ربط الملف
              {unlinkFileTarget?.fileName ? (
                <>
                  {" "}
                  <span className="font-black text-[#101828]">
                    «{unlinkFileTarget.fileName}»
                  </span>
                </>
              ) : null}{" "}
              عن هذا الموعد؟ لا يُحذف الملف من النظام بالكامل، لكن لن يعد ظاهراً
              ضمن هذا الموعد.
            </span>
          }
          onConfirm={async () => {
            if (!unlinkFileTarget) return;
            await handleAppointmentFileUnlinkConfirmed(unlinkFileTarget.fileId);
          }}
        />

        <CancelAppointmentDialog
          open={cancelOpen}
          onOpenChange={(open) => {
            setCancelOpen(open);
            if (!open) setCancelTarget(null);
          }}
          targetName={cancelTarget?.patientName ?? ""}
          confirmDisabled={cancelMutation.isPending}
          confirmLabel="تأكيد إلغاء الموعد"
          successToast={{
            title: "تم إلغاء الموعد",
            message: "تم إلغاء الموعد وحفظ السبب بنجاح.",
            variant: "success",
          }}
          onConfirm={async (reason) => {
            if (!cancelTarget) return;
            try {
                await cancelMutation.mutateAsync({
                  id: cancelTarget.id,
                  body: { reason: reason || undefined },
                });
            } catch (error) {
              toast(getAppointmentWriteErrorMessage(error, "cancel"), {
                title: "خطأ",
                variant: "error",
                durationMs: 4800,
              });
              throw error;
            }
          }}
        />

        <CompleteOrReasonDialog
          open={completeOpen}
          onOpenChange={(open) => {
            setCompleteOpen(open);
            if (!open) setCompleteTarget(null);
          }}
          patientName={completeTarget?.patientName ?? ""}
          confirmDisabled={completeMutation.isPending}
          maxLength={2000}
          title="إنهاء الموعد"
          fieldLabel="ملاحظات الإنهاء"
          placeholder="اكتب ملاحظات الطبيب التي يجب إرسالها مع إنهاء الموعد..."
          confirmLabel="إنهاء الموعد"
          onConfirm={async (medicalNotes) => {
            if (!completeTarget) return;
            try {
                await completeMutation.mutateAsync({
                  id: completeTarget.id,
                  body: { notes: medicalNotes || undefined },
                });
              toast("تم إنهاء الموعد وتسجيل الملاحظات بنجاح.", {
                title: "تم الإنهاء",
                variant: "success",
                durationMs: 4200,
              });
            } catch (error) {
              toast(getAppointmentStatusMutationErrorMessage(error, "complete"), {
                title: "خطأ",
                variant: "error",
                durationMs: 4800,
              });
              throw error;
            }
          }}
        />

        <CompleteOrReasonDialog
          open={noShowOpen}
          onOpenChange={(open) => {
            setNoShowOpen(open);
            if (!open) setNoShowTarget(null);
          }}
          patientName={noShowTarget?.patientName ?? ""}
          confirmDisabled={noShowMutation.isPending}
          maxLength={1000}
          title="تسجيل عدم حضور"
          fieldLabel="سبب عدم الحضور"
          placeholder="اكتب سبب تسجيل الموعد كعدم حضور..."
          confirmLabel="تسجيل عدم الحضور"
          onConfirm={async (reason) => {
            if (!noShowTarget) return;
            try {
                await noShowMutation.mutateAsync({
                  id: noShowTarget.id,
                  body: { reason: reason || undefined },
                });
              toast("تم تسجيل عدم حضور المريض لهذا الموعد.", {
                title: "تم التسجيل",
                variant: "success",
                durationMs: 4200,
              });
            } catch (error) {
              toast(getAppointmentStatusMutationErrorMessage(error, "no-show"), {
                title: "خطأ",
                variant: "error",
                durationMs: 4800,
              });
              throw error;
            }
          }}
        />

        <RescheduleAppointmentDialog
          open={rescheduleOpen}
          onOpenChange={(open) => {
            setRescheduleOpen(open);
            if (!open) setRescheduleTarget(null);
          }}
          patientName={rescheduleTarget?.patientName ?? ""}
          initialDate={rescheduleTarget?.date}
          initialTime={rescheduleTarget?.time}
          initialAppointmentTypeId={
            expandedAppointmentId === rescheduleTarget?.id &&
            detailsQuery.appointment?.appointmentType
              ? detailsQuery.appointment.appointmentType
              : undefined
          }
          doctorId={readAuthUser()?.actorIds?.doctorId}
          confirmDisabled={rescheduleMutation.isPending}
          onConfirm={async (values) => {
            if (!rescheduleTarget) return false;
            try {
              await rescheduleMutation.mutateAsync({
                id: rescheduleTarget.id,
                body: values,
              });
              toast("تم تحديث تاريخ ووقت الموعد بنجاح.", {
                title: "تم إعادة الجدولة",
                variant: "success",
                durationMs: 4200,
              });
            } catch (error) {
              toast(getAppointmentWriteErrorMessage(error, "reschedule"), {
                title: "خطأ",
                variant: "error",
                durationMs: 4800,
              });
              return true;
              return false;
            }
          }}
        />

        {/* شريط تصفية احترافي — مطابق لصفحة المرضى، البحث ~50% على الشاشات الواسعة */}
        <section
          className="my-6 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_20px_50px_rgba(15,143,139,0.08),0_2px_8px_rgba(0,0,0,0.04)]"
          aria-label="تصفية قائمة المواعيد"
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
                <div className="min-w-0 text-right">
                  <h2 className="font-cairo text-[16px] font-black leading-tight text-[#111827] sm:text-[17px]">
                    تصفية المواعيد
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-end items-center">
                <button
                  type="button"
                  disabled={!hasActiveFilters}
                  onClick={() => setFilters({ ...defaultFilters })}
                  className={
                    !hasActiveFilters
                      ? "inline-flex h-[40px] min-w-[132px] cursor-not-allowed items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F2F4F7] px-4 font-cairo text-[12px] font-extrabold text-[#98A2B3]"
                      : "inline-flex h-[40px] min-w-[132px] items-center justify-center rounded-xl border border-primary/30 bg-white px-4 font-cairo text-[12px] font-extrabold text-primary shadow-[0_1px_2px_rgba(15,143,139,0.12)] transition-all hover:bg-primary/[0.06] hover:shadow-[0_4px_14px_rgba(15,143,139,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  }
                >
                  مسح الفلاتر
                </button>

                <output
                  className="inline-flex h-[40px] min-w-[100px] items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-black text-[#344054] shadow-sm tabular-nums"
                  aria-live="polite"
                >
                  <span className="text-primary">
                    {appointmentsListFailed ? "—" : listQuery.total || 0}
                  </span>
                  <span className="font-extrabold text-[#667085]">نتيجة</span>
                </output>
              </div>
            </div>
          </div>
          {/* filter container */}
          <div className="px-5 py-5 space-y-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:gap-6">
              {/* بحث محلي رئيسي: نصف عرض الحاوية على xl */}
              <div className="w-full flex-[0_0_auto] xl:w-1/2 xl:max-w-[50%]">
                <label
                  htmlFor="doctor-appointments-search"
                  className="flex gap-2 justify-between items-center mb-2"
                >
                  <span className="inline-flex items-center gap-1.5 font-cairo text-[12px] font-extrabold text-[#111827]">
                    <CalendarDays
                      className="h-3.5 w-3.5 text-primary"
                      aria-hidden
                    />
                    بحث في القائمة الحالية
                  </span>
                  <span className="hidden font-cairo text-[10px] font-bold uppercase tracking-wider text-[#98A2B3] sm:inline">
                    المريض · المعرّف · الملاحظات
                  </span>
                </label>
                <div className="relative group">
                  <input
                    id="doctor-appointments-search"
                    type="search"
                    enterKeyHint="search"
                    autoComplete="off"
                    placeholder="ابدأ بالكتابة داخل نتائج هذه الصفحة فقط..."
                    className="h-[48px] w-full rounded-xl border-2 border-[#E8ECF3] bg-gradient-to-b from-[#FBFCFD] to-white pe-12 ps-4 font-cairo text-[13px] font-bold text-[#111827] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-[border-color,box-shadow,background] placeholder:text-[#98A2B3] hover:border-[#D0D8E6] focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(15,143,139,0.12),inset_0_1px_2px_rgba(0,0,0,0.02)]"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                  />
                  <div className="pointer-events-none absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-focus-within:bg-primary/[0.14]">
                    <Search className="h-[18px] w-[18px]" strokeWidth={2.25} />
                  </div>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-3 min-w-0 sm:grid-cols-2">
                <div className="relative min-w-0">
                  <label
                    htmlFor="doctor-appointments-view"
                    className="mb-2 block font-cairo text-[11px] font-extrabold text-[#667085]"
                  >
                    نوع العرض
                  </label>
                  <StyledSelect
                    id="doctor-appointments-view"
                    size="sm"
                    tone="muted"
                    value={filters.view}
                    onChange={(v) =>
                      setFilters((prev) => ({
                        ...prev,
                        view: (v as MainView) || "schedule",
                        page: 1,
                      }))
                    }
                    options={[
                      { value: "schedule", label: "جدول المواعيد" },
                      { value: "waiting", label: "قائمة الانتظار" },
                    ]}
                    listboxAriaLabel="نوع العرض"
                  />
                </div>

                {filters.view === "schedule" ? (
                  <div className="relative min-w-0">
                    <label
                      htmlFor="doctor-appointments-status"
                      className="mb-2 block font-cairo text-[11px] font-extrabold text-[#667085]"
                    >
                      حالة الموعد
                    </label>
                    <StyledSelect
                      id="doctor-appointments-status"
                      size="sm"
                      tone="muted"
                      value={filters.status}
                      onChange={(v) =>
                        setFilters((prev) => ({
                          ...prev,
                          status: (v as StatusTab) || "scheduled",
                          page: 1,
                        }))
                      }
                      options={[
                        { value: "scheduled", label: "المجدولة" },
                        { value: "completed", label: "المكتملة" },
                        { value: "cancelled", label: "الملغية" },
                        { value: "no-show", label: "عدم الحضور" },
                      ]}
                      listboxAriaLabel="حالة الموعد"
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[42px] min-w-0 flex-col justify-end rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
                    <p className="font-cairo text-[11px] font-semibold leading-relaxed text-[#667085]">
                      قائمة الانتظار تعرض المواعيد{" "}
                      <span className="font-extrabold text-[#344054]">
                        المجدولة
                      </span>{" "}
                      وفق التاريخ المُرسل للخادم.
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* date filter */}
            <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFBFC]/90 px-4 py-4 sm:px-5">
              <div className="flex flex-wrap gap-2 items-center mb-3 text-right">
                <Calendar
                  className="w-4 h-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span className="font-cairo text-[12px] font-extrabold text-[#344054]">
                  تاريخ المواعيد
                </span>
              </div>
              <div className="max-w-xs">
                <span className="mb-1.5 block font-cairo text-[10px] font-extrabold uppercase tracking-wide text-[#667085]">
                  اليوم
                </span>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      date: e.target.value,
                      page: 1,
                    }))
                  }
                  className="h-[40px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827] shadow-sm outline-none transition-all focus:border-primary/45 focus:ring-2 focus:ring-primary/12"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_20px_50px_rgba(15,143,139,0.06),0_2px_8px_rgba(0,0,0,0.03)]">
            {filters.view === "waiting" && (
              <div className="border-b border-[#F2F4F7] px-4 py-3 sm:px-6">
                <p className="font-cairo text-[13px] font-semibold text-[#667085]">
                  قائمة الانتظار تعرض المواعيد المجدولة ضمن نفس فلاتر الباكند
                  الحالية.
                </p>
              </div>
            )}

            <div className="px-4 py-4 sm:px-6">
              {appointmentsListFailed ? (
                <DoctorListErrorState
                  title={appointmentsLoadErrorPresentation.title}
                  brief={appointmentsLoadErrorPresentation.brief}
                  detail={appointmentsLoadErrorPresentation.detail}
                  showTechnicalDetail={
                    appointmentsLoadErrorPresentation.showTechnicalDetail
                  }
                  retrying={retryingAppointmentsList}
                  onRetry={() => void retryAppointmentsList()}
                />
              ) : false ? (
                <div
                  dir={dir}
                  lang={locale}
                  role="alert"
                  className="flex min-h-[360px] items-center justify-center px-3 py-10 sm:px-4"
                >
                  <div className="relative mx-auto w-full max-w-[440px] overflow-hidden rounded-[22px] border border-[#E8ECF3] bg-gradient-to-br from-[#FAFFFE] via-white to-[#F8FAFC] px-6 pb-10 pt-9 text-center shadow-[0_24px_64px_-20px_rgba(15,23,42,0.14)]">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-[#0F766E]/90 via-primary to-[#5EEAD4]"
                    />
                    <div className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-[#E6F7F6] bg-white shadow-[0_14px_32px_rgba(15,143,139,0.14)]">
                      <WifiOff
                        className="h-[26px] w-[26px] text-primary"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </div>
                    <h2 className="mt-5 font-cairo text-[clamp(1.05rem,2.8vw,1.2rem)] font-black tracking-tight text-[#101828]">
                      {appointmentsLoadErrorPresentation.title}
                    </h2>
                    <p className="mx-auto mt-2 max-w-[34ch] font-cairo text-[13px] font-semibold leading-[1.7] text-[#475467]">
                      {appointmentsLoadErrorPresentation.brief}
                    </p>
                    {appointmentsLoadErrorPresentation.showTechnicalDetail ? (
                      <details className="group mt-5 rounded-2xl border border-[#EAECF0] bg-white/75 px-4 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-[2px]">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-cairo text-[12px] font-extrabold text-[#344054] transition-colors hover:text-[#101828] [&::-webkit-details-marker]:hidden">
                          <span>تفاصيل إضافية</span>
                          <ChevronDown
                            className="h-4 w-4 shrink-0 text-[#98A2B3] transition-transform duration-200 group-open:rotate-180"
                            aria-hidden
                          />
                        </summary>
                        <p className="mt-3 border-t border-[#F2F4F7] pt-3 text-right font-cairo text-[12px] font-medium leading-[1.75] text-[#667085]">
                          {appointmentsLoadErrorPresentation.detail}
                        </p>
                      </details>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void retryAppointmentsList()}
                      disabled={retryingAppointmentsList}
                      className="mt-7 inline-flex h-[44px] min-w-[180px] items-center justify-center gap-2 rounded-[14px] bg-primary px-6 font-cairo text-[13px] font-extrabold text-white shadow-[0_12px_28px_rgba(15,143,139,0.22)] transition-[transform,box-shadow,background-color] duration-200 hover:bg-[#0d7d76] hover:shadow-[0_14px_32px_rgba(15,143,139,0.26)] active:translate-y-[0.5px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 disabled:pointer-events-none disabled:opacity-60"
                    >
                      {retryingAppointmentsList ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : null}
                      إعادة المحاولة
                    </button>
                  </div>
                </div>
              ) : appointmentsListPending ? (
                <DoctorExpandableCardSkeleton count={5} />
              ) : listQuery.total === 0 ? (
                <AppointmentsEmptyState onBookClick={handleBookingAction} />
              ) : visibleAppointments.length === 0 ? (
                <div className="py-12 text-center">
                  <Calendar className="mx-auto w-12 h-12 text-gray-300" />
                  <p className="mt-3 font-cairo text-[14px] font-semibold text-[#667085]">
                    لا توجد نتائج مطابقة للبحث المحلي ضمن هذه الصفحة.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleAppointments.map((appointment) => (
                    <DoctorAppointmentExpandableCard
                      key={appointment._id}
                      appointment={appointment}
                      expanded={expandedAppointmentId === appointment._id}
                      detailsLoading={
                        expandedAppointmentId === appointment._id &&
                        (detailsQuery.isAwaitingData ||
                          appointmentFilesQuery.isAwaitingData)
                      }
                      onToggle={() => {
                        setExpandedAppointmentId((current) =>
                          current === appointment._id ? null : appointment._id,
                        );
                      }}
                      cancelling={cancelMutation.isPending}
                      completing={completeMutation.isPending}
                      rescheduling={rescheduleMutation.isPending}
                      noShowing={noShowMutation.isPending}
                      onCancel={() => {
                        setCancelTarget({
                          id: appointment._id,
                          patientName:
                            appointment.patient?.userId?.fullName || "",
                        });
                        setCancelOpen(true);
                      }}
                      onComplete={() => {
                        setCompleteTarget({
                          id: appointment._id,
                          patientName:
                            appointment.patient?.userId?.fullName || "",
                        });
                        setCompleteOpen(true);
                      }}
                      onEdit={() => {
                        setRescheduleTarget({
                          id: appointment._id,
                          patientName:
                            appointment.patient?.userId?.fullName || "",
                          date: appointment.date || "",
                          time: appointment.startTime || "",
                        });
                        setRescheduleOpen(true);
                      }}
                      onNoShow={() => {
                        if (
                          isFutureAppointmentSlot(
                            appointment.date,
                            appointment.startTime,
                          )
                        ) {
                          toast("لا يمكن تسجيل عدم حضور لموعد مستقبلي.", {
                            title: "إجراء غير متاح",
                            variant: "warning",
                            durationMs: 4200,
                          });
                          return;
                        }
                        setNoShowTarget({
                          id: appointment._id,
                          patientName:
                            appointment.patient?.userId?.fullName || "",
                        });
                        setNoShowOpen(true);
                      }}
                      onUploadFile={() =>
                        document
                          .getElementById("doctor-appointment-file-upload")
                          ?.click()
                      }
                      onOpenFile={(fileId) =>
                        handleAppointmentFileOpen(appointment._id, fileId)
                      }
                      onDownloadFile={(fileId) =>
                        handleAppointmentFileDownload(appointment._id, fileId)
                      }
                      onUnlinkFile={handleRequestUnlinkAppointmentFile}
                      fileActionKey={appointmentFileActionKey}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Pagination — متناغم مع بطاقة الفلاتر */}
        <section className="mt-5 flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_20px_50px_rgba(15,143,139,0.06),0_2px_8px_rgba(0,0,0,0.03)] sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-right font-cairo text-[12px] font-bold text-[#667085]">
            الصفحة {filters.page} من {totalPages}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="w-[118px] shrink-0">
              <StyledSelect
                size="xs"
                tone="emphasis"
                disabled={!appointmentsListReady}
                value={String(filters.limit)}
                onChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    limit: Number(v),
                    page: 1,
                  }))
                }
                options={[20, 50, 100].map((v) => ({
                  value: String(v),
                  label: String(v),
                }))}
                listboxAriaLabel="عدد العناصر في الصفحة"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              disabled={filters.page <= 1 || !appointmentsListReady}
              className="inline-flex h-[36px] items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              السابق
            </button>

            <button
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min(totalPages, prev.page + 1),
                }))
              }
              disabled={filters.page >= totalPages || !appointmentsListReady}
              className="inline-flex h-[36px] items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              التالي
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
