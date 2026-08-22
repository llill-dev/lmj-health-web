import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  badgeLabel: string;
  badgeBgColor: string;
  badgeTextColor: string;
  value: number;
  label: string;
  subtitle?: string;
  subtitleColor?: string;
}

export default function StatCard({
  icon: Icon,
  iconBgColor,
  iconColor,
  badgeLabel,
  badgeBgColor,
  badgeTextColor,
  value,
  label,
  subtitle,
  subtitleColor,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgColor}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <span className={`rounded-full ${badgeBgColor} px-2 py-0.5 font-cairo text-xs font-bold ${badgeTextColor}`}>
          {badgeLabel}
        </span>
      </div>
      <div className="font-cairo text-2xl font-bold text-[#0f172a]">{value}</div>
      <div className="font-cairo text-sm font-medium text-[#64748b]">
        {label}
      </div>
      {subtitle && (
        <div className={`mt-1 font-cairo text-xs font-medium ${subtitleColor}`}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
