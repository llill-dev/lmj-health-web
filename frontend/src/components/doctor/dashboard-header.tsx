'use client';

import { Bell, MessageCircle, Search } from 'lucide-react';

export default function DashboardHeader({
  title = 'لوحة التحكم',
  subtitle = 'مرحباً، د. خالد عبدالله (وضع العرض)',
  searchPlaceholder = 'بحث...',
}: {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
}) {
  return (
    <header
      dir='rtl'
      lang='ar'
      className='flex h-[90px] pt-[16px] px-[32px] pb-[1.82px] w-full border-b-[1.82px] border-[#E5E7EB] items-center justify-between bg-[#FFFFFF]'
    >
      <div className='text-right'>
        <div className='font-cairo text-[22px] font-extrabold leading-[26px] text-[#111827]'>
          {title}
        </div>
        <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
          {subtitle}
        </div>
      </div>

      <div className='flex flex-1 items-center justify-center'>
        <div className='relative w-full max-w-[360px]'>
          <input
            type='text'
            placeholder={searchPlaceholder}
            className='h-[40px] w-full rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] ps-11 pe-4 font-cairo text-[13px] font-semibold text-[#111827] shadow-[0_10px_25px_rgba(0,0,0,0.06)] outline-none placeholder:font-cairo placeholder:font-medium placeholder:text-[#98A2B3]'
          />
          <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]'>
            <Search className='h-[18px] w-[18px]' />
          </div>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <button
          type='button'
          className='flex h-10 w-10 items-center justify-center rounded-[12px] bg-white shadow-[0_10px_25px_rgba(0,0,0,0.06)]'
          aria-label='الإشعارات'
        >
          <Bell className='h-[18px] w-[18px] text-[#16C5C0]' />
        </button>
        <div className='h-9 w-px bg-[#E5E7EB]' />
        <button
          type='button'
          className='flex h-10 w-10 items-center justify-center rounded-[12px] bg-white shadow-[0_10px_25px_rgba(0,0,0,0.06)]'
          aria-label='الرسائل'
        >
          <MessageCircle className='h-[18px] w-[18px] text-[#16C5C0]' />
        </button>
      </div>
    </header>
  );
}
