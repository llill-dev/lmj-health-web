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

  return (
    <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
      <div
        className={
          order === 'filters-first'
            ? 'flex flex-row-reverse items-center justify-between gap-4'
            : 'flex items-center justify-between gap-4'
        }
      >
        <div className='relative flex-1'>
          <input
            placeholder={queryPlaceholder}
            value={values.query ?? ''}
            onChange={(e) =>
              setValues((v) => ({ ...v, query: e.target.value }))
            }
            className={
              queryEndAdornment
                ? 'h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-10 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
                : 'h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
            }
          />
          {queryEndAdornment ? (
            <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
              {queryEndAdornment}
            </div>
          ) : null}
        </div>

        {hasFilters ? (
          <div className='flex items-center gap-3'>
            {filtersLeading}
            {hasSpecialty ? (
              <div className='relative'>
                <select
                  value={values.specialty ?? ''}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, specialty: e.target.value }))
                  }
                  className='h-[42px] w-[160px] appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#111827]'
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
              <div className='relative'>
                <select
                  value={values.status ?? ''}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, status: e.target.value }))
                  }
                  className='h-[42px] w-[140px] appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-bold text-[#111827]'
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
