import { LayoutGroup, motion } from "framer-motion";
import { cn } from "@/lib/utils/utils";
import type { MedicalVisitStatusFilter } from "./types";

const TABS: { id: MedicalVisitStatusFilter; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "open", label: "نشطة" },
  { id: "closed", label: "مغلقة" },
];

export function EncountersStatusTabs({
  value,
  onChange,
  disabled = false,
}: {
  value: MedicalVisitStatusFilter;
  onChange: (value: MedicalVisitStatusFilter) => void;
  disabled?: boolean;
}) {
  return (
    <LayoutGroup id="encounters-status-tabs">
      <div
        role="tablist"
        aria-label="تصفية حالة الزيارة"
        className="relative mb-5 flex w-full rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-1"
      >
        {TABS.map((tab) => {
          const active = value === tab.id;
          return (
            <motion.button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              onClick={() => onChange(tab.id)}
              whileTap={disabled ? undefined : { scale: 0.98 }}
              className={cn(
                "relative flex-1 rounded-[10px] px-4 py-2.5 font-cairo text-[13px] font-extrabold transition-colors duration-200",
                disabled && "pointer-events-none opacity-70",
                active
                  ? "text-white"
                  : "text-[#475467] hover:bg-white/80 hover:text-[#101828]",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="encounters-status-tab-pill"
                  className="absolute inset-0 rounded-[10px] bg-primary shadow-[0_8px_20px_-6px_rgba(15,143,139,0.45)]"
                  transition={{
                    type: "spring",
                    stiffness: 400,
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
  );
}
