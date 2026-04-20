import { Filter, Search } from 'lucide-react';
import {
  FILTER_CATEGORIES,
  FILTER_OUTCOMES,
  FILTER_ROLES,
  SELECT_CLASS,
} from '@/components/admin/system-logs/auditLogConstants';
import type { AuditLogCategory, AuditLogOutcome } from '@/lib/admin/types';

export function AdminAuditLogFilters({
  search,
  category,
  outcome,
  actorRole,
  from,
  to,
  hasActiveFilters,
  onSearchChange,
  onCategoryChange,
  onOutcomeChange,
  onActorRoleChange,
  onFromChange,
  onToChange,
  onReset,
}: {
  search: string;
  category: AuditLogCategory | '';
  outcome: AuditLogOutcome | '';
  actorRole: string;
  from: string;
  to: string;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: AuditLogCategory | '') => void;
  onOutcomeChange: (value: AuditLogOutcome | '') => void;
  onActorRoleChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onReset: () => void;
}) {
  return (
    <section className='mt-5 rounded-[14px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
      <div className='mb-3 flex items-center justify-between'>
        <div className='flex items-center gap-2 text-[#344054]'>
          <Filter className='h-4 w-4' />
          <span className='font-cairo text-[13px] font-extrabold'>تصفية السجلات</span>
        </div>
        {hasActiveFilters && (
          <button
            type='button'
            onClick={onReset}
            className='font-cairo text-[12px] font-bold text-primary underline-offset-2 hover:underline'
          >
            إعادة تعيين
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8'>
        <div className='relative sm:col-span-2 lg:col-span-2 xl:col-span-2'>
          <input
            placeholder='بحث في السجلات...'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className='h-[40px] w-full rounded-[10px] border border-[#EEF2F6] bg-white pe-10 ps-4 text-right font-cairo text-[13px] font-bold text-[#111827] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-primary/20'
          />
          <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]' />
        </div>

        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as AuditLogCategory | '')}
          className={SELECT_CLASS}
        >
          {FILTER_CATEGORIES.map((c) => (
            <option key={c.value || 'all-cat'} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={outcome}
          onChange={(e) => onOutcomeChange(e.target.value as AuditLogOutcome | '')}
          className={SELECT_CLASS}
        >
          {FILTER_OUTCOMES.map((o) => (
            <option key={o.value || 'all-out'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select value={actorRole} onChange={(e) => onActorRoleChange(e.target.value)} className={SELECT_CLASS}>
          {FILTER_ROLES.map((r) => (
            <option key={r.value || 'all-role'} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <div className='flex min-w-0 items-center gap-2 sm:col-span-2 lg:col-span-4 xl:col-span-3'>
          <input
            type='date'
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className={`${SELECT_CLASS} min-w-0 flex-1 px-2`}
            title='من تاريخ'
          />
          <span className='font-cairo text-[11px] text-[#98A2B3]'>إلى</span>
          <input
            type='date'
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className={`${SELECT_CLASS} min-w-0 flex-1 px-2`}
            title='إلى تاريخ'
          />
        </div>
      </div>
    </section>
  );
}
