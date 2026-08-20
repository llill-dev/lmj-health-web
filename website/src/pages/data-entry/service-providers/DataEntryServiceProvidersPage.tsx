import { Helmet } from "react-helmet-async";
import { Building2, ChevronLeft, ChevronRight, Edit3, Info, Loader2, Plus, RefreshCw, Search, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import StyledSelect from "@/components/ui/styled-select";
import CreateServiceProviderDialog from "@/components/admin/service-providers/dialogs/CreateServiceProviderDialog";
import EditServiceProviderDialog from "@/components/admin/service-providers/dialogs/EditServiceProviderDialog";
import {
  useServiceProvidersList,
  useServiceTypesPublicList,
} from "@/hooks/admin/services/useAdminServices";
import type { ManagedServiceProvider, ProviderStatus } from "@/lib/admin/types";
import { resolveLabel } from "@/lib/admin/types";
import { useI18n } from "@/i18n/provider";

const PAGE_LIMIT = 20;

function resolveProviderLabel(provider: ManagedServiceProvider): string {
  if (provider.name?.trim()) return provider.name.trim();
  if (provider.city?.trim()) return provider.city.trim();
  return provider.id;
}

export default function DataEntryServiceProvidersPage() {
  const { locale, dir, t } = useI18n();
  const STATUS_LABELS: Record<string, string> = {
    active: t("common.active"),
    inactive: t("common.disabled"),
    draft: t("content.status.draft"),
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTypeId = searchParams.get("serviceType") ?? "";
  const q = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(q);
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ManagedServiceProvider | null>(null);

  const typesQuery = useServiceTypesPublicList();
  // Data-entry defaults to Draft: the backend already scopes this list to the
  // signed-in user's own records, and drafts are the only status they act on
  // day-to-day (no status-change controls are exposed to this role at all).
  const providersQuery = useServiceProvidersList({
    serviceType: selectedTypeId || undefined,
    status: "draft" as ProviderStatus,
    q: q || undefined,
    page,
    limit: PAGE_LIMIT,
  });

  const serviceTypes = typesQuery.data?.serviceTypes ?? [];
  const providers = providersQuery.data?.providers ?? [];
  const total = providersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const typeOptions = useMemo(
    () =>
      serviceTypes.map((type) => ({
        value: type._id,
        label: resolveLabel(type.name, locale) || type.slug,
      })),
    [locale, serviceTypes],
  );

  const updateFilters = useCallback(
    (next: { serviceType?: string; q?: string }) => {
      const params = new URLSearchParams(searchParams);
      const merged = { serviceType: selectedTypeId, q, ...next };
      (["serviceType", "q"] as const).forEach((key) => {
        if (merged[key]) params.set(key, merged[key]);
        else params.delete(key);
      });
      setSearchParams(params);
      setPage(1);
    },
    [searchParams, selectedTypeId, q, setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSearchParams({});
    setPage(1);
  }, [setSearchParams]);

  const hasFilters = Boolean(selectedTypeId || q);

  return (
    <>
      <Helmet>
        <title>{t("dataEntry.page.serviceProviders.title")}</title>
      </Helmet>

      <div dir={dir} lang={locale} className="space-y-4">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={t("dataEntry.serviceProviders.hero.title")}
          subtitle={
            locale === "ar" ? `${total} مسودة` : `${total} draft${total === 1 ? "" : "s"}`
          }
          headerIcon={<Building2 className="h-8 w-8 text-white" />}
          actionLabel={t("dataEntry.serviceProviders.hero.addAction")}
          actionIcon={<Plus className="h-4 w-4" />}
          onActionClick={() => setCreateOpen(true)}
        />

        <section className="rounded-[12px] border border-[#D5E8E6] bg-[#F8FFFE] px-6 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
          <div className="flex items-start gap-3 text-right">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <p className="font-cairo text-[13px] font-extrabold text-[#111827]">
                {t("dataEntry.serviceProviders.scope.title")}
              </p>
              <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                {t("dataEntry.serviceProviders.scope.body")}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-5">
              <div className="mb-2 font-cairo text-[12px] font-extrabold text-[#667085]">
                {t("dataEntry.serviceProviders.filters.serviceType")}
              </div>
              <StyledSelect
                value={selectedTypeId}
                onChange={(value) => updateFilters({ serviceType: value })}
                options={[
                  { value: "", label: locale === "ar" ? "كل الأنواع" : "All types" },
                  ...typeOptions,
                ]}
                listboxAriaLabel={t("dataEntry.serviceProviders.filters.serviceType")}
              />
            </div>
            <div className="lg:col-span-4">
              <div className="mb-2 font-cairo text-[12px] font-extrabold text-[#667085]">
                {locale === "ar" ? "بحث" : "Search"}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateFilters({ q: searchInput.trim() });
                }}
                className="relative"
              >
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={locale === "ar" ? "ابحث بالاسم أو المدينة…" : "Search name or city…"}
                  className="h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 pe-10 font-cairo text-[12px] font-bold text-[#101828] outline-none focus-visible:border-primary"
                />
                <button
                  type="submit"
                  aria-label={locale === "ar" ? "بحث" : "Search"}
                  className="absolute inset-y-0 end-2 flex items-center text-[#98A2B3]"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>
            <div className="flex items-center gap-2 lg:col-span-3">
              <button
                type="button"
                onClick={() => void providersQuery.refetch()}
                disabled={providersQuery.isFetching}
                className="inline-flex h-[40px] flex-1 items-center justify-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-extrabold text-[#344054] disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${providersQuery.isFetching ? "animate-spin" : ""}`} />
                {t("common.refresh")}
              </button>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  aria-label={locale === "ar" ? "مسح الفلاتر" : "Clear filters"}
                  className="inline-flex h-[40px] items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[#667085]"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </section>

        {typesQuery.isError ? (
          <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-4 font-cairo text-[12px] font-bold text-[#B42318]">
            {t("dataEntry.serviceProviders.error.typesLoad")}
          </div>
        ) : null}

        <section className="space-y-3">
          {providersQuery.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : providers.length === 0 ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center">
              <p className="font-cairo text-[13px] font-semibold text-[#667085]">
                {locale === "ar"
                  ? "لا يوجد مزودون يطابقون هذه الفلاتر."
                  : "No providers match these filters."}
              </p>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-[8px] bg-primary px-4 py-2 font-cairo text-[12px] font-extrabold text-white"
              >
                <Plus className="h-4 w-4" />
                {t("dataEntry.serviceProviders.hero.addAction")}
              </button>
            </div>
          ) : (
            providers.map((provider) => (
              <div
                key={provider.id}
                className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.05)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-right">
                    <div className="font-cairo text-[14px] font-black text-[#111827]">
                      {resolveProviderLabel(provider)}
                    </div>
                    <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                      {resolveLabel(provider.serviceType.name, locale) || provider.serviceType.slug}
                      {" · "}
                      {STATUS_LABELS[provider.status] ?? provider.status ?? "—"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProvider(provider);
                      setEditOpen(true);
                    }}
                    title={t("dataEntry.serviceProviders.actions.edit")}
                    className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#BBF7D0] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#16A34A] transition hover:bg-[#F0FDF4]"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    {t("dataEntry.serviceProviders.actions.edit")}
                  </button>
                </div>
              </div>
            ))
          )}

          {providers.length > 0 && totalPages > 1 ? (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#344054] disabled:opacity-40"
                aria-label={locale === "ar" ? "الصفحة السابقة" : "Previous page"}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="font-cairo text-[12px] font-bold text-[#344054]">
                {locale === "ar" ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#344054] disabled:opacity-40"
                aria-label={locale === "ar" ? "الصفحة التالية" : "Next page"}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </section>

        <CreateServiceProviderDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          serviceTypes={serviceTypes}
          onSuccess={() => providersQuery.refetch()}
          allowAdvancedJson={false}
        />

        <EditServiceProviderDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          providerId={selectedProvider?.id ?? null}
          onSuccess={() => providersQuery.refetch()}
          allowAdvancedJson={false}
        />
      </div>
    </>
  );
}
