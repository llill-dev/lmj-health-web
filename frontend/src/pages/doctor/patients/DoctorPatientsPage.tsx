import DoctorDashboardOverview from "@/components/doctor/dashboard/doctor-dashboard-overview";
import DoctorPatientExpandableCard, {
  type DoctorPatientExpandableCardData,
  type PatientCardTab,
} from "@/components/doctor/patients/doctor-patient-expandable-card";
import CreateTemporaryPatientDialog from "@/components/doctor/patients/create-temporary-patient-dialog";
import { PatientTabEmptyIllustration } from "@/components/doctor/patients/patient-tab-empty-illustration";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import { DoctorTableSkeleton } from "@/components/doctor/shared/skeletons";
import {
  useCreateTemporaryDoctorPatient,
  useDoctorPatientFullProfile,
  useDoctorPatientFiles,
  useDoctorPatientPublicProfile,
  useDoctorPatients,
  useDeleteDoctorPatientFile,
  useRequestDoctorPatientAccess,
  useUploadDoctorPatientFile,
} from "@/hooks";
import { Helmet } from "react-helmet-async";
import {
  Search,
  Filter,
  UserCheck,
  UserMinus,
  UserRoundPlus,
  Link2,
  Clock,
  Hourglass,
  CheckCircle2,
  Stethoscope,
  Users,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import StyledSelect from "@/components/ui/styled-select";
import { readAuthUser } from "@/lib/cookies";
import { ApiError, getUserFacingRequestErrorMessage } from "@/lib/api";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { doctorApi } from "@/lib/doctor/client";
import {
  determinePatientState,
  type PatientRelationshipState,
} from "@/lib/doctor/patients/patient-states";
import { triggerBrowserFileDownload } from "@/lib/files/triggerBrowserFileDownload";
import { useNavigate } from "react-router-dom";

type FilterStatus = "all" | "active" | "temporary" | "suspended";
type RelationshipFilter = "all" | PatientRelationshipState;
type PendingAccessState = Record<
  string,
  { pendingRequestId?: string | null; message?: string }
>;

function getPatientsListErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return getUserFacingRequestErrorMessage(error);
  }

  if (error.messageKey === "errors.doctor.notApproved") {
    return "حساب الطبيب الحالي غير مُعتمد بعد، لذلك لا يمكن تحميل قائمة المرضى.";
  }

  if (error.status === 401) {
    return "انتهت صلاحية جلسة الدخول أو لم يتم التحقق من الهوية. سجّل الدخول من جديد.";
  }

  if (error.status === 403) {
    return error.message || "لا تملك صلاحية عرض مرضى الطبيب بهذا الحساب.";
  }

  return (
    error.message || getUserFacingRequestErrorMessage(error)
  );
}

function summarizePatientsListError(error: unknown): {
  title: string;
  brief: string;
  detail: string;
  showTechnicalDetail: boolean;
} {
  const detail = getPatientsListErrorMessage(error);
  const verbose =
    detail.length > 160 ||
    detail.includes("لم نتمكن من إتمام الطلب") ||
    detail.includes("VPN") ||
    detail.includes("جدار الحماية") ||
    detail.includes("توقيت خاطئ");
  const brief = verbose
    ? "لم نتمكن من جلب قائمة المرضى في هذه المحاولة. تحقق من اتصالك بالإنترنت ثم أعد المحاولة، أو انتظر قليلًا إن كانت الخدمة مشغولة."
    : detail;

  return {
    title: "تعذّر تحميل مرضى الطبيب",
    brief,
    detail,
    showTechnicalDetail: verbose,
  };
}

function formatIsoDate(value?: string | null): string {
  if (!value) return "لا توجد زيارات";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ar-SA");
}

function toCardData(patient: {
  _id: string;
  publicId: string;
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
    fileNo: patient.publicId,
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

type DoctorPatientsFiltersState = {
  account_status: FilterStatus;
  relationship: RelationshipFilter;
  search: string;
  diagnosis: string;
  from: string;
  to: string;
  page: number;
  limit: number;
};

export default function DoctorPatientsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const authUser = readAuthUser();
  const doctorId = authUser?.actorIds?.doctorId ?? "";

  const defaultFilters = useMemo<DoctorPatientsFiltersState>(() => {
    return {
      account_status: "all",
      relationship: "all",
      search: "",
      diagnosis: "",
      from: "",
      to: "",
      page: 1,
      limit: 20,
    };
  }, []);

  const [filters, setFilters] = useState<DoctorPatientsFiltersState>({
    ...defaultFilters,
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PatientCardTab>("basic");
  const [tempPatientOpen, setTempPatientOpen] = useState(false);
  const [pendingAccessByPatient, setPendingAccessByPatient] =
    useState<PendingAccessState>({});
  const [accessResolutionByPatientId, setAccessResolutionByPatientId] = useState<
    Record<
      string,
      {
        accessRequired: boolean;
        accessPending: boolean;
        pendingRequestId: string | null;
      }
    >
  >({});
  const [patientFileActionKey, setPatientFileActionKey] = useState<string | null>(null);

  const listQuery = useDoctorPatients({
    search: filters.search || undefined,
    diagnosis: filters.diagnosis || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page: filters.page,
    limit: filters.limit,
    account_status: filters.account_status,
  });

  // KPI counts should come from backend totals, not the current page slice.
  const activeCountQuery = useDoctorPatients({
    page: 1,
    limit: 1,
    account_status: "active",
  });
  const temporaryCountQuery = useDoctorPatients({
    page: 1,
    limit: 1,
    account_status: "temporary",
  });
  const suspendedCountQuery = useDoctorPatients({
    page: 1,
    limit: 1,
    account_status: "suspended",
  });
  const expandedListPatient = useMemo(
    () => listQuery.patients.find((patient) => patient._id === expandedId),
    [expandedId, listQuery.patients],
  );
  const expandedPatientIsTemporary = Boolean(
    expandedListPatient?.isTemporary ||
      expandedListPatient?.user.accountStatus === "temporary",
  );

  const publicProfileQuery = useDoctorPatientPublicProfile(
    expandedId ?? "",
    Boolean(expandedId),
  );
  const fullProfileQuery = useDoctorPatientFullProfile(
    doctorId,
    expandedId ?? "",
    Boolean(expandedId && doctorId && !expandedPatientIsTemporary),
  );
  const canFetchFiles =
    Boolean(expandedId) &&
    !expandedPatientIsTemporary &&
    fullProfileQuery.isSuccess &&
    fullProfileQuery.data?.ok === true;
  const patientFilesQuery = useDoctorPatientFiles(
    expandedId ?? "",
    canFetchFiles,
  );

  const createTempMutation = useCreateTemporaryDoctorPatient();
  const requestAccessMutation = useRequestDoctorPatientAccess(doctorId);
  const uploadPatientFileMutation = useUploadDoctorPatientFile(expandedId ?? "");
  const deletePatientFileMutation = useDeleteDoctorPatientFile(expandedId ?? "");

  const totalPages = useMemo(() => {
    const safeLimit = Math.max(1, filters.limit);
    const pages = Math.ceil((listQuery.total || 0) / safeLimit);
    return pages || 1;
  }, [filters.limit, listQuery.total]);

  const patientsListFailed = listQuery.isError;
  const patientsListPending = listQuery.isAwaitingData && !patientsListFailed;
  const patientsListReady = !patientsListFailed && !patientsListPending;
  const { retry: retryPatientsList, retrying: retryingPatientsList } =
    useRetryAction(() => listQuery.refetch());
  const patientsLoadErrorPresentation = useMemo(
    () => summarizePatientsListError(listQuery.error),
    [listQuery.error],
  );

  const hasActiveFilters = useMemo(() => {
    return (
      filters.account_status !== defaultFilters.account_status ||
      filters.relationship !== defaultFilters.relationship ||
      Boolean(filters.search.trim()) ||
      Boolean(filters.diagnosis.trim()) ||
      Boolean(filters.from.trim()) ||
      Boolean(filters.to.trim()) ||
      filters.page !== defaultFilters.page ||
      filters.limit !== defaultFilters.limit
    );
  }, [defaultFilters, filters]);

  const statusCounts = {
    active: activeCountQuery.total,
    temporary: temporaryCountQuery.total,
    suspended: suspendedCountQuery.total,
    loading:
      activeCountQuery.isAwaitingData ||
      temporaryCountQuery.isAwaitingData ||
      suspendedCountQuery.isAwaitingData,
  };

  const fullProfileData = expandedPatientIsTemporary
    ? {
        medicalHistory: [],
        medications: [],
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
        files: (
          patientFilesQuery.files.length
            ? patientFilesQuery.files
            : (fullProfileQuery.patient.files ?? [])
        ).map((file) => ({
          id: file._id,
          name: file.originalName ?? "ملف",
          createdAt: formatIsoDate(file.createdAt),
        })),
        orders: (fullProfileQuery.patient.orders ?? []).map((order, index) => ({
          id: order._id ?? `order-${index}`,
          title:
            order.orderTitle ?? order.orderName ?? order.orderType ?? "طلب",
          status: order.status ?? order.statusCode ?? "—",
        })),
      }
    : null;

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

  const effectivePendingAccess =
    (expandedId ? pendingAccessByPatient[expandedId] : undefined) ?? null;

  const accessPending = Boolean(
    pendingRequestIdFromQuery || effectivePendingAccess?.pendingRequestId,
  );

  const accessMessage =
    effectivePendingAccess?.message ??
    (typeof accessError?.message === "string"
      ? accessError.message
      : undefined);

  useEffect(() => {
    if (!expandedId) return;
    if (fullProfileQuery.isAwaitingData) return;

    const pid = expandedId;
    const pendId =
      pendingRequestIdFromQuery ??
      pendingAccessByPatient[pid]?.pendingRequestId ??
      null;

    if (expandedPatientIsTemporary) {
      setAccessResolutionByPatientId((prev) => ({
        ...prev,
        [pid]: {
          accessRequired: false,
          accessPending: false,
          pendingRequestId: null,
        },
      }));
      return;
    }

    if (fullProfileQuery.patient) {
      setAccessResolutionByPatientId((prev) => ({
        ...prev,
        [pid]: {
          accessRequired: false,
          accessPending: Boolean(pendId),
          pendingRequestId: pendId,
        },
      }));
      return;
    }

    if (
      fullProfileQuery.deniedError ||
      accessRequired ||
      accessPending
    ) {
      setAccessResolutionByPatientId((prev) => ({
        ...prev,
        [pid]: {
          accessRequired: Boolean(accessRequired),
          accessPending: Boolean(accessPending),
          pendingRequestId: pendId,
        },
      }));
    }
  }, [
    expandedId,
    expandedPatientIsTemporary,
    fullProfileQuery.isAwaitingData,
    fullProfileQuery.patient,
    fullProfileQuery.deniedError,
    accessRequired,
    accessPending,
    pendingRequestIdFromQuery,
    pendingAccessByPatient,
  ]);

  const cardPatients = useMemo(() => {
    const buildRelationshipState = (
      base: ReturnType<typeof toCardData>,
      patientApiId: string,
    ): PatientRelationshipState => {
      const resolved = accessResolutionByPatientId[patientApiId];
      const optimisticPendingId =
        pendingAccessByPatient[patientApiId]?.pendingRequestId ?? null;

      const relationshipKnown =
        Boolean(resolved) ||
        Boolean(optimisticPendingId) ||
        Boolean(base.isTemporary) ||
        base.accountStatusKey === "temporary" ||
        base.accountStatusKey === "suspended";

      const accessRequiredForState = resolved ? resolved.accessRequired : false;
      const accessPendingForState = resolved
        ? resolved.accessPending
        : Boolean(optimisticPendingId);

      return determinePatientState({
        isTemporary: base.isTemporary ?? false,
        accessRequired: accessRequiredForState,
        accessPending: accessPendingForState,
        hasActiveEncounter: false,
        accountStatus: base.accountStatusKey,
        relationshipKnown,
      });
    };

    const enhancedPatients = listQuery.patients.map((patient) => {
      const base = toCardData(patient);
      const relationshipState = buildRelationshipState(base, patient._id);

      if (
        expandedId &&
        patient._id === expandedId &&
        publicProfileQuery.patient
      ) {
        return {
          ...base,
          relationshipState,
          allergies: publicProfileQuery.patient.allergies ?? base.allergies,
          medicalConditions:
            publicProfileQuery.patient.medicalConditions ??
            base.medicalConditions,
          bloodType: publicProfileQuery.patient.bloodType ?? base.bloodType,
          heightLabel: publicProfileQuery.patient.heightCm
            ? `${publicProfileQuery.patient.heightCm} سم`
            : "—",
          weightLabel: publicProfileQuery.patient.weightKg
            ? `${publicProfileQuery.patient.weightKg} كغ`
            : "—",
          measurementUnitLabel:
            publicProfileQuery.patient.measurementUnit === "metric"
              ? "متري"
              : (publicProfileQuery.patient.measurementUnit ?? "—"),
        };
      }
      return { ...base, relationshipState };
    });

    if (filters.relationship !== "all") {
      return enhancedPatients.filter(
        (p) => p.relationshipState === filters.relationship,
      );
    }

    return enhancedPatients;
  }, [
    accessResolutionByPatientId,
    expandedId,
    listQuery.patients,
    pendingAccessByPatient,
    publicProfileQuery.patient,
    filters.relationship,
  ]);

  const patientFilesLoading =
    expandedId !== null &&
    activeTab === "files" &&
    !expandedPatientIsTemporary &&
    patientFilesQuery.isAwaitingData;

  const handlePatientFileOpen = async (patientId: string, fileId: string) => {
    if (!doctorId) return;
    setPatientFileActionKey(fileId);
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
        title: "تعذر فتح الملف",
        variant: "error",
      });
    } finally {
      setPatientFileActionKey(null);
    }
  };

  const handlePatientFileDownload = async (patientId: string, fileId: string) => {
    if (!doctorId) return;
    setPatientFileActionKey(fileId);
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
        title: "تعذر تحميل الملف",
        variant: "error",
      });
    } finally {
      setPatientFileActionKey(null);
    }
  };

  const handlePatientFileDelete = async (fileId: string) => {
    if (!expandedId) return;
    setPatientFileActionKey(fileId);
    try {
      const response = await deletePatientFileMutation.mutateAsync(fileId);
      toast(response.message ?? "تم حذف الملف بنجاح.", {
        title: "نجاح",
        variant: "success",
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: "تعذر حذف الملف",
        variant: "error",
      });
    } finally {
      setPatientFileActionKey(null);
    }
  };

  const handlePatientFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !expandedId) return;
    setPatientFileActionKey("upload");
    try {
      const response = await uploadPatientFileMutation.mutateAsync({ file });
      toast(response.message ?? "تم رفع الملف بنجاح.", {
        title: "نجاح",
        variant: "success",
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: "تعذر رفع الملف",
        variant: "error",
      });
    } finally {
      event.target.value = "";
      setPatientFileActionKey(null);
    }
  };

  return (
    <>
      <input
        id="doctor-patient-file-upload"
        type="file"
        className="hidden"
        onChange={handlePatientFileUpload}
      />
      <Helmet>
        <title>Patients • LMJ Health</title>
      </Helmet>
      {/* Overview section */}
      <div dir="rtl" lang="ar">
        {/* Overview section */}
        <DoctorDashboardOverview
          variant="patients"
          surface="mint"
          title="إجمالي مرضى الطبيب"
          subtitle={
            <span>
              <span className="font-extrabold text-primary">
                {patientsListFailed ? "—" : listQuery.total}
              </span>
              <span className="text-primary/90">
                {" "}
                — إجمالي المرضى حسب الحالة
              </span>
            </span>
          }
          onActionClick={() => setTempPatientOpen(true)}
          actionLabel="إضافة مريض مؤقت"
          kpis={[
            {
              key: "active",
              icon: <UserCheck className="w-5 h-5 shrink-0" />,
              value: statusCounts.loading ? "—" : statusCounts.active,
              label: "نشط",
            },
            {
              key: "temporary",
              icon: <UserRoundPlus className="w-5 h-5 shrink-0" />,
              value: statusCounts.loading ? "—" : statusCounts.temporary,
              label: "مؤقت",
            },
            {
              key: "suspended",
              icon: <UserMinus className="w-5 h-5 shrink-0" />,
              value: statusCounts.loading ? "—" : statusCounts.suspended,
              label: "معلّق",
            },
          ]}
        />
        {/* Create temporary patient dialog */}
        <CreateTemporaryPatientDialog
          open={tempPatientOpen}
          onOpenChange={setTempPatientOpen}
          busy={createTempMutation.isPending}
          onSubmit={async (values) => {
            const response = await createTempMutation.mutateAsync(values);
            toast(response.message ?? "تم إنشاء وربط المريض المؤقت.", {
              title: "نجاح",
              variant: "success",
            });
          }}
        />
        {/* شريط تصفية احترافي — البحث الرئيسي ~50% على الشاشات الواسعة */}
        <section
          className="my-5 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_20px_50px_rgba(15,143,139,0.08),0_2px_8px_rgba(0,0,0,0.04)]"
          aria-label="تصفية قائمة المرضى"
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
                    تصفية قائمة المرضى
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
                    {patientsListFailed ? "—" : listQuery.total || 0}
                  </span>
                  <span className="font-extrabold text-[#667085]">نتيجة</span>
                </output>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 space-y-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:gap-6">
              {/* بحث رئيسي: نصف عرض الحاوية على xl */}
              <div className="w-full flex-[0_0_auto] xl:w-1/2 xl:max-w-[50%]">
                <label
                  htmlFor="doctor-patients-search"
                  className="flex gap-2 justify-between items-center mb-2"
                >
                  <span className="inline-flex items-center gap-1.5 font-cairo text-[12px] font-extrabold text-[#111827]">
                    <Users className="h-3.5 w-3.5 text-primary" aria-hidden />
                    البحث عن المريض
                  </span>
                  <span className="hidden font-cairo text-[10px] font-bold uppercase tracking-wider text-[#98A2B3] sm:inline">
                    الاسم · البريد · الهاتف · الرقم العام
                  </span>
                </label>
                <div className="relative group">
                  <input
                    id="doctor-patients-search"
                    type="search"
                    enterKeyHint="search"
                    autoComplete="off"
                    placeholder="ابدأ بالكتابة: الاسم، البريد، الهاتف، أو الرقم العام..."
                    className="h-[48px] w-full rounded-xl border-2 border-[#E8ECF3] bg-gradient-to-b from-[#FBFCFD] to-white pe-12 ps-4 font-cairo text-[13px] font-bold text-[#111827] shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-[border-color,box-shadow,background] placeholder:text-[#98A2B3] hover:border-[#D0D8E6] focus:border-primary focus:bg-white focus:shadow-[0_0_0_4px_rgba(15,143,139,0.12),inset_0_1px_2px_rgba(0,0,0,0.02)]"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                        page: 1,
                      }))
                    }
                  />
                  <div className="pointer-events-none absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-focus-within:bg-primary/[0.14]">
                    <Search className="h-[18px] w-[18px]" strokeWidth={2.25} />
                  </div>
                </div>
              </div>

              {/* فلاتر ثانوية في شبكة مدمجة */}
              <div className="grid flex-1 grid-cols-1 gap-3 min-w-0 sm:grid-cols-2 lg:grid-cols-3">
                <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                  <label
                    htmlFor="doctor-patients-diagnosis"
                    className="mb-2 flex items-center gap-1.5 font-cairo text-[11px] font-extrabold text-[#667085]"
                  >
                    <Stethoscope className="h-3.5 w-3.5 text-primary/80 shrink-0" aria-hidden />
                    التشخيص / الملاحظات
                  </label>
                  <input
                    id="doctor-patients-diagnosis"
                    type="text"
                    placeholder="كلمة في التشخيص..."
                    value={filters.diagnosis}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        diagnosis: e.target.value,
                        page: 1,
                      }))
                    }
                    className="h-[42px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-right font-cairo text-[12px] font-bold text-[#111827] shadow-sm outline-none transition-all placeholder:text-[#98A2B3] hover:border-[#D0D5DD] focus:border-primary/45 focus:ring-2 focus:ring-primary/12"
                  />
                </div>

                <div className="relative min-w-0">
                  <label
                    htmlFor="doctor-patients-account-status"
                    className="mb-2 block font-cairo text-[11px] font-extrabold text-[#667085]"
                  >
                    حالة الحساب
                  </label>
                  <StyledSelect
                    id="doctor-patients-account-status"
                    size="sm"
                    tone="muted"
                    value={filters.account_status}
                    onChange={(v) =>
                      setFilters((prev) => ({
                        ...prev,
                        account_status: (v as FilterStatus) || "all",
                        page: 1,
                      }))
                    }
                    options={[
                      { value: "all", label: "جميع الحالات" },
                      { value: "active", label: "نشط" },
                      { value: "temporary", label: "مؤقت" },
                      { value: "suspended", label: "معلق" },
                    ]}
                    listboxAriaLabel="حالة الحساب"
                  />
                </div>

                <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
                  <label
                    htmlFor="doctor-patients-relationship"
                    className="mb-2 block font-cairo text-[11px] font-extrabold text-[#667085]"
                  >
                    علاقة الوصول
                  </label>
                  <StyledSelect
                    id="doctor-patients-relationship"
                    size="sm"
                    tone="muted"
                    value={filters.relationship}
                    onChange={(v) =>
                      setFilters((prev) => ({
                        ...prev,
                        relationship: (v as RelationshipFilter) || "all",
                        page: 1,
                      }))
                    }
                    className="lg:min-w-0"
                    options={[
                      { value: "all", label: "كل العلاقات" },
                      { value: "full-access", label: "وصول كامل" },
                      { value: "linked-only", label: "مرتبط فقط" },
                      { value: "temporary", label: "مؤقت" },
                      { value: "access-pending", label: "قيد الانتظار" },
                      { value: "active-encounter", label: "زيارة جارية" },
                      { value: "restricted", label: "محجوب" },
                      {
                        value: "relationship-indeterminate",
                        label: "لم تُعرَف بعد (وسِّع البطاقة)",
                      },
                    ]}
                    listboxAriaLabel="علاقة الوصول"
                  />
                </div>
              </div>
            </div>

            {/* فترة آخر زيارة — شريط زمني متماسك */}
            <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFBFC]/90 px-4 py-4 sm:px-5">
              <div className="flex flex-wrap gap-2 items-center mb-3 text-right">
                <Calendar className="w-4 h-4 text-primary shrink-0" aria-hidden />
                <span className="font-cairo text-[12px] font-extrabold text-[#344054]">
                  نطاق تاريخ آخر زيارة
                </span>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-5">
                <div className="flex min-w-[200px] flex-1 flex-col gap-1.5 sm:max-w-xs">
                  <span className="font-cairo text-[10px] font-extrabold uppercase tracking-wide text-[#667085]">
                    من تاريخ
                  </span>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        from: e.target.value,
                        page: 1,
                      }))
                    }
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
                    إلى تاريخ
                  </span>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        to: e.target.value,
                        page: 1,
                      }))
                    }
                    className="h-[40px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-semibold text-[#111827] shadow-sm outline-none transition-all focus:border-primary/45 focus:ring-2 focus:ring-primary/12"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Patients list section */}
        <section className="space-y-3">
          {patientsListFailed ? (
            <DoctorListErrorState
              title={patientsLoadErrorPresentation.title}
              brief={patientsLoadErrorPresentation.brief}
              detail={patientsLoadErrorPresentation.detail}
              showTechnicalDetail={
                patientsLoadErrorPresentation.showTechnicalDetail
              }
              retrying={retryingPatientsList}
              onRetry={() => void retryPatientsList()}
            />
          ) : false ? (
            <div
              className="flex flex-col justify-center items-center  rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center shadow-sm"
              role="alert"
            >
              <AlertCircle
                className="mb-4 text-center h-11 w-11 text-[#B42318]"
                aria-hidden
              />
              <div className="font-cairo text-[15px] font-extrabold text-[#B42318]">
                تعذّر تحميل مرضى الطبيب
              </div>
              <p className="mt-2 font-cairo text-[13px] font-semibold leading-7 text-[#7A271A]">
                {getPatientsListErrorMessage(listQuery.error)}
              </p>
              <button
                type="button"
                onClick={() => listQuery.refetch()}
                className="mt-6 inline-flex h-[40px] min-w-[160px] items-center justify-center rounded-xl bg-primary px-5 font-cairo text-[13px] font-extrabold text-white shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : patientsListPending ? (
            <DoctorTableSkeleton rows={8} columns={5} />
          ) : listQuery.patients.length === 0 ? (
            listQuery.total === 0 ? (
              <PatientTabEmptyIllustration
                variant="teal"
                imageSrc="/images/photo-not-found-patient.png"
                imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.1)]"
                title="لا يوجد مرضى مضافة بعد"
                subtitle="قم بإضافة مريض جديد الآن"
                actionLabel="إضافة مريض"
                onAction={() => setTempPatientOpen(true)}
                actionIcon={<UserRoundPlus className="w-4 h-4" />}
              />
            ) : (
              <div className="rounded-2xl border border-[#E8ECF3] bg-white px-6 py-12 text-center shadow-sm">
                <Users className="mx-auto h-12 w-12 text-[#D0D5DD]" aria-hidden />
                <p className="mt-4 font-cairo text-[14px] font-semibold leading-relaxed text-[#667085]">
                  لا توجد مرضى في هذه الصفحة وفقًا لعدد النتائج الإجمالي. جرّب
                  العودة إلى صفحة سابقة أو تعديل عدد النتائج بالصفحة.
                </p>
              </div>
            )
          ) : cardPatients.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white px-6 py-12 text-center shadow-sm">
              <Users className="mx-auto h-12 w-12 text-[#D0D5DD]" aria-hidden />
              <p className="mt-4 font-cairo text-[14px] font-semibold text-[#667085]">
                لا يوجد مرضى يطابقون فلتر «علاقة الوصول» الحالي ضمن الصفحة
                المعروضة. جرّب اختيار «كل العلاقات» أو غيّر الفلاتر الأخرى.
              </p>
            </div>
          ) : (
            cardPatients.map((patient) => (
              <DoctorPatientExpandableCard
                key={patient.id}
                patient={patient}
                expanded={expandedId === patient.id}
                activeTab={expandedId === patient.id ? activeTab : "basic"}
                onChangeTab={(tab) => {
                  setExpandedId(patient.id);
                  setActiveTab(tab);
                }}
                onToggle={() => {
                  setExpandedId((current) =>
                    current === patient.id ? null : patient.id,
                  );
                  setActiveTab("basic");
                }}
                detailsLoading={
                  expandedId === patient.id &&
                  (publicProfileQuery.isAwaitingData ||
                    fullProfileQuery.isAwaitingData ||
                    patientFilesLoading)
                }
                fullProfile={expandedId === patient.id ? fullProfileData : null}
                accessRequired={
                  expandedId === patient.id ? accessRequired : false
                }
                accessPending={
                  expandedId === patient.id ? accessPending : false
                }
                accessMessage={
                  expandedId === patient.id ? accessMessage : undefined
                }
                pendingRequestId={
                  expandedId === patient.id
                    ? (pendingRequestIdFromQuery ??
                      effectivePendingAccess?.pendingRequestId ??
                      null)
                    : null
                }
                onUploadFile={() =>
                  document.getElementById("doctor-patient-file-upload")?.click()
                }
                onOpenFile={(fileId) => handlePatientFileOpen(patient.id, fileId)}
                onDownloadFile={(fileId) =>
                  handlePatientFileDownload(patient.id, fileId)
                }
                onDeleteFile={handlePatientFileDelete}
                fileActionKey={patientFileActionKey}
                onOpenDetails={() => {
                  navigate(`/doctor/patients/${patient.id}`, {
                    state: { patient },
                  });
                }}
                onStartConsultation={() =>
                  toast(
                    "تدفق بدء الاستشارة يرتبط بوحدة encounters/consultations التالية.",
                    {
                      title: "مرتبط بمسار آخر",
                      variant: "info",
                      durationMs: 4200,
                    },
                  )
                }
                onRequestAccess={async () => {
                  if (!doctorId) {
                    toast("تعذر تحديد هوية الطبيب الحالية لإنشاء طلب الوصول.", {
                      title: "خطأ",
                      variant: "error",
                    });
                    return;
                  }
                  try {
                    const response = await requestAccessMutation.mutateAsync({
                      patientId: patient.id,
                      body: {
                        reason:
                          "طلب وصول للملف الطبي الكامل لمتابعة الحالة الصحية",
                      },
                    });

                    // Update local state to reflect pending access
                    if (response.request?._id) {
                      setPendingAccessByPatient((prev) => ({
                        ...prev,
                        [patient.id]: {
                          pendingRequestId: response.request._id,
                          message: response.message,
                        },
                      }));
                    }

                    toast(response.message ?? "تم إرسال طلب الوصول بنجاح.", {
                      title: "نجاح",
                      variant: "success",
                      durationMs: 4000,
                    });
                  } catch (error) {
                    toast(
                      error instanceof Error
                        ? error.message
                        : "تعذر إنشاء طلب الوصول.",
                      {
                        title: "خطأ",
                        variant: "error",
                      },
                    );
                  }
                }}
              />
            ))
          )}
        </section>
        {/* Modern pagination section - Admin style */}
        <section className="mt-5 flex flex-col gap-4 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-right font-cairo text-[12px] font-bold text-[#667085]">
            الصفحة {filters.page} من {totalPages}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="w-[118px] shrink-0">
              <StyledSelect
                size="xs"
                tone="emphasis"
                disabled={!patientsListReady}
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
              disabled={filters.page <= 1 || !patientsListReady}
              className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
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
              disabled={filters.page >= totalPages || !patientsListReady}
              className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              التالي
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
