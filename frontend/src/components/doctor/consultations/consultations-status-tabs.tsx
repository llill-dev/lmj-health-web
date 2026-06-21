import { Activity, Ban, CheckCircle2, Clock } from 'lucide-react';
import { LayoutGroup, motion } from 'framer-motion';
import { cn } from '@/lib/utils/utils';

export type ConsultationStatusTab = 'waiting' | 'in_progress' | 'closed' | 'dismissed';

type TabCounts = {
  waiting: number;
  in_progress: number;
  closed: number;
  dismissed: number;
};

const TABS: {
  id: ConsultationStatusTab;
  label: string;
  icon: typeof Clock;
}[] = [
  { id: 'waiting', label: 'جديدة', icon: Clock },
  { id: 'in_progress', label: 'نشطة', icon: Activity },
  { id: 'closed', label: 'مغلقة', icon: CheckCircle2 },
  { id: 'dismissed', label: 'مرفوضة', icon: Ban },
];

export function ConsultationsStatusTabs({
  value,
  onChange,
  counts,
  disabled = false,
}: {
  value: ConsultationStatusTab;
  onChange: (value: ConsultationStatusTab) => void;
  counts: TabCounts;
  disabled?: boolean;
}) {
  return (
    <LayoutGroup id="consultations-status-tabs">
      <div
        role="tablist"
        aria-label="تصفية حالة الاستشارة"
        className="relative grid grid-cols-4 gap-1 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-1"
      >
        {TABS.map((tab) => {
          const active = value === tab.id;
          const Icon = tab.icon;
          const count = counts[tab.id];

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
                'relative flex h-[42px] items-center justify-center gap-2 rounded-[8px] px-2 font-cairo text-[12px] font-extrabold transition-colors duration-200 sm:text-[13px]',
                disabled && 'pointer-events-none opacity-70',
                active
                  ? 'text-white'
                  : 'text-[#667085] hover:bg-white/80 hover:text-[#101828]',
              )}
            >
              {active ? (
                <motion.span
                  layoutId="consultations-status-tab-pill"
                  className="absolute inset-0 rounded-[8px] bg-primary shadow-[0_8px_20px_-6px_rgba(15,143,139,0.45)]"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 32,
                  }}
                  aria-hidden
                />
              ) : null}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span>{tab.label}</span>
                {active && count > 0 ? (
                  <span className="inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-white/25 px-1.5 font-cairo text-[10px] font-extrabold text-white">
                    {count}
                  </span>
                ) : null}
              </span>
            </motion.button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
