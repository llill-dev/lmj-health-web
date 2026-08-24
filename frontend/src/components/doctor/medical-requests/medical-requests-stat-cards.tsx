import { FlaskConical, ScanLine, Stethoscope, LayoutGrid, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

const CARDS = [
  {
    key: 'all' as const,
    label: 'الكل',
    icon: LayoutGrid,
    activeClass: 'border-primary bg-primary text-white shadow-[0_10px_24px_rgba(15,143,139,0.28)]',
    idleClass: 'border-[#C7F3F1] bg-primary text-white',
  },
  {
    key: 'lab' as const,
    label: 'تحاليل',
    icon: FlaskConical,
    activeClass: 'border-[#99F6E4] bg-[#CCFBF1] text-primary',
    idleClass: 'border-[#E2E8F0] bg-[#F0FDFA] text-primary',
  },
  {
    key: 'radiology' as const,
    label: 'أشعة',
    icon: ScanLine,
    activeClass: 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475467]',
    idleClass: 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475467]',
  },
  {
    key: 'procedure' as const,
    label: 'إجراءات',
    icon: Stethoscope,
    activeClass: 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475467]',
    idleClass: 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475467]',
  },
  {
    key: 'referral' as const,
    label: 'إحالات',
    icon: Share2,
    activeClass: 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475467]',
    idleClass: 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475467]',
  },
];

export function MedicalRequestsStatCards({
  stats,
}: {
  stats: { all: number; lab: number; radiology: number; procedure: number; referral: number };
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const count = stats[card.key];
        const isPrimary = card.key === 'all';

        return (
          <div
            key={card.key}
            className={cn(
              'flex items-center justify-between gap-3 rounded-[10px] border px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]',
              isPrimary ? card.activeClass : card.idleClass,
            )}
          >
            <div className="text-start">
              <div
                className={cn(
                  'font-cairo text-[12px] font-bold',
                  isPrimary ? 'text-white/90' : 'text-[#667085]',
                )}
              >
                {card.label}
              </div>
              <div
                className={cn(
                  'mt-1 font-cairo text-[22px] font-black tabular-nums leading-none',
                  isPrimary ? 'text-white' : 'text-[#101828]',
                )}
              >
                {count}
              </div>
            </div>
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px]',
                isPrimary ? 'bg-white/15 text-white' : 'bg-white text-primary',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </div>
          </div>
        );
      })}
    </div>
  );
}
