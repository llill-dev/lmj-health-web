"use client";

import { CreditCard, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  ClinicAccountsFilterTabs,
  ClinicAccountsSearchCount,
  ClinicAccountsSubNav,
  PaymentListItem,
} from "@/components/doctor/clinic-accounts";
import { DoctorListEmptyIllustration } from "@/components/doctor/shared/doctor-list-empty-illustration";
import DoctorDashboardOverview from "@/components/doctor/dashboard/doctor-dashboard-overview";
import DoctorListErrorState from "@/components/doctor/shared/doctor-list-error-state";
import DoctorTablePagination from "@/components/doctor/shared/doctor-table-pagination";
import { DoctorTableSkeleton } from "@/components/doctor/shared/skeletons";
import { useBillingPayments, useBillingSettings } from "@/hooks/doctor/billing";
import { getUserFacingRequestErrorMessage } from "@/lib/api";
import { useRetryAction } from "@/lib/query/useRetryAction";
import { useI18n } from "@/i18n/provider";
import { useBillingAccess } from "@/hooks/billing/useBillingAccess";
import type { ApiBillingPaymentMethod } from "@/lib/doctor/billing/apiTypes";

type PaymentMethodFilter = "all" | ApiBillingPaymentMethod;

function buildMethodOptions(
  tr: (ar: string, en: string) => string,
): Array<{ id: PaymentMethodFilter; label: string }> {
  return [
    { id: "all", label: tr("الكل", "All") },
    { id: "cash", label: tr("نقدي", "Cash") },
    { id: "card", label: tr("بطاقة", "Card") },
    { id: "bank_transfer", label: tr("تحويل بنكي", "Bank transfer") },
    { id: "insurance", label: tr("تأمين", "Insurance") },
  ];
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function DoctorClinicPaymentsPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const navigate = useNavigate();
  const { basePath, canManagePayments, canViewPayments, canViewSettings, isSecretary } =
    useBillingAccess();
  const methodOptions = buildMethodOptions(tr);

  const [method, setMethod] = useState<PaymentMethodFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const settingsQuery = useBillingSettings(!isSecretary || canViewSettings);
  const listQuery = useBillingPayments(
    {
      method: method === "all" ? undefined : method,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit,
    },
    canViewPayments,
  );
  const { retry: retryList, retrying: retryingList } = useRetryAction(() =>
    listQuery.refetch(),
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(listQuery.total / listQuery.limit)),
    [listQuery.total, listQuery.limit],
  );

  return (
    <>
      <Helmet>
        <title>{tr("المدفوعات • LMJ Health", "Payments • LMJ Health")}</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <DoctorDashboardOverview
          variant="appointments"
          surface="mint"
          kpiColumns={3}
          headerIcon={<CreditCard className="h-8 w-8 text-white" />}
          title={tr("المدفوعات", "Payments")}
          subtitle={
            <span>
              <span className="font-extrabold text-primary">
                {listQuery.isAwaitingData ? "—" : listQuery.total}
              </span>
              <span className="text-primary/90">
                {tr(" — إجمالي المدفوعات", " — total payments")}
              </span>
            </span>
          }
          actionLabel={canManagePayments ? tr("تسجيل دفعة", "Record payment") : undefined}
          actionIcon={canManagePayments ? <Plus className="h-4 w-4" /> : undefined}
          onActionClick={
            canManagePayments ? () => navigate(`${basePath}/payments/new`) : undefined
          }
        />

        <ClinicAccountsSubNav />

        {!canViewPayments ? (
          <p className="py-10 text-center font-cairo text-[15px] font-semibold text-[#64748B]">
            {tr(
              "ليست لديك صلاحية عرض المدفوعات.",
              "You do not have permission to view payments.",
            )}
          </p>
        ) : (
          <>
            <ClinicAccountsFilterTabs<PaymentMethodFilter>
              value={method}
              onChange={(next) => {
                setMethod(next);
                setPage(1);
              }}
              options={methodOptions}
            />

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => {
                  setDateFrom(event.target.value);
                  setPage(1);
                }}
                aria-label={tr("من تاريخ", "From date")}
                className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-3 font-cairo text-[13px] font-bold text-[#111827] outline-none focus:border-primary sm:w-[180px]"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  setPage(1);
                }}
                aria-label={tr("إلى تاريخ", "To date")}
                className="h-[40px] w-full rounded-[12px] border border-[#DCE3EC] bg-white px-3 font-cairo text-[13px] font-bold text-[#111827] outline-none focus:border-primary sm:w-[180px]"
              />
              <div className="sm:ms-auto">
                <ClinicAccountsSearchCount count={listQuery.total} label={tr("دفعة", "payment")} />
              </div>
            </div>

            {listQuery.isAwaitingData ? (
              <DoctorTableSkeleton rows={6} columns={1} />
            ) : listQuery.isError ? (
              <DoctorListErrorState
                title={tr("تعذّر تحميل المدفوعات", "Failed to load payments")}
                brief={getUserFacingRequestErrorMessage(listQuery.error)}
                retrying={retryingList}
                onRetry={() => void retryList()}
              />
            ) : listQuery.payments.length === 0 ? (
              <DoctorListEmptyIllustration
                variant="teal"
                imageSrc="/images/photo-not-found_appotemint.png"
                imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.1)]"
                title={
                  method !== "all" || dateFrom || dateTo
                    ? tr(
                        "لا توجد مدفوعات تطابق الفلتر الحالي",
                        "No payments match the current filter",
                      )
                    : tr("لا توجد مدفوعات مسجلة بعد", "No payments recorded yet")
                }
                subtitle={
                  method !== "all" || dateFrom || dateTo
                    ? tr(
                        "جرّب إعادة ضبط الفلاتر لعرض النتائج",
                        "Try resetting the filters to see results",
                      )
                    : tr(
                        "سجّل دفعة لفاتورة لعرضها هنا",
                        "Record a payment against an invoice to see it here",
                      )
                }
                actionLabel={canManagePayments ? tr("تسجيل دفعة", "Record payment") : undefined}
                onAction={
                  canManagePayments
                    ? () => navigate(`${basePath}/payments/new`)
                    : undefined
                }
                actionIcon={canManagePayments ? <Plus className="h-4 w-4" /> : undefined}
              />
            ) : (
              <div className="space-y-3">
                {listQuery.payments.map((payment, index) => (
                  <PaymentListItem
                    key={payment.id}
                    payment={payment}
                    index={index}
                    currency={settingsQuery.currency}
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
          </>
        )}
      </div>
    </>
  );
}
