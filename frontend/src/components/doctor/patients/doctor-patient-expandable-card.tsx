import { cn } from "@/lib/utils/utils";
import { memo } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Link2,
  Phone,
  ShieldAlert,
  Stethoscope,
  UserRound,
} from "lucide-react";
import {
  determinePatientState,
  getPatientStateInfo,
  getStateActions,
  getStateMessage,
  type PatientRelationshipState,
} from "@/lib/doctor/patients/patient-states";
import { useI18n } from "@/i18n/provider";

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
  relationshipState: PatientRelationshipState;
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

export type DoctorPatientExpandableCardProps = {
  patient: DoctorPatientExpandableCardData;
  expanded: boolean;
  activeTab: PatientCardTab;
  onChangeTab: (tab: PatientCardTab) => void;
  onToggle: () => void;
  onOpenDetails?: () => void;
  onStartConsultation?: () => void;
  onRequestAccess?: () => void;
  fullProfile?: FullProfileData | null;
  detailsLoading?: boolean;
  accessRequired?: boolean;
  accessMessage?: string;
  accessPending?: boolean;
  pendingRequestId?: string | null;
  hasActiveEncounter?: boolean;
  onUploadFile?: () => void;
  onOpenFile?: (fileId: string) => void;
  onDownloadFile?: (fileId: string) => void;
  onDeleteFile?: (fileId: string) => void;
  fileActionKey?: string | null;
};

const QuickInfo = memo<{ label: string; value: string }>(function QuickInfo({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-[#E4E7EC] bg-[#F8FAFC] px-3 py-3 text-start">
      <div className="font-cairo text-[11px] font-bold text-[#667085]">
        {label}
      </div>
      <div className="mt-1 font-cairo text-[13px] font-extrabold text-[#101828]">
        {value}
      </div>
    </div>
  );
});

const DoctorPatientExpandableCard = memo(function DoctorPatientExpandableCard({
  patient,
  expanded,
  onToggle,
  onOpenDetails,
  onStartConsultation,
  onRequestAccess,
  accessRequired,
  accessMessage,
  accessPending,
  pendingRequestId,
  hasActiveEncounter,
}: DoctorPatientExpandableCardProps) {
  const { t } = useI18n();
  const digits = patient.phone.replace(/\D/g, "");
  const phoneDisplay =
    digits.startsWith("966") && digits.length >= 12
      ? `+${digits}`
      : digits.startsWith("5") && digits.length >= 9
        ? `+966${digits}`
        : digits.startsWith("05")
          ? `+966${digits.slice(1)}`
          : patient.phone;

  const relationshipState: PatientRelationshipState = expanded
    ? determinePatientState({
        isTemporary: patient.isTemporary ?? false,
        accessRequired: accessRequired ?? false,
        accessPending: accessPending ?? false,
        hasActiveEncounter: hasActiveEncounter ?? false,
        accountStatus: patient.accountStatusKey,
        relationshipKnown: true,
      })
    : patient.relationshipState;

  const stateInfo = getPatientStateInfo(relationshipState);
  const stateMessage = getStateMessage(relationshipState, pendingRequestId);
  const stateActions = getStateActions(relationshipState);

  const statusTone =
    patient.accountStatusKey === "temporary"
      ? "bg-[#FFF4ED] text-[#C4320A] ring-[#FED7AA]"
      : patient.accountStatusKey === "suspended"
        ? "bg-[#FEF2F2] text-[#B42318] ring-[#FECACA]"
        : "bg-[#ECFDF3] text-[#027A48] ring-[#ABEFC6]";

  const StateIcon =
    stateInfo.icon === "link"
      ? Link2
      : stateInfo.icon === "clock"
        ? Clock
        : stateInfo.icon === "check"
          ? CheckCircle2
          : stateInfo.icon === "stethoscope"
            ? Stethoscope
            : ShieldAlert;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white transition-shadow",
        expanded && "shadow-[0_12px_24px_rgba(15,143,139,0.08)]",
        !expanded && "shadow-[0px_4px_12px_rgba(0,0,0,0.06)]",
      )}
    >
      <div className="px-4 py-4 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-1 gap-3 items-start min-w-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_18px_rgba(15,143,139,0.22)]">
              <UserRound className="w-7 h-7" aria-hidden strokeWidth={1.75} />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5 text-start">
              <div className="font-cairo text-[17px] font-extrabold leading-tight text-primary">
                {patient.name}
              </div>

              <div className="flex flex-wrap gap-2 items-center">
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
                {t('doctor.patientCard.fileNumber').replace(
                  '{fileNo}',
                  patient.fileNo,
                )}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-start gap-x-4 gap-y-2 font-cairo text-[13px] font-semibold text-[#667085]">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-4 h-4 shrink-0 text-primary" />
                  <span
                    dir="ltr"
                    className="text-end font-semibold text-[#344054]"
                  >
                    {phoneDisplay}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>
                    {t('doctor.patientCard.lastVisit')}{" "}
                    <span className="text-[#1F2937]">{patient.lastVisit}</span>
                  </span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-expanded={expanded}
            aria-label={
              expanded
                ? t('doctor.patientCard.collapseQuickView')
                : t('doctor.patientCard.expandQuickView')
            }
            onClick={onToggle}
            className="flex h-9 w-9 shrink-0 self-end items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#344054] transition-colors hover:border-primary hover:text-primary sm:self-auto"
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
            "grid duration-300 ease-out transition-[grid-template-rows]",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden min-h-0">
            <div className="mt-4 border-t border-[#EEF2F6] pt-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <QuickInfo
                  label={t('doctor.patientCard.bloodType')}
                  value={patient.bloodType}
                />
                <QuickInfo
                  label={t('doctor.patientCard.allergies')}
                  value={
                    patient.allergies.length
                      ? t('doctor.patientCard.itemsCount').replace(
                          '{count}',
                          String(patient.allergies.length),
                        )
                      : t('doctor.patientCard.none')
                  }
                />
                <QuickInfo
                  label={t('doctor.patientCard.chronicConditions')}
                  value={
                    patient.medicalConditions.length
                      ? t('doctor.patientCard.itemsCount').replace(
                          '{count}',
                          String(patient.medicalConditions.length),
                        )
                      : t('doctor.patientCard.none')
                  }
                />
                <QuickInfo
                  label={t('doctor.patientCard.accessStatus')}
                  value={stateInfo.label}
                />
              </div>

              <div
                className={cn(
                  "mt-4 rounded-2xl border px-4 py-4",
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
                  <StateIcon className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="flex-1 text-start">
                    <div className="font-cairo text-[14px] font-extrabold">
                      {stateMessage.title}
                    </div>
                    <p className="mt-1 font-cairo text-[13px] font-semibold leading-6">
                      {accessMessage ?? stateMessage.body}
                    </p>
                    {pendingRequestId ? (
                      <div className="mt-2 font-cairo text-[12px] font-bold opacity-80">
                        {t('doctor.patientCard.requestNumber')} {pendingRequestId}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 mt-5 md:grid-cols-3">
                {onOpenDetails ? (
                  <button
                    type="button"
                    onClick={onOpenDetails}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] border-2 border-primary/20 bg-[#F8FFFE] px-2 font-cairo text-[13px] font-extrabold text-primary transition-colors hover:bg-[#F0F9F9]"
                  >
                    <FileText className="w-4 h-4 shrink-0" aria-hidden />
                    <span className="truncate">
                      {t('doctor.patientCard.openPatientFile')}
                    </span>
                  </button>
                ) : null}

                {stateActions.primary ? (
                  <button
                    type="button"
                    onClick={
                      stateActions.primary.action === "start-encounter"
                        ? onStartConsultation
                        : stateActions.primary.action === "request-access"
                          ? onRequestAccess
                          : undefined
                    }
                    disabled={
                      !stateInfo.canStartEncounter &&
                      !stateInfo.canRequestAccess
                    }
                    className={cn(
                      "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] px-2 font-cairo text-[13px] font-extrabold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                      stateActions.primary.variant === "primary"
                        ? "bg-primary text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)] hover:bg-[#0d7a77]"
                        : "border-2 border-primary bg-[#F0F9F9] text-primary hover:bg-[#E6F4F4]",
                    )}
                  >
                    {stateActions.primary.action === "start-encounter" ? (
                      <Stethoscope className="w-4 h-4 shrink-0" aria-hidden />
                    ) : (
                      <Link2 className="w-4 h-4 shrink-0" aria-hidden />
                    )}
                    <span className="truncate">
                      {stateActions.primary.label}
                    </span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={onToggle}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] border-2 border-[#E5E7EB] bg-white px-2 font-cairo text-[13px] font-extrabold text-[#344054] transition-colors hover:bg-[#F9FAFB]"
                >
                  <ChevronDown className="w-4 h-4 shrink-0" aria-hidden />
                  <span className="truncate">
                    {expanded
                      ? t('doctor.patientCard.hidePreview')
                      : t('doctor.patientCard.showPreview')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DoctorPatientExpandableCard;
