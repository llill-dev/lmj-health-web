'use client';

import { useMemo } from 'react';
import {
  ArrowRight,
  Bell,
  HelpCircle,
  Loader2,
  LogOut,
  Menu,
  Settings,
  User,
} from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  getAdminBackNavigation,
  getAdminPageMeta,
} from '@/constant/adminPageMeta';
import { useAdminUnreadNotificationCount } from '@/hooks/admin/notifications/useAdminNotifications';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/i18n/provider';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

type Props = {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
  onLogoutClick: () => void;
  loggingOut?: boolean;
};

export default function AdminHeader({
  title: titleOverride,
  subtitle: subtitleOverride,
  onMenuClick,
  onLogoutClick,
  loggingOut = false,
}: Props) {
  const { dir, locale, t } = useI18n();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { data: unreadTotal, isAwaitingData: unreadAwaiting } =
    useAdminUnreadNotificationCount();

  const { title, subtitle } = useMemo(() => {
    const m = getAdminPageMeta(location.pathname);
    const topSegment = location.pathname
      .replace(/^\/admin\/?/, '')
      .split('/')
      .filter(Boolean)[0];
    const localTitle =
      topSegment === 'overview' || topSegment === 'dashboard' || !topSegment
        ? t('admin.meta.overview.title', m.title)
        : t(`sidebar.item.${topSegment}`, m.title);
    const localSubtitle =
      topSegment === 'overview' || topSegment === 'dashboard' || !topSegment
        ? t('admin.meta.overview.subtitle', m.subtitle)
        : t('admin.meta.dataManagement.subtitle', m.subtitle);
    return {
      title: titleOverride ?? localTitle,
      subtitle: subtitleOverride ?? localSubtitle,
    };
  }, [location.pathname, titleOverride, subtitleOverride, t]);

  const backNavigation = useMemo(() => {
    const back = getAdminBackNavigation(location.pathname);
    if (!back) return null;

    return {
      href: back.href,
      label: t(
        'header.backToSection',
        `Back to ${t(`sidebar.item.${back.section}`, back.section)}`,
      ).replace('{section}', t(`sidebar.item.${back.section}`, back.section)),
    };
  }, [location.pathname, t]);

  const displayName =
    user?.name?.trim() || user?.email || t('header.defaultAdminName');
  const displayLine2 =
    user?.email && user?.name ? user.email : t('header.connected');

  const unreadBadge =
    typeof unreadTotal === 'number' && unreadTotal > 0
      ? unreadTotal > 99
        ? '99+'
        : String(unreadTotal)
      : null;

  const backIconClassName = dir === 'rtl' ? 'rotate-180' : '';

  return (
    <header
      dir={dir}
      lang={locale}
      className='flex min-h-[90px] w-full flex-nowrap items-center justify-between gap-2 border-b border-gray-100 bg-white px-4 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:gap-4 sm:px-6'
    >
      <section className='flex min-w-0 flex-1 items-center gap-3'>
        <button
          type='button'
          onClick={onMenuClick}
          className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-700 transition-colors hover:bg-gray-50 sm:h-10 sm:w-10 lg:hidden'
          aria-label={t('common.openSidebar')}
        >
          <Menu className='h-4 w-4 sm:h-5 sm:w-5' aria-hidden />
        </button>
        <div className='min-w-0'>
          {backNavigation ? (
            <Link
              to={backNavigation.href}
              className='mb-2 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[12px] font-semibold text-gray-700 transition-colors hover:border-primary/25 hover:bg-primary/5 hover:text-primary'
            >
              <ArrowRight className={`h-3.5 w-3.5 ${backIconClassName}`} aria-hidden />
              <span>{backNavigation.label}</span>
            </Link>
          ) : null}
          <div className='truncate font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
            {title}
          </div>
          <div className='mt-1 line-clamp-2 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
            {subtitle}
          </div>
        </div>
      </section>

      <div className='flex shrink-0 items-center justify-end gap-1.5 sm:gap-2 lg:gap-3'>
        {/* Support: reachable from the sidebar drawer on mobile, so it only takes header space from sm up */}
        <Link
          to='/admin/complaints'
          className='hidden h-10 w-10 items-center justify-center rounded-lg border border-gray-100 bg-white transition-colors hover:bg-gray-50 sm:flex'
          aria-label={t('header.adminSupport')}
          title={t('header.adminSupport')}
        >
          <HelpCircle className='h-5 w-5 text-gray-600' aria-hidden />
        </Link>

        {/* Notifications stay visible at every size — the unread badge needs to be glanceable */}
        <NavLink
          to='/admin/notifications'
          className={({ isActive }) =>
            `relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors sm:h-10 sm:w-10 ${
              isActive
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-100 bg-white hover:bg-gray-50'
            }`
          }
          aria-label={t('header.notifications')}
          title={t('header.notifications')}
        >
          <Bell className='h-4 w-4 text-gray-600 sm:h-5 sm:w-5' aria-hidden />
          {unreadAwaiting ? (
            <span className='absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-100'>
              <Loader2
                className='h-3 w-3 animate-spin text-gray-500'
                aria-hidden
              />
            </span>
          ) : unreadBadge ? (
            <span className='absolute -end-1 -top-1 flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white'>
              {unreadBadge}
            </span>
          ) : null}
        </NavLink>

        {/* Settings: also a sidebar nav item, so drop it from the mobile header */}
        <Link
          to='/admin/settings'
          className='hidden h-10 w-10 items-center justify-center rounded-lg border border-gray-100 bg-white transition-colors hover:bg-gray-50 sm:flex'
          aria-label={t('header.settings')}
          title={t('header.settings')}
        >
          <Settings className='h-5 w-5 text-gray-600' aria-hidden />
        </Link>

        <div className='hidden h-[40px] w-[0.8px] bg-gray-200 sm:block' aria-hidden />

        <Link
          to='/admin/settings'
          className='hidden max-w-[200px] min-w-0 items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50 sm:flex'
          title={t('header.settingsProfile')}
        >
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100'>
            <User className='h-4 w-4 text-blue-600' aria-hidden />
          </div>
          <div className='min-w-0 text-start'>
            <div className='truncate text-sm font-medium text-gray-900'>
              {displayName}
            </div>
            <div className='truncate text-xs text-gray-500'>{displayLine2}</div>
          </div>
        </Link>

        {/* Logout: the mobile sidebar drawer already exposes its own logout action */}
        <button
          type='button'
          disabled={loggingOut}
          onClick={onLogoutClick}
          className='hidden h-10 w-10 items-center justify-center rounded-lg border border-gray-100 bg-white transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60 sm:flex'
          aria-label={t('common.logout')}
          title={t('common.logout')}
        >
          {loggingOut ? (
            <Loader2 className='h-5 w-5 animate-spin text-gray-500' aria-hidden />
          ) : (
            <LogOut className='h-5 w-5 text-gray-600' aria-hidden />
          )}
        </button>
        <LanguageSwitcher compact className='h-9 sm:h-10' />
      </div>
    </header>
  );
}
