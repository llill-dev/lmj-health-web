'use client';

import { ChevronLeft, ChevronsRight, LogOut, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sidebarItems, type SidebarItemId } from '@/constant/sidebar-items';

export default function Sidebar({
  active = 'appointments',
  collapsed = false,
  onToggleCollapse,
  onLogout,
}: {
  active?: SidebarItemId;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
}) {
  const [isHovering, setIsHovering] = useState(false);
  const effectiveCollapsed = collapsed && !isHovering;

  const handleCollapse = () => {
    setIsHovering(false);
    if (!collapsed) {
      onToggleCollapse?.();
    }
  };

  return (
    <aside
      dir='rtl'
      lang='ar'
      onMouseEnter={() => {
        if (collapsed) setIsHovering(true);
      }}
      onMouseLeave={() => {
        if (collapsed) setIsHovering(false);
      }}
      className={
        effectiveCollapsed
          ? 'relative z-50 h-screen w-[88px] shrink-0 border-[1.82px] border-[#E5E7EB] bg-[#FFFFFF] transition-[width] duration-300'
          : 'relative z-50 h-screen w-[320px] shrink-0 border-[1.82px] border-[#E5E7EB] bg-[#FFFFFF] transition-[width] duration-300'
      }
    >
      <div className='flex h-full flex-col'>
        <div
          className={
            effectiveCollapsed
              ? 'px-[16px] pt-[16px] pb-[16px] border-b-[1.82px] border-b-[#E5E7EB]'
              : 'px-[24px] pt-[24px] pb-[24px] border-b-[1.82px] border-b-[#E5E7EB]'
          }
        >
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-2'>
              <div className='mt-0.5 flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-[#16C5C0] shadow-[0_14px_30px_rgba(22,197,192,0.35)]'>
                <Stethoscope className='h-6 w-6 text-white' />
              </div>
              {!effectiveCollapsed ? (
                <div className='flex flex-col items-center text-center'>
                  <div className='font-cairo text-[18px] font-extrabold leading-[20px] text-[#111827]'>
                    LMJ HEALTH
                  </div>
                  <div className='mt-1 font-cairo text-[12px] font-bold leading-[14px] text-[#16C5C0]'>
                    بوابة الطبيب
                  </div>
                </div>
              ) : null}
            </div>

            <div className='flex items-center gap-2'>
              {!effectiveCollapsed ? (
                <button
                  type='button'
                  onClick={handleCollapse}
                  className='mt-1 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]'
                  aria-label='طي القائمة'
                >
                  <ChevronsRight className='h-5 w-5' />
                </button>
              ) : null}
            </div>
          </div>

          {!effectiveCollapsed ? (
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
          ) : null}
        </div>

        <nav
          className={
            effectiveCollapsed
              ? 'flex-1 overflow-y-auto scrollbar-hide p-3'
              : 'flex-1 overflow-y-auto scrollbar-hide p-[15.99px]'
          }
        >
          <div className='space-y-1'>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === active;

              return (
                <Link
                  key={item.path}
                  to={`/doctor/${item.path}`}
                  className={
                    isActive
                      ? effectiveCollapsed
                        ? 'relative flex w-full items-center justify-center rounded-[10px] bg-gradient-to-l from-[#18C6C0] via-[#12B9B4] to-[#0FA6A3] px-3 py-3 text-white shadow-[0_12px_24px_rgba(22,197,192,0.30)]'
                        : 'relative flex w-full items-center rounded-[6px] bg-gradient-to-l from-[#18C6C0] via-[#12B9B4] to-[#0FA6A3] px-4 py-[10px] text-white shadow-[0_12px_24px_rgba(22,197,192,0.30)]'
                      : effectiveCollapsed
                        ? 'relative flex w-full items-center justify-center rounded-[10px] px-3 py-3 text-[#344054] hover:bg-[#F2F4F7]'
                        : 'relative flex w-full items-center rounded-[6px] px-4 py-[10px] text-[#344054] hover:bg-[#F2F4F7]'
                  }
                >
                  <div
                    className={
                      effectiveCollapsed
                        ? 'flex items-center'
                        : 'flex items-center gap-3'
                    }
                  >
                    <Icon
                      className={
                        isActive
                          ? 'h-[18px] w-[18px] text-white'
                          : 'h-[18px] w-[18px] text-[#4A5565]'
                      }
                    />
                    {!effectiveCollapsed ? (
                      <span
                        className={
                          isActive
                            ? 'font-cairo leading-[24px] text-[#4A5565] text-[16px] font-extrabold'
                            : 'font-cairo leading-[24px] text-[#4A5565] text-[16px] font-bold'
                        }
                      >
                        {item.label}
                      </span>
                    ) : null}
                  </div>

                  {!effectiveCollapsed && typeof item.badge === 'number' ? (
                    <div
                      className={
                        isActive
                          ? 'ms-auto flex h-[26px] min-w-[26px] items-center justify-center rounded-full bg-white px-2 font-cairo text-[12px] font-extrabold text-[#16C5C0] shadow-[0_10px_20px_rgba(0,0,0,0.10)]'
                          : 'ms-auto flex h-[26px] min-w-[26px] items-center justify-center rounded-full bg-[#16C5C0] px-2 font-cairo text-[12px] font-extrabold text-white shadow-[0_10px_20px_rgba(22,197,192,0.25)]'
                      }
                    >
                      {item.badge}
                    </div>
                  ) : !effectiveCollapsed ? (
                    <span className='ms-auto w-6' />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </nav>

        <div
          className={
            effectiveCollapsed
              ? 'border-t-[1.82px] border-t-[#E5E7EB] p-3'
              : 'h-[69.8px] border-t-[1.82px] border-t-[#E5E7EB] px-[16px] py-[17.81px]'
          }
        >
          <button
            type='button'
            onClick={onLogout}
            className={
              effectiveCollapsed
                ? 'flex w-full items-center justify-center rounded-[10px] p-3 text-[#E11D48] hover:bg-[#FFF1F2] hover:text-[#BE123C]'
                : 'flex w-full items-center justify-start gap-2 font-cairo text-[14px] font-extrabold text-[#E11D48] hover:text-[#BE123C]'
            }
          >
            <LogOut className='h-4 w-4' />
            {!effectiveCollapsed ? 'تسجيل الخروج' : null}
          </button>
        </div>
      </div>
    </aside>
  );
}
