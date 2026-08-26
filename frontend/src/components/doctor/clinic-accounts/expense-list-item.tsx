'use client';

import { motion } from 'framer-motion';
import {
  Box,
  Home,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { ClinicExpense, ExpenseCategory } from '@/lib/doctor/clinicAccounts/types';
import { expenseCategoryLabel } from '@/lib/doctor/clinicAccounts/labels';
import { formatBillingAmount } from '@/lib/doctor/billing/format';
import { useI18n } from '@/i18n/provider';

const CATEGORY_ICONS: Record<ExpenseCategory, LucideIcon> = {
  rent: Home,
  salaries: Users,
  services: Zap,
  materials: Box,
};

export function ExpenseListItem({
  expense,
  index,
  currency,
}: {
  expense: ClinicExpense;
  index: number;
  currency?: string;
}) {
  const { locale } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const Icon = CATEGORY_ICONS[expense.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className="flex items-center justify-between gap-4 rounded-[12px] border border-[#D1FAE5] bg-white px-5 py-4 shadow-sm"
    >
      <div className="flex-1 min-w-0">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#F0FDFA] px-3 py-1 font-cairo text-[11px] font-extrabold text-primary">
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {expenseCategoryLabel(expense.category, tr)}
        </div>
        <p className="font-cairo text-[14px] font-extrabold text-[#111827]">
          {expense.title}
        </p>
        <p className="mt-1 font-cairo text-[12px] font-semibold text-[#98A2B3]">
          {expense.date}
        </p>
      </div>
      <span className="font-cairo text-[22px] font-black text-primary">
        {formatBillingAmount(expense.amount, currency)}
      </span>
    </motion.div>
  );
}
