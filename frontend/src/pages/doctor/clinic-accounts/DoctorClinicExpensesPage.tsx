'use client';

import { Box, Home, Plus, Receipt, Users, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ClinicAccountsBanner,
  ClinicAccountsFilterTabs,
  ClinicAccountsMiniStatCard,
  ClinicAccountsSearchCount,
  ClinicAccountsSearchRow,
  ClinicAccountsSubNav,
  ClinicAccountsEmptyState,
  ClinicAccountsModalShell,
  ExpenseListItem,
} from '@/components/doctor/clinic-accounts';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { DoctorTableSkeleton } from '@/components/doctor/shared/skeletons';
import {
  useBillingExpenses,
  useBillingSettings,
  useCreateBillingExpense,
} from '@/hooks/doctor/billing';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import { formatBillingAmount } from '@/lib/doctor/billing/format';
import {
  EXPENSE_CATEGORY_LABELS,
} from '@/lib/doctor/clinicAccounts/mockData';
import type { ExpenseCategory } from '@/lib/doctor/clinicAccounts/types';
import { useToast } from '@/components/ui/ToastProvider';

type ExpenseFilter = 'all' | ExpenseCategory;

const FILTER_OPTIONS: Array<{ id: ExpenseFilter; label: string }> = [
  { id: 'all', label: 'الكل' },
  { id: 'rent', label: 'إيجار' },
  { id: 'salaries', label: 'رواتب' },
  { id: 'services', label: 'خدمات' },
  { id: 'materials', label: 'مواد' },
];

const CATEGORY_TO_API: Record<ExpenseCategory, string> = {
  rent: 'Rent',
  salaries: 'Salaries',
  services: 'Services',
  materials: 'Supplies',
};

export default function DoctorClinicExpensesPage() {
  const { toast } = useToast();
  const settingsQuery = useBillingSettings();
  const expensesQuery = useBillingExpenses({ limit: 100 });
  const createExpense = useCreateBillingExpense();

  const [filter, setFilter] = useState<ExpenseFilter>('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('rent');
  const [date, setDate] = useState('');

  const currency = settingsQuery.currency;
  const categoryOptions =
    settingsQuery.settings?.expenseCategories?.length
      ? settingsQuery.settings.expenseCategories
      : Object.values(CATEGORY_TO_API);

  const stats = useMemo(
    () => ({
      rent: expensesQuery.expenses.filter((e) => e.category === 'rent').length,
      services: expensesQuery.expenses.filter((e) => e.category === 'services').length,
      salaries: expensesQuery.expenses.filter((e) => e.category === 'salaries').length,
      materials: expensesQuery.expenses.filter((e) => e.category === 'materials').length,
    }),
    [expensesQuery.expenses],
  );

  const total = expensesQuery.expenses.reduce((sum, item) => sum + item.amount, 0);

  const filtered = expensesQuery.expenses.filter((expense) => {
    const matchesFilter = filter === 'all' || expense.category === filter;
    const q = search.trim();
    const matchesSearch =
      !q || expense.title.includes(q) || expense.date.includes(q);
    return matchesFilter && matchesSearch;
  });

  const handleSave = async () => {
    const parsedAmount = Number(amount);
    if (!title.trim() || !parsedAmount || parsedAmount <= 0 || !date) {
      toast('يرجى تعبئة العنوان والمبلغ والتاريخ.', {
        title: 'حقول ناقصة',
        variant: 'error',
      });
      return;
    }

    try {
      await createExpense.mutateAsync({
        category: CATEGORY_TO_API[category] ?? category,
        amount: parsedAmount,
        expenseDate: new Date(date).toISOString(),
        description: title.trim(),
      });
      toast('تم حفظ المصروف.', { title: 'تم الحفظ', variant: 'success' });
      setDialogOpen(false);
      setTitle('');
      setAmount('');
      setDate('');
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر الحفظ',
        variant: 'error',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>المصاريف • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <ClinicAccountsBanner
          title="المصاريف"
          subtitle={`إجمالي المصاريف لديك ${formatBillingAmount(total, currency)}`}
          icon={<Receipt className="h-7 w-7 text-white sm:h-8 sm:w-8" />}
          action={
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="inline-flex h-[44px] min-w-[120px] shrink-0 items-center justify-between gap-3 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-extrabold text-primary shadow-sm"
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              <span>جديد</span>
            </button>
          }
        />

        <ClinicAccountsSubNav />

        <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ClinicAccountsMiniStatCard label="إيجار" value={stats.rent} icon={Home} active />
          <ClinicAccountsMiniStatCard label="خدمات" value={stats.services} icon={Zap} />
          <ClinicAccountsMiniStatCard label="رواتب" value={stats.salaries} icon={Users} />
          <ClinicAccountsMiniStatCard label="مواد" value={stats.materials} icon={Box} />
        </section>

        <ClinicAccountsFilterTabs<ExpenseFilter>
          value={filter}
          onChange={setFilter}
          options={FILTER_OPTIONS}
        />

        <ClinicAccountsSearchRow
          value={search}
          onChange={setSearch}
          placeholder="بحث في المصاريف"
          trailing={
            <ClinicAccountsSearchCount count={filtered.length} label="مصروف" />
          }
        />

        {expensesQuery.isLoading ? (
          <DoctorTableSkeleton rows={5} columns={1} />
        ) : expensesQuery.isError ? (
          <DoctorListErrorState
            title="تعذّر تحميل المصاريف"
            brief={getUserFacingRequestErrorMessage(expensesQuery.error)}
            retrying={expensesQuery.isFetching}
            onRetry={() => void expensesQuery.refetch()}
          />
        ) : filtered.length === 0 ? (
          <ClinicAccountsEmptyState
            title={
              expensesQuery.expenses.length === 0
                ? 'لا يوجد مصاريف'
                : 'لا توجد مصاريف مطابقة'
            }
            subtitle={
              expensesQuery.expenses.length === 0
                ? 'ابدأ بتسجيل أول مصروف لإدارة حسابات عيادتك'
                : 'جرّب تغيير البحث أو الفلتر للعثور على مصاريف أخرى'
            }
            actionLabel={
              expensesQuery.expenses.length === 0 ? 'إضافة مصروف' : undefined
            }
            onAction={
              expensesQuery.expenses.length === 0
                ? () => setDialogOpen(true)
                : undefined
            }
            actionIcon={<Plus className="h-4 w-4" aria-hidden />}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((expense, index) => (
              <ExpenseListItem key={expense.rawId ?? expense.id} expense={expense} index={index} />
            ))}
          </div>
        )}

        <ClinicAccountsModalShell
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="إضافة مصروف"
          maxWidthClass="max-w-[560px]"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-right font-cairo text-[12px] font-bold text-[#667085]">
                العنوان
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-2 block text-right font-cairo text-[12px] font-bold text-[#667085]">
                الفئة
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
              >
                {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map(
                  (key) => (
                    <option key={key} value={key}>
                      {EXPENSE_CATEGORY_LABELS[key]}
                    </option>
                  ),
                )}
              </select>
              {categoryOptions.length ? (
                <p className="mt-2 text-right font-cairo text-[11px] font-semibold text-[#98A2B3]">
                  فئات الخادم: {categoryOptions.join('، ')}
                </p>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-right font-cairo text-[12px] font-bold text-[#667085]">
                  المبلغ
                </label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-2 block text-right font-cairo text-[12px] font-bold text-[#667085]">
                  التاريخ
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
                />
              </div>
            </div>
            <button
              type="button"
              disabled={createExpense.isPending}
              onClick={() => void handleSave()}
              className="mt-2 flex h-[48px] w-full items-center justify-center rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
            >
              {createExpense.isPending ? 'جاري الحفظ...' : 'حفظ المصروف'}
            </button>
          </div>
        </ClinicAccountsModalShell>
      </div>
    </>
  );
}
