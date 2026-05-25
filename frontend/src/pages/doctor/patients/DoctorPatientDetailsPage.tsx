import { Helmet } from "react-helmet-async";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  Eye,
  FileText,
  FlaskConical,
  Heart,
  Link2,
  Loader2,
  Phone,
  Pill,
  Plus,
  Printer,
  ScanLine,
  ShieldAlert,
  Stethoscope,
  Syringe,
  Upload,
  UserCheck,
  UserRound,
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
import { readAuthUser } from "@/lib/cookies";
import { doctorApi } from "@/lib/doctor/client";
import {
  determinePatientState,
  getPatientStateInfo,
  getStateMessage,
} from "@/lib/doctor/patient-states";
import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";
import type { FullProfileData, PatientDetailsTab } from "@/components/doctor/patients/patient-details";
import {
  TABS,
  TAB_PANEL_TRANSITION,
  PatientDetailsTabSkeleton,
  PatientHeaderSkeleton,
  InfoCard,
  EmptyPanel,
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
import { triggerBrowserFileDownload } from "@/lib/files/triggerBrowserFileDownload";
import { cn } from "@/lib/utils/utils";

function formatIsoDate(value?: string | null): string {
  if (!value) return "لا توجد زيارات";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value ?? "";
  return date.toLocaleDateString("ar-SA");
}

function toCardData(patient: {
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
}): Omit<DoctorPatientExpandableCardData, "relationshipState"> {
  const accountStatusLabel =
    patient.user.accountStatus === "temporary"
      ? "مؤقت"
      : patient.user.accountStatus === "suspended"
        ? "معلّق"
        : "نشط";

  return {
    id: patient._id,
    fileNo: patient.publicId ?? patient._id,
    name: patient.user.fullName,
    accountStatusLabel,
    accountStatusKey: patient.user.accountStatus ?? "active",
    isTemporary:
      patient.isTemporary ?? patient.user.accountStatus === "temporary",
    phone: patient.user.phone ?? "—",
    lastVisit: formatIsoDate(patient.lastVisitAt),
    allergies: patient.allergies ?? [],
    medicalConditions: patient.medicalConditions ?? [],
    bloodType: patient.bloodType ?? "غير محدد",
    heightLabel: "—",
    weightLabel: "—",
    measurementUnitLabel: "—",
  };
}

function getPatientAccessErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return getUserFacingRequestErrorMessage(error);
  }
  if (error.messageKey === "errors.doctor.notApproved") {
    return "حساب الطبيب الحالي غير معتمد بعد، لذلك لا يمكن تحميل بيانات هذا المريض.";
  }
  if (error.status === 401) {
    return "انتهت صلاحية جلسة الدخول أو لم يتم التحقق من الهوية. سجّل الدخول من جديد.";
  }
  if (error.status === 403) {
    return error.message || "لا تملك صلاحية عرض هذا المريض بهذا الحساب.";
  }
  return error.message || getUserFacingRequestErrorMessage(error);
}

function patientNameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return `${a}${b}`.toUpperCase();
  }
  const t = name.trim();
  return (t.slice(0, 2) || "؟").toUpperCase();
}

export default function DoctorPatientDetailsPage() {
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
    return toCardData({
      _id: publicProfileQuery.patient._id ?? patientId,
      publicId: patientId,
      user: {
        fullName: publicProfileQuery.patient.user?.fullName ?? "مريض",
        phone: publicProfileQuery.patient.user?.phone,
        accountStatus: "active",
      },
      allergies: publicProfileQuery.patient.allergies ?? [],
      medicalConditions: publicProfileQuery.patient.medicalConditions ?? [],
      bloodType: publicProfileQuery.patient.bloodType ?? null,
      lastVisitAt: null,
      isTemporary: false,
    });
  }, [patientId, publicProfileQuery.patient]);

  const fullProfileBasePatient = useMemo(() => {
    if (!patientId || !fullProfileQuery.patient) return null;
    return toCardData({
      _id: fullProfileQuery.patient._id ?? patientId,
      publicId: fullProfileQuery.patient.patientId ?? patientId,
      user: {
        fullName: fullProfileQuery.patient.user?.fullName ?? "مريض",
        phone: fullProfileQuery.patient.user?.phone,
        accountStatus: "active",
      },
      allergies: fullProfileQuery.patient.allergies ?? [],
      medicalConditions: fullProfileQuery.patient.medicalConditions ?? [],
      bloodType: fullProfileQuery.patient.bloodType ?? null,
      lastVisitAt: null,
      isTemporary: false,
    });
  }, [patientId, fullProfileQuery.patient]);

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

  // جلب مواعيد المريض
  const patientAppointmentsQuery = useQuery({
    queryKey: ['doctor-patient-appointments', doctorId, patientId],
    queryFn: async () => {
      if (!doctorId || !patientId) return { appointments: [] };
      try {
        // جلب جميع المواعيد وفلترتها للمريض المحدد
        const response = await doctorApi.appointments.list({});
        const patientAppointments = response.appointments?.filter(
          (apt: any) => apt.patient?._id === patientId || apt.patient === patientId
        ) ?? [];
        console.log('🗓️ Patient Appointments:', patientAppointments);
        return { appointments: patientAppointments };
      } catch (error) {
        console.error('Error fetching patient appointments:', error);
        return { appointments: [] };
      }
    },
    enabled: Boolean(patientId && doctorId && !isTemporary),
    staleTime: 1000 * 30,
  });

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
        ? `${publicProfileQuery.patient.heightCm} سم`
        : "—",
      weightLabel: publicProfileQuery.patient?.weightKg
        ? `${publicProfileQuery.patient.weightKg} كغ`
        : "—",
      measurementUnitLabel:
        publicProfileQuery.patient?.measurementUnit === "metric"
          ? "متري"
          : (publicProfileQuery.patient?.measurementUnit ?? "—"),
    };
  }, [
    accessPending,
    accessRequired,
    basePatient,
    encountersQuery.encounters,
    publicProfileQuery.patient,
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
              title: record.title ?? "سجل طبي",
              diagnosis: record.diagnosis ?? "—",
              date: formatIsoDate(record.date ?? record.createdAt),
            }),
          ),
          medications: (fullProfileQuery.patient.medications ?? []).map(
            (medication, index) => ({
              id: medication._id ?? `med-${index}`,
              name: medication.name ?? "دواء",
              dosage: medication.dosage ?? "—",
              frequency: medication.frequency ?? "—",
            }),
          ),
          prescriptions: (
            (fullProfileQuery.patient as any)?.prescriptions ?? []
          ).map((prescription: any, index: number) => ({
            id: prescription._id ?? `prescription-${index}`,
            status: prescription.status ?? "draft",
            createdAt: formatIsoDate(prescription.createdAt),
            items: (prescription.items ?? []).map((item: any) => ({
              medicationName:
                item.medication?.name ?? item.medicationName ?? "دواء",
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
            name: file.originalName ?? "ملف",
            createdAt: formatIsoDate(file.createdAt),
          })),
          orders: (() => {
            // Debug: تحقق من البيانات
            console.log('🔍 Full Profile Patient Data:', fullProfileQuery.patient);
            console.log('🔍 Orders from API:', fullProfileQuery.patient.orders);
            console.log('🔍 Medical Orders:', (fullProfileQuery.patient as any)?.medicalOrders);

            // جرب أكثر من مصدر محتمل للطلبات
            const ordersSource = fullProfileQuery.patient.orders ??
                                (fullProfileQuery.patient as any)?.medicalOrders ??
                                [];

            console.log('🔍 Orders Source:', ordersSource);

            return ordersSource.map((order: any, index: number) => ({
              id: order._id ?? order.id ?? `order-${index}`,
              title: order.orderTitle ?? order.title ?? order.orderName ?? order.orderType ?? order.type ?? "طلب طبي",
              status: order.status ?? order.statusCode ?? "pending",
            }));
          })(),
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

  async function handleRequestAccess() {
    if (!doctorId || !patientId) return;
    try {
      const response = await requestAccessMutation.mutateAsync({
        patientId,
        body: {
          reason: "طلب وصول من صفحة تفاصيل المريض",
        },
      });
      setPendingAccess({
        pendingRequestId:
          response.pendingRequestId ?? response.request?._id ?? null,
        message: response.message,
      });
      toast(response.message ?? "تم إرسال طلب الوصول بنجاح.", {
        title: "نجاح",
        variant: "success",
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: "تعذّر إرسال طلب الوصول",
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
      if (response.url) {
        window.open(response.url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: "تعذّر فتح الملف",
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
      if (downloadResponse.url) {
        triggerBrowserFileDownload(
          downloadResponse.url,
          fileResponse.file?.originalName ?? "patient-file",
        );
      }
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: "تعذّر تحميل الملف",
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
      toast(response.message ?? "تم حذف الملف بنجاح.", {
        title: "نجاح",
        variant: "success",
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: "تعذّر حذف الملف",
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
      toast(response.message ?? "تم رفع الملف بنجاح.", {
        title: "نجاح",
        variant: "success",
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: "تعذّر رفع الملف",
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
          <div className="flex-1 text-right">
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
                إرسال طلب وصول
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

    const awaitingFullProfile =
      !isTemporary &&
      (fullProfileQuery.isLoading ||
        (!fullProfileQuery.patient && fullProfileQuery.isFetching));

    if (awaitingFullProfile) {
      return <PatientDetailsTabSkeleton rows={activeTab === "files" ? 3 : 4} />;
    }

    const tabLabel =
      TABS.find((tab) => tab.id === activeTab)?.label ?? "هذا القسم";

    /** ملف كامل غير متاح (خطأ شبكة أو رد الخادم) — يُعرَض وفق اسم التبويب النشِط */
    if (!fullProfileData && !isTemporary) {
      const detailMsg = fullProfileQuery.isError
        ? getPatientAccessErrorMessage(fullProfileQuery.error)
        : fullProfileQuery.deniedError instanceof ApiError
          ? fullProfileQuery.deniedError.message ||
            getPatientAccessErrorMessage(fullProfileQuery.deniedError)
          : "تعذّر إكمال طلب البيانات. تحقّق من الاتصال ثم أعد المحاولة.";
      const canRetry = Boolean(doctorId && patientId);

      return (
        <EmptyPanel
          title={`تعذّر عرض «${tabLabel}»`}
          message="حدث خطأ أثناء جلب جزء ملف المريض المرتبط بهذا القسم، أو لم تُرسَل البيانات من الخادم بشكل مكتمل. راجع الوصف أسفله ثم يمكن إعادة المحاولة إن أمكن."
          detail={detailMsg}
          actionLabel={canRetry ? "إعادة المحاولة" : undefined}
          actionPending={
            fullProfileQuery.isFetching || fullProfileQuery.isPending
          }
          onAction={
            canRetry
              ? () => {
                  void fullProfileQuery.refetch();
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
          onCreateMedicalRecord={() => navigate('/doctor/medical-records/new')}
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
          isLoading={encountersQuery.isLoading}
          isError={encountersQuery.isError}
          error={encountersQuery.error}
          isFetching={encountersQuery.isFetching}
          onRetry={() => {
            void encountersQuery.refetch();
          }}
          onOpenEncountersPage={() => navigate('/doctor/encounters')}
          formatIsoDate={formatIsoDate}
        />
      );
    }

    if (activeTab === "history") {
      return <HistoryTab fullProfileData={fullProfileData} />;
    }

    if (activeTab === "medications") {
      return (
        <MedicationsTab
          fullProfileData={fullProfileData}
          onAddMedication={() => navigate('/doctor/medical-records')}
        />
      );
    }

    if (activeTab === "prescriptions") {
      return (
        <PrescriptionsTab
          fullProfileData={fullProfileData}
          onCreatePrescription={() => navigate('/doctor/prescriptions/new')}
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
      return <DocumentsTab onOpenFiles={() => setActiveTab('files')} />;
    }

    if (activeTab === "appointments") {
      return (
        <AppointmentsTab
          appointments={patientAppointmentsQuery.data?.appointments ?? []}
          isLoading={patientAppointmentsQuery.isLoading}
          isError={patientAppointmentsQuery.isError}
          isFetching={patientAppointmentsQuery.isFetching}
          onRetry={() => {
            void patientAppointmentsQuery.refetch();
          }}
          onOpenAppointments={() => navigate('/doctor/appointments')}
          formatIsoDate={formatIsoDate}
        />
      );
    }

    return (
      <EmptyPanel
        title={`قسم غير متاح`}
        message={`لا توجد واجهة تعرض الآن لمكوّن «${tabLabel}».`}
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
        <title>تفاصيل المريض • LMJ Health</title>
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

      <div dir="rtl" lang="ar" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-right">
            <div className="font-cairo text-[26px] font-black leading-[34px] text-[#111827]">
              ملف المريض
            </div>
            <div className="mt-1 font-cairo text-[13px] font-semibold leading-relaxed text-[#64748b]">
              {patientError && patientId ? (
                <>
                  لتصعيد المشكلة مع الدعم يُستخدَم معرّف النظام:{" "}
                  <span className="rounded-md bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[11px] font-medium text-[#334155]">
                    {patientId}
                  </span>
                </>
              ) : patient ? (
                "عرض البيانات المعتمدة والسجل الصحي وفق صلاحياتك كطبيب."
              ) : patientId ? (
                "جارٍ تحميل تفاصيل الملف…"
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
            العودة إلى المرضى
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
              حجز موعد
            </button>
            <button
              type="button"
              onClick={() => navigate("/doctor/medical-records/new")}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#475467] transition-all hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"
            >
              <ClipboardList className="h-3.5 w-3.5" />
              سجل طبي جديد
            </button>
            <button
              type="button"
              onClick={() => navigate("/doctor/prescriptions/new")}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E9D5FF] bg-[#FAF5FF] px-4 font-cairo text-[12px] font-extrabold text-[#7C3AED] transition-all hover:bg-[#F3E8FF] hover:border-[#DDD6FE]"
            >
              <FileText className="h-3.5 w-3.5" />
              وصفة جديدة
            </button>
            {stateInfo?.canRequestAccess && (
              <button
                type="button"
                onClick={handleRequestAccess}
                disabled={requestAccessMutation.isPending}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#FED7AA] bg-[#FFFBEB] px-4 font-cairo text-[12px] font-extrabold text-[#B45309] transition-all hover:bg-[#FEF3C7] hover:border-[#FDBA74] disabled:opacity-60"
              >
                <Link2 className="h-3.5 w-3.5" />
                طلب وصول
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#475467] transition-all hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"
            >
              <Printer className="h-3.5 w-3.5" />
              طباعة
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
                  الزيارات
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
                  السجلات
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
                  الأدوية
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
                  الطلبات
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
                  الملفات
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
                  الوصفات
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
            title="تعذّر تحميل ملف المريض"
            brief={getPatientAccessErrorMessage(patientError)}
            detail={getPatientAccessErrorMessage(patientError)}
            retrying={
              publicProfileQuery.isFetching || fullProfileQuery.isFetching
            }
            onRetry={() => {
              void publicProfileQuery.refetch();
              void fullProfileQuery.refetch();
            }}
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
                className="pointer-events-none absolute -left-24 top-1/3 h-52 w-52 rounded-full bg-[#14b8a6]/10 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -right-20 bottom-0 h-44 w-44 rounded-full bg-primary/[0.09] blur-3xl"
                aria-hidden
              />

              <div className="relative px-5 py-7 sm:px-8 sm:py-8">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
                  <div className="flex flex-1 gap-5 items-start min-w-0 sm:gap-6">
                    <div className="relative shrink-0">
                      <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[22px] bg-gradient-to-br from-[#0f766e] via-[#0f8f8b] to-[#14b8a6] font-cairo text-[22px] font-black tracking-wide text-white shadow-[0_18px_38px_rgba(15,143,139,0.35)] ring-[3px] ring-white/90">
                        {patientNameInitials(patient.name)}
                      </div>
                      <span
                        className="absolute -bottom-0.5 -left-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-[3px] border-white bg-[#ecfdf5] text-primary shadow-sm"
                        aria-hidden
                      >
                        <UserRound className="w-3 h-3" strokeWidth={2.5} />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 text-right">
                      <p className="font-cairo text-[11px] font-extrabold uppercase tracking-[0.06em] text-primary">
                        ملف المريض الطبي
                      </p>
                      <h1 className="mt-1.5 font-cairo text-[clamp(1.35rem,3.2vw,1.75rem)] font-black leading-[1.2] text-[#0f172a]">
                        {patient.name}
                      </h1>
                      <div className="flex flex-wrap gap-2 justify-start items-center mt-3">
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E8F0]/90 bg-white/85 px-3 py-1.5 font-cairo text-[12px] font-bold text-[#475569] shadow-[0_4px_14px_rgba(15,23,42,0.04)] backdrop-blur-sm">
                          <span className="text-[#94a3b8]">رقم الملف</span>
                          <span className="font-cairo tabular-nums text-[#0f172a]">
                            {patient.fileNo}
                          </span>
                        </span>
                        <span className="inline-flex items-center rounded-full bg-gradient-to-l from-[#ecfdf5] to-[#d1fae5] px-3.5 py-1 font-cairo text-[12px] font-extrabold text-[#047857] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-[#6ee7b7]/55">
                          {patient.accountStatusLabel}
                        </span>
                        {stateInfo ? (
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-3.5 py-1 font-cairo text-[12px] font-extrabold ring-1 ring-inset shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
                              stateInfo.color.bg,
                              stateInfo.color.text,
                              stateInfo.color.ring,
                            )}
                          >
                            {stateInfo.label}
                          </span>
                        ) : null}
                      </div>

                      {/* Badges للتنبيهات المهمة */}
                      {(patient.allergies.length > 0 || patient.medicalConditions.length > 0) && (
                        <div className="flex flex-wrap gap-2 items-center mt-3">
                          {patient.allergies.length > 0 && (
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#FEE2E2] bg-[#FEF2F2] px-2.5 py-1 shadow-sm">
                              <AlertTriangle className="h-3.5 w-3.5 text-[#DC2626]" />
                              <span className="font-cairo text-[11px] font-bold text-[#B91C1C]">
                                {patient.allergies.length} حساسية
                              </span>
                            </div>
                          )}
                          {patient.medicalConditions.length > 0 && (
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#FED7AA] bg-[#FFF7ED] px-2.5 py-1 shadow-sm">
                              <Heart className="h-3.5 w-3.5 text-[#EA580C]" />
                              <span className="font-cairo text-[11px] font-bold text-[#C2410C]">
                                {patient.medicalConditions.length} مرض مزمن
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[340px] xl:min-w-[380px]">
                    <InfoCard
                      label="الهاتف"
                      value={patient.phone}
                      icon={Phone}
                    />
                    <InfoCard
                      label="آخر زيارة"
                      value={patient.lastVisit}
                      icon={CalendarDays}
                    />
                  </div>
                </div>
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
    </>
  );
}
