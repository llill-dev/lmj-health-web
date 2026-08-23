import { ChevronDown, Filter, Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import StyledSelect from '@/components/ui/styled-select';
import {
  filterCategories,
  filterOutcomes,
  filterRoles,
  SELECT_CLASS,
} from '@/components/admin/system-logs/auditLogConstants';
import type { AuditLogCategory, AuditLogOutcome } from '@/lib/admin/types';
import { useI18n } from '@/i18n/provider';

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
  const { locale, t } = useI18n();

  const ADVANCED_FIELDS: Array<{
    key: keyof AuditAdvancedFilters;
    label: string;
    placeholder: string;
    dir?: 'ltr' | 'rtl';
  }> = [
    { key: 'actorUserId', label: t('adminAuditLog.filters.field.actorUserId'), placeholder: 'Actor User ID', dir: 'ltr' },
    { key: 'targetUserId', label: t('adminAuditLog.filters.field.targetUserId'), placeholder: 'Target User ID', dir: 'ltr' },
    { key: 'patientId', label: t('adminAuditLog.filters.field.patientId'), placeholder: 'Patient ID', dir: 'ltr' },
    { key: 'entityType', label: t('adminAuditLog.filters.field.entityType'), placeholder: t('adminAuditLog.filters.field.entityType.placeholder') },
    { key: 'entityId', label: t('adminAuditLog.filters.field.entityId'), placeholder: 'Entity ID', dir: 'ltr' },
    { key: 'action', label: t('adminAuditLog.filters.field.action'), placeholder: t('adminAuditLog.filters.field.action.placeholder'), dir: 'ltr' },
    { key: 'requestId', label: t('adminAuditLog.filters.field.requestId'), placeholder: 'req-123', dir: 'ltr' },
    { key: 'ip', label: t('adminAuditLog.filters.field.ip'), placeholder: '203.0.113.10', dir: 'ltr' },
  ];

  const advancedActiveCount = ADVANCED_FIELDS.filter(
    (f) => advanced[f.key].trim() !== '',
  ).length;
  const [expanded, setExpanded] = useState(advancedActiveCount > 0);

  return (
    <section className='mt-5 rounded-[14px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]'>
      <div className='mb-3 flex items-center justify-between'>
        <div className='flex items-center gap-2 text-[#344054]'>
          <Filter className='h-4 w-4' />
          <span className='font-cairo text-[13px] font-extrabold'>{t('adminAuditLog.filters.title')}</span>
        </div>
        {hasActiveFilters && (
          <button
            type='button'
            onClick={onReset}
            className='font-cairo text-[12px] font-bold text-primary underline-offset-2 hover:underline'
          >
            {t('adminAuditLog.filters.reset')}
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8'>
        <div className='relative sm:col-span-2 lg:col-span-2 xl:col-span-2'>
          <input
            placeholder={t('adminSystemLogs.filters.search.placeholder')}
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
          options={filterCategories(locale).map((c) => ({
            value: c.value,
            label: c.label,
          }))}
          listboxAriaLabel={t('adminAuditLog.filters.categoryAriaLabel')}
        />

        <StyledSelect
          size="sm"
          tone="muted"
          className="min-w-0"
          triggerClassName="!h-[40px] !rounded-[10px] border-0 !shadow-none"
          value={outcome}
          onChange={(v) => onOutcomeChange(v as AuditLogOutcome | '')}
          options={filterOutcomes(locale).map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          listboxAriaLabel={t('adminAuditLog.filters.outcomeAriaLabel')}
        />

        <StyledSelect
          size="sm"
          tone="muted"
          className="min-w-0"
          triggerClassName="!h-[40px] !rounded-[10px] border-0 !shadow-none"
          value={actorRole}
          onChange={onActorRoleChange}
          options={filterRoles(locale).map((r) => ({
            value: r.value,
            label: r.label,
          }))}
          listboxAriaLabel={t('adminAuditLog.filters.roleAriaLabel')}
        />

        <div className='flex min-w-0 items-center gap-2 sm:col-span-2 lg:col-span-4 xl:col-span-3'>
          <input
            type='date'
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className={`${SELECT_CLASS} min-w-0 flex-1 px-2`}
            title={t('adminSystemLogs.filters.fromDate')}
          />
          <span className='font-cairo text-[11px] text-[#98A2B3]'>{t('adminAuditLog.filters.toWord')}</span>
          <input
            type='date'
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className={`${SELECT_CLASS} min-w-0 flex-1 px-2`}
            title={t('adminSystemLogs.filters.toDate')}
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
          {t('adminAuditLog.filters.advanced')}
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
