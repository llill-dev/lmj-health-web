import type { UiContentStatus } from "@/components/admin/medical-content/contentListUtils";
import { useI18n } from "@/i18n/provider";

const STATUS_FILTER_CONFIG = [
  { value: "الكل" as const },
  { value: "منشور" as const, disableWhenMine: true },
  { value: "قيد المراجعة" as const },
  { value: "مسودة" as const },
  { value: "مؤرشف" as const, disableWhenMine: true },
];

export function AdminContentStatusFilterBar({
  activeStatus,
  onChange,
  showMineOnly,
}: {
  activeStatus: UiContentStatus;
  onChange: (next: UiContentStatus) => void;
  showMineOnly: boolean;
}) {
  const { t } = useI18n();

  const statusFilters = STATUS_FILTER_CONFIG.map((filter) => ({
    ...filter,
    label: t(`adminMedicalContent.status.${filter.value}`),
  }));

  return (
    <>
      <div className="mt-1.5 flex flex-wrap content-start justify-start gap-2 rounded-[10px] border border-[#F2F4F7] bg-[#FAFAFB] p-2">
        {statusFilters.map((filter) => {
          const active = activeStatus === filter.value;
          const disabled = Boolean(filter.disableWhenMine && showMineOnly);
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onChange(filter.value)}
              disabled={disabled}
              className={
                active
                  ? "inline-flex h-[30px] items-center justify-center rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white"
                  : "inline-flex h-[30px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] disabled:cursor-not-allowed disabled:opacity-40"
              }
            >
              {filter.label}
            </button>
          );
        })}
      </div>
      {showMineOnly ? (
        <div className="mt-2 font-cairo text-[11px] font-bold text-[#98A2B3]">
          {t("adminMedicalContent.mineOnlyHint")}
        </div>
      ) : null}
    </>
  );
}
