import type { LucideIcon } from "lucide-react";

interface InfoCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
}

export function InfoCard({ label, value, icon: Icon }: InfoCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0]/90 bg-gradient-to-br from-white via-[#FAFDFC] to-[#F0F9F8] px-4 py-4 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_32px_rgba(15,23,42,0.05)] transition-[box-shadow,transform] duration-300 hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_16px_40px_rgba(15,143,139,0.1)]">
      <div
        className="pointer-events-none absolute -left-8 top-0 h-24 w-24 rounded-full bg-primary/[0.06] blur-2xl transition-opacity group-hover:opacity-100"
        aria-hidden
      />
      <div className="flex relative gap-3 items-start">
        {Icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary/12 to-primary/6 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-primary/10">
            <Icon className="w-5 h-5" aria-hidden />
          </div>
        ) : null}
        <div className="flex-1 min-w-0">
          <div className="font-cairo text-[11px] font-bold uppercase tracking-[0.04em] text-[#94a3b8]">
            {label}
          </div>
          <div className="mt-2 break-words font-cairo text-[15px] font-black leading-snug text-[#0f172a] sm:text-[16px] sm:leading-6">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}
