'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import StyledSelect from '@/components/ui/styled-select';
import { useI18n } from '@/i18n/provider';

export type AdminSearchFiltersValues = {
  query?: string;
  specialty?: string;
  status?: string;
};

function areValuesEqual(
  a: AdminSearchFiltersValues,
  b: AdminSearchFiltersValues,
) {
  return (
    (a.query ?? '') === (b.query ?? '') &&
    (a.specialty ?? '') === (b.specialty ?? '') &&
    (a.status ?? '') === (b.status ?? '')
  );
}

export default function AdminSearchFiltersBar({
  queryPlaceholder,
  queryEndAdornment,
  order = 'query-first',
  specialtyPlaceholder,
  specialtyOptions,
  statusPlaceholder,
  statusOptions,
  filtersLeading,
  filtersTrailing,
  resetSignal,
  defaultValues,
  onChange,
}: {
  queryPlaceholder: string;
  queryEndAdornment?: ReactNode;
  order?: 'query-first' | 'filters-first';
  specialtyPlaceholder?: string;
  specialtyOptions?: Array<{ label: string; value: string }>;
  statusPlaceholder?: string;
  statusOptions?: Array<{ label: string; value: string }>;
  filtersLeading?: ReactNode;
  filtersTrailing?: ReactNode;
  resetSignal?: number;
  defaultValues?: AdminSearchFiltersValues;
  onChange?: (values: AdminSearchFiltersValues) => void;
}) {
  const { t } = useI18n();
  const resolvedDefaultValues = useMemo(() => {
    return {
      query: '',
      specialty: '',
      status: '',
      ...defaultValues,
    } satisfies AdminSearchFiltersValues;
  }, [defaultValues]);

  const [values, setValues] = useState<AdminSearchFiltersValues>(
    resolvedDefaultValues,
  );
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    setValues((prev) =>
      areValuesEqual(prev, resolvedDefaultValues)
        ? prev
        : resolvedDefaultValues,
    );
  }, [resolvedDefaultValues, resetSignal]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onChangeRef.current?.(values);
  }, [values]);

  const hasSpecialty = (specialtyOptions?.length ?? 0) > 0;
  const hasStatus = (statusOptions?.length ?? 0) > 0;
  const hasFilters = hasSpecialty || hasStatus || Boolean(filtersLeading);

  const rowClass =
    order === 'filters-first'
      ? 'flex flex-col gap-4 xl:flex-row-reverse xl:items-center xl:justify-between xl:gap-4'
      : 'flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between xl:gap-4';

  return (
    <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-3 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] sm:px-5'>
      <div className={rowClass}>
        <div className='relative w-full min-w-0 xl:max-w-xl xl:flex-1'>
          <input
            placeholder={queryPlaceholder}
            value={values.query ?? ''}
            onChange={(e) =>
              setValues((v) => ({ ...v, query: e.target.value }))
            }
            className={
              queryEndAdornment
                ? 'h-[42px] w-full min-w-0 rounded-[10px] border border-[#E5E7EB] bg-white pe-10 ps-4 text-start font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
                : 'h-[42px] w-full min-w-0 rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-start font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
            }
          />
          {queryEndAdornment ? (
            <div className='pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
              {queryEndAdornment}
            </div>
          ) : null}
        </div>

        {hasFilters ? (
          <div className='flex w-full min-w-0 flex-wrap items-stretch gap-2 sm:gap-3 xl:w-auto xl:flex-nowrap'>
            {filtersLeading}
            {hasSpecialty ? (
              <div className='min-w-0 flex-1 sm:flex-none sm:min-w-[140px] sm:w-[160px]'>
                <StyledSelect
                  size='sm'
                  tone='muted'
                  value={values.specialty ?? ''}
                  onChange={(v) => setValues((prev) => ({ ...prev, specialty: v }))}
                  options={[
                    { value: '', label: specialtyPlaceholder ?? t('common.specialtyLabel') },
                    ...(specialtyOptions?.map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                    })) ?? []),
                  ]}
                  placeholder={specialtyPlaceholder ?? t('common.specialtyLabel')}
                  listboxAriaLabel={specialtyPlaceholder ?? t('common.specialtyLabel')}
                />
              </div>
            ) : null}

            {hasStatus ? (
              <div className='min-w-0 flex-1 sm:flex-none sm:min-w-[120px] sm:w-[140px]'>
                <StyledSelect
                  size='sm'
                  tone='muted'
                  value={values.status ?? ''}
                  onChange={(v) => setValues((prev) => ({ ...prev, status: v }))}
                  options={[
                    { value: '', label: statusPlaceholder ?? t('common.statusLabel') },
                    ...(statusOptions?.map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                    })) ?? []),
                  ]}
                  placeholder={statusPlaceholder ?? t('common.statusLabel')}
                  listboxAriaLabel={statusPlaceholder ?? t('common.statusLabel')}
                />
              </div>
            ) : null}
            {filtersTrailing}
          </div>
        ) : null}
      </div>
    </section>
  );
}
