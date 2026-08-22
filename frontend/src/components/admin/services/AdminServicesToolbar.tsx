import { Search } from 'lucide-react';
import StyledSelect from '@/components/ui/styled-select';
import { resolveLabel } from '@/lib/admin/types';
import type { ProviderStatus, ServiceType } from '@/lib/admin/types';

const STATUS_OPTIONS: Array<{ value: '' | ProviderStatus; ar: string; en: string }> = [
  { value: '', ar: 'كل الحالات', en: 'All statuses' },
  { value: 'draft', ar: 'مسودة', en: 'Draft' },
  { value: 'active', ar: 'نشط', en: 'Active' },
  { value: 'inactive', ar: 'معطّل', en: 'Inactive' },
];

export function AdminServicesToolbar({
  serviceTypes,
  isLoadingTypes,
  selectedTypeId,
  onSelectType,
  status,
  onStatusChange,
  searchInput,
  onSearchChange,
  locale,
}: {
  serviceTypes: ServiceType[];
  isLoadingTypes: boolean;
  selectedTypeId: string;
  onSelectType: (id: string) => void;
  status: '' | ProviderStatus;
  onStatusChange: (status: '' | ProviderStatus) => void;
  searchInput: string;
  onSearchChange: (value: string) => void;
  locale: 'ar' | 'en';
}) {
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);

  return (
    <section className='mt-6 rounded-[14px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
      {/* Service-type tabs — built at runtime from the real /service-types catalog */}
      <div className='flex flex-wrap items-center gap-2'>
        <button
          type='button'
          onClick={() => onSelectType('')}
          className={
            selectedTypeId === ''
              ? 'inline-flex h-[38px] items-center gap-2 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_8px_18px_rgba(15,143,139,0.25)]'
              : 'inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] transition hover:border-primary/40 hover:bg-[#F8FFFE]'
          }
        >
          {tr('كل الأنواع', 'All types')}
        </button>

        {isLoadingTypes ? (
          <span className='font-cairo text-[12px] font-semibold text-[#98A2B3]'>
            {tr('جارٍ تحميل الأنواع…', 'Loading types…')}
          </span>
        ) : (
          serviceTypes.map((type) => {
            const active = selectedTypeId === type._id;
            const label = resolveLabel(type.name, locale) || type.slug;
            return (
              <button
                key={type._id}
                type='button'
                onClick={() => onSelectType(type._id)}
                className={
                  active
                    ? 'inline-flex h-[38px] items-center gap-2 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white shadow-[0_8px_18px_rgba(15,143,139,0.25)]'
                    : 'inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] transition hover:border-primary/40 hover:bg-[#F8FFFE]'
                }
              >
                <span>{label}</span>
                {!type.isActive ? (
                  <span
                    className={
                      active
                        ? 'inline-flex h-[6px] w-[6px] rounded-full bg-white/70'
                        : 'inline-flex h-[6px] w-[6px] rounded-full bg-amber-400'
                    }
                    aria-hidden
                    title={tr('نوع غير مُفعّل', 'Inactive type')}
                  />
                ) : null}
              </button>
            );
          })
        )}
      </div>

      {/* Status + search */}
      <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[200px_1fr]'>
        <StyledSelect
          size='sm'
          tone='muted'
          value={status}
          listboxAriaLabel={tr('الحالة', 'Status')}
          options={STATUS_OPTIONS.map((option) => ({
            value: option.value,
            label: tr(option.ar, option.en),
          }))}
          onChange={(next) => onStatusChange(next as '' | ProviderStatus)}
        />

        <div className='relative'>
          <input
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={tr('ابحث بالاسم أو المدينة…', 'Search by name or city…')}
            className='h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-[#FAFBFC] pe-12 ps-4 text-right font-cairo text-[13px] font-bold text-[#111827] outline-none transition placeholder:text-[#98A2B3] focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15'
          />
          <div className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
            <Search className='h-4 w-4' />
          </div>
        </div>
      </div>
    </section>
  );
}
