import { cn } from "@/lib/utils/utils";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Heart,
  Hourglass,
  Link2,
  Phone,
  ShieldAlert,
  Stethoscope,
  UserRound,
} from "lucide-react";
import {
  determinePatientState,
  getPatientStateInfo,
  getStateMessage,
  getStateActions,
  type PatientRelationshipState,
} from "@/lib/doctor/patient-states";

export type PatientCardTab =
  | "basic"
  | "history"
  | "medications"
  | "tests"
  | "files"
  | "appointments";

export type DoctorPatientExpandableCardData = {
  id: string;
  fileNo: string;
  name: string;
  accountStatusLabel: string;
  accountStatusKey?: "active" | "temporary" | "suspended";
  isTemporary?: boolean;
  phone: string;
  lastVisit: string;
  allergies: string[];
  medicalConditions: string[];
  bloodType: string;
  heightLabel: string;
  weightLabel: string;
  measurementUnitLabel: string;
};

type FullProfileData = {
  medicalHistory: Array<{
    id: string;
    title: string;
    diagnosis: string;
    date: string;
  }>;
  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
  }>;
  files: Array<{
    id: string;
    name: string;
    createdAt: string;
  }>;
  orders: Array<{
    id: string;
    title: string;
    status: string;
  }>;
};

const TABS: { id: PatientCardTab; label: string }[] = [
  { id: "basic", label: "معلومات أساسية" },
  { id: "history", label: "السجل الطبي" },
  { id: "medications", label: "الأدوية" },
  { id: "tests", label: "الطلبات" },
  { id: "files", label: "الملفات" },
  { id: "appointments", label: "المواعيد" },
];

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-white bg-[#E6F4F4] px-4 py-3 font-cairo shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]">
      <span className="min-w-0 text-right text-[15px] font-bold text-primary">
        {label}
      </span>
      <span className="min-w-0 text-left text-[15px] font-semibold text-[#1F2937]">
        {value}
      </span>
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <p className="rounded-[10px] border border-dashed border-[#E5E7EB] bg-[#FAFBFC] px-4 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]">
      {message}
    </p>
  );
}

export type DoctorPatientExpandableCardProps = {
  patient: DoctorPatientExpandableCardData;
  expanded: boolean;
  activeTab: PatientCardTab;
  onChangeTab: (tab: PatientCardTab) => void;
  onToggle: () => void;
  onStartConsultation?: () => void;
  onRequestAccess?: () => void;
  fullProfile?: FullProfileData | null;
  detailsLoading?: boolean;
  accessRequired?: boolean;
  accessMessage?: string;
  accessPending?: boolean;
  pendingRequestId?: string | null;
  hasActiveEncounter?: boolean;
};

export default function DoctorPatientExpandableCard({
  patient,
  expanded,
  activeTab,
  onChangeTab,
  onToggle,
  onStartConsultation,
  onRequestAccess,
  fullProfile,
  detailsLoading,
  accessRequired,
  accessMessage,
  accessPending,
  pendingRequestId,
  hasActiveEncounter,
}: DoctorPatientExpandableCardProps) {
  const digits = patient.phone.replace(/\D/g, "");
  const phoneDisplay =
    digits.startsWith("966") && digits.length >= 12
      ? `+${digits}`
      : digits.startsWith("5") && digits.length >= 9
        ? `+966${digits}`
        : digits.startsWith("05")
          ? `+966${digits.slice(1)}`
          : patient.phone;

  // Determine patient relationship state
  const relationshipState = determinePatientState({
    isTemporary: patient.isTemporary ?? false,
    accessRequired: accessRequired ?? false,
    accessPending: accessPending ?? false,
    hasActiveEncounter: hasActiveEncounter ?? false,
    accountStatus: patient.accountStatusKey,
  });

  const stateInfo = getPatientStateInfo(relationshipState);
  const stateMessage = getStateMessage(relationshipState, pendingRequestId);
  const stateActions = getStateActions(relationshipState);

  const statusTone =
    patient.accountStatusKey === "temporary"
      ? "bg-[#FFF4ED] text-[#C4320A] ring-[#FED7AA]"
      : patient.accountStatusKey === "suspended"
        ? "bg-[#FEF2F2] text-[#B42318] ring-[#FECACA]"
        : "bg-[#ECFDF3] text-[#027A48] ring-[#ABEFC6]";

  const StateIcon = stateInfo.icon === 'link' ? Link2
    : stateInfo.icon === 'clock' ? Clock
    : stateInfo.icon === 'hourglass' ? Hourglass
    : stateInfo.icon === 'check' ? CheckCircle2
    : stateInfo.icon === 'stethoscope' ? Stethoscope
    : ShieldAlert;

  const renderRestrictedPanel = () => {
    const messageTypeColor = stateMessage.type === 'error' 
      ? 'border-[#FECACA] bg-[#FEF2F2] text-[#B42318]'
      : stateMessage.type === 'warning'
      ? 'border-[#FEDF89] bg-[#FFFAEB] text-[#B54708]'
      : stateMessage.type === 'success'
      ? 'border-[#ABEFC6] bg-[#ECFDF3] text-[#027A48]'
      : 'border-[#B2DDFF] bg-[#EFF8FF] text-[#175CD3]';

    return (
      <div className={cn('rounded-[12px] border px-4 py-5', messageTypeColor)}>
        <div className="flex items-start gap-3">
          <StateIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1 text-right">
            <div className="font-cairo text-[14px] font-extrabold">
              {stateMessage.title}
            </div>
            <p className="mt-1 font-cairo text-[13px] font-semibold leading-6">
              {stateMessage.body}
            </p>
            {pendingRequestId ? (
              <div className="mt-3 font-cairo text-[12px] font-bold opacity-80">
                رقم الطلب: {pendingRequestId}
              </div>
            ) : null}
            {stateInfo.canRequestAccess && onRequestAccess ? (
              <button
                type="button"
                onClick={onRequestAccess}
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-current bg-white px-4 font-cairo text-[13px] font-extrabold hover:opacity-90 transition-opacity"
              >
                <Link2 className="h-4 w-4" />
                إرسال طلب وصول
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  const renderFullTab = () => {
    if (detailsLoading) {
      return <EmptyPanel message="جارِ تحميل بيانات المريض..." />;
    }

    if (accessRequired) {
      return renderRestrictedPanel();
    }

    if (!fullProfile) {
      return (
        <EmptyPanel message="لا توجد بيانات إضافية متاحة لهذا المريض حالياً." />
      );
    }

    if (activeTab === "history") {
      return fullProfile.medicalHistory.length ? (
        <div className="space-y-2">
          {fullProfile.medicalHistory.map((record) => (
            <div
              key={record.id}
              className="rounded-[10px] border border-[#E5E7EB] bg-[#FAFBFC] px-4 py-3 text-right"
            >
              <div className="font-cairo text-[14px] font-extrabold text-[#101828]">
                {record.title}
              </div>
              <div className="mt-1 font-cairo text-[13px] font-semibold text-[#475467]">
                {record.diagnosis}
              </div>
              <div className="mt-2 font-cairo text-[12px] font-bold text-[#98A2B3]">
                {record.date}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel message="لا توجد سجلات طبية مرتبطة بهذا المريض." />
      );
    }

    if (activeTab === "medications") {
      return fullProfile.medications.length ? (
        <div className="space-y-2">
          {fullProfile.medications.map((medication) => (
            <div
              key={medication.id}
              className="rounded-[10px] border border-[#E5E7EB] bg-[#FAFBFC] px-4 py-3 text-right"
            >
              <div className="font-cairo text-[14px] font-extrabold text-[#101828]">
                {medication.name}
              </div>
              <div className="mt-1 font-cairo text-[13px] font-semibold text-[#475467]">
                {medication.dosage} • {medication.frequency}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel message="لا توجد أدوية ظاهرة في الملف الحالي." />
      );
    }

    if (activeTab === "tests") {
      return fullProfile.orders.length ? (
        <div className="space-y-2">
          {fullProfile.orders.map((order) => (
            <div
              key={order.id}
              className="rounded-[10px] border border-[#E5E7EB] bg-[#FAFBFC] px-4 py-3 text-right"
            >
              <div className="font-cairo text-[14px] font-extrabold text-[#101828]">
                {order.title}
              </div>
              <div className="mt-1 font-cairo text-[13px] font-semibold text-[#475467]">
                الحالة: {order.status}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel message="لا توجد طلبات طبية مرتبطة في الملف." />
      );
    }

    if (activeTab === "files") {
      return fullProfile.files.length ? (
        <div className="space-y-2">
          {fullProfile.files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-3 rounded-[10px] border border-[#E5E7EB] bg-[#FAFBFC] px-4 py-3"
            >
              <div className="text-right">
                <div className="font-cairo text-[14px] font-extrabold text-[#101828]">
                  {file.name}
                </div>
                <div className="mt-1 font-cairo text-[12px] font-bold text-[#98A2B3]">
                  {file.createdAt}
                </div>
              </div>
              <FileText className="h-5 w-5 shrink-0 text-primary" />
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel message="لا توجد ملفات حالياً في الملف الظاهر." />
      );
    }

    if (activeTab === "appointments") {
      return (
        <EmptyPanel message="مرجع الـ API الحالي لا يعرّف قائمة مواعيد مستقلة داخل وحدة مرضى الطبيب، لذلك لم نبتكر مصدراً غير موثق هنا." />
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white transition-shadow",
        expanded && "shadow-[0_12px_24px_rgba(15,143,139,0.08)]",
        !expanded && "shadow-[0px_4px_12px_rgba(0,0,0,0.06)]",
      )}
    >
      <div className="px-4 py-4 sm:px-5 sm:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_18px_rgba(15,143,139,0.22)]">
              <UserRound className="h-7 w-7" aria-hidden strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5 text-right">
              <div className="font-cairo text-[17px] font-extrabold leading-tight text-primary">
                {patient.name}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 font-cairo text-[12px] font-extrabold ring-1 ring-inset",
                    statusTone,
                  )}
                >
                  {patient.accountStatusLabel}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-cairo text-[12px] font-extrabold ring-1 ring-inset",
                    stateInfo.color.bg,
                    stateInfo.color.text,
                    stateInfo.color.ring,
                  )}
                >
                  <StateIcon className="h-3.5 w-3.5" />
                  {stateInfo.label}
                </span>
              </div>
              <p className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                ملف #{patient.fileNo}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-start gap-x-4 font-cairo text-[13px] font-semibold text-[#667085]">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <span
                    dir="ltr"
                    className="text-left font-semibold text-[#344054]"
                  >
                    {phoneDisplay}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>
                    آخر زيارة:{" "}
                    <span className="text-[#1F2937]">{patient.lastVisit}</span>
                  </span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-expanded={expanded}
            aria-label={expanded ? "طي التفاصيل" : "عرض التفاصيل الكاملة"}
            onClick={onToggle}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#344054] transition-colors hover:border-primary hover:text-primary"
          >
            <ChevronDown
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                expanded && "-rotate-180",
              )}
            />
          </button>
        </div>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="mt-4 border-t border-[#EEF2F6] pt-4">
              <div className="grid grid-cols-2 gap-2 rounded-[12px] bg-[#E8EAEE] p-1 sm:grid-cols-3 lg:grid-cols-6">
                {TABS.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => onChangeTab(tab.id)}
                      className={cn(
                        "min-h-[42px] rounded-[10px] px-2 py-2 text-center font-cairo text-[12px] font-black transition-colors",
                        active
                          ? "bg-primary text-white shadow-[0_8px_18px_rgba(15,143,139,0.2)]"
                          : "text-[#4A5565]",
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
                  <div className="rounded-[12px] border border-[#E4E7EC] bg-[#F8FAFC] px-4 py-3 text-right">
                    <div className="font-cairo text-[12px] font-bold text-[#667085]">
                      ???? ?????
                    </div>
                    <div className="mt-1 font-cairo text-[14px] font-extrabold text-[#101828]">
                      ?????? ????? ???????
                    </div>
                  </div>
                  <div className="rounded-[12px] border border-[#E4E7EC] bg-[#F8FAFC] px-4 py-3 text-right">
                    <div className="font-cairo text-[12px] font-bold text-[#667085]">
                      حالة الوصول
                    </div>
                    <div className={cn(
                      "mt-1 font-cairo text-[14px] font-extrabold",
                      stateInfo.color.text
                    )}>
                      {stateInfo.label}
                    </div>
                  </div>
                  <div className="rounded-[12px] border border-[#E4E7EC] bg-[#F8FAFC] px-4 py-3 text-right">
                    <div className="font-cairo text-[12px] font-bold text-[#667085]">
                      الإجراءات المتاحة
                    </div>
                    <div className="mt-1 font-cairo text-[14px] font-extrabold text-[#101828]">
                      {stateInfo.canStartEncounter
                        ? "يمكن بدء زيارة طبية"
                        : stateInfo.canRequestAccess
                        ? "يحتاج طلب وصول"
                        : stateInfo.canViewFullProfile
                        ? "عرض متاح"
                        : "وصول محدود"}
                    </div>
                  </div>
                </div>

                {activeTab === "basic" ? (
                  <div className="space-y-3">
                    <div className="space-y-2.5">
                      <InfoRow label="فصيلة الدم" value={patient.bloodType} />
                      <InfoRow label="الطول" value={patient.heightLabel} />
                      <InfoRow label="الوزن" value={patient.weightLabel} />
                      <InfoRow
                        label="وحدة القياس"
                        value={patient.measurementUnitLabel}
                      />
                    </div>

                    <div className="rounded-[12px] bg-[#FEF2F2] px-4 py-3">
                      <div className="mb-2 flex items-start justify-start gap-2">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-[#B42318]" />
                        <div className="flex flex-col gap-2">
                          <span className="font-cairo text-[14px] font-extrabold text-[#B42318]">
                            الحساسية
                          </span>
                          <div className="flex flex-wrap justify-start gap-2">
                            {patient.allergies.length ? (
                              patient.allergies.map((value) => (
                                <span
                                  key={value}
                                  className="rounded-full bg-white/80 px-3 py-1 font-cairo text-[12px] font-bold text-[#B42318] ring-1 ring-[#FECACA]"
                                >
                                  {value}
                                </span>
                              ))
                            ) : (
                              <span className="font-cairo text-[13px] font-semibold text-[#667085]">
                                لا توجد حساسية مسجلة
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[12px] bg-[#FFF4ED] px-4 py-3">
                      <div className="mb-2 flex items-start justify-start gap-2">
                        <Heart className="h-5 w-5 shrink-0 text-[#EA580C]" />
                        <div className="flex flex-col gap-2">
                          <span className="font-cairo text-[14px] font-extrabold text-[#C4320A]">
                            الحالات المزمنة
                          </span>
                          <div className="flex flex-wrap justify-start gap-2">
                            {patient.medicalConditions.length ? (
                              patient.medicalConditions.map((value) => (
                                <span
                                  key={value}
                                  className="rounded-full bg-white/80 px-3 py-1 font-cairo text-[12px] font-bold text-[#C4320A] ring-1 ring-[#FDBA74]"
                                >
                                  {value}
                                </span>
                              ))
                            ) : (
                              <span className="font-cairo text-[13px] font-semibold text-[#667085]">
                                لا توجد حالات مزمنة مسجلة
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  renderFullTab()
                )}
              </div>

              <div className="mt-5 grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:gap-4">
                {stateActions.primary && (
                  <button
                    type="button"
                    onClick={
                      stateActions.primary.action === 'start-encounter'
                        ? onStartConsultation
                        : stateActions.primary.action === 'request-access'
                        ? onRequestAccess
                        : undefined
                    }
                    disabled={!stateInfo.canStartEncounter && !stateInfo.canRequestAccess}
                    className={cn(
                      "inline-flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-[8px] px-2 font-cairo text-[13px] font-extrabold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                      stateActions.primary.variant === 'primary'
                        ? "bg-primary text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)] hover:bg-[#0d7a77]"
                        : "border-2 border-primary bg-[#F0F9F9] text-primary hover:bg-[#E6F4F4]"
                    )}
                  >
                    {stateActions.primary.action === 'start-encounter' ? (
                      <Stethoscope className="h-4 w-4 shrink-0" aria-hidden />
                    ) : (
                      <Link2 className="h-4 w-4 shrink-0" aria-hidden />
                    )}
                    <span className="truncate">{stateActions.primary.label}</span>
                  </button>
                )}
                {stateActions.secondary && (
                  <button
                    type="button"
                    onClick={onToggle}
                    className="inline-flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-[8px] border-2 border-[#E5E7EB] bg-white px-2 font-cairo text-[13px] font-extrabold text-[#344054] transition-colors hover:bg-[#F9FAFB]"
                  >
                    <FileText className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="truncate">{stateActions.secondary.label}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

