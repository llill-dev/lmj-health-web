import { Loader2, Search } from 'lucide-react';
import type { Tab } from '@/components/admin/services/tabsConfig';

export function AdminServicesToolbar({
  tabs,
  searchInput,
  onSearchChange,
  searchDisabled,
  isFetching,
  activeTabIdx,
  onTabChange,
  serviceTypesCount,
}: {
  tabs: Tab[];
  searchInput: string;
  onSearchChange: (value: string) => void;
  searchDisabled: boolean;
  isFetching: boolean;
  activeTabIdx: number;
  onTabChange: (idx: number) => void;
  serviceTypesCount: number;
}) {
  return (
    <section className='mt-6 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)]'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='relative min-w-[180px] flex-1'>
          <input
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='ابحث عن منشأة...'
            disabled={searchDisabled}
            className='h-[40px] w-full rounded-[10px] border border-[#E5E7EB] bg-white pe-12 ps-4 text-right font-cairo text-[12px] font-bold text-[#111827] outline-none placeholder:text-[#98A2B3] focus:border-primary disabled:opacity-50'
          />
          <div className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
            {isFetching ? (
              <Loader2 className='h-4 w-4 animate-spin text-primary' />
            ) : (
              <Search className='h-4 w-4' />
            )}
          </div>
        </div>

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
                    ? 'inline-flex h-[34px] items-center gap-2 rounded-[10px] bg-primary px-4 font-cairo text-[12px] font-extrabold text-white'
                    : 'inline-flex h-[34px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#111827] hover:border-primary/40'
                }
              >
                <Icon className={active ? 'h-4 w-4 text-white' : 'h-4 w-4 text-[#667085]'} />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className='inline-flex min-w-[20px] items-center justify-center rounded-[6px] bg-white/20 px-1.5 font-cairo text-[10px] font-black'>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
