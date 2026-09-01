import { Clock } from 'lucide-react';
import type { DoctorLibraryItem } from '@/lib/doctor/library/libraryTypes';
import { useI18n } from '@/i18n/provider';

export function ClinicalLibraryRecentStrip({
  items,
  typeLabels,
  isAwaitingData,
}: {
  items: DoctorLibraryItem[];
  typeLabels: Record<string, string>;
  isAwaitingData: boolean;
}) {
  const { t } = useI18n();
  if (isAwaitingData) {
    return (
      <div className='mb-5 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-3 font-cairo text-[12px] font-semibold text-[#667085]'>
        {t('doctor.clinicalLibrary.recent.loading')}
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <section className='mb-5 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-4 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)] sm:px-5'>
      <div className='mb-3 flex items-center justify-between gap-2'>
        <h2 className='inline-flex items-center gap-2 font-cairo text-[13px] font-extrabold text-[#111827]'>
          <Clock className='h-4 w-4 text-primary' aria-hidden />
          {t('doctor.clinicalLibrary.recent.title')}
        </h2>
      </div>
      <div className='flex gap-2 overflow-x-auto pb-1'>
        {items.map((item) => (
          <div
            key={item._id}
            className='min-w-[180px] shrink-0 rounded-[10px] border border-[#E6F4F3] bg-[#F0FDFA] px-3 py-2 text-start'
          >
            <div className='truncate font-cairo text-[12px] font-extrabold text-[#111827]'>
              {item.label ?? '—'}
            </div>
            <div className='mt-0.5 font-cairo text-[11px] font-semibold text-[#667085]'>
              {item.type ? typeLabels[item.type] ?? item.type : '—'}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
