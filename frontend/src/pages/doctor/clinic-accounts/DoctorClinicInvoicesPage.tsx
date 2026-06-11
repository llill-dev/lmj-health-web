'use client';

import { BookOpen, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ClinicAccountsBanner,
  ClinicAccountsFilterTabs,
  ClinicAccountsMiniStatCard,
  ClinicAccountsSearchCount,
  ClinicAccountsSearchRow,
  ClinicAccountsSubNav,
  InvoiceDetailsDialog,
  InvoiceListItem,
} from '@/components/doctor/clinic-accounts';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { DoctorTableSkeleton } from '@/components/doctor/shared/skeletons';
import { useBillingInvoice, useBillingInvoices } from '@/hooks/doctor/billing';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import type { ClinicInvoice, InvoiceStatus } from '@/lib/doctor/clinicAccounts/types';

type InvoiceFilter = 'all' | InvoiceStatus;

const FILTER_OPTIONS: Array<{ id: InvoiceFilter; label: string }> = [
  { id: 'all', label: 'الكل' },
  { id: 'paid', label: 'مدفوعة' },
  { id: 'unpaid', label: 'غير مدفوعة' },
  { id: 'overdue', label: 'متأخرة' },
];

export default function DoctorClinicInvoicesPage() {
  const [filter, setFilter] = useState<InvoiceFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const listQuery = useBillingInvoices({
    uiStatus: filter,
    search,
    limit: 100,
  });
  const allQuery = useBillingInvoices({ limit: 200 });
  const detailQuery = useBillingInvoice(selectedInvoiceId ?? '', Boolean(selectedInvoiceId));

  const stats = useMemo(
    () => ({
      paid: allQuery.invoices.filter((i) => i.status === 'paid').length,
      unpaid: allQuery.invoices.filter((i) => i.status === 'unpaid').length,
      overdue: allQuery.invoices.filter((i) => i.status === 'overdue').length,
    }),
    [allQuery.invoices],
  );

  const openDetails = (invoice: ClinicInvoice) => {
    setSelectedInvoiceId(invoice.rawId ?? invoice.id);
    setDetailsOpen(true);
  };

  const selectedInvoice = detailQuery.invoice;

  return (
    <>
      <Helmet>
        <title>الفواتير • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <ClinicAccountsBanner
          title="الفواتير"
          subtitle="جميع الفواتير لديك"
          icon={<BookOpen className="h-7 w-7 text-white sm:h-8 sm:w-8" />}
          action={
            <Link
              to="/doctor/accounts/invoices/new"
              className="inline-flex h-[44px] min-w-[120px] shrink-0 items-center justify-between gap-3 rounded-[10px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[13px] font-extrabold text-primary shadow-sm transition hover:border-primary/30"
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              <span>جديد</span>
            </Link>
          }
        />

        <ClinicAccountsSubNav />

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ClinicAccountsMiniStatCard label="مدفوعة" value={stats.paid} icon={BookOpen} active />
          <ClinicAccountsMiniStatCard label="غير مدفوعة" value={stats.unpaid} icon={BookOpen} />
          <ClinicAccountsMiniStatCard label="متأخرة" value={stats.overdue} icon={BookOpen} />
        </section>

        <ClinicAccountsFilterTabs<InvoiceFilter>
          value={filter}
          onChange={setFilter}
          options={FILTER_OPTIONS}
        />

        <ClinicAccountsSearchRow
          value={search}
          onChange={setSearch}
          placeholder="بحث بالاسم أو رقم الفاتورة..."
          trailing={
            <ClinicAccountsSearchCount count={listQuery.invoices.length} label="فاتورة" />
          }
        />

        {listQuery.isLoading ? (
          <DoctorTableSkeleton rows={6} columns={1} />
        ) : listQuery.isError ? (
          <DoctorListErrorState
            title="تعذّر تحميل الفواتير"
            brief={getUserFacingRequestErrorMessage(listQuery.error)}
            retrying={listQuery.isFetching}
            onRetry={() => void listQuery.refetch()}
          />
        ) : listQuery.invoices.length === 0 ? (
          <p className="py-10 text-center font-cairo text-[14px] font-semibold text-[#667085]">
            لا توجد فواتير مطابقة للبحث أو الفلتر.
          </p>
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

        <InvoiceDetailsDialog
          open={detailsOpen}
          invoice={selectedInvoice}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedInvoiceId(null);
          }}
        />
      </div>
    </>
  );
}
