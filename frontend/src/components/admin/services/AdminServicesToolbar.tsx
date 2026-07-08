import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import StyledSelect from '@/components/ui/styled-select';
import type { Tab } from '@/components/admin/services/tabsConfig';
import { adminApi } from '@/lib/admin/client';
import type { FacilityStatus, FacilitiesListParams } from '@/lib/admin/types';

type FacilityFilterState = Pick<
  FacilitiesListParams,
  | 'status'
  | 'hasDoctors'
  | 'attribute'
  | 'ownerDoctorId'
  | 'name'
  | 'city'
  | 'sortBy'
  | 'sortOrder'
>;

const DEFAULT_FILTERS: FacilityFilterState = {
  sortBy: 'updatedAt',
  sortOrder: 'desc',
};

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='space-y-1.5'>
      <label className='block text-right font-cairo text-[11px] font-extrabold text-[#667085]'>
        {label}
      </label>
      {children}
    </div>
  );
}

const STATUS_OPTIONS: Array<{ value: '' | FacilityStatus; label: string }> = [
  { value: '', label: 'كل الحالات' },
  { value: 'ACTIVE', label: 'نشطة' },
  { value: 'PENDING', label: 'معلّقة' },
  { value: 'INACTIVE', label: 'غير نشطة' },
  { value: 'DELETED', label: 'محذوفة' },
];

const DOCTOR_LINK_OPTIONS: Array<{ value: 'all' | 'yes' | 'no'; label: string }> = [
  { value: 'all', label: 'كل الارتباطات' },
  { value: 'yes', label: 'مرتبطة بأطباء' },
  { value: 'no', label: 'بدون أطباء' },
];

const SORT_BY_OPTIONS: Array<{
  value: NonNullable<FacilitiesListParams['sortBy']>;
  label: string;
}> = [
  { value: 'updatedAt', label: 'آخر تحديث' },
  { value: 'createdAt', label: 'تاريخ الإنشاء' },
  { value: 'name', label: 'الاسم' },
  { value: 'city', label: 'المدينة' },
  { value: 'status', label: 'الحالة' },
  { value: 'facilityType', label: 'نوع المنشأة' },
  { value: 'doctorCount', label: 'عدد الأطباء' },
];

export function AdminServicesToolbar({
  tabs,
  searchInput,
  onSearchChange,
  searchDisabled,
  activeTabIdx,
  onTabChange,
  serviceTypesCount,
  facilityFilters,
  onFacilityFiltersChange,
}: {
  tabs: Tab[];
  searchInput: string;
  onSearchChange: (value: string) => void;
  searchDisabled: boolean;
  activeTabIdx: number;
  onTabChange: (idx: number) => void;
  serviceTypesCount: number;
  facilityFilters?: FacilityFilterState;
  onFacilityFiltersChange?: (next: FacilityFilterState) => void;
}) {
  const inputClass =
    'h-[42px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3.5 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/15';

  const showFilters = !searchDisabled && facilityFilters && onFacilityFiltersChange;

  const ownerDoctorsQuery = useQuery({
    queryKey: ['admin', 'facility-owner-filter-options'],
    queryFn: () =>
      adminApi.doctors.list({
        status: 'approved',
        page: 1,
        limit: 100,
      }),
    enabled: Boolean(showFilters),
    staleTime: 60_000,
  });

  const doctorLinkValue =
    facilityFilters?.hasDoctors === true
      ? 'yes'
      : facilityFilters?.hasDoctors === false
        ? 'no'
        : 'all';

  const ownerDoctorOptions = [
    { value: '', label: 'كل المالكين' },
    ...(ownerDoctorsQuery.data?.doctors ?? []).map((doctor) => ({
      value: doctor._id,
      label: doctor.user?.fullName || doctor._id,
    })),
  ];

  const hasActiveFilters = Boolean(
    facilityFilters &&
      (facilityFilters.status ||
        facilityFilters.hasDoctors !== undefined ||
        facilityFilters.attribute ||
        facilityFilters.ownerDoctorId ||
        facilityFilters.name ||
        facilityFilters.city ||
        (facilityFilters.sortBy ?? 'updatedAt') !== 'updatedAt' ||
        (facilityFilters.sortOrder ?? 'desc') !== 'desc' ||
        searchInput),
  );

  const handleReset = () => {
    onFacilityFiltersChange?.({ ...DEFAULT_FILTERS });
    onSearchChange('');
  };

  return (
    <section className='mt-6 rounded-[14px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
      {/* Tabs */}
      <div className='flex flex-wrap items-center gap-2'>
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const active = activeTabIdx === idx;
          const count = tab.kind === 'service-types' ? serviceTypesCount : 0;

          return (
            <button
              key={idx}
              type='button'
              onClick={() => onTabChange(idx)}
              className={
                active
                  ? 'inline-flex h-[38px] items-center gap-2 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_8px_18px_rgba(15,143,139,0.25)]'
                  : 'inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] transition hover:border-primary/40 hover:bg-[#F8FFFE]'
              }
            >
              <Icon className={active ? 'h-4 w-4 text-white' : 'h-4 w-4 text-[#667085]'} />
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={
                    active
                      ? 'inline-flex min-w-[20px] items-center justify-center rounded-[6px] bg-white/20 px-1.5 font-cairo text-[10px] font-black'
                      : 'inline-flex min-w-[20px] items-center justify-center rounded-[6px] bg-[#F2F4F7] px-1.5 font-cairo text-[10px] font-black text-[#667085]'
                  }
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className='relative mt-4'>
        <input
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder='ابحث عن منشأة بالاسم...'
          disabled={searchDisabled}
          className='h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-[#FAFBFC] pe-12 ps-4 text-right font-cairo text-[13px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 disabled:opacity-50'
        />
        <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
          <Search className='h-4 w-4' />
        </div>
      </div>

      {/* Filters & sorting */}
      {showFilters ? (
        <div className='mt-5 border-t border-[#F2F4F7] pt-4'>
          <div className='mb-3 flex items-center justify-between'>
            <div className='flex items-center gap-2 text-[#344054]'>
              <SlidersHorizontal className='h-4 w-4 text-primary' />
              <h4 className='font-cairo text-[13px] font-extrabold'>تصفية وفرز</h4>
            </div>
            <button
              type='button'
              onClick={handleReset}
              disabled={!hasActiveFilters}
              className='inline-flex h-[32px] items-center gap-1.5 rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#667085] transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40'
            >
              <RotateCcw className='h-3.5 w-3.5' />
              إعادة تعيين
            </button>
          </div>

          <div className='grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3'>
            <FilterField label='الحالة'>
              <StyledSelect
                size='sm'
                tone='muted'
                listboxAriaLabel='حالة المنشأة'
                value={facilityFilters!.status ?? ''}
                options={STATUS_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                onChange={(next) =>
                  onFacilityFiltersChange!({
                    ...facilityFilters!,
                    status: (next || undefined) as FacilityStatus | undefined,
                  })
                }
              />
            </FilterField>

            <FilterField label='الارتباط بالأطباء'>
              <StyledSelect
                size='sm'
                tone='muted'
                listboxAriaLabel='الارتباط بالأطباء'
                value={doctorLinkValue}
                options={DOCTOR_LINK_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                onChange={(next) =>
                  onFacilityFiltersChange!({
                    ...facilityFilters!,
                    hasDoctors: next === 'yes' ? true : next === 'no' ? false : undefined,
                  })
                }
              />
            </FilterField>

            <FilterField label='السمة'>
              <input
                value={facilityFilters!.attribute ?? ''}
                onChange={(event) =>
                  onFacilityFiltersChange!({
                    ...facilityFilters!,
                    attribute: event.target.value || undefined,
                  })
                }
                placeholder='مثال: night_shift'
                className={inputClass}
              />
            </FilterField>

            <FilterField label='اسم المنشأة'>
              <input
                value={facilityFilters!.name ?? ''}
                onChange={(event) =>
                  onFacilityFiltersChange!({
                    ...facilityFilters!,
                    name: event.target.value || undefined,
                  })
                }
                placeholder='مثال: مستشفى الشفاء'
                className={inputClass}
              />
            </FilterField>

            <FilterField label='المدينة'>
              <input
                value={facilityFilters!.city ?? ''}
                onChange={(event) =>
                  onFacilityFiltersChange!({
                    ...facilityFilters!,
                    city: event.target.value || undefined,
                  })
                }
                placeholder='مثال: دمشق'
                className={inputClass}
              />
            </FilterField>

            <FilterField label='الطبيب المالك'>
              <StyledSelect
                size='sm'
                tone='muted'
                listboxAriaLabel='الطبيب المالك'
                value={facilityFilters!.ownerDoctorId ?? ''}
                options={ownerDoctorOptions}
                onChange={(next) =>
                  onFacilityFiltersChange!({
                    ...facilityFilters!,
                    ownerDoctorId: next || undefined,
                  })
                }
                disabled={ownerDoctorsQuery.isLoading}
              />
            </FilterField>

            <FilterField label='ترتيب حسب'>
              <StyledSelect
                size='sm'
                tone='muted'
                listboxAriaLabel='ترتيب حسب'
                value={facilityFilters!.sortBy ?? 'updatedAt'}
                options={SORT_BY_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                onChange={(next) =>
                  onFacilityFiltersChange!({
                    ...facilityFilters!,
                    sortBy: next as NonNullable<FacilitiesListParams['sortBy']>,
                  })
                }
              />
            </FilterField>

            <FilterField label='اتجاه الترتيب'>
              <StyledSelect
                size='sm'
                tone='muted'
                listboxAriaLabel='اتجاه الترتيب'
                value={facilityFilters!.sortOrder ?? 'desc'}
                options={[
                  { value: 'desc', label: 'تنازلي' },
                  { value: 'asc', label: 'تصاعدي' },
                ]}
                onChange={(next) =>
                  onFacilityFiltersChange!({
                    ...facilityFilters!,
                    sortOrder: next as 'asc' | 'desc',
                  })
                }
              />
            </FilterField>
          </div>
        </div>
      ) : null}
    </section>
  );
}
