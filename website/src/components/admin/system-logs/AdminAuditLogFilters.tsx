import { ChevronDown, Filter, Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import StyledSelect from '@/components/ui/styled-select';
import {
  FILTER_CATEGORIES,
  FILTER_OUTCOMES,
  FILTER_ROLES,
  SELECT_CLASS,
} from '@/components/admin/system-logs/auditLogConstants';
import type { AuditLogCategory, AuditLogOutcome } from '@/lib/admin/types';

export type AuditAdvancedFilters = {
  actorUserId: string;
  targetUserId: string;
  patientId: string;
  entityType: string;
  entityId: string;
  action: string;
  requestId: string;
  ip: string;
};

const ADVANCED_FIELDS: Array<{
  key: keyof AuditAdvancedFilters;
  label: string;
  placeholder: string;
  dir?: 'ltr' | 'rtl';
}> = [
  { key: 'actorUserId', label: 'معرّف المنفِّذ', placeholder: 'Actor User ID', dir: 'ltr' },
  { key: 'targetUserId', label: 'المستخدم المستهدف', placeholder: 'Target User ID', dir: 'ltr' },
  { key: 'patientId', label: 'معرّف المريض', placeholder: 'Patient ID', dir: 'ltr' },
  { key: 'entityType', label: 'نوع الكيان', placeholder: 'مثال: User' },
  { key: 'entityId', label: 'معرّف الكيان', placeholder: 'Entity ID', dir: 'ltr' },
  { key: 'action', label: 'الإجراء', placeholder: 'مثال: AUTH_LOGIN_FAILED', dir: 'ltr' },
  { key: 'requestId', label: 'معرّف الطلب', placeholder: 'req-123', dir: 'ltr' },
  { key: 'ip', label: 'عنوان IP', placeholder: '203.0.113.10', dir: 'ltr' },
];

export function AdminAuditLogFilters({
  search,
  category,
  outcome,
  actorRole,
  from,
  to,
  advanced,
  hasActiveFilters,
  onSearchChange,
  onCategoryChange,
  onOutcomeChange,
  onActorRoleChange,
  onFromChange,
  onToChange,
  onAdvancedChange,
  onReset,
}: {
  search: string;
  category: AuditLogCategory | '';
  outcome: AuditLogOutcome | '';
  actorRole: string;
  from: string;
  to: string;
  advanced: AuditAdvancedFilters;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: AuditLogCategory | '') => void;
  onOutcomeChange: (value: AuditLogOutcome | '') => void;
  onActorRoleChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onAdvancedChange: (key: keyof AuditAdvancedFilters, value: string) => void;
  onReset: () => void;
}) {
  const advancedActiveCount = ADVANCED_FIELDS.filter(
    (f) => advanced[f.key].trim() !== '',
  ).length;
  const [expanded, setExpanded] = useState(advancedActiveCount > 0);

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

        <StyledSelect
          size="sm"
          tone="muted"
          className="min-w-0"
          triggerClassName="!h-[40px] !rounded-[10px] border-0 !shadow-none"
          value={category}
          onChange={(v) => onCategoryChange(v as AuditLogCategory | '')}
          options={FILTER_CATEGORIES.map((c) => ({
            value: c.value,
            label: c.label,
          }))}
          listboxAriaLabel="تصنيف السجل"
        />

        <StyledSelect
          size="sm"
          tone="muted"
          className="min-w-0"
          triggerClassName="!h-[40px] !rounded-[10px] border-0 !shadow-none"
          value={outcome}
          onChange={(v) => onOutcomeChange(v as AuditLogOutcome | '')}
          options={FILTER_OUTCOMES.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          listboxAriaLabel="نتيجة العملية"
        />

        <StyledSelect
          size="sm"
          tone="muted"
          className="min-w-0"
          triggerClassName="!h-[40px] !rounded-[10px] border-0 !shadow-none"
          value={actorRole}
          onChange={onActorRoleChange}
          options={FILTER_ROLES.map((r) => ({
            value: r.value,
            label: r.label,
          }))}
          listboxAriaLabel="دور المستخدم"
        />

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

      <div className='mt-3 border-t border-[#F2F4F7] pt-3'>
        <button
          type='button'
          onClick={() => setExpanded((v) => !v)}
          className='inline-flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#344054] transition hover:text-primary'
          aria-expanded={expanded}
        >
          <SlidersHorizontal className='h-4 w-4' />
          فلاتر متقدمة
          {advancedActiveCount > 0 ? (
            <span className='inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 font-cairo text-[10px] font-extrabold text-white'>
              {advancedActiveCount}
            </span>
          ) : null}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        {expanded ? (
          <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            {ADVANCED_FIELDS.map((f) => (
              <div key={f.key} className='min-w-0'>
                <label className='mb-1 block text-right font-cairo text-[11px] font-extrabold text-[#667085]'>
                  {f.label}
                </label>
                <input
                  value={advanced[f.key]}
                  onChange={(e) => onAdvancedChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  dir={f.dir ?? 'rtl'}
                  className='h-[40px] w-full rounded-[10px] border border-[#EEF2F6] bg-white px-3 font-cairo text-[13px] font-bold text-[#111827] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-primary/20'
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
