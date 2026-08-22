import type { UiContentStatus } from "@/components/admin/medical-content/contentListUtils";

const STATUS_FILTERS: Array<{
  value: UiContentStatus;
  ar: string;
  en: string;
  disableWhenMine?: boolean;
}> = [
  { value: "الكل", ar: "الكل", en: "All" },
  { value: "منشور", ar: "منشور", en: "Published", disableWhenMine: true },
  { value: "قيد المراجعة", ar: "قيد المراجعة", en: "In review" },
  { value: "مسودة", ar: "مسودة", en: "Draft" },
  { value: "مؤرشف", ar: "مؤرشف", en: "Archived", disableWhenMine: true },
];

export function AdminContentStatusFilterBar({
  activeStatus,
  onChange,
  showMineOnly,
  tr,
}: {
  activeStatus: UiContentStatus;
  onChange: (next: UiContentStatus) => void;
  showMineOnly: boolean;
  tr: (ar: string, en: string) => string;
}) {
  return (
    <>
      <div className="mt-1.5 flex flex-wrap content-start justify-start gap-2 rounded-[10px] border border-[#F2F4F7] bg-[#FAFAFB] p-2">
        {STATUS_FILTERS.map((filter) => {
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
              {tr(filter.ar, filter.en)}
            </button>
          );
        })}
      </div>
      {showMineOnly ? (
        <div className="mt-2 font-cairo text-[11px] font-bold text-[#98A2B3]">
          {tr(
            "واجهة (محتواي فقط) مرتبطة بمسار /api/admin/content/mine وتدعم فقط: الكل، مسودة، قيد المراجعة.",
            "My-content mode is backed by /api/admin/content/mine and supports only: All, Draft, In review.",
          )}
        </div>
      ) : null}
    </>
  );
}
