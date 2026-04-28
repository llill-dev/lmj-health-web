import { motion } from 'framer-motion';
import { Check, FileText } from 'lucide-react';

export default function ComplaintsSummaryStatCard({
  variant,
  value,
  delay = 0,
}: {
  variant: 'total' | 'closed' | 'review';
  value: number;
  delay?: number;
}) {
  const label =
    variant === 'total'
      ? 'إجمالي الشكاوي'
      : variant === 'closed'
        ? 'مغلقة'
        : 'قيد المراجعة';

  const icon =
    variant === 'total' ? (
      <div className='flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[10px] bg-[#106d6b] shadow-inner'>
        <FileText
          className='h-7 w-7 text-white'
          strokeWidth={2}
        />
      </div>
    ) : variant === 'closed' ? (
      <div className='flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[10px] bg-[#22c55e] shadow-[0_4px_12px_rgba(34,197,94,0.35)]'>
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm'>
          <Check
            className='h-5 w-5 text-[#16a34a]'
            strokeWidth={3}
          />
        </div>
      </div>
    ) : (
      <div className='flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[10px] bg-[#4A5565] shadow-inner'>
        <div className='flex h-9 w-9 items-center justify-center rounded-full bg-white'>
          <span className='font-cairo text-[17px] font-black leading-none text-[#4A5565]'>
            !
          </span>
        </div>
      </div>
    );

  const shell =
    variant === 'total'
      ? 'border border-[#3db0ad]/50 bg-[#148283] shadow-[0_12px_32px_rgba(20,130,131,0.28)]'
      : variant === 'closed'
        ? 'border border-emerald-200/90 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)] ring-1 ring-emerald-100/80'
        : 'border border-[#E5E7EB] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)]';

  const labelClass =
    variant === 'total'
      ? 'text-[13px] font-bold text-[#c8f2ef]'
      : 'text-[13px] font-bold text-[#64748B]';

  const valueClass =
    variant === 'total'
      ? 'text-[32px] font-black tabular-nums leading-none tracking-tight text-[#ecfffe]'
      : 'text-[32px] font-black tabular-nums leading-none tracking-tight text-[#0F172A]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{
        y: -3,
        transition: { duration: 0.2 },
      }}
      className={`relative overflow-hidden rounded-xl px-5 py-5 ${shell}`}
    >
      <div
        dir='ltr'
        className='flex items-center gap-4'
      >
        {icon}
        <div
          dir='rtl'
          className='flex min-w-0 flex-1 flex-col gap-1 text-right'
        >
          <div className={`font-cairo ${labelClass}`}>{label}</div>
          <div className={`font-cairo ${valueClass}`}>{value}</div>
        </div>
      </div>
    </motion.div>
  );
}
