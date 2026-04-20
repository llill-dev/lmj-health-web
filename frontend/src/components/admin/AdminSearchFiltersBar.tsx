'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';

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
                ? 'h-[42px] w-full min-w-0 rounded-[10px] border border-[#E5E7EB] bg-white pe-10 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
                : 'h-[42px] w-full min-w-0 rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
            }
          />
          {queryEndAdornment ? (
            <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
              {queryEndAdornment}
            </div>
          ) : null}
        </div>

        {hasFilters ? (
          <div className='flex w-full min-w-0 flex-wrap items-stretch gap-2 sm:gap-3 xl:w-auto xl:flex-nowrap'>
            {filtersLeading}
            {hasSpecialty ? (
              <div className='relative min-w-0 flex-1 sm:flex-none sm:min-w-[140px]'>
                <select
                  value={values.specialty ?? ''}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, specialty: e.target.value }))
                  }
                  className='h-[42px] w-full min-w-[120px] appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#111827] sm:w-[160px]'
                >
                  <option value=''>{specialtyPlaceholder ?? 'الاختصاص'}</option>
                  {specialtyOptions?.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                  <ChevronLeft className='h-4 w-4 rotate-[-90deg]' />
                </div>
              </div>
            ) : null}

            {hasStatus ? (
              <div className='relative min-w-0 flex-1 sm:flex-none sm:min-w-[120px]'>
                <select
                  value={values.status ?? ''}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, status: e.target.value }))
                  }
                  className='h-[42px] w-full min-w-[110px] appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#111827] sm:w-[140px]'
                >
                  <option value=''>{statusPlaceholder ?? 'الحالة'}</option>
                  {statusOptions?.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
                  <ChevronLeft className='h-4 w-4 rotate-[-90deg]' />
                </div>
              </div>
            ) : null}
            {filtersTrailing}
          </div>
        ) : null}
      </div>
    </section>
  );
}
