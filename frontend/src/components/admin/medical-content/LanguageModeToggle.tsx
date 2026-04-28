import type { LangFilter } from './contentListUtils';
import { cn } from '@/lib/utils';

export default function LanguageModeToggle({
  value,
  onChange,
}: {
  value: LangFilter;
  onChange: (v: LangFilter) => void;
}) {
  const inBinary = value === 'ar' || value === 'en';
  return (
    <div className='flex flex-wrap gap-2 justify-end items-center w-full min-w-0 sm:ms-auto sm:w-auto'>
      <span className='font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
        لغة المحتوى
      </span>
      <div className='flex min-w-0 items-center justify-end gap-1.5'>
        <button
          type='button'
          onClick={() => onChange('الكل')}
          className={cn(
            'h-9 shrink-0 rounded-full px-3 font-cairo text-[12px] font-extrabold transition',
            value === 'الكل'
              ? 'bg-primary text-white shadow-[0_6px_16px_rgba(15,143,139,0.3)]'
              : 'border border-[#E5E7EB] bg-white text-[#344054] shadow-sm hover:bg-[#F9FAFB]',
          )}
        >
          الكل
        </button>
        <div
          className='relative h-9 w-[11.25rem] max-w-full shrink-0 overflow-hidden rounded-full bg-primary p-0.5 shadow-[0_8px_22px_rgba(15,143,139,0.3)]'
          dir='rtl'
          role='group'
          aria-label='تبديل لغة العرض: العربية أو English'
        >
          <div
            className='pointer-events-none absolute top-0.5 bottom-0.5 w-[calc(50%-0.2rem)] rounded-full bg-white/30 shadow-inner transition-all duration-200 ease-out'
            style={{
              opacity: inBinary ? 1 : 0,
              insetInlineStart:
                value === 'en' ? 'calc(50% + 0.1rem)' : '0.2rem',
            }}
          />
          <div className='flex relative z-10 items-stretch w-full min-w-0 h-8'>
            <button
              type='button'
              onClick={() => onChange('ar')}
              className={cn(
                'flex-1 min-w-0 rounded-full font-cairo text-[12px] font-extrabold transition',
                value === 'ar'
                  ? 'text-white'
                  : 'text-white/75 hover:text-white',
              )}
            >
              العربية
            </button>
            <button
              type='button'
              onClick={() => onChange('en')}
              className={cn(
                'flex-1 min-w-0 rounded-full font-cairo text-[12px] font-extrabold transition',
                value === 'en'
                  ? 'text-white'
                  : 'text-white/75 hover:text-white',
              )}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
