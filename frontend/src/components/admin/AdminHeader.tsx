'use client';

import { useMemo } from 'react';
import {
  Bell,
  Search,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Loader2,
} from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getAdminPageMeta } from '@/constant/adminPageMeta';
import { useAdminUnreadNotificationCount } from '@/hooks/useAdminNotifications';

type Props = {
  /** يتجاوز العنوان المستنتج من المسار */
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  /** فتح حوار التأكيد (التسجيل الفعلي في الـ layout) */
  onLogoutClick: () => void;
  /** أثناء تنفيذ تسجيل الخروج من الـ layout */
  loggingOut?: boolean;
};

export default function AdminHeader({
  title: titleOverride,
  subtitle: subtitleOverride,
  searchPlaceholder = 'بحث سريع… اضغط إدخال للانتقال إلى المرضى',
  onLogoutClick,
  loggingOut = false,
}: Props) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const { data: unreadTotal, isFetching: unreadLoading } =
    useAdminUnreadNotificationCount();

  const { title, subtitle } = useMemo(() => {
    const m = getAdminPageMeta(location.pathname);
    return {
      title: titleOverride ?? m.title,
      subtitle: subtitleOverride ?? m.subtitle,
    };
  }, [location.pathname, titleOverride, subtitleOverride]);

  const displayName = user?.name?.trim() || user?.email || 'مدير النظام';
  const displayLine2 = user?.email && user?.name ? user.email : 'متصل';

  const unreadBadge =
    typeof unreadTotal === 'number' && unreadTotal > 0
      ? unreadTotal > 99
        ? '99+'
        : String(unreadTotal)
      : null;

  return (
    <header
      dir='rtl'
      lang='ar'
      className='flex h-[90px] w-full items-center justify-between border-b border-gray-200 bg-white px-6'
    >
      <section>
        <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
          {title}
        </div>
        <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
          {subtitle}
        </div>
      </section>

      <div className='flex gap-3 items-center shrink-0'>
        <Link
          to='/admin/complaints'
          className='flex justify-center items-center w-10 h-10 bg-white rounded-lg border border-gray-200 transition-colors hover:bg-gray-50'
          aria-label='الشكاوي والدعم'
          title='الشكاوي والدعم'
        >
          <HelpCircle className='w-5 h-5 text-gray-600' aria-hidden />
        </Link>

        <NavLink
          to='/admin/notifications'
          className={({ isActive }) =>
            `relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
              isActive
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`
          }
          aria-label='الإشعارات'
          title='الإشعارات'
        >
          <Bell className='w-5 h-5 text-gray-600' aria-hidden />
          {unreadLoading ? (
            <span className='flex absolute -top-1 justify-center items-center w-5 h-5 bg-gray-100 rounded-full -end-1'>
              <Loader2 className='w-3 h-3 text-gray-500 animate-spin' aria-hidden />
            </span>
          ) : unreadBadge ? (
            <span className='absolute -end-1 -top-1 flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white'>
              {unreadBadge}
            </span>
          ) : null}
        </NavLink>

        <Link
          to='/admin/settings'
          className='flex justify-center items-center w-10 h-10 bg-white rounded-lg border border-gray-200 transition-colors hover:bg-gray-50'
          aria-label='الإعدادات'
          title='الإعدادات'
        >
          <Settings className='w-5 h-5 text-gray-600' aria-hidden />
        </Link>

        <div className='h-[40px] w-[0.8px] bg-gray-200' aria-hidden />

        <Link
          to='/admin/settings'
          className='flex max-w-[200px] items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50'
          title='الإعدادات والملف'
        >
          <div className='flex justify-center items-center w-8 h-8 bg-blue-100 rounded-full shrink-0'>
            <User className='w-4 h-4 text-blue-600' aria-hidden />
          </div>
          <div className='min-w-0 text-right'>
            <div className='text-sm font-medium text-gray-900 truncate'>
              {displayName}
            </div>
            <div className='text-xs text-gray-500 truncate'>{displayLine2}</div>
          </div>
        </Link>

        <button
          type='button'
          disabled={loggingOut}
          onClick={onLogoutClick}
          className='flex justify-center items-center w-10 h-10 bg-white rounded-lg border border-gray-200 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60'
          aria-label='تسجيل الخروج'
          title='تسجيل الخروج'
        >
          {loggingOut ? (
            <Loader2 className='w-5 h-5 text-gray-500 animate-spin' aria-hidden />
          ) : (
            <LogOut className='w-5 h-5 text-gray-600' aria-hidden />
          )}
        </button>
      </div>
    </header>
  );
}
