import type { ReactNode } from "react";
import { Activity, CheckCircle2, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils/utils";

type EncountersStatsRowProps = {
  total: number;
  active: number;
  closed: number;
};

export function EncountersStatsRow({
  total,
  active,
  closed,
}: EncountersStatsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        variant="primary"
        icon={<ClipboardList className="h-5 w-5" aria-hidden />}
        value={total}
        label="الكل"
      />
      <StatCard
        variant="active"
        icon={<Activity className="h-5 w-5" aria-hidden />}
        value={active}
        label="نشطة"
      />
      <StatCard
        variant="closed"
        icon={<CheckCircle2 className="h-5 w-5" aria-hidden />}
        value={closed}
        label="مغلقة"
      />
    </div>
  );
}

function StatCard({
  variant,
  icon,
  value,
  label,
}: {
  variant: "primary" | "active" | "closed";
  icon: ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[10px] border px-[18px] py-[18px] shadow-[0_4px_12px_-2px_rgba(15,143,139,0.12)] transition-transform duration-200 hover:-translate-y-0.5",
        variant === "primary" &&
          "border-[#0f8f8b]/30 bg-gradient-to-br from-primary via-[#0d9488] to-[#14b8a6] text-white",
        variant === "active" &&
          "border-[#ABEFC6] bg-gradient-to-br from-[#ECFDF3] via-white to-[#F0FDF9]",
        variant === "closed" &&
          "border-[#E2E8F0] bg-gradient-to-br from-[#F8FAFC] via-white to-[#F1F5F9]",
      )}
    >
      {variant === "primary" ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30 bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center"
        />
      ) : null}
      <div className="relative flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-[8px]",
            variant === "primary"
              ? "bg-white/20 text-white"
              : variant === "active"
                ? "bg-[#D1FAE5] text-[#027A48]"
                : "bg-[#E2E8F0] text-[#475467]",
          )}
        >
          {icon}
        </span>
        <span
          className={cn(
            "font-cairo text-[24px] font-black leading-[34px]",
            variant === "primary" ? "text-white" : "text-primary",
          )}
        >
          {value}
        </span>
      </div>
      <p
        className={cn(
          "relative mt-1 font-cairo text-[14px] font-semibold leading-5",
          variant === "primary" ? "text-white/90" : "text-primary",
        )}
      >
        {label}
      </p>
    </div>
  );
}
