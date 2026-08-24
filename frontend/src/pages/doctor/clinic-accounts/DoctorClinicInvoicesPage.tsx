"use client";

import { BookOpen, CheckCircle, Clock, FileText, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  ClinicAccountsFilterTabs,
  ClinicAccountsSearchCount,
  ClinicAccountsSearchRow,
  ClinicAccountsSubNav,
  InvoiceDetailsDialog,
  InvoiceListItem,
} from "@/components/doctor/clinic-accounts";
import { DoctorListEmptyIllustration } from "@/components/doctor/shared/doctor-list-empty-illustration";
import DoctorDashboardOverview from "@/components/doctor/dashboard/doctor-dashboard-overview";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import DoctorTablePagination from "@/components/doctor/shared/doctor-table-pagination";
import { DoctorTableSkeleton } from "@/components/doctor/shared/skeletons";
import {
  useBillingDashboard,
  useBillingInvoice,
  useBillingInvoices,
  useBillingSettings,
} from "@/hooks/doctor/billing";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { useI18n } from "@/i18n/provider";
import type {
  ClinicInvoice,
  InvoiceStatus,
} from "@/lib/doctor/clinicAccounts/types";
import { useBillingAccess } from "@/hooks/billing/useBillingAccess";

type InvoiceFilter = "all" | InvoiceStatus;

function buildFilterOptions(
  tr: (ar: string, en: string) => string,
): Array<{ id: InvoiceFilter; label: string }> {
  return [
    { id: "all", label: tr("الكل", "All") },
    { id: "paid", label: tr("مدفوعة", "Paid") },
    { id: "unpaid", label: tr("غير مدفوعة", "Unpaid") },
    { id: "partial", label: tr("مدفوعة جزئياً", "Partially paid") },
    { id: "overdue", label: tr("متأخرة", "Overdue") },
    { id: "cancelled", label: tr("ملغاة", "Cancelled") },
  ];
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function pickStatusCount(
  rows: Array<{ label?: string; count?: number; amount?: number }> | undefined,
  status: string,
) {
  return rows?.find((row) => row.label === status)?.count ?? 0;
}

export default function DoctorClinicInvoicesPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const filterOptions = buildFilterOptions(tr);
  const navigate = useNavigate();
  const {
    basePath,
    canManageInvoices,
    canViewDashboard,
    canViewSettings,
    isSecretary,
  } =
    useBillingAccess();
  const [filter, setFilter] = useState<InvoiceFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const settingsQuery = useBillingSettings(!isSecretary || canViewSettings);
  const dashboardQuery = useBillingDashboard(
    "month",
    settingsQuery.currency,
    !isSecretary || canViewDashboard,
  );
  const listQuery = useBillingInvoices({
    uiStatus: filter,
    search,
    page,
    limit,
  });
  const { retry: retryList, retrying: retryingList } = useRetryAction(() =>
    listQuery.refetch(),
  );
  const detailQuery = useBillingInvoice(
    selectedInvoiceId ?? "",
    Boolean(selectedInvoiceId),
  );

  const invoiceStatusRows = dashboardQuery.dashboard?.charts?.invoiceTotalsByStatus;

  const stats = useMemo(
    () => ({
      paid: pickStatusCount(invoiceStatusRows, "paid"),
      // The "Unpaid" tab only fetches status=issued (see mapUiInvoiceStatusToApi),
      // so this KPI counts the same set — draft invoices are a separate lifecycle
      // state with no dedicated tab and are intentionally excluded here.
      unpaid: pickStatusCount(invoiceStatusRows, "issued"),
      partial: pickStatusCount(invoiceStatusRows, "partial"),
      overdue: pickStatusCount(invoiceStatusRows, "overdue"),
    }),
    [invoiceStatusRows],
  );

  const totalPages = Math.max(1, Math.ceil(listQuery.total / listQuery.limit));

  const openDetails = (invoice: ClinicInvoice) => {
    setSelectedInvoiceId(invoice.rawId ?? invoice.id);
    setDetailsOpen(true);
  };

  const selectedInvoice = detailQuery.invoice;

  return (
    <>
      <Helmet>
        <title>{tr("الفواتير • LMJ Health", "Invoices • LMJ Health")}</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <DoctorDashboardOverview
          variant="appointments"
          surface="mint"
          kpiColumns={3}
          headerIcon={<BookOpen className="h-8 w-8 text-white" />}
          title={tr("الفواتير", "Invoices")}
          subtitle={
            <span>
              <span className="font-extrabold text-primary">
                {listQuery.isAwaitingData ? "—" : listQuery.total}
              </span>
              <span className="text-primary/90">
                {tr(" — إجمالي الفواتير", " — total invoices")}
              </span>
            </span>
          }
          actionLabel={
            canManageInvoices ? tr("فاتورة جديدة", "New invoice") : undefined
          }
          actionIcon={canManageInvoices ? <Plus className="h-4 w-4" /> : undefined}
          onActionClick={
            canManageInvoices
              ? () => navigate(`${basePath}/invoices/new`)
              : undefined
          }
          kpis={[
            {
              key: "paid",
              icon: <CheckCircle className="w-5 h-5 shrink-0" />,
              value:
                !isSecretary || canViewDashboard
                  ? dashboardQuery.isAwaitingData
                    ? "—"
                    : stats.paid
                  : "—",
              label: tr("مدفوعة", "Paid"),
            },
            {
              key: "unpaid",
              icon: <FileText className="w-5 h-5 shrink-0" />,
              value:
                !isSecretary || canViewDashboard
                  ? dashboardQuery.isAwaitingData
                    ? "—"
                    : stats.unpaid
                  : "—",
              label: tr("غير مدفوعة", "Unpaid"),
            },
            {
              key: "overdue",
              icon: <Clock className="w-5 h-5 shrink-0" />,
              value:
                !isSecretary || canViewDashboard
                  ? dashboardQuery.isAwaitingData
                    ? "—"
                    : stats.overdue
                  : "—",
              label: tr("متأخرة", "Overdue"),
            },
          ]}
        />

        <ClinicAccountsSubNav />

        <ClinicAccountsFilterTabs<InvoiceFilter>
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
          placeholder={tr("بحث بالاسم أو رقم الفاتورة...", "Search by name or invoice number...")}
          onClear={() => {
            setSearch('');
            setFilter('all');
            setPage(1);
          }}
          trailing={
            <ClinicAccountsSearchCount count={listQuery.total} label={tr("فاتورة", "invoice")} />
          }
        />

        {listQuery.isAwaitingData ? (
          <DoctorTableSkeleton rows={6} columns={1} />
        ) : listQuery.isError ? (
          <DoctorListErrorState
            title={tr("تعذّر تحميل الفواتير", "Failed to load invoices")}
            brief={getUserFacingRequestErrorMessage(listQuery.error)}
            retrying={retryingList}
            onRetry={() => void retryList()}
          />
        ) : listQuery.invoices.length === 0 ? (
          <DoctorListEmptyIllustration
            variant="teal"
            imageSrc="/images/photo-not-found_appotemint.png"
            imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.1)]"
            title={
              search.trim() || filter !== 'all'
                ? tr('لا توجد فواتير تطابق البحث أو الفلتر الحالي', 'No invoices match the current search or filter')
                : tr('لا توجد فواتير صادرة بعد', 'No invoices issued yet')
            }
            subtitle={
              search.trim() || filter !== 'all'
                ? tr('جرّب تعديل كلمات البحث أو إعادة ضبط الفلاتر لعرض النتائج', 'Try adjusting the search terms or resetting the filters to see results')
                : tr('أنشئ فواتير للمرضى وتتبع المدفوعات والمبالغ المستحقة', 'Create invoices for patients and track payments and amounts due')
            }
            actionLabel={canManageInvoices ? tr("فاتورة جديدة", "New invoice") : undefined}
            onAction={
              canManageInvoices
                ? () => navigate(`${basePath}/invoices/new`)
                : undefined
            }
            actionIcon={canManageInvoices ? <Plus className="h-4 w-4" /> : undefined}
          />
        ) : (
          <div className="space-y-3">
            {listQuery.invoices.map((invoice, index) => (
              <InvoiceListItem
                key={invoice.rawId ?? invoice.id}
                invoice={invoice}
                index={index}
                onOpen={openDetails}
              />
            ))}
          </div>
        )}

        {!listQuery.isError ? (
          <DoctorTablePagination
            className="mt-6"
            page={listQuery.page}
            totalPages={totalPages}
            pageSize={listQuery.limit}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            disabled={listQuery.isAwaitingData}
            onPageChange={setPage}
            onPageSizeChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
          />
        ) : null}

        <InvoiceDetailsDialog
          open={detailsOpen}
          invoice={selectedInvoice}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedInvoiceId(null);
          }}
          onInvoiceUpdated={() => {
            void detailQuery.refetch();
            void listQuery.refetch();
            void dashboardQuery.refetch();
          }}
        />
      </div>
    </>
  );
}
