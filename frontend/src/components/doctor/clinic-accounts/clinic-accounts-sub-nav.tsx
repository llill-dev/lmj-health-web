'use client';

import { NavLink } from 'react-router-dom';
import { useBillingAccess } from '@/hooks/billing/useBillingAccess';
import { cn } from '@/lib/utils/utils';
import { useI18n } from '@/i18n/provider';

export function ClinicAccountsSubNav() {
  const { locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const {
    basePath,
    canViewDashboard,
    canViewInvoices,
    canViewPayments,
    canViewServices,
    canViewExpenses,
    canViewReports,
    canViewSettings,
  } = useBillingAccess();

  const links = [
    canViewDashboard
      ? { to: basePath, label: tr('لوحة الحسابات', 'Accounts'), end: true }
      : null,
    canViewInvoices
      ? { to: `${basePath}/invoices`, label: tr('الفواتير', 'Invoices'), end: false }
      : null,
    canViewPayments
      ? { to: `${basePath}/payments`, label: tr('المدفوعات', 'Payments'), end: false }
      : null,
    canViewServices
      ? { to: `${basePath}/services`, label: tr('الخدمات', 'Services'), end: false }
      : null,
    canViewExpenses
      ? { to: `${basePath}/expenses`, label: tr('المصاريف', 'Expenses'), end: false }
      : null,
    canViewReports
      ? { to: `${basePath}/reports`, label: tr('التقارير', 'Reports'), end: false }
      : null,
    canViewSettings
      ? { to: `${basePath}/settings`, label: tr('الإعدادات', 'Settings'), end: false }
      : null,
  ].filter(Boolean) as Array<{ to: string; label: string; end: boolean }>;

  return (
    <nav
      className="mb-6 grid grid-cols-2 gap-2 rounded-[12px] border border-[#EEF2F6] bg-white p-2 shadow-sm sm:grid-cols-3 lg:grid-cols-7"
      aria-label={tr('تنقل الحسابات', 'Accounts navigation')}
    >
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            cn(
              'flex w-full items-center justify-center rounded-[10px] px-3 py-2.5 text-center font-cairo text-[13px] font-extrabold transition',
              isActive
                ? 'bg-primary text-white shadow-[0_8px_20px_rgba(15,143,139,0.25)]'
                : 'text-[#667085] hover:bg-[#F0FDFA] hover:text-primary',
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
