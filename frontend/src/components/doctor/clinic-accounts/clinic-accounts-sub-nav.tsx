'use client';

import { NavLink } from 'react-router-dom';
import { useBillingAccess } from '@/hooks/billing/useBillingAccess';
import { cn } from '@/lib/utils/utils';

export function ClinicAccountsSubNav() {
  const {
    basePath,
    canViewDashboard,
    canViewInvoices,
    canViewServices,
    canViewExpenses,
    canViewReports,
    canViewSettings,
  } = useBillingAccess();

  const links = [
    canViewDashboard
      ? { to: basePath, label: 'لوحة الحسابات', end: true }
      : null,
    canViewInvoices
      ? { to: `${basePath}/invoices`, label: 'الفواتير', end: false }
      : null,
    canViewServices
      ? { to: `${basePath}/services`, label: 'الخدمات', end: false }
      : null,
    canViewExpenses
      ? { to: `${basePath}/expenses`, label: 'المصاريف', end: false }
      : null,
    canViewReports
      ? { to: `${basePath}/reports`, label: 'التقارير', end: false }
      : null,
    canViewSettings
      ? { to: `${basePath}/settings`, label: 'الإعدادات', end: false }
      : null,
  ].filter(Boolean) as Array<{ to: string; label: string; end: boolean }>;

  return (
    <nav
      className="mb-6 grid grid-cols-2 gap-2 rounded-[12px] border border-[#EEF2F6] bg-white p-2 shadow-sm sm:grid-cols-3 lg:grid-cols-6"
      aria-label="تنقل الحسابات"
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
