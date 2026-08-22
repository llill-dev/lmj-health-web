import {
  BookOpen,
  HeartPulse,
  FileText,
  Stethoscope,
  Newspaper,
  Pill,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { AdminContentType } from "@/lib/admin/types";

type TypeFilterValue = "الكل" | AdminContentType;

const TYPE_FILTERS: Array<{
  value: TypeFilterValue;
  icon: LucideIcon;
  /** Matches the original markup: only the "All" icon inherits the button's
   * text color (white when active); every other icon stays gray regardless
   * of active state. Preserved as-is to avoid an unintended visual change. */
  iconAdaptsToActive?: boolean;
  ar: string;
  en: string;
}> = [
  { value: "الكل", icon: BookOpen, iconAdaptsToActive: true, ar: "الكل", en: "All" },
  { value: "CONDITION", icon: HeartPulse, ar: "الحالات الطبية", en: "Conditions" },
  { value: "SYMPTOM", icon: FileText, ar: "الأعراض", en: "Symptoms" },
  { value: "GENERAL_ADVICE", icon: Stethoscope, ar: "نصائح عامة", en: "General advice" },
  { value: "NEWS", icon: Newspaper, ar: "الأخبار", en: "News" },
  { value: "MEDICATION", icon: Pill, ar: "الأدوية", en: "Medications" },
  { value: "SETTINGS_PAGE", icon: Settings, ar: "صفحات الإعدادات", en: "Settings pages" },
];

export function AdminContentTypeFilterBar({
  activeType,
  onChange,
  tr,
}: {
  activeType: TypeFilterValue;
  onChange: (next: TypeFilterValue) => void;
  tr: (ar: string, en: string) => string;
}) {
  return (
    <div className="mt-1.5 flex flex-wrap content-start justify-start gap-2 rounded-[10px] border border-[#F2F4F7] bg-[#FAFAFB] p-2">
      {TYPE_FILTERS.map((filter) => {
        const Icon = filter.icon;
        const active = activeType === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={
              active
                ? "inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-primary bg-primary px-4 font-cairo text-[12px] font-extrabold text-white"
                : "inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827]"
            }
          >
            <Icon
              className={
                filter.iconAdaptsToActive ? "h-4 w-4" : "h-4 w-4 text-[#667085]"
              }
            />
            {tr(filter.ar, filter.en)}
          </button>
        );
      })}
    </div>
  );
}
