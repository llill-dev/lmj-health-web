import { Helmet } from "react-helmet-async";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  Eye,
  FileText,
  FlaskConical,
  Link2,
  Loader2,
  Pill,
  Plus,
  Printer,
  ScanLine,
  ShieldAlert,
  Stethoscope,
  Syringe,
  Upload,
  UserCheck,
  Users,
  type LucideIcon,
  Calendar,
} from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { DoctorPatientExpandableCardData } from "@/components/doctor/patients/doctor-patient-expandable-card";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { useToast } from "@/components/ui/ToastProvider";
import {
  useDeleteDoctorPatientFile,
  useDoctorPatientEncounters,
  useDoctorPatientFiles,
  useDoctorPatientFullProfile,
  useDoctorPatientPublicProfile,
  useRequestDoctorPatientAccess,
  useUploadDoctorPatientFile,
} from "@/hooks";
import { ApiError, getUserFacingRequestErrorMessage } from "@/lib/api";
import { isAwaitingInitialQueryData } from "@/lib/query/queryUi";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { readAuthUser } from "@/lib/cookies";
import { doctorApi } from "@/lib/doctor/client";
import {
  determinePatientState,
  getPatientStateInfo,
  getStateMessage,
} from "@/lib/doctor/patients/patient-states";
import {
  getDoctorAccessRequestErrorMessage,
  getPatientFileAccessErrorMessage,
  getPatientFileMutationErrorMessage,
} from "@/lib/doctor/writeFlowErrors";
import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";
import type { FullProfileData, PatientDetailsTab } from "@/components/doctor/patients/patient-details";
import {
  TABS,
  TAB_PANEL_TRANSITION,
  PatientDetailsTabSkeleton,
  PatientHeaderSkeleton,
  EmptyPanel,
  PatientProfileHeader,
  OverviewTab,
  TimelineTab,
  HistoryTab,
  MedicationsTab,
  PrescriptionsTab,
  OrdersTab,
  PatientFilesTab,
  EncountersTab,
  DocumentsTab,
  AppointmentsTab,
} from "@/components/doctor/patients/patient-details";
import { PatientAddMedicationDialog } from "@/components/doctor/patients/patient-details/patient-add-medication-dialog";
import { useAddDoctorPatientMedication } from "@/hooks/doctor/patients/useDoctorClinicalShortcuts";
import { triggerBrowserFileDownload } from "@/lib/files/triggerBrowserFileDownload";
import { countPatientAppointments } from "@/lib/doctor/dashboard/countPatientAppointments";
import { resolvePatientOrderCategory } from "@/lib/doctor/encounters/encounterOrderCategories";
import { cn } from "@/lib/utils/utils";
import { useI18n } from "@/i18n/provider";

function formatIsoDate(
  value: string | null | undefined,
  locale: "ar" | "en" = "ar",
  tr: (ar: string, en: string) => string = (ar, en) => (locale === "ar" ? ar : en),
): string {
  if (!value) return tr("لا توجد زيارات", "No visits");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value ?? "";
  return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US");
}

function toCardData(
  patient: {
    _id: string;
    publicId?: string;
    user: {
      fullName: string;
      phone?: string;
      accountStatus?: "active" | "temporary" | "suspended";
    };
    allergies: string[];
    medicalConditions: string[];
    bloodType: string | null;
    lastVisitAt: string | null;
    isTemporary?: boolean;
  },
  locale: "ar" | "en",
  tr: (ar: string, en: string) => string,
): Omit<DoctorPatientExpandableCardData, "relationshipState"> {
  const accountStatusLabel =
    patient.user.accountStatus === "temporary"
      ? tr("مؤقت", "Temporary")
      : patient.user.accountStatus === "suspended"
        ? tr("معلّق", "Suspended")
        : tr("نشط", "Active");

  return {
    id: patient._id,
    fileNo: patient.publicId ?? patient._id,
    name: patient.user.fullName,
    accountStatusLabel,
    accountStatusKey: patient.user.accountStatus ?? "active",
    isTemporary:
      patient.isTemporary ?? patient.user.accountStatus === "temporary",
    phone: patient.user.phone ?? "—",
    lastVisit: formatIsoDate(patient.lastVisitAt, locale, tr),
    allergies: patient.allergies ?? [],
    medicalConditions: patient.medicalConditions ?? [],
    bloodType: patient.bloodType ?? tr("غير محدد", "Not specified"),
    heightLabel: "—",
    weightLabel: "—",
    measurementUnitLabel: "—",
  };
}

function getPatientAccessErrorMessage(
  error: unknown,
  tr: (ar: string, en: string) => string,
): string {
  if (!(error instanceof ApiError)) {
    return getUserFacingRequestErrorMessage(error);
  }
  if (error.messageKey === "errors.doctor.notApproved") {
    return tr(
      "حساب الطبيب الحالي غير معتمد بعد، لذلك لا يمكن تحميل بيانات هذا المريض.",
      "The current doctor account is not approved yet, so this patient's data cannot be loaded.",
    );
  }
  if (error.status === 401) {
    return tr(
      "انتهت صلاحية جلسة الدخول أو لم يتم التحقق من الهوية. سجّل الدخول من جديد.",
      "Your session has expired or your identity could not be verified. Please sign in again.",
    );
  }
  if (error.status === 403) {
    return (
      error.message ||
      tr(
        "لا تملك صلاحية عرض هذا المريض بهذا الحساب.",
        "You do not have permission to view this patient with this account.",
      )
    );
  }
  return error.message || getUserFacingRequestErrorMessage(error);
}

export default function DoctorPatientDetailsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const authUser = readAuthUser();
  const doctorId = authUser?.actorIds?.doctorId ?? "";
  const initialPatient = (
    location.state as { patient?: DoctorPatientExpandableCardData } | null
  )?.patient;

  const [activeTab, setActiveTab] = useState<PatientDetailsTab>("basic");
  const [pendingAccess, setPendingAccess] = useState<{
    pendingRequestId?: string | null;
    message?: string;
  } | null>(null);
  const [fileActionKey, setFileActionKey] = useState<string | null>(null);
  const [orderTypeFilter, setOrderTypeFilter] = useState<
    "all" | "lab" | "radiology" | "procedure" | "referral"
  >("all");
  const [timelineFilter, setTimelineFilter] = useState<
    "all" | "encounter" | "file" | "order" | "prescription" | "history"
  >("all");
  const [medicationDialogOpen, setMedicationDialogOpen] = useState(false);

  const addMedicationMutation = useAddDoctorPatientMedication(
    doctorId,
    patientId ?? "",
  );

  const publicProfileQuery = useDoctorPatientPublicProfile(
    patientId ?? "",
    Boolean(patientId),
  );
  const fullProfileQuery = useDoctorPatientFullProfile(
    doctorId,
    patientId ?? "",
    Boolean(patientId && doctorId),
  );
  const fallbackPatient = useMemo(() => {
    if (!patientId || !publicProfileQuery.patient) return null;
    return toCardData(
      {
        _id: publicProfileQuery.patient._id ?? patientId,
        publicId: patientId,
        user: {
          fullName: publicProfileQuery.patient.user?.fullName ?? tr("مريض", "Patient"),
          phone: publicProfileQuery.patient.user?.phone,
          accountStatus: "active",
        },
        allergies: publicProfileQuery.patient.allergies ?? [],
        medicalConditions: publicProfileQuery.patient.medicalConditions ?? [],
        bloodType: publicProfileQuery.patient.bloodType ?? null,
        lastVisitAt: null,
        isTemporary: false,
      },
      locale,
      tr,
    );
  }, [patientId, publicProfileQuery.patient, locale, tr]);

  const fullProfileBasePatient = useMemo(() => {
    if (!patientId || !fullProfileQuery.patient) return null;
    return toCardData(
      {
        _id: fullProfileQuery.patient._id ?? patientId,
        publicId: fullProfileQuery.patient.patientId ?? patientId,
        user: {
          fullName: fullProfileQuery.patient.user?.fullName ?? tr("مريض", "Patient"),
          phone: fullProfileQuery.patient.user?.phone,
          accountStatus: "active",
        },
        allergies: fullProfileQuery.patient.allergies ?? [],
        medicalConditions: fullProfileQuery.patient.medicalConditions ?? [],
        bloodType: fullProfileQuery.patient.bloodType ?? null,
        lastVisitAt: null,
        isTemporary: false,
      },
      locale,
      tr,
    );
  }, [patientId, fullProfileQuery.patient, locale, tr]);

  const basePatient =
    initialPatient ?? fullProfileBasePatient ?? fallbackPatient;
  const isTemporary = Boolean(basePatient?.isTemporary);
  const encountersQuery = useDoctorPatientEncounters(
    doctorId,
    patientId ?? "",
    {
      page: 1,
      limit: 20,
      sortBy: "startedAt",
      sortOrder: "desc",
    },
    Boolean(patientId && doctorId && !isTemporary),
  );
  const patientFilesQuery = useDoctorPatientFiles(
    patientId ?? "",
    Boolean(patientId && !isTemporary && fullProfileQuery.data?.ok === true),
  );

  // جلب مواعيد المريض — API لا يدعم فلتر patientId، نجلب آخر 100 موعد ونفلتر محلياً
  const patientAppointmentsQuery = useQuery({
    queryKey: ['doctor-patient-appointments', doctorId, patientId],
    queryFn: async () => {
      if (!doctorId || !patientId) return { appointments: [] };
      try {
        const response = await doctorApi.appointments.list({ limit: 100 });
        const patientAppointments = (response.appointments ?? []).filter(
          (apt: any) =>
            apt.patient?._id === patientId ||
            apt.patient?.publicId === patientId ||
            apt.patient === patientId,
        );
        return { appointments: patientAppointments };
      } catch {
        return { appointments: [] };
      }
    },
    enabled: Boolean(patientId && doctorId && !isTemporary),
    staleTime: 1000 * 30,
  });

  const patientAppointments = patientAppointmentsQuery.data?.appointments ?? [];
  const patientAppointmentsAwaitingData = isAwaitingInitialQueryData(
    patientAppointmentsQuery.data,
    patientAppointmentsQuery.isError,
  );
  const { retry: retryPatientProfile, retrying: retryingPatientProfile } =
    useRetryAction(async () => {
      await Promise.all([
        publicProfileQuery.refetch(),
        fullProfileQuery.refetch(),
      ]);
    });
  const { retry: retryEncounters, retrying: retryingEncounters } =
    useRetryAction(() => encountersQuery.refetch());
  const { retry: retryAppointments, retrying: retryingAppointments } =
    useRetryAction(() => patientAppointmentsQuery.refetch());
  const patientAppointmentsCount = useMemo(
    () => countPatientAppointments(patientAppointments).total,
    [patientAppointments],
  );

  const requestAccessMutation = useRequestDoctorPatientAccess(doctorId);
  const uploadPatientFileMutation = useUploadDoctorPatientFile(patientId ?? "");
  const deletePatientFileMutation = useDeleteDoctorPatientFile(patientId ?? "");

  const accessError =
    fullProfileQuery.deniedError instanceof ApiError
      ? fullProfileQuery.deniedError
      : null;
  const accessRequired =
    accessError?.messageKey === "errors.accessRequest.approvalRequired" ||
    accessError?.body?.accessRequired === true;
  const pendingRequestIdFromQuery =
    typeof accessError?.body?.pendingRequestId === "string"
      ? accessError.body.pendingRequestId
      : null;
  const accessPending = Boolean(
    pendingRequestIdFromQuery || pendingAccess?.pendingRequestId,
  );
  const accessMessage =
    pendingAccess?.message ??
    (typeof accessError?.message === "string"
      ? accessError.message
      : undefined);

  const patient = useMemo(() => {
    if (!basePatient) return null;
    const hasActiveEncounter = (encountersQuery.encounters ?? []).some(
      (encounter) => encounter.status === "open",
    );
    const relationshipState = determinePatientState({
      isTemporary: basePatient.isTemporary ?? false,
      accessRequired,
      accessPending,
      hasActiveEncounter,
      accountStatus: basePatient.accountStatusKey,
      relationshipKnown: true,
    });
    return {
      ...basePatient,
      relationshipState,
      allergies: publicProfileQuery.patient?.allergies ?? basePatient.allergies,
      medicalConditions:
        publicProfileQuery.patient?.medicalConditions ??
        basePatient.medicalConditions,
      bloodType: publicProfileQuery.patient?.bloodType ?? basePatient.bloodType,
      heightLabel: publicProfileQuery.patient?.heightCm
        ? `${publicProfileQuery.patient.heightCm} ${tr("سم", "cm")}`
        : "—",
      weightLabel: publicProfileQuery.patient?.weightKg
        ? `${publicProfileQuery.patient.weightKg} ${tr("كغ", "kg")}`
        : "—",
      measurementUnitLabel:
        publicProfileQuery.patient?.measurementUnit === "metric"
          ? tr("متري", "Metric")
          : (publicProfileQuery.patient?.measurementUnit ?? "—"),
    };
  }, [
    accessPending,
    accessRequired,
    basePatient,
    encountersQuery.encounters,
    publicProfileQuery.patient,
    tr,
  ]);

  const fullProfileData: FullProfileData | null = isTemporary
    ? {
        medicalHistory: [],
        medications: [],
        prescriptions: [],
        files: [],
        orders: [],
      }
    : fullProfileQuery.patient
      ? {
          medicalHistory: (fullProfileQuery.patient.medicalHistory ?? []).map(
            (record) => ({
              id: record._id,
              title: record.title ?? tr("سجل طبي", "Medical record"),
              diagnosis: record.diagnosis ?? "—",
              date: formatIsoDate(record.date ?? record.createdAt, locale, tr),
            }),
          ),
          medications: (fullProfileQuery.patient.medications ?? []).map(
            (medication, index) => ({
              id: medication._id ?? `med-${index}`,
              name: medication.name ?? tr("دواء", "Medication"),
              dosage: medication.dosage ?? "—",
              frequency: medication.frequency ?? "—",
            }),
          ),
          prescriptions: (
            (fullProfileQuery.patient as any)?.prescriptions ?? []
          ).map((prescription: any, index: number) => ({
            id: prescription._id ?? `prescription-${index}`,
            status: prescription.status ?? "draft",
            createdAt: formatIsoDate(prescription.createdAt, locale, tr),
            items: (prescription.items ?? []).map((item: any) => ({
              medicationName:
                item.medication?.name ?? item.medicationName ?? tr("دواء", "Medication"),
              dosage: item.dosage ?? "—",
              frequency: item.frequency ?? "—",
            })),
            notes: prescription.notes ?? "",
          })),
          files: (patientFilesQuery.files.length
            ? patientFilesQuery.files
            : (fullProfileQuery.patient.files ?? [])
          ).map((file) => ({
            id: file._id,
            name: file.originalName ?? tr("ملف", "File"),
            createdAt: formatIsoDate(file.createdAt, locale, tr),
          })),
          orders: (
            fullProfileQuery.patient.orders ??
            (fullProfileQuery.patient as any)?.medicalOrders ??
            []
          ).map((order: any, index: number) => ({
            id: order._id ?? order.id ?? `order-${index}`,
            title:
              order.orderTitle ??
              order.title ??
              order.orderName ??
              order.orderType ??
              order.type ??
              tr("طلب طبي", "Medical order"),
            status: order.status ?? order.statusCode ?? "pending",
            category: resolvePatientOrderCategory(order),
          })),
        }
      : null;

  useEffect(() => {
    if (fullProfileQuery.patient) {
      setPendingAccess(null);
    }
  }, [fullProfileQuery.patient]);

  const stateInfo = patient
    ? getPatientStateInfo(patient.relationshipState)
    : null;
  const stateMessage = patient
    ? getStateMessage(
        patient.relationshipState,
        pendingRequestIdFromQuery ?? pendingAccess?.pendingRequestId ?? null,
      )
    : null;

  const relationshipIcon =
    stateInfo?.icon === "link"
      ? Link2
      : stateInfo?.icon === "clock"
        ? Clock
        : stateInfo?.icon === "check"
          ? CheckCircle2
          : stateInfo?.icon === "stethoscope"
            ? Stethoscope
            : ShieldAlert;

  async function handleRequestAccess() {
    if (!doctorId || !patientId) return;
    try {
      const response = await requestAccessMutation.mutateAsync({
        patientId,
        body: {
          reason: tr(
            "طلب وصول من صفحة تفاصيل المريض",
            "Access request from the patient details page",
          ),
        },
      });
      setPendingAccess({
        pendingRequestId:
          response.pendingRequestId ?? response.request?._id ?? null,
        message: response.message,
      });
      toast(
        response.message ??
          tr("تم إرسال طلب الوصول بنجاح.", "The access request was sent successfully."),
        {
          title: tr("نجاح", "Success"),
          variant: "success",
        },
      );
    } catch (error) {
      toast(getDoctorAccessRequestErrorMessage(error), {
        title: tr("تعذّر إرسال طلب الوصول", "Could not send the access request"),
        variant: "error",
      });
    }
  }

  async function handleOpenFile(fileId: string) {
    if (!doctorId || !patientId) return;
    setFileActionKey(fileId);
    try {
      const response = await doctorApi.patients.getFileDownloadUrl(
        doctorId,
        patientId,
        fileId,
      );
      const fileUrl = response.url ?? response.downloadUrl;
      if (!fileUrl) throw new Error("missing download url");
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast(getPatientFileAccessErrorMessage(error, "open"), {
        title: tr("تعذّر فتح الملف", "Could not open the file"),
        variant: "error",
      });
    } finally {
      setFileActionKey(null);
    }
  }

  async function handleDownloadFile(fileId: string) {
    if (!doctorId || !patientId) return;
    setFileActionKey(fileId);
    try {
      const [downloadResponse, fileResponse] = await Promise.all([
        doctorApi.patients.getFileDownloadUrl(doctorId, patientId, fileId),
        doctorApi.patients.getFile(patientId, fileId),
      ]);
      const fileUrl = downloadResponse.url ?? downloadResponse.downloadUrl;
      if (!fileUrl) throw new Error("missing download url");
      await triggerBrowserFileDownload(
        fileUrl,
        fileResponse.file?.originalName ?? "patient-file",
      );
    } catch (error) {
      toast(getPatientFileAccessErrorMessage(error, "download"), {
        title: tr("تعذّر تحميل الملف", "Could not download the file"),
        variant: "error",
      });
    } finally {
      setFileActionKey(null);
    }
  }

  async function handleDeleteFile(fileId: string) {
    if (!patientId) return;
    setFileActionKey(fileId);
    try {
      const response = await deletePatientFileMutation.mutateAsync(fileId);
      toast(
        response.message ?? tr("تم حذف الملف بنجاح.", "The file was deleted successfully."),
        {
          title: tr("نجاح", "Success"),
          variant: "success",
        },
      );
    } catch (error) {
      toast(getPatientFileMutationErrorMessage(error, "delete"), {
        title: tr("تعذّر حذف الملف", "Could not delete the file"),
        variant: "error",
      });
    } finally {
      setFileActionKey(null);
    }
  }

  async function handleUploadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !patientId) return;
    setFileActionKey("upload");
    try {
      const response = await uploadPatientFileMutation.mutateAsync({ file });
      toast(
        response.message ?? tr("تم رفع الملف بنجاح.", "The file was uploaded successfully."),
        {
          title: tr("نجاح", "Success"),
          variant: "success",
        },
      );
    } catch (error) {
      toast(getPatientFileMutationErrorMessage(error, "upload"), {
        title: tr("تعذّر رفع الملف", "Could not upload the file"),
        variant: "error",
      });
    } finally {
      event.target.value = "";
      setFileActionKey(null);
    }
  }

  function renderRestrictedPanel() {
    if (!stateInfo || !stateMessage) return null;
    const Icon =
      stateInfo.icon === "link"
        ? Link2
        : stateInfo.icon === "stethoscope"
          ? Stethoscope
          : ShieldAlert;
    return (
      <div
        className={cn(
          "rounded-2xl border px-4 py-5",
          stateMessage.type === "error"
            ? "border-[#FECACA] bg-[#FEF2F2] text-[#B42318]"
            : stateMessage.type === "warning"
              ? "border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]"
              : stateMessage.type === "success"
                ? "border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]"
                : "border-[#B2DDFF] bg-[#EFF8FF] text-[#175CD3]",
        )}
      >
        <div className="flex gap-3 items-start">
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1 text-start">
            <div className="font-cairo text-[14px] font-extrabold">
              {stateMessage.title}
            </div>
            <p className="mt-1 font-cairo text-[13px] font-semibold leading-6">
              {accessMessage ?? stateMessage.body}
            </p>
            {stateInfo.canRequestAccess ? (
              <button
                type="button"
                onClick={handleRequestAccess}
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-current bg-white px-4 font-cairo text-[13px] font-extrabold transition-opacity hover:opacity-90"
              >
                <Link2 className="w-4 h-4" />
                {tr("إرسال طلب وصول", "Send access request")}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  function renderTabContent() {
    if (accessRequired && activeTab !== "basic") {
      return renderRestrictedPanel();
    }

    const encounters = encountersQuery.encounters ?? [];
    const encountersCount = encounters.length;
    const hasOpenEncounter = encounters.some((encounter) => encounter.status === "open");

    if (activeTab === "basic") {
      return (
        <OverviewTab
          patient={patient}
          fullProfileData={fullProfileData}
          encountersCount={encountersCount}
          appointmentsCount={patientAppointmentsCount}
          appointmentsLoading={patientAppointmentsAwaitingData}
          hasOpenEncounter={hasOpenEncounter}
          accessRequired={accessRequired}
          stateInfo={stateInfo}
          stateMessage={stateMessage}
          requestAccessPending={requestAccessMutation.isPending}
          onRequestAccess={handleRequestAccess}
          onSelectTab={setActiveTab}
        />
      );
    }

    const awaitingFullProfile = !isTemporary && fullProfileQuery.isAwaitingData;

    if (awaitingFullProfile) {
      return <PatientDetailsTabSkeleton rows={activeTab === "files" ? 3 : 4} />;
    }

    const tabLabel =
      TABS.find((tab) => tab.id === activeTab)?.label ?? tr("هذا القسم", "This section");

    /** ملف كامل غير متاح (خطأ شبكة أو رد الخادم) — يُعرَض وفق اسم التبويب النشِط */
    if (!fullProfileData && !isTemporary) {
      const detailMsg = fullProfileQuery.isError
        ? getPatientAccessErrorMessage(fullProfileQuery.error, tr)
        : fullProfileQuery.deniedError instanceof ApiError
          ? fullProfileQuery.deniedError.message ||
            getPatientAccessErrorMessage(fullProfileQuery.deniedError, tr)
          : tr(
              "تعذّر إكمال طلب البيانات. تحقّق من الاتصال ثم أعد المحاولة.",
              "Could not complete the data request. Check your connection and try again.",
            );
      const canRetry = Boolean(doctorId && patientId);

      return (
        <EmptyPanel
          title={tr(`تعذّر عرض «${tabLabel}»`, `Could not display “${tabLabel}”`)}
          message={tr(
            "حدث خطأ أثناء جلب جزء ملف المريض المرتبط بهذا القسم، أو لم تُرسَل البيانات من الخادم بشكل مكتمل. راجع الوصف أسفله ثم يمكن إعادة المحاولة إن أمكن.",
            "An error occurred while fetching the part of the patient's file linked to this section, or the data was not sent completely by the server. Review the description below, then retry if possible.",
          )}
          detail={detailMsg}
          actionLabel={canRetry ? tr("إعادة المحاولة", "Retry") : undefined}
          actionPending={retryingPatientProfile}
          onAction={
            canRetry
              ? () => {
                  void retryPatientProfile();
                }
              : undefined
          }
        />
      );
    }

    if (activeTab === "timeline") {
      return (
        <TimelineTab
          fullProfileData={fullProfileData}
          encounters={encounters}
          medicalConditions={patient?.medicalConditions ?? []}
          timelineFilter={timelineFilter}
          onTimelineFilterChange={setTimelineFilter}
          onCreateMedicalRecord={() => navigate('/doctor/medical-records')}
          onOpenEncountersTab={() => setActiveTab("encounters")}
          onOpenPrescriptionsTab={() => setActiveTab("prescriptions")}
          onOpenOrdersTab={() => setActiveTab("tests")}
        />
      );
    }

    if (activeTab === "encounters") {
      return (
        <EncountersTab
          encounters={encounters}
          isAwaitingData={encountersQuery.isAwaitingData}
          isError={encountersQuery.isError}
          error={encountersQuery.error}
          retrying={retryingEncounters}
          onRetry={() => {
            void retryEncounters();
          }}
          onOpenEncountersPage={() => navigate('/doctor/encounters')}
          formatIsoDate={formatIsoDate}
        />
      );
    }

    if (activeTab === "history") {
      return (
        <HistoryTab
          fullProfileData={fullProfileData}
          onAddRecord={() => navigate('/doctor/medical-records')}
        />
      );
    }

    if (activeTab === "medications") {
      return (
        <MedicationsTab
          fullProfileData={fullProfileData}
          onAddMedication={() => setMedicationDialogOpen(true)}
        />
      );
    }

    if (activeTab === "prescriptions") {
      return (
        <PrescriptionsTab
          fullProfileData={fullProfileData}
          onCreatePrescription={() =>
            navigate(
              patientId
                ? `/doctor/prescription?patientId=${encodeURIComponent(patientId)}`
                : '/doctor/prescription',
            )
          }
        />
      );
    }

    if (activeTab === "tests") {
      return (
        <OrdersTab
          fullProfileData={fullProfileData}
          orderTypeFilter={orderTypeFilter}
          onOrderTypeFilterChange={setOrderTypeFilter}
        />
      );
    }

    if (activeTab === "files") {
      return (
        <PatientFilesTab
          files={patientFilesQuery.files}
          fileActionKey={fileActionKey}
          onOpenFile={handleOpenFile}
          onDownloadFile={handleDownloadFile}
          onDeleteFile={handleDeleteFile}
          onUploadFile={handleUploadFile}
        />
      );
    }

    if (activeTab === "documents") {
      return (
        <DocumentsTab
          fullProfileData={fullProfileData}
          encounters={encounters}
          onOpenFiles={() => setActiveTab('files')}
          onOpenEncountersPage={() => navigate('/doctor/encounters')}
        />
      );
    }

    if (activeTab === "appointments") {
      return (
        <AppointmentsTab
          appointments={patientAppointments}
          isAwaitingData={patientAppointmentsAwaitingData}
          isError={patientAppointmentsQuery.isError}
          retrying={retryingAppointments}
          onRetry={() => {
            void retryAppointments();
          }}
          onOpenAppointments={() => navigate('/doctor/appointments')}
          formatIsoDate={formatIsoDate}
        />
      );
    }

    return (
      <EmptyPanel
        title={tr("قسم غير متاح", "Section unavailable")}
        message={tr(
          `لا توجد واجهة تعرض الآن لمكوّن «${tabLabel}».`,
          `There is currently no interface to display the “${tabLabel}” component.`,
        )}
      />
    );
  }

  const patientError = publicProfileQuery.error;

  return (
    <>
      <input
        id="doctor-patient-details-file-upload"
        type="file"
        className="hidden"
        onChange={handleUploadFile}
      />
      <Helmet>
        <title>
          {tr("تفاصيل المريض • LMJ Health", "Patient Details • LMJ Health")}
        </title>
        <style>{`
          @media print {
            @page { margin: 2cm; }
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            button, .no-print { display: none !important; }
            .print-break { page-break-after: always; }
            * { box-shadow: none !important; }
          }
        `}</style>
      </Helmet>

      <div dir={dir} lang={locale} className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-start">
            <div className="font-cairo text-[26px] font-black leading-[34px] text-[#111827]">
              {tr("ملف المريض", "Patient file")}
            </div>
            <div className="mt-1 font-cairo text-[13px] font-semibold leading-relaxed text-[#64748b]">
              {patientError && patientId ? (
                <>
                  {tr(
                    "لتصعيد المشكلة مع الدعم يُستخدَم معرّف النظام: ",
                    "For support escalation use system ID: ",
                  )}
                  <span className="rounded-md bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[11px] font-medium text-[#334155]">
                    {patientId}
                  </span>
                </>
              ) : patient ? (
                tr(
                  "عرض البيانات المعتمدة والسجل الصحي وفق صلاحياتك كطبيب.",
                  "View approved data and health record based on your doctor permissions.",
                )
              ) : patientId ? (
                tr("جارٍ تحميل تفاصيل الملف…", "Loading file details…")
              ) : (
                "—"
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/doctor/patients")}
            className="no-print inline-flex h-[40px] items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-extrabold text-[#344054] hover:bg-[#F9FAFB]"
          >
            <ArrowRight className="w-4 h-4" />
            {tr("العودة إلى المرضى", "Back to patients")}
          </button>
        </div>

        {/* Quick Actions */}
        {patient && !patientError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap gap-2 no-print"
          >
            <button
              type="button"
              onClick={() => navigate("/doctor/appointments")}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-sm transition-all hover:bg-[#0d7a77] hover:shadow-md"
            >
              <Plus className="h-3.5 w-3.5" />
              {tr("حجز موعد", "Book appointment")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/doctor/medical-records")}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#475467] transition-all hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"
            >
              <ClipboardList className="h-3.5 w-3.5" />
              {tr("سجل طبي جديد", "New medical record")}
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(
                  patientId
                    ? `/doctor/prescription?patientId=${encodeURIComponent(patientId)}`
                    : "/doctor/prescription",
                )
              }
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E9D5FF] bg-[#FAF5FF] px-4 font-cairo text-[12px] font-extrabold text-[#7C3AED] transition-all hover:bg-[#F3E8FF] hover:border-[#DDD6FE]"
            >
              <FileText className="h-3.5 w-3.5" />
              {tr("وصفة جديدة", "New prescription")}
            </button>
            {stateInfo?.canRequestAccess && (
              <button
                type="button"
                onClick={handleRequestAccess}
                disabled={requestAccessMutation.isPending}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#FED7AA] bg-[#FFFBEB] px-4 font-cairo text-[12px] font-extrabold text-[#B45309] transition-all hover:bg-[#FEF3C7] hover:border-[#FDBA74] disabled:opacity-60"
              >
                <Link2 className="h-3.5 w-3.5" />
                {tr("طلب وصول", "Request access")}
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#475467] transition-all hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"
            >
              <Printer className="h-3.5 w-3.5" />
              {tr("طباعة", "Print")}
            </button>
          </motion.div>
        )}

        {/* إحصائيات سريعة */}
        {patient && !patientError && !accessRequired && fullProfileData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6"
          >
            <div className="rounded-xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#F0F9FF] px-4 py-3">
              <div className="flex gap-2 items-center mb-1">
                <Stethoscope className="h-4 w-4 text-[#0EA5E9]" />
                <span className="font-cairo text-[11px] font-bold text-[#64748B]">
                  {tr("الزيارات", "Visits")}
                </span>
              </div>
              <div className="font-cairo text-[22px] font-black text-[#0F172A]">
                {encountersQuery.encounters?.length ?? 0}
              </div>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#FAF5FF] px-4 py-3">
              <div className="flex gap-2 items-center mb-1">
                <ClipboardList className="h-4 w-4 text-[#A855F7]" />
                <span className="font-cairo text-[11px] font-bold text-[#64748B]">
                  {tr("السجلات", "Records")}
                </span>
              </div>
              <div className="font-cairo text-[22px] font-black text-[#0F172A]">
                {fullProfileData.medicalHistory.length}
              </div>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#FEF2F2] px-4 py-3">
              <div className="flex gap-2 items-center mb-1">
                <Pill className="h-4 w-4 text-[#F43F5E]" />
                <span className="font-cairo text-[11px] font-bold text-[#64748B]">
                  {tr("الأدوية", "Medications")}
                </span>
              </div>
              <div className="font-cairo text-[22px] font-black text-[#0F172A]">
                {fullProfileData.medications.length}
              </div>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#FFFBEB] px-4 py-3">
              <div className="flex gap-2 items-center mb-1">
                <Activity className="h-4 w-4 text-[#EAB308]" />
                <span className="font-cairo text-[11px] font-bold text-[#64748B]">
                  {tr("الطلبات", "Orders")}
                </span>
              </div>
              <div className="font-cairo text-[22px] font-black text-[#0F172A]">
                {fullProfileData.orders.length}
              </div>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#F0FDFA] px-4 py-3">
              <div className="flex gap-2 items-center mb-1">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-cairo text-[11px] font-bold text-[#64748B]">
                  {tr("الملفات", "Files")}
                </span>
              </div>
              <div className="font-cairo text-[22px] font-black text-[#0F172A]">
                {fullProfileData.files.length}
              </div>
            </div>
            <div className="rounded-xl border border-[#E2E8F0] bg-gradient-to-br from-white to-[#FAF5FF] px-4 py-3">
              <div className="flex gap-2 items-center mb-1">
                <FileText className="h-4 w-4 text-[#8B5CF6]" />
                <span className="font-cairo text-[11px] font-bold text-[#64748B]">
                  {tr("الوصفات", "Prescriptions")}
                </span>
              </div>
              <div className="font-cairo text-[22px] font-black text-[#0F172A]">
                {fullProfileData.prescriptions.length}
              </div>
            </div>
          </motion.div>
        )}

        {patientError ? (
          <DoctorListErrorState
            title={tr("تعذّر تحميل ملف المريض", "Failed to load patient file")}
            brief={getPatientAccessErrorMessage(patientError, tr)}
            detail={getPatientAccessErrorMessage(patientError, tr)}
            retrying={retryingPatientProfile}
            onRetry={() => void retryPatientProfile()}
          />
        ) : !patient ? (
          <>
            <PatientHeaderSkeleton />
            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_50px_rgba(15,143,139,0.06)]">
              <div className="flex animate-pulse flex-wrap gap-2 border-b border-[#E5E7EB] pb-5">
                {TABS.map((tab) => (
                  <div
                    key={tab.id}
                    className="h-10 w-28 rounded-xl bg-gradient-to-r from-[#F3F4F6] to-[#E5E7EB]"
                  />
                ))}
              </div>
              <div className="pt-6">
                <PatientDetailsTabSkeleton rows={3} />
              </div>
            </div>
          </>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-[28px] border border-[#E2E8F0]/95 bg-white shadow-[0_28px_64px_-18px_rgba(15,143,139,0.14),0_8px_24px_rgba(15,23,42,0.06)]">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-[#5eead4] via-primary to-[#0f766e]"
                aria-hidden
              />
              <div
                className="absolute inset-0 opacity-80 pointer-events-none"
                aria-hidden
                style={{
                  backgroundImage:
                    "radial-gradient(ellipse 85% 65% at 100% 0%, rgba(15,143,139,0.11), transparent 52%), radial-gradient(ellipse 70% 50% at 0% 100%, rgba(20,184,166,0.09), transparent 48%), linear-gradient(165deg, #ffffff 0%, #f8fdfc 42%, #f1faf9 100%)",
                }}
              />
              <div
                className="pointer-events-none absolute -start-24 top-1/3 h-52 w-52 rounded-full bg-[#14b8a6]/10 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -end-20 bottom-0 h-44 w-44 rounded-full bg-primary/[0.09] blur-3xl"
                aria-hidden
              />

              <div className="relative px-5 py-7 sm:px-8 sm:py-8">
                <PatientProfileHeader
                  variant="page"
                  patient={patient}
                  relationshipLabel={stateInfo?.label}
                  relationshipTone={stateInfo?.color}
                  relationshipIcon={relationshipIcon}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-[0_20px_50px_rgba(15,143,139,0.06)] sm:p-6">
              <LayoutGroup id="patient-details-tabs">
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#E8EAEE] p-1 sm:grid-cols-3 lg:grid-cols-5">
                  {TABS.map((tab) => {
                    const active = activeTab === tab.id;
                    return (
                      <motion.button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: active ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 28,
                        }}
                        className={cn(
                          "relative min-h-[44px] rounded-xl px-2 py-2 text-center font-cairo text-[12px] font-black transition-colors",
                          active
                            ? "text-white shadow-[0_8px_18px_rgba(15,143,139,0.2)]"
                            : "text-[#4A5565] hover:bg-white/55",
                        )}
                      >
                        {active ? (
                          <motion.span
                            layoutId="patient-details-tab-pill"
                            className="absolute inset-0 rounded-xl bg-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 32,
                            }}
                            aria-hidden
                          />
                        ) : null}
                        <span className="relative z-10">{tab.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </LayoutGroup>

              <div className="relative mt-5 min-h-[240px] overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeTab}
                    role="tabpanel"
                    aria-label={TABS.find((t) => t.id === activeTab)?.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={TAB_PANEL_TRANSITION}
                    className="w-full"
                  >
                    {renderTabContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          </>
        )}
      </div>
      <PatientAddMedicationDialog
        open={medicationDialogOpen}
        onOpenChange={setMedicationDialogOpen}
        busy={addMedicationMutation.isPending}
        onSubmit={async (values) => {
          try {
            await addMedicationMutation.mutateAsync(values);
            toast(tr("تمت إضافة الدواء للمريض.", "The medication was added for the patient."), {
              variant: "success",
            });
          } catch (error) {
            toast(getUserFacingRequestErrorMessage(error), {
              title: tr("تعذّر إضافة الدواء", "Could not add the medication"),
              variant: "error",
            });
            throw error;
          }
        }}
      />
    </>
  );
}
