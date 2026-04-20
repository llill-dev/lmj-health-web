import { Layers } from 'lucide-react';
import type { ServiceType } from '@/lib/admin/services/types';
import { resolveLabel } from '@/lib/admin/services/types';

export function ServiceTypeCard({ st }: { st: ServiceType }) {
  const nameAr = resolveLabel(st.name, 'ar');
  const nameEn = resolveLabel(st.name, 'en');
  return (
    <div className='flex items-start justify-between rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_12px_24px_rgba(0,0,0,0.06)]'>
      <div className='flex items-start gap-4'>
        <div className='flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[10px] bg-[#F0FDF4] text-emerald-600'>
          <Layers className='h-5 w-5' />
        </div>
        <div className='text-right'>
          <div className='flex items-center gap-2'>
            <span className='font-cairo text-[15px] font-black text-[#111827]'>{nameAr || nameEn}</span>
            {nameAr && nameEn && (
              <span className='font-cairo text-[12px] text-[#98A2B3]'>({nameEn})</span>
            )}
            <span
              className={`inline-flex items-center rounded-[6px] px-2 py-0.5 font-cairo text-[11px] font-extrabold ${
                st.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {st.isActive ? 'نشط' : 'غير نشط'}
            </span>
          </div>
          <div className='mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]'>
            <span dir='ltr'>{st.slug}</span>
            {' · '}نسخة المخطط: {st.schemaVersion}
            {' · '}
            {st.fields.length} حقل
          </div>
          {st.fields.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-1.5'>
              {st.fields.map((f) => (
                <span
                  key={f.key}
                  className='inline-flex items-center gap-1 rounded-[5px] border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 font-cairo text-[11px] font-bold text-[#344054]'
                >
                  <span dir='ltr'>{f.key}</span>
                  <span className='text-[#98A2B3]'>{f.type}</span>
                  {f.required && <span className='text-red-400'>*</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
