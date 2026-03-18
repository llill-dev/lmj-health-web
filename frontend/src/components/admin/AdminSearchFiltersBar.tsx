'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';

const adminSearchFiltersSchema = z.object({
  query: z.string().optional(),
  specialty: z.string().optional(),
  status: z.string().optional(),
});

export type AdminSearchFiltersValues = z.input<typeof adminSearchFiltersSchema>;

export default function AdminSearchFiltersBar({
  queryPlaceholder,
  queryEndAdornment,
  specialtyPlaceholder,
  specialtyOptions,
  statusPlaceholder,
  statusOptions,
  filtersLeading,
  defaultValues,
  onChange,
}: {
  queryPlaceholder: string;
  queryEndAdornment?: ReactNode;
  specialtyPlaceholder?: string;
  specialtyOptions?: Array<{ label: string; value: string }>;
  statusPlaceholder?: string;
  statusOptions?: Array<{ label: string; value: string }>;
  filtersLeading?: ReactNode;
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

  const { register, watch } = useForm<AdminSearchFiltersValues>({
    resolver: zodResolver(adminSearchFiltersSchema),
    defaultValues: resolvedDefaultValues,
    mode: 'onChange',
  });

  const values = watch();

  useEffect(() => {
    onChange?.(values);
  }, [onChange, values]);

  const hasSpecialty = (specialtyOptions?.length ?? 0) > 0;
  const hasStatus = (statusOptions?.length ?? 0) > 0;
  const hasFilters = hasSpecialty || hasStatus || Boolean(filtersLeading);

  return (
    <section className='mt-5 rounded-[12px] border border-[#EEF2F6] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
      <div className='flex items-center justify-between gap-4'>
        <div className='relative flex-1'>
          <input
            placeholder={queryPlaceholder}
            {...register('query')}
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
                  {...register('specialty')}
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
                  {...register('status')}
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
          </div>
        ) : null}
      </div>
    </section>
  );
}
