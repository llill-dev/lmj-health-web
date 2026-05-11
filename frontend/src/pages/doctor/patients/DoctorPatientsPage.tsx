import DoctorDashboardOverview from "@/components/doctor/dashboard/doctor-dashboard-overview";
import DoctorPatientExpandableCard, {
  type DoctorPatientExpandableCardData,
  type PatientCardTab,
} from "@/components/doctor/patients/doctor-patient-expandable-card";
import CreateTemporaryPatientDialog from "@/components/doctor/patients/create-temporary-patient-dialog";
import {
  useCreateTemporaryDoctorPatient,
  useDoctorPatientFullProfile,
  useDoctorPatientPublicProfile,
  useDoctorPatients,
  useRequestDoctorPatientAccess,
} from "@/hooks";
import { Helmet } from "react-helmet-async";
import {
  Search,
  UserCheck,
  UserMinus,
  UserRoundPlus,
  Link2,
  Clock,
  Hourglass,
  CheckCircle2,
  Stethoscope,
  ShieldAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { readAuthUser } from "@/lib/cookies";
import { ApiError } from "@/lib/api";
import {
  determinePatientState,
  getPatientStateInfo,
  type PatientRelationshipState
} from "@/lib/doctor/patient-states";

type FilterStatus = "all" | "active" | "temporary" | "suspended";
type RelationshipFilter = "all" | PatientRelationshipState;
type PendingAccessState = Record<
  string,
  { pendingRequestId?: string | null; message?: string }
>;

function getPatientsListErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "تعذر تحميل قائمة المرضى من الخادم حالياً. حاول مجددًا بعد قليل.";
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

  return error.message || "تعذر تحميل قائمة المرضى من الخادم.";
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
}): DoctorPatientExpandableCardData {
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

export default function DoctorPatientsPage() {
  const { toast } = useToast();
  const authUser = readAuthUser();
  const doctorId = authUser?.actorIds?.doctorId ?? "";

  const [search, setSearch] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [relationshipFilter, setRelationshipFilter] = useState<RelationshipFilter>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PatientCardTab>("basic");
  const [tempPatientOpen, setTempPatientOpen] = useState(false);
  const [pendingAccessByPatient, setPendingAccessByPatient] =
    useState<PendingAccessState>({});

  const listQuery = useDoctorPatients({
    search: search || undefined,
    diagnosis: diagnosis || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    limit,
    account_status: statusFilter,
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

  const publicProfileQuery = useDoctorPatientPublicProfile(
    expandedId ?? "",
    Boolean(expandedId),
  );
  const fullProfileQuery = useDoctorPatientFullProfile(
    doctorId,
    expandedId ?? "",
    Boolean(expandedId && doctorId),
  );

  const createTempMutation = useCreateTemporaryDoctorPatient();
  const requestAccessMutation = useRequestDoctorPatientAccess(doctorId);

  const totalPages = Math.max(
    1,
    Math.ceil(listQuery.total / Math.max(limit, 1)),
  );
  const cardPatients = useMemo(() => {
    const enhancedPatients = listQuery.patients.map((patient) => {
      const base = toCardData(patient);

      // Determine relationship state for each patient
      const relationshipState = determinePatientState({
        isTemporary: base.isTemporary ?? false,
        accessRequired: false, // Will be determined when expanded
        accessPending: Boolean(pendingAccessByPatient[patient._id]),
        hasActiveEncounter: false, // TODO: Add encounter check
        accountStatus: base.accountStatusKey,
      });

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

    // Apply relationship filter
    if (relationshipFilter !== "all") {
      return enhancedPatients.filter(p => p.relationshipState === relationshipFilter);
    }

    return enhancedPatients;
  }, [expandedId, listQuery.patients, publicProfileQuery.patient, pendingAccessByPatient, relationshipFilter]);

  const statusCounts = {
    active: activeCountQuery.total,
    temporary: temporaryCountQuery.total,
    suspended: suspendedCountQuery.total,
    loading:
      activeCountQuery.isLoading ||
      temporaryCountQuery.isLoading ||
      suspendedCountQuery.isLoading,
  };

  const fullProfileData = fullProfileQuery.patient
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
        files: (fullProfileQuery.patient.files ?? []).map((file) => ({
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
    (typeof accessError?.message === "string" ? accessError.message : undefined);

  return (
    <>
      <Helmet>
        <title>Patients • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <DoctorDashboardOverview
          variant="patients"
          surface="mint"
          title="إجمالي مرضى الطبيب"
          subtitle={
            <span>
              <span className="font-extrabold text-primary">
                {listQuery.total}
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

        <section className="mb-5 rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <h3 className="mb-3 font-cairo text-[14px] font-extrabold text-[#111827]">
            تصفية حسب حالة العلاقة
          </h3>
          <div className="flex flex-wrap gap-2">
            {(['all', 'full-access', 'linked-only', 'temporary', 'access-pending', 'active-encounter', 'restricted'] as const).map((state) => {
              const isActive = relationshipFilter === state;
              const stateInfo = state !== 'all' ? getPatientStateInfo(state) : null;
              const StateIcon = state === 'all' ? UserCheck
                : state === 'full-access' ? CheckCircle2
                : state === 'linked-only' ? Link2
                : state === 'temporary' ? Clock
                : state === 'access-pending' ? Hourglass
                : state === 'active-encounter' ? Stethoscope
                : ShieldAlert;

              return (
                <button
                  key={state}
                  type="button"
                  onClick={() => {
                    setRelationshipFilter(state);
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-cairo text-[12px] font-bold transition-all ${
                    isActive
                      ? stateInfo
                        ? `${stateInfo.color.bg} ${stateInfo.color.text} ring-2 ${stateInfo.color.ring} ring-inset`
                        : 'bg-primary text-white ring-2 ring-primary ring-inset'
                      : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                  }`}
                >
                  <StateIcon className="h-3.5 w-3.5 shrink-0" />
                  {state === 'all' ? 'الكل'
                    : state === 'full-access' ? 'وصول كامل'
                    : state === 'linked-only' ? 'مرتبط فقط'
                    : state === 'temporary' ? 'مؤقت'
                    : state === 'access-pending' ? 'قيد الانتظار'
                    : state === 'active-encounter' ? 'زيارة جارية'
                    : 'محجوب'}
                </button>
              );
            })}
          </div>
        </section>

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

        <section className="mb-5 rounded-[6px] border border-[#E5E7EB] bg-white p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="mb-3 rounded-[10px] border border-[#D1E9E8] bg-[#F3FBFA] px-4 py-3 text-right font-cairo text-[13px] font-semibold leading-6 text-[#155E75]">
            هذه الصفحة تعتمد على <code dir="ltr">GET /api/doctors/patients</code>
            ، وهذا المسار يعرض المرضى المرتبطين بهذا الطبيب فقط. إنشاء مريض من
            لوحة الإدارة وحده لا يربطه بالطبيب تلقائياً، لذلك قد لا يظهر هنا حتى
            يتم عمل link له مع الطبيب.
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr),180px,180px]">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث من الباكند بالاسم أو البريد أو الهاتف أو الرقم العام"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-[6px] border border-[#E5E7EB] bg-white py-3 pl-4 pr-10 font-cairo text-[14px] font-semibold text-[#111827] placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-[#0F8F8B]/20"
              />
            </div>

            <input
              type="text"
              placeholder="بحث بالتشخيص"
              value={diagnosis}
              onChange={(e) => {
                setDiagnosis(e.target.value);
                setPage(1);
              }}
              className="rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-3 font-cairo text-[14px] font-semibold text-[#111827] placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-[#0F8F8B]/20"
            />

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as FilterStatus);
                setPage(1);
              }}
              className="rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-3 font-cairo text-[14px] font-semibold text-[#111827] focus:border-primary focus:outline-none focus:ring-2 focus:ring-[#0F8F8B]/20"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشط</option>
              <option value="temporary">مؤقت</option>
              <option value="suspended">معلّق</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-3 sm:grid-cols-3">
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              className="rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-3 font-cairo text-[14px] font-semibold text-[#111827]"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
              className="rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-3 font-cairo text-[14px] font-semibold text-[#111827]"
            />
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-3 font-cairo text-[14px] font-semibold text-[#111827]"
            >
              {[10, 20, 50].map((value) => (
                <option key={value} value={value}>
                  {value} / صفحة
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="space-y-3">
          {listQuery.isLoading ? (
            <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-6 py-10 text-center font-cairo text-[14px] font-semibold text-[#667085]">
              جارِ تحميل المرضى...
            </div>
          ) : listQuery.isError ? (
            <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-8 text-right font-cairo">
              <div className="text-[15px] font-extrabold text-[#B42318]">
                تعذر تحميل مرضى الطبيب
              </div>
              <p className="mt-2 text-[13px] font-semibold leading-6 text-[#7A271A]">
                {getPatientsListErrorMessage(listQuery.error)}
              </p>
            </div>
          ) : listQuery.patients.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-6 py-12 text-center font-cairo text-[14px] font-semibold text-[#667085]">
              لا توجد نتائج حالياً. إذا أنشأت المريض من admin فقط، فالغالب أنه
              غير مرتبط بهذا الطبيب بعد، لذلك لن يظهر في هذه القائمة.
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
                  (publicProfileQuery.isLoading || fullProfileQuery.isLoading)
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
                    ? pendingRequestIdFromQuery ??
                      effectivePendingAccess?.pendingRequestId ??
                      null
                    : null
                }
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
                        reason: "طلب وصول للملف الطبي الكامل لمتابعة الحالة الصحية",
                      },
                    });

                    // Update local state to reflect pending access
                    if (response.request?._id) {
                      setPendingAccessByPatient(prev => ({
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

        <section className="mt-5 flex items-center justify-between rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="font-cairo text-[12px] font-bold text-[#667085]">
            الصفحة {page} من {totalPages} • إجمالي {listQuery.total}
          </div>

          <div className="flex gap-3 items-center">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || listQuery.isFetching}
              className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:opacity-60"
            >
              السابق
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || listQuery.isFetching}
              className="inline-flex h-[36px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:opacity-60"
            >
              التالي
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
