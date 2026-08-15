import { Helmet } from "react-helmet-async";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Edit3,
  Power,
  Search,
  Plus,
  X,
} from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import StyledSelect from "@/components/ui/styled-select";
import CreateServiceProviderDialog from "@/components/admin/service-providers/dialogs/CreateServiceProviderDialog";
import EditServiceProviderDialog from "@/components/admin/service-providers/dialogs/EditServiceProviderDialog";
import UpdateProviderStatusDialog from "@/components/admin/service-providers/dialogs/UpdateProviderStatusDialog";
import {
  useServiceProvidersList,
  useServiceTypesList,
} from "@/hooks/admin/services/useAdminServices";
import type { ManagedServiceProvider, ProviderStatus } from "@/lib/admin/types";
import { resolveLabel } from "@/lib/admin/types";
import { useI18n } from "@/i18n/provider";

const PAGE_LIMIT = 20;

const STATUS_FILTER_OPTIONS: Array<{ value: string; ar: string; en: string }> = [
  { value: "", ar: "كل الحالات", en: "All statuses" },
  { value: "draft", ar: "مسودة", en: "Draft" },
  { value: "active", ar: "نشط", en: "Active" },
  { value: "inactive", ar: "معطّل", en: "Inactive" },
];

function resolveProviderLabel(provider: ManagedServiceProvider): string {
  if (provider.name?.trim()) return provider.name.trim();
  if (provider.city?.trim()) return provider.city.trim();
  return provider.id;
}

export default function AdminServiceProvidersPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTypeId = searchParams.get("serviceType") ?? "";
  const selectedStatus = searchParams.get("status") ?? "";
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const q = searchParams.get("q") ?? "";
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<ManagedServiceProvider | null>(null);

  const statusLabels: Record<string, string> = {
    active: tr("نشط", "Active"),
    inactive: tr("معطّل", "Inactive"),
    draft: tr("مسودة", "Draft"),
  };

  const typesQuery = useServiceTypesList();
  const providersQuery = useServiceProvidersList({
    serviceType: selectedTypeId || undefined,
    status: (selectedStatus || undefined) as ProviderStatus | undefined,
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
    [serviceTypes, locale],
  );

  const updateFilters = useCallback(
    (next: { serviceType?: string; status?: string; q?: string }) => {
      const params = new URLSearchParams(searchParams);
      const merged = {
        serviceType: selectedTypeId,
        status: selectedStatus,
        q,
        ...next,
      };
      (["serviceType", "status", "q"] as const).forEach((key) => {
        if (merged[key]) params.set(key, merged[key]);
        else params.delete(key);
      });
      setSearchParams(params);
      setPage(1);
    },
    [searchParams, selectedTypeId, selectedStatus, q, setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSearchParams({});
    setPage(1);
  }, [setSearchParams]);

  const hasFilters = Boolean(selectedTypeId || selectedStatus || q);

  const openEdit = useCallback((provider: ManagedServiceProvider) => {
    setSelectedProvider(provider);
    setEditOpen(true);
  }, []);

  const openStatus = useCallback((provider: ManagedServiceProvider) => {
    setSelectedProvider(provider);
    setStatusOpen(true);
  }, []);

  return (
    <>
      <Helmet>
        <title>{tr("مزودو الخدمة", "Service providers")} • LMJ Health</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <Link
          to="/admin/service-types"
          className="mb-5 inline-flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#667085] transition hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          {tr("العودة إلى أنواع الخدمات", "Back to service types")}
        </Link>

        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={tr("مزودو الخدمة", "Service providers")}
          subtitle={tr(
            `${total} مزود خدمة`,
            `${total} service provider${total === 1 ? "" : "s"}`,
          )}
          headerIcon={<Building2 className="h-8 w-8 text-white" />}
          actionLabel={tr("إضافة مزود", "Add provider")}
          actionIcon={<Plus className="h-4 w-4" />}
          onActionClick={() => setCreateOpen(true)}
        />

        <section className="mt-2 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-4">
              <div className="mb-2 font-cairo text-[12px] font-extrabold text-[#667085]">
                {tr("نوع الخدمة", "Service type")}
              </div>
              <StyledSelect
                value={selectedTypeId}
                onChange={(value) => updateFilters({ serviceType: value })}
                options={[
                  { value: "", label: tr("كل الأنواع", "All types") },
                  ...typeOptions,
                ]}
                listboxAriaLabel={tr("نوع الخدمة", "Service type")}
              />
            </div>
            <div className="lg:col-span-3">
              <div className="mb-2 font-cairo text-[12px] font-extrabold text-[#667085]">
                {tr("الحالة", "Status")}
              </div>
              <StyledSelect
                value={selectedStatus}
                onChange={(value) => updateFilters({ status: value })}
                options={STATUS_FILTER_OPTIONS.map((o) => ({
                  value: o.value,
                  label: tr(o.ar, o.en),
                }))}
                listboxAriaLabel={tr("الحالة", "Status")}
              />
            </div>
            <div className="lg:col-span-3">
              <div className="mb-2 font-cairo text-[12px] font-extrabold text-[#667085]">
                {tr("بحث", "Search")}
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
                  placeholder={tr("ابحث بالاسم أو المدينة…", "Search name or city…")}
                  className="h-[40px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 pe-10 font-cairo text-[12px] font-bold text-[#101828] outline-none focus-visible:border-primary"
                />
                <button
                  type="submit"
                  aria-label={tr("بحث", "Search")}
                  className="absolute inset-y-0 end-2 flex items-center text-[#98A2B3]"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>
            <div className="flex items-center gap-2 lg:col-span-2">
              <button
                type="button"
                onClick={() => void providersQuery.refetch()}
                disabled={providersQuery.isFetching}
                className="inline-flex h-[40px] flex-1 items-center justify-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-extrabold text-[#344054] disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${providersQuery.isFetching ? "animate-spin" : ""}`}
                />
                {tr("تحديث", "Refresh")}
              </button>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  aria-label={tr("مسح الفلاتر", "Clear filters")}
                  className="inline-flex h-[40px] items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[#667085]"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-4 space-y-3">
          {providersQuery.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : providers.length === 0 ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center">
              <p className="font-cairo text-[13px] font-semibold text-[#667085]">
                {tr(
                  "لا يوجد مزودون يطابقون هذه الفلاتر.",
                  "No providers match these filters.",
                )}
              </p>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-[8px] bg-primary px-4 py-2 font-cairo text-[12px] font-extrabold text-white"
              >
                <Plus className="h-4 w-4" />
                {tr("إضافة مزود", "Create provider")}
              </button>
            </div>
          ) : (
            providers.map((provider) => {
              const inactiveType = !provider.serviceType.isActive;
              return (
                <div
                  key={provider.id}
                  className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-start">
                      <div className="flex items-center gap-2">
                        <span className="font-cairo text-[14px] font-black text-[#111827]">
                          {resolveProviderLabel(provider)}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 font-cairo text-[10px] font-extrabold ${
                            provider.status === "active"
                              ? "bg-[#ECFDF3] text-[#027A48]"
                              : provider.status === "inactive"
                                ? "bg-[#FEF3F2] text-[#B42318]"
                                : "bg-[#F2F4F7] text-[#475467]"
                          }`}
                        >
                          {statusLabels[provider.status] ?? provider.status}
                        </span>
                        {inactiveType ? (
                          <span className="inline-flex items-center rounded-full bg-[#FFFBEB] px-2 py-0.5 font-cairo text-[10px] font-extrabold text-[#92400E]">
                            {tr("نوع غير مُفعّل", "Type inactive")}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                        {resolveLabel(provider.serviceType.name, locale) ||
                          provider.serviceType.slug}
                        {provider.city ? ` · ${provider.city}` : ""}
                        {provider.country ? `, ${provider.country}` : ""}
                        {" · "}
                        {tr("إصدار", "v")}
                        {provider.schemaVersionAtWrite}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(provider)}
                        title={tr("تعديل البيانات", "Edit details")}
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#BBF7D0] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#16A34A] transition hover:bg-[#F0FDF4]"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        {tr("تعديل", "Edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => openStatus(provider)}
                        title={tr("تغيير الحالة", "Change status")}
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#FDE68A] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#D97706] transition hover:bg-[#FFFBEB]"
                      >
                        <Power className="h-3.5 w-3.5" />
                        {tr("الحالة", "Status")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {providers.length > 0 && totalPages > 1 ? (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#344054] disabled:opacity-40"
                aria-label={tr("الصفحة السابقة", "Previous page")}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="font-cairo text-[12px] font-bold text-[#344054]">
                {tr(`صفحة ${page} من ${totalPages}`, `Page ${page} of ${totalPages}`)}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#344054] disabled:opacity-40"
                aria-label={tr("الصفحة التالية", "Next page")}
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
        />

        <EditServiceProviderDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          providerId={selectedProvider?.id ?? null}
          onSuccess={() => providersQuery.refetch()}
        />

        {selectedProvider && (
          <UpdateProviderStatusDialog
            open={statusOpen}
            onOpenChange={setStatusOpen}
            providerId={selectedProvider.id}
            providerName={resolveProviderLabel(selectedProvider)}
            currentStatus={selectedProvider.status || "draft"}
            isServiceTypeActive={selectedProvider.serviceType.isActive}
            onSuccess={() => providersQuery.refetch()}
          />
        )}
      </div>
    </>
  );
}
