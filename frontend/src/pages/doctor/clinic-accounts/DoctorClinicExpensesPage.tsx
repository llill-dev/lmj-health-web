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
  getBillingFutureDateMessage,
  isBillingDateInputAfterToday,
} from "@/lib/doctor/billing/dateInput";
import { expenseCategoryLabel } from "@/lib/doctor/clinicAccounts/labels";
import type { ExpenseCategory } from "@/lib/doctor/clinicAccounts/types";
import { useToast } from "@/components/ui/ToastProvider";
import { useBillingAccess } from "@/hooks/billing/useBillingAccess";
import { useI18n } from "@/i18n/provider";

type ExpenseFilter = "all" | ExpenseCategory;

function buildFilterOptions(
  t: (key: string) => string,
): Array<{ id: ExpenseFilter; label: string }> {
  return [
    { id: "all", label: t("doctor.clinicAccounts.expenses.filter.all") },
    { id: "rent", label: t("doctor.clinicAccounts.expenses.filter.rent") },
    {
      id: "salaries",
      label: t("doctor.clinicAccounts.expenses.filter.salaries"),
    },
    {
      id: "services",
      label: t("doctor.clinicAccounts.expenses.filter.services"),
    },
    {
      id: "materials",
      label: t("doctor.clinicAccounts.expenses.filter.materials"),
    },
  ];
}

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
  return (
    rows?.find(
      (row) => (row.label ?? "").toLowerCase() === category.toLowerCase(),
    )?.count ?? 0
  );
}

export default function DoctorClinicExpensesPage() {
  const { t, locale, dir } = useI18n();
  const filterOptions = buildFilterOptions(t);
  const { toast } = useToast();
  const { canManageExpenses, canViewDashboard, canViewSettings, isSecretary } =
    useBillingAccess();
  const [filter, setFilter] = useState<ExpenseFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  // Free-text category value sent to the backend as-is — the backend accepts
  // arbitrary clinic-defined categories (billing:settings), not just the 4
  // fixed values used for filter tabs below.
  const [category, setCategory] = useState<string>("Rent");
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
      toast(t("doctor.clinicAccounts.expenses.error.missingFields"), {
        title: t("doctor.clinicAccounts.expenses.error.missingFieldsTitle"),
        variant: "error",
      });
      return;
    }

    if (isBillingDateInputAfterToday(date)) {
      toast(getBillingFutureDateMessage(t).message, {
        title: getBillingFutureDateMessage(t).title,
        variant: "error",
      });
      return;
    }

    try {
      await createExpense.mutateAsync({
        category,
        amount: parsedAmount,
        expenseDate: billingDateInputToIso(date),
        description: title.trim(),
      });
      toast(t("doctor.clinicAccounts.expenses.success.saved"), {
        title: t("doctor.clinicAccounts.expenses.success.savedTitle"),
        variant: "success",
      });
      setDialogOpen(false);
      setTitle("");
      setAmount("");
      setDate("");
      setPage(1);
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: t("doctor.clinicAccounts.expenses.error.saveFailed"),
        variant: "error",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("doctor.clinicAccounts.expenses.page.title")}</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <DoctorDashboardOverview
          variant="appointments"
          surface="mint"
          headerIcon={<Receipt className="h-8 w-8 text-white" />}
          title={t("doctor.clinicAccounts.expenses.title")}
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
              <span className="text-primary/90">
                {t("doctor.clinicAccounts.expenses.subtitle")}
              </span>
            </span>
          }
          actionLabel={
            canManageExpenses
              ? t("doctor.clinicAccounts.expenses.newExpense")
              : undefined
          }
          actionIcon={
            canManageExpenses ? <Plus className="h-4 w-4" /> : undefined
          }
          onActionClick={
            canManageExpenses ? () => setDialogOpen(true) : undefined
          }
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
              label: t("doctor.clinicAccounts.expenses.filter.rent"),
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
              label: t("doctor.clinicAccounts.expenses.filter.services"),
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
              label: t("doctor.clinicAccounts.expenses.filter.salaries"),
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
              label: t("doctor.clinicAccounts.expenses.filter.materials"),
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
          options={filterOptions}
        />

        <ClinicAccountsSearchRow
          value={search}
          onChange={setSearch}
          onValueChangeExtra={() => setPage(1)}
          placeholder={t("doctor.clinicAccounts.expenses.searchPlaceholder")}
          trailing={
            <ClinicAccountsSearchCount
              count={expensesQuery.total}
              label={t("doctor.clinicAccounts.expenses.searchCountLabel")}
            />
          }
        />
        {!canManageExpenses ? (
          <p className="mt-4 text-start font-cairo text-[12px] font-semibold text-[#667085]">
            {t("doctor.clinicAccounts.expenses.viewOnlyMessage")}
          </p>
        ) : null}

        {expensesQuery.isAwaitingData ? (
          <DoctorTableSkeleton rows={5} columns={1} />
        ) : expensesQuery.isError ? (
          <DoctorListErrorState
            title={t("doctor.clinicAccounts.expenses.loadFailed")}
            brief={getUserFacingRequestErrorMessage(expensesQuery.error)}
            retrying={retryingExpenses}
            onRetry={() => void retryExpenses()}
          />
        ) : expensesQuery.expenses.length === 0 ? (
          <ClinicAccountsEmptyState
            title={t("doctor.clinicAccounts.expenses.empty.title")}
            subtitle={t("doctor.clinicAccounts.expenses.empty.subtitle")}
            actionLabel={
              canManageExpenses
                ? t("doctor.clinicAccounts.expenses.empty.addExpense")
                : undefined
            }
            onAction={canManageExpenses ? () => setDialogOpen(true) : undefined}
            actionIcon={
              canManageExpenses ? (
                <Plus className="w-4 h-4" aria-hidden />
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {expensesQuery.expenses.map((expense, index) => (
              <ExpenseListItem
                key={expense.rawId ?? expense.id}
                expense={expense}
                index={index}
                currency={settingsQuery.currency}
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
          title={t("doctor.clinicAccounts.expenses.addExpenseTitle")}
          maxWidthClass="max-w-[560px]"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
                {t("doctor.clinicAccounts.expenses.titleLabel")}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
                {t("doctor.clinicAccounts.expenses.categoryLabel")}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
              >
                {categoryOptions.map((apiCategory) => {
                  const knownKey = (
                    Object.keys(CATEGORY_TO_API) as ExpenseCategory[]
                  ).find((key) => CATEGORY_TO_API[key] === apiCategory);
                  return (
                    <option key={apiCategory} value={apiCategory}>
                      {knownKey
                        ? expenseCategoryLabel(knownKey, t)
                        : apiCategory}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
                  {t("doctor.clinicAccounts.expenses.amountLabel")}
                </label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-[44px] w-full rounded-[10px] border border-[#E5E7EB] px-4 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-2 block text-start font-cairo text-[12px] font-bold text-[#667085]">
                  {t("doctor.clinicAccounts.expenses.dateLabel")}
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
              {createExpense.isPending
                ? t("doctor.clinicAccounts.expenses.saving")
                : t("doctor.clinicAccounts.expenses.saveExpense")}
            </button>
          </div>
        </ClinicAccountsModalShell>
      </div>
    </>
  );
}
