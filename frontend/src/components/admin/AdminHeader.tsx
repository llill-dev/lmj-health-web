'use client';

import { useMemo, useState } from 'react';
import {
  Bell,
  Search,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Loader2,
} from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getAdminPageMeta } from '@/constant/adminPageMeta';
import { useAdminUnreadNotificationCount } from '@/hooks/useAdminNotifications';

type Props = {
  /** يتجاوز العنوان المستنتج من المسار */
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
};

export default function AdminHeader({
  title: titleOverride,
  subtitle: subtitleOverride,
  searchPlaceholder = 'بحث سريع… اضغط إدخال للانتقال إلى المرضى',
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const [loggingOut, setLoggingOut] = useState(false);

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

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await useAuthStore.getState().logout();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

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

      <div className='flex flex-1 items-center justify-end gap-4 px-4'>
        <div className='relative hidden max-w-[320px] flex-1 md:block'>
          <input
            type='search'
            placeholder={searchPlaceholder}
            className='h-[44px] w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm font-medium text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                navigate('/admin/patients');
              }
            }}
            aria-label='بحث سريع، إدخال للانتقال إلى المرضى'
          />
          <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'>
            <Search className='h-5 w-5' aria-hidden />
          </div>
        </div>
      </div>

      <div className='flex shrink-0 items-center gap-3'>
        <Link
          to='/admin/complaints'
          className='flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors hover:bg-gray-50'
          aria-label='الشكاوي والدعم'
          title='الشكاوي والدعم'
        >
          <HelpCircle className='h-5 w-5 text-gray-600' aria-hidden />
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
          <Bell className='h-5 w-5 text-gray-600' aria-hidden />
          {unreadLoading ? (
            <span className='absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-100'>
              <Loader2 className='h-3 w-3 animate-spin text-gray-500' aria-hidden />
            </span>
          ) : unreadBadge ? (
            <span className='absolute -end-1 -top-1 flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white'>
              {unreadBadge}
            </span>
          ) : null}
        </NavLink>

        <Link
          to='/admin/settings'
          className='flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors hover:bg-gray-50'
          aria-label='الإعدادات'
          title='الإعدادات'
        >
          <Settings className='h-5 w-5 text-gray-600' aria-hidden />
        </Link>

        <div className='h-[40px] w-[0.8px] bg-gray-200' aria-hidden />

        <Link
          to='/admin/settings'
          className='flex max-w-[200px] items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50'
          title='الإعدادات والملف'
        >
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100'>
            <User className='h-4 w-4 text-blue-600' aria-hidden />
          </div>
          <div className='min-w-0 text-right'>
            <div className='truncate text-sm font-medium text-gray-900'>
              {displayName}
            </div>
            <div className='truncate text-xs text-gray-500'>{displayLine2}</div>
          </div>
        </Link>

        <button
          type='button'
          disabled={loggingOut}
          onClick={() => void handleLogout()}
          className='flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60'
          aria-label='تسجيل الخروج'
          title='تسجيل الخروج'
        >
          {loggingOut ? (
            <Loader2 className='h-5 w-5 animate-spin text-gray-500' aria-hidden />
          ) : (
            <LogOut className='h-5 w-5 text-gray-600' aria-hidden />
          )}
        </button>
      </div>
    </header>
  );
}
