'use client';

import { ChevronsRight, LogOut, Stethoscope } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  adminSidebarItems,
  sidebarItems,
  type AdminSidebarItemId,
  type SidebarItemId,
} from '@/constant/sidebar-items';
import { useAdminBrandingForSidebar } from '@/contexts/AdminAppSettingsContext';

export default function Sidebar({
  active,
  role = 'doctor',
  collapsed = false,
  onToggleCollapse,
  onLogout,
}: {
  active?: SidebarItemId | AdminSidebarItemId;
  role?: 'doctor' | 'admin';
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
}) {
  const navItems = useMemo(() => {
    return role === 'admin' ? adminSidebarItems : sidebarItems;
  }, [role]);

  const adminBranding = useAdminBrandingForSidebar();
  const brandTitle =
    role === 'admin' ? adminBranding.appName.trim() || 'LMJ HEALTH' : 'LMJ HEALTH';
  const brandSubtitle =
    role === 'admin'
      ? adminBranding.appDescription.trim() || 'بوابة الإدارة'
      : 'بوابة الطبيب';

  const basePath = role === 'admin' ? '/admin' : '/doctor';

  const resolvedActive =
    (active as (SidebarItemId | AdminSidebarItemId) | undefined) ??
    (role === 'admin' ? 'overview' : 'dashboard');

  return (
    <aside
      dir='rtl'
      lang='ar'
      className={
        collapsed
          ? 'relative z-50 h-screen w-[88px] shrink-0 border-[1.82px] border-[#E5E7EB] bg-[#FFFFFF] transition-[width] duration-300'
          : 'relative z-50 h-screen w-[320px] shrink-0 border-[1.82px] border-[#E5E7EB] bg-[#FFFFFF] transition-[width] duration-300'
      }
    >
      <div className='flex h-full flex-col'>
        <div
          className={
            collapsed
              ? 'px-[16px] pt-[16px] pb-[16px] border-b-[1.82px] border-b-[#E5E7EB]'
              : 'px-[24px] pt-[24px] pb-[24px] border-b-[1.82px] border-b-[#E5E7EB]'
          }
        >
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-2'>
              {!collapsed ? (
                <>
                  <div className='mt-0.5 flex h-[44px] w-[44px] shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-primary shadow-[0_14px_30px_rgba(15,143,139,0.30)]'>
                    {role === 'admin' && adminBranding.logo.dataUrl ? (
                      <img
                        src={adminBranding.logo.dataUrl}
                        alt=''
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <Stethoscope className='h-6 w-6 text-white' aria-hidden />
                    )}
                  </div>
                  <div className='flex min-w-0 flex-col items-center text-center'>
                    <div className='max-w-[200px] truncate font-cairo text-[18px] font-extrabold leading-[20px] text-[#111827]'>
                      {brandTitle}
                    </div>
                    <div
                      className='mt-1 max-w-[220px] line-clamp-2 font-cairo text-[12px] font-bold leading-[14px] text-primary'
                      title={brandSubtitle}
                    >
                      {brandSubtitle}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={onToggleCollapse}
                className={
                  collapsed
                    ? 'mt-1 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]'
                    : 'mt-1 flex h-9 w-9 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]'
                }
                aria-label={collapsed ? 'فتح القائمة' : 'طي القائمة'}
              >
                <ChevronsRight
                  className={collapsed ? 'h-5 w-5 rotate-180' : 'h-5 w-5'}
                />
              </button>
            </div>
          </div>

          {!collapsed ? (
            <div className='mt-6 rounded-[6px] border border-[#BFEDEC] bg-[#F2FFFE] px-4 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.06)]'>
              <div className='flex items-center gap-3'>
                <div className='flex h-[46px] w-[46px] items-center justify-center overflow-hidden rounded-[6px] bg-primary text-white shadow-[0_12px_25px_rgba(15,143,139,0.30)]'>
                  {role === 'admin' && adminBranding.logo.dataUrl ? (
                    <img
                      src={adminBranding.logo.dataUrl}
                      alt=''
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <span className='font-cairo text-[18px] font-extrabold leading-none'>
                      {role === 'admin'
                        ? (adminBranding.appName.trim().charAt(0) || 'م')
                        : 'د'}
                    </span>
                  )}
                </div>
                <div className='flex-1'>
                  <div className='text-right font-cairo text-[14px] font-extrabold leading-[18px] text-[#111827]'>
                    {role === 'admin' ? 'المدير' : 'د. خالد عبدالله'}
                  </div>
                  <div className='mt-1 text-right font-cairo text-[12px] font-medium leading-[16px] text-[#667085]'>
                    {role === 'admin'
                      ? 'admin@lmjhealth.com'
                      : 'doctor1@example.com'}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <nav
          className={
            collapsed
              ? 'flex-1 overflow-y-auto scrollbar-hide p-3'
              : 'flex-1 overflow-y-auto scrollbar-hide p-[15.99px]'
          }
        >
          <div className='space-y-1'>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === resolvedActive;

              return (
                <Link
                  key={item.path}
                  to={`${basePath}/${item.path}`}
                  className={
                    isActive
                      ? collapsed
                        ? 'relative flex w-full items-center justify-center rounded-[10px] bg-primary px-3 py-3 text-white shadow-[0_12px_24px_rgba(15,143,139,0.30)]'
                        : 'relative flex w-full items-center rounded-[6px] bg-primary px-4 py-[10px] text-white shadow-[0_12px_24px_rgba(15,143,139,0.30)]'
                      : collapsed
                        ? 'relative flex w-full items-center justify-center rounded-[10px] px-3 py-3 text-[#344054] hover:bg-[#F2F4F7]'
                        : 'relative flex w-full items-center rounded-[6px] px-4 py-[10px] text-[#344054] hover:bg-[#F2F4F7]'
                  }
                >
                  <div
                    className={
                      collapsed
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
                    {!collapsed ? (
                      <span
                        className={
                          isActive
                            ? 'font-cairo text-[16px] font-extrabold leading-[24px] text-white'
                            : 'font-cairo text-[16px] font-bold leading-[24px] text-[#4A5565]'
                        }
                      >
                        {item.label}
                      </span>
                    ) : null}
                  </div>

                  {!collapsed && typeof item.badge === 'number' ? (
                    <div
                      className={
                        isActive
                          ? 'ms-auto flex h-[26px] min-w-[26px] items-center justify-center rounded-full bg-white px-2 font-cairo text-[12px] font-extrabold text-primary shadow-[0_10px_20px_rgba(0,0,0,0.10)]'
                          : 'ms-auto flex h-[26px] min-w-[26px] items-center justify-center rounded-full bg-primary px-2 font-cairo text-[12px] font-extrabold text-white shadow-[0_10px_20px_rgba(15,143,139,0.25)]'
                      }
                    >
                      {item.badge}
                    </div>
                  ) : !collapsed ? (
                    <span className='ms-auto w-6' />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </nav>

        <div
          className={
            collapsed
              ? 'border-t-[1.82px] border-t-[#E5E7EB] p-3'
              : 'h-[69.8px] border-t-[1.82px] border-t-[#E5E7EB] px-[16px] py-[17.81px]'
          }
        >
          <button
            type='button'
            onClick={onLogout}
            className={
              collapsed
                ? 'flex w-full items-center justify-center rounded-[10px] p-3 text-[#E11D48] hover:bg-[#FFF1F2] hover:text-[#BE123C]'
                : 'flex w-full items-center justify-start gap-2 font-cairo text-[14px] font-extrabold text-[#E11D48] hover:text-[#BE123C]'
            }
          >
            <LogOut className='h-4 w-4' />
            {!collapsed ? 'تسجيل الخروج' : null}
          </button>
        </div>
      </div>
    </aside>
  );
}
