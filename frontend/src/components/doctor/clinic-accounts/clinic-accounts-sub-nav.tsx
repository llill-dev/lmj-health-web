'use client';

import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils/utils';

const LINKS = [
  { to: '/doctor/accounts', label: 'لوحة الحسابات', end: true },
  { to: '/doctor/accounts/invoices', label: 'الفواتير', end: false },
  { to: '/doctor/accounts/expenses', label: 'المصاريف', end: false },
  { to: '/doctor/accounts/reports', label: 'التقارير', end: false },
] as const;

export function ClinicAccountsSubNav() {
  return (
    <nav
      className="mb-6 grid grid-cols-2 gap-2 rounded-[12px] border border-[#EEF2F6] bg-white p-2 shadow-sm sm:grid-cols-4"
      aria-label="تنقل الحسابات"
    >
      {LINKS.map((link) => (
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
