'use client';

import { ChevronLeft, LogOut, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { sidebarItems, type SidebarItemId } from '@/constant/sidebar-items';

export default function Sidebar({
  active = 'appointments',
  onBack,
  onLogout,
}: {
  active?: SidebarItemId;
  onBack?: () => void;
  onLogout?: () => void;
}) {
  return (
    <aside
      dir='rtl'
      lang='ar'
      className='relative w-[320px] shrink-0 border-l-[1.82px] border-[#E5E7EB] bg-[#FFFFFF]'
    >
      <div className='flex flex-col justify-between min-h-screen'>
        <div className='px-[24px] pt-[24px] pb-[24px] border-b-[1.82px] border-[#E5E7EB] gap-[24px]'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-2'>
              <div className='mt-0.5 flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-[#16C5C0] shadow-[0_14px_30px_rgba(22,197,192,0.35)]'>
                <Stethoscope className='h-6 w-6 text-white' />
              </div>
              <div className='flex flex-col items-center text-center'>
                <div className='font-cairo text-[18px] font-extrabold leading-[20px] text-[#111827]'>
                  LMJ HEALTH
                </div>
                <div className='mt-1 font-cairo text-[12px] font-bold leading-[14px] text-[#16C5C0]'>
                  بوابة الطبيب
                </div>
              </div>
            </div>
            <button
              type='button'
              onClick={onBack}
              className='mt-1 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]'
              aria-label='رجوع'
            >
              <ChevronLeft className='h-5 w-5' />
            </button>
          </div>

          <div className='mt-6 rounded-[6px] border border-[#BFEDEC] bg-[#F2FFFE] px-4 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.06)]'>
            <div className='flex items-center gap-3'>
              <div className='flex h-[46px] w-[46px] items-center justify-center rounded-[6px] bg-[#16C5C0] text-white shadow-[0_12px_25px_rgba(22,197,192,0.35)]'>
                <span className='font-cairo text-[18px] font-extrabold leading-none'>
                  د
                </span>
              </div>
              <div className='flex-1'>
                <div className='text-right font-cairo text-[14px] font-extrabold leading-[18px] text-[#111827]'>
                  د. خالد عبدالله
                </div>
                <div className='mt-1 text-right font-cairo text-[12px] font-medium leading-[16px] text-[#667085]'>
                  doctor1@example.com
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className='pt-[15.99px] px-[15.99px]'>
          <div className='space-y-1'>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === active;

              return (
                <Link
                  key={item.path}
                  href={`/${item.path}`}
                  className={
                    isActive
                      ? 'relative flex w-full items-center rounded-[6px] bg-gradient-to-l from-[#18C6C0] via-[#12B9B4] to-[#0FA6A3] px-4 py-[10px] text-white shadow-[0_12px_24px_rgba(22,197,192,0.30)]'
                      : 'relative flex w-full items-center rounded-[6px] px-4 py-[10px] text-[#344054] hover:bg-[#F2F4F7]'
                  }
                >
                  <div className='flex items-center gap-3'>
                    <Icon
                      className={
                        isActive
                          ? 'h-[18px] w-[18px] text-white'
                          : 'h-[18px] w-[18px] text-[#4A5565]'
                      }
                    />
                    <span
                      className={
                        isActive
                          ? 'font-cairo leading-[24px] text-[#4A5565] text-[16px] font-extrabold'
                          : 'font-cairo leading-[24px] text-[#4A5565] text-[16px] font-bold'
                      }
                    >
                      {item.label}
                    </span>
                  </div>

                  {typeof item.badge === 'number' ? (
                    <div
                      className={
                        isActive
                          ? 'ms-auto flex h-[26px] min-w-[26px] items-center justify-center rounded-full bg-white px-2 font-cairo text-[12px] font-extrabold text-[#16C5C0] shadow-[0_10px_20px_rgba(0,0,0,0.10)]'
                          : 'ms-auto flex h-[26px] min-w-[26px] items-center justify-center rounded-full bg-[#16C5C0] px-2 font-cairo text-[12px] font-extrabold text-white shadow-[0_10px_20px_rgba(22,197,192,0.25)]'
                      }
                    >
                      {item.badge}
                    </div>
                  ) : (
                    <span className='ms-auto w-6' />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className='h-[69.8px] border-t-[1.82px] px-[16px] [17.81px]'>
          <button
            type='button'
            onClick={onLogout}
            className='mt-6 flex w-full items-center justify-start gap-2 font-cairo text-[14px] font-extrabold text-[#E11D48] hover:text-[#BE123C]'
          >
            <LogOut className='h-4 w-4' />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </aside>
  );
}
