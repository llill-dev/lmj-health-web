"use client";

import { Box, Home, Plus, Receipt, Users, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ClinicAccountsFilterTabs,
  ClinicAccountsSearchCount,
  ClinicAccountsSearchRow,
  ClinicAccountsSubNav,
  ClinicAccountsEmptyState,
  ClinicAccountsModalShell,
  ExpenseListItem,
} from "@/components/doctor/clinic-accounts";
import DoctorDashboardOverview from "@/components/doctor/dashboard/doctor-dashboard-overview";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import DoctorTablePagination from "@/components/doctor/shared/doctor-table-pagination";
import { DoctorTableSkeleton } from "@/components/doctor/shared/skeletons";
import {
  useBillingDashboard,
  useBillingExpenses,
  useBillingSettings,
  useCreateBillingExpense,
} from "@/hooks/doctor/billing";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { formatBillingAmount } from "@/lib/doctor/billing/format";
import {
  billingDateInputToIso,
  billingTodayDateInput,
  BILLING_FUTURE_DATE_MESSAGE,
  isBillingDateInputAfterToday,
} from "@/lib/doctor/billing/dateInput";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/doctor/clinicAccounts/labels";
import type { ExpenseCategory } from "@/lib/doctor/clinicAccounts/types";
import { useToast } from "@/components/ui/ToastProvider";
import { useBillingAccess } from "@/hooks/billing/useBillingAccess";

type ExpenseFilter = "all" | ExpenseCategory;

const FILTER_OPTIONS: Array<{ id: ExpenseFilter; label: string }> = [
  { id: "all", label: "الكل" },
  { id: "rent", label: "إيجار" },
  { id: "salaries", label: "رواتب" },
  { id: "services", label: "خدمات" },
  { id: "materials", label: "مواد" },
];

const CATEGORY_TO_API: Record<ExpenseCategory, string> = {
  rent: "Rent",
  salaries: "Salaries",
  services: "Services",
  materials: "Supplies",
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function findCategoryCount(
  rows: Array<{ label?: string; count?: number }> | undefined,
  category: string,
) {
  return rows?.find((row) => (row.label ?? "").toLowerCase() === category.toLowerCase())
    ?.count ?? 0;
}

export default function DoctorClinicExpensesPage() {
  const { toast } = useToast();
  const {
    canManageExpenses,
    canViewDashboard,
    canViewSettings,
    isSecretary,
  } = useBillingAccess();
  const [filter, setFilter] = useState<ExpenseFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("rent");
  const [date, setDate] = useState("");

  const settingsQuery = useBillingSettings(!isSecretary || canViewSettings);
  const dashboardQuery = useBillingDashboard(
    "month",
    settingsQuery.currency,
    !isSecretary || canViewDashboard,
  );
  const expensesQuery = useBillingExpenses({
    page,
    limit,
    search,
    category: filter === "all" ? undefined : CATEGORY_TO_API[filter],
  });
  const createExpense = useCreateBillingExpense();
  const { retry: retryExpenses, retrying: retryingExpenses } = useRetryAction(
    () => expensesQuery.refetch(),
  );

  const currency = settingsQuery.currency;
  const categoryOptions = settingsQuery.settings?.expenseCategories?.length
    ? settingsQuery.settings.expenseCategories
    : Object.values(CATEGORY_TO_API);
  const categoryRows = dashboardQuery.dashboard?.charts?.expensesByCategory;

  const stats = useMemo(
    () => ({
      rent: findCategoryCount(categoryRows, "Rent"),
      services: findCategoryCount(categoryRows, "Services"),
      salaries: findCategoryCount(categoryRows, "Salaries"),
      materials: findCategoryCount(categoryRows, "Supplies"),
    }),
    [categoryRows],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(expensesQuery.total / expensesQuery.limit),
  );

  const handleSave = async () => {
    const parsedAmount = Number(amount);
    if (!title.trim() || !parsedAmount || parsedAmount <= 0 || !date) {
      toast("يرجى تعبئة العنوان والمبلغ والتاريخ.", {
        title: "حقول ناقصة",
        variant: "error",
      });
      return;
    }

    if (isBillingDateInputAfterToday(date)) {
      toast(BILLING_FUTURE_DATE_MESSAGE.message, {
        title: BILLING_FUTURE_DATE_MESSAGE.title,
        variant: "error",
      });
      return;
    }

    try {
      await createExpense.mutateAsync({
        category: CATEGORY_TO_API[category] ?? category,
        amount: parsedAmount,
        expenseDate: billingDateInputToIso(date),
        description: title.trim(),
      });
      toast("تم حفظ المصروف.", { title: "تم الحفظ", variant: "success" });
      setDialogOpen(false);
      setTitle("");
      setAmount("");
      setDate("");
      setPage(1);
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: "تعذّر الحفظ",
        variant: "error",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>المصاريف • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <DoctorDashboardOverview
          variant="appointments"
          surface="mint"
          headerIcon={<Receipt className="h-8 w-8 text-white" />}
          title="المصاريف"
          subtitle={
            <span>
              <span className="font-extrabold text-primary">
                {dashboardQuery.isAwaitingData
                  ? "—"
                  : !isSecretary || canViewDashboard
                    ? formatBillingAmount(
                        dashboardQuery.summary?.expenses ?? 0,
                        currency,
                      )
                    : "—"}
              </span>
              <span className="text-primary/90"> — إجمالي المصاريف</span>
            </span>
          }
          actionLabel={canManageExpenses ? "مصروف جديد" : undefined}
          actionIcon={canManageExpenses ? <Plus className="h-4 w-4" /> : undefined}
          onActionClick={canManageExpenses ? () => setDialogOpen(true) : undefined}
          kpis={[
            {
              key: "rent",
              icon: <Home className="w-5 h-5 shrink-0" />,
              value:
                !isSecretary || canViewDashboard
                  ? dashboardQuery.isAwaitingData
                    ? "—"
                    : stats.rent
                  : "—",
              label: "إيجار",
            },
            {
              key: "services",
              icon: <Zap className="w-5 h-5 shrink-0" />,
              value:
                !isSecretary || canViewDashboard
                  ? dashboardQuery.isAwaitingData
                    ? "—"
                    : stats.services
                  : "—",
              label: "خدمات",
            },
            {
              key: "salaries",
              icon: <Users className="w-5 h-5 shrink-0" />,
              value:
                !isSecretary || canViewDashboard
                  ? dashboardQuery.isAwaitingData
                    ? "—"
                    : stats.salaries
                  : "—",
              label: "رواتب",
            },
            {
              key: "materials",
              icon: <Box className="w-5 h-5 shrink-0" />,
              value:
                !isSecretary || canViewDashboard
                  ? dashboardQuery.isAwaitingData
                    ? "—"
                    : stats.materials
                  : "—",
              label: "مواد",
            },
          ]}
        />

        <ClinicAccountsSubNav />

        <ClinicAccountsFilterTabs<ExpenseFilter>
          value={filter}
          onChange={(nextFilter) => {
            setFilter(nextFilter);
            setPage(1);
          }}
          options={FILTER_OPTIONS}
        />

        <ClinicAccountsSearchRow
          value={search}
          onChange={setSearch}
          onValueChangeExtra={() => setPage(1)}
          placeholder="بحث في المصاريف"
          trailing={
            <ClinicAccountsSearchCount count={expensesQuery.total} label="مصروف" />
          }
        />
        {!canManageExpenses ? (
          <p className="mt-4 text-right font-cairo text-[12px] font-semibold text-[#667085]">
            يمكنك عرض المصاريف فقط، بينما إضافة مصروف جديد تتطلب صلاحية إدارة.
          </p>
        ) : null}

        {expensesQuery.isAwaitingData ? (
          <DoctorTableSkeleton rows={5} columns={1} />
        ) : expensesQuery.isError ? (
          <DoctorListErrorState
            title="تعذّر تحميل المصاريف"
            brief={getUserFacingRequestErrorMessage(expensesQuery.error)}
            retrying={retryingExpenses}
            onRetry={() => void retryExpenses()}
          />
        ) : expensesQuery.expenses.length === 0 ? (
          <ClinicAccountsEmptyState
            title="لا توجد مصاريف مطابقة"
            subtitle="جرّب تغيير البحث أو الفئة، أو أضف مصروفًا جديدًا لبدء السجل المالي."
            actionLabel={canManageExpenses ? "إضافة مصروف" : undefined}
            onAction={canManageExpenses ? () => setDialogOpen(true) : undefined}
            actionIcon={canManageExpenses ? <Plus className="w-4 h-4" aria-hidden /> : undefined}
          />
        ) : (
          <div className="space-y-3">
            {expensesQuery.expenses.map((expense, index) => (
              <ExpenseListItem
                key={expense.rawId ?? expense.id}
                expense={expense}
                index={index}
              />
            ))}
          </div>
        )}

        {!expensesQuery.isError ? (
          <DoctorTablePagination
            className="mt-6"
            page={expensesQuery.page}
            totalPages={totalPages}
            pageSize={expensesQuery.limit}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            disabled={expensesQuery.isAwaitingData}
            onPageChange={setPage}
            onPageSizeChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
          />
        ) : null}

        <ClinicAccountsModalShell
          open={dialogOpen && canManageExpenses}
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
                  فئات الخادم: {categoryOptions.join("، ")}
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
                  max={billingTodayDateInput()}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next && isBillingDateInputAfterToday(next)) return;
                    setDate(next);
                  }}
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
              {createExpense.isPending ? "جارٍ الحفظ..." : "حفظ المصروف"}
            </button>
          </div>
        </ClinicAccountsModalShell>
      </div>
    </>
  );
}
