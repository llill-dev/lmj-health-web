import type { ReactNode } from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import {
  CATEGORY_LABELS,
  CATEGORY_STYLES,
  OUTCOME_LABELS,
  ROLE_LABELS,
} from '@/components/admin/system-logs/auditLogConstants';
import { formatAuditLogDateTime } from '@/components/admin/system-logs/auditLogUtils';
import type { AuditLogItem, AuditLogOutcome } from '@/lib/admin/types';

const OUTCOME_STYLES: Record<
  AuditLogOutcome,
  { bg: string; text: string; icon: ReactNode }
> = {
  SUCCESS: {
    bg: 'bg-[#ECFDF5] border border-[#A7F3D0]',
    text: 'text-[#065F46]',
    icon: <ShieldCheck className='h-3.5 w-3.5' />,
  },
  FAIL: {
    bg: 'bg-[#FEF2F2] border border-[#FECACA]',
    text: 'text-[#991B1B]',
    icon: <ShieldAlert className='h-3.5 w-3.5' />,
  },
  DENY: {
    bg: 'bg-[#FFF7ED] border border-[#FED7AA]',
    text: 'text-[#92400E]',
    icon: <Shield className='h-3.5 w-3.5' />,
  },
};

export function AuditLogRow({ log }: { log: AuditLogItem }) {
  const catStyle = CATEGORY_STYLES[log.category] ?? CATEGORY_STYLES.SYSTEM;
  const outStyle = OUTCOME_STYLES[log.outcome] ?? OUTCOME_STYLES.FAIL;
  const { date, time } = formatAuditLogDateTime(log.createdAt);
  const actorLabel = log.actorRole ? ROLE_LABELS[log.actorRole] ?? log.actorRole : '—';

  return (
    <div className='grid grid-cols-12 gap-2 px-6 py-4 transition-colors hover:bg-[#FAFBFC]'>
      <div className='col-span-3 text-right'>
        <div className='break-all font-cairo text-[13px] font-black leading-snug text-[#111827]'>
          {log.action}
        </div>
        <span
          className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-cairo text-[11px] font-bold ${catStyle.bg} ${catStyle.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${catStyle.dot}`} />
          {CATEGORY_LABELS[log.category]}
        </span>
      </div>

      <div className='col-span-2 text-right'>
        <div className='font-cairo text-[13px] font-bold leading-snug text-[#344054]'>
          {log.actorUserName || '—'}
        </div>
        <div className='mt-0.5 font-cairo text-[11px] font-semibold text-[#98A2B3]'>{actorLabel}</div>
      </div>

      <div className='col-span-2 flex items-start justify-start text-right pt-0.5'>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-cairo text-[11px] font-bold ${outStyle.bg} ${outStyle.text}`}
        >
          {outStyle.icon}
          {OUTCOME_LABELS[log.outcome]}
        </span>
      </div>

      <div className='col-span-2 text-right'>
        <div className='font-cairo text-[12px] font-semibold leading-snug text-[#667085]'>{log.ip || '—'}</div>
        {log.method && log.route ? (
          <div className='mt-0.5 break-all font-cairo text-[10px] font-semibold text-[#98A2B3]'>
            {log.method} {log.route}
          </div>
        ) : null}
      </div>

      <div className='col-span-3 text-right'>
        <div className='font-cairo text-[12px] font-bold text-[#344054]'>{date}</div>
        <div className='mt-0.5 font-cairo text-[11px] font-semibold text-[#98A2B3]'>{time}</div>
      </div>
    </div>
  );
}
