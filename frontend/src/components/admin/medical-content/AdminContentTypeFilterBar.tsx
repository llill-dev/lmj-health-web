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
import { useI18n } from "@/i18n/provider";

type TypeFilterValue = "الكل" | AdminContentType;

const TYPE_FILTER_CONFIG = [
  { value: "الكل" as const, icon: BookOpen, iconAdaptsToActive: true },
  { value: "CONDITION" as const, icon: HeartPulse },
  { value: "SYMPTOM" as const, icon: FileText },
  { value: "GENERAL_ADVICE" as const, icon: Stethoscope },
  { value: "NEWS" as const, icon: Newspaper },
  { value: "MEDICATION" as const, icon: Pill },
  { value: "SETTINGS_PAGE" as const, icon: Settings },
];

export function AdminContentTypeFilterBar({
  activeType,
  onChange,
}: {
  activeType: TypeFilterValue;
  onChange: (next: TypeFilterValue) => void;
}) {
  const { t } = useI18n();

  const typeFilters = TYPE_FILTER_CONFIG.map((filter) => ({
    ...filter,
    label: t(`adminMedicalContent.type.${filter.value}`),
  }));

  return (
    <div className="mt-1.5 flex flex-wrap content-start justify-start gap-2 rounded-[10px] border border-[#F2F4F7] bg-[#FAFAFB] p-2">
      {typeFilters.map((filter) => {
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
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
