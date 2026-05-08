import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Calendar,
  CalendarDays,
  ChevronDown,
  Heart,
  Link2,
  Phone,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useState } from "react";

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
  ageLabel: string;
  genderLabel: string;
  phone: string;
  lastVisit: string;
  lastVisitIso: string;
  weightKg: string;
  heightCm: string;
  bloodPressure: string;
  allergySummary: string;
  sensitivities: string[];
  chronicConditions: string[];
};

const TABS: { id: PatientCardTab; label: string }[] = [
  { id: "basic", label: "معلومات أساسية" },
  { id: "history", label: "التاريخ الطبي" },
  { id: "medications", label: "الأدوية" },
  { id: "tests", label: "التحاليل" },
  { id: "files", label: "الملفات" },
  { id: "appointments", label: "المواعيد" },
];

const TAB_SLIDER_PAD_PX = 4;
const TAB_COUNT = TABS.length;

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-[10px] border border-white",
        "bg-[#E6F4F4] px-4 py-3 font-cairo shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]",
      )}
    >
      <span className="min-w-0 text-right text-[15px] font-bold text-primary">
        {label}
      </span>
      <span className="min-w-0 text-left text-[15px] font-semibold text-[#1F2937]">
        {value}
      </span>
    </div>
  );
}

export type DoctorPatientExpandableCardProps = {
  patient: DoctorPatientExpandableCardData;
  expanded: boolean;
  onToggle: () => void;
  onStartConsultation?: () => void;
  onStartVisit?: () => void;
  onRequestAccess?: () => void;
};

export default function DoctorPatientExpandableCard({
  patient,
  expanded,
  onToggle,
  onStartConsultation,
  onStartVisit,
  onRequestAccess,
}: DoctorPatientExpandableCardProps) {
  const [activeTab, setActiveTab] = useState<PatientCardTab>("basic");

  const activeTabIndex = TABS.findIndex((t) => t.id === activeTab);
  const sliderIndex = activeTabIndex >= 0 ? activeTabIndex : 0;
  const sliderPad = TAB_SLIDER_PAD_PX * 2;
  const sliderSegmentStyle = {
    width: `calc((100% - ${sliderPad}px) / ${TAB_COUNT})`,
    insetInlineStart: `calc(${TAB_SLIDER_PAD_PX}px + ${sliderIndex} * (100% - ${sliderPad}px) / ${TAB_COUNT})`,
  } as const;

  const digits = patient.phone.replace(/\D/g, "");
  const phoneDisplay =
    digits.startsWith("966") && digits.length >= 12
      ? `+${digits}`
      : digits.startsWith("5") && digits.length >= 9
        ? `+966${digits}`
        : digits.startsWith("05")
          ? `+966${digits.slice(1)}`
          : patient.phone;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white transition-shadow",
        expanded && "shadow-[0_12px_24px_rgba(15,143,139,0.08)]",
        !expanded && "shadow-[0px_4px_12px_rgba(0,0,0,0.06)]",
      )}
    >
      <div className="px-4 py-4 sm:px-5 sm:py-4">
        <div className="flex gap-3 justify-between items-start">
          <div className="flex flex-1 gap-3 items-start min-w-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_18px_rgba(15,143,139,0.22)]">
              <UserRound className="w-7 h-7" aria-hidden strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5 text-right">
              <div className="font-cairo text-[17px] font-extrabold leading-tight text-primary">
                {patient.name}
              </div>
              <div className="font-cairo text-[13px] font-semibold text-[#667085]">
                {patient.ageLabel}
                <span className="mx-2 text-[#D0D5DD]">•</span>
                {patient.genderLabel}
              </div>
              <p className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                ملف #{patient.fileNo}
              </p>
              <div className="flex flex-wrap mt-4 items-center justify-start gap-x-4 font-cairo text-[13px] font-semibold text-[#667085]">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-4 h-4 shrink-0 text-primary" />
                  <span
                    dir="ltr"
                    className="text-left font-semibold text-[#344054]"
                  >
                    {phoneDisplay}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>
                    آخر زيارة:{` `}
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
            "grid duration-300 ease-out transition-[grid-template-rows]",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden min-h-0">
            <div className="mt-4 border-t border-[#EEF2F6] pt-4">
              <div
                className="relative w-full min-w-0 rounded-[12px] bg-[#E8EAEE] p-1 shadow-[inset_0_1px_2px_rgba(15,23,42,0.06)]"
                role="tablist"
                aria-label="أقسام بطاقة المريض"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-1 rounded-[10px] bg-primary shadow-[0_4px_14px_rgba(15,143,139,0.32)] transition-[inset-inline-start] duration-200 ease-out"
                  style={sliderSegmentStyle}
                />
                <div
                  className="relative z-[1] grid min-h-[44px] w-full min-w-0 gap-0"
                  style={{
                    gridTemplateColumns: `repeat(${TAB_COUNT}, minmax(0, 1fr))`,
                  }}
                >
                  {TABS.map(({ id, label }) => {
                    const active = activeTab === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveTab(id)}
                        className={cn(
                          "flex min-h-[44px] min-w-0 items-center justify-center whitespace-normal px-0.5 py-1 text-center font-cairo text-[12px] font-black leading-[16px] transition-colors duration-200",
                          active
                            ? "text-white"
                            : "text-[#4A5565]",
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4">
                {activeTab === "basic" ? (
                  <div className="space-y-3">
                    <div className="space-y-2.5">
                      <InfoRow label="الوزن" value={patient.weightKg} />
                      <InfoRow label="الطول" value={patient.heightCm} />
                      <InfoRow label="ضغط الدم" value={patient.bloodPressure} />
                      <InfoRow
                        label="ملخص الحساسية"
                        value={patient.allergySummary}
                      />
                    </div>

                    <div className="rounded-[12px] bg-[#FEF2F2] px-4 py-3">
                      <div className="flex gap-2 justify-start items-start mb-2">
                        <AlertTriangle
                          className="h-5 w-5 shrink-0 text-[#B42318]"
                          aria-hidden
                        />
                        <div className="flex flex-col gap-2">
                          <span className="font-cairo text-[14px] font-extrabold text-[#B42318]">
                            الحساسيات
                          </span>
                          <div className="flex flex-wrap gap-2 justify-start">
                            {patient.sensitivities.length ? (
                              patient.sensitivities.map((s) => (
                                <span
                                  key={s}
                                  className="rounded-full bg-white/80 px-3 py-1 font-cairo text-[12px] font-bold text-[#B42318] ring-1 ring-[#FECACA]"
                                >
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="font-cairo text-[13px] font-semibold text-[#667085]">
                                لا توجد حساسيات مسجّلة
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[12px] bg-[#FFF4ED] px-4 py-3">
                      <div className="flex gap-2 justify-start items-start mb-2">
                        <Heart
                          className="h-5 w-5 shrink-0 text-[#EA580C]"
                          aria-hidden
                          strokeWidth={2}
                        />
                        <div className="flex flex-col gap-2">
                          <span className="font-cairo text-[14px] font-extrabold text-[#C4320A]">
                            الأمراض المزمنة
                          </span>
                          <div className="flex flex-wrap gap-2 justify-start">
                            {patient.chronicConditions.length ? (
                              patient.chronicConditions.map((c) => (
                                <span
                                  key={c}
                                  className="rounded-full bg-white/80 px-3 py-1 font-cairo text-[12px] font-bold text-[#C4320A] ring-1 ring-[#FDBA74]"
                                >
                                  {c}
                                </span>
                              ))
                            ) : (
                              <span className="font-cairo text-[13px] font-semibold text-[#667085]">
                                لا توجد أمراض مزمنة مسجّلة
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-[10px] border border-dashed border-[#E5E7EB] bg-[#FAFBFC] px-4 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085]">
                    سيتم عرض «{TABS.find((t) => t.id === activeTab)?.label}» عند
                    ربط البيانات بالخادم.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2 mt-5 w-full sm:grid-cols-3 lg:gap-10">
                <button
                  type="button"
                  onClick={onStartConsultation}
                  className="inline-flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-[8px] bg-primary px-2 font-cairo text-[13px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)] transition-colors hover:bg-[#0d7a77]"
                >
                  <Stethoscope className="w-4 h-4 shrink-0" aria-hidden />
                  <span className="truncate">بدء استشارة</span>
                </button>
                <button
                  type="button"
                  onClick={onStartVisit}
                  className="inline-flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-[8px] bg-primary px-2 font-cairo text-[13px] font-extrabold text-white shadow-[0_10px_24px_rgba(15,143,139,0.22)] transition-colors hover:bg-[#0d7a77]"
                >
                  <CalendarDays className="w-4 h-4 shrink-0" aria-hidden />
                  <span className="truncate">بدء زيارة</span>
                </button>
                <button
                  type="button"
                  onClick={onRequestAccess}
                  className="inline-flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-[8px] border-2 border-primary bg-[#F0F9F9] px-2 font-cairo text-[13px] font-extrabold text-primary transition-colors hover:bg-[#E6F4F4]"
                >
                  <Link2 className="w-4 h-4 shrink-0" aria-hidden />
                  <span className="truncate">طلب وصول</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
