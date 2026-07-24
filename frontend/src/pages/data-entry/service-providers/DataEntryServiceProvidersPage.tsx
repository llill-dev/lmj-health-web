import { Helmet } from "react-helmet-async";
import { Building2, Edit3, Loader2, Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import StyledSelect from "@/components/ui/styled-select";
import CreateServiceProviderDialog from "@/components/admin/service-providers/dialogs/CreateServiceProviderDialog";
import EditServiceProviderDialog from "@/components/admin/service-providers/dialogs/EditServiceProviderDialog";
import {
  useServiceProvidersList,
  useServiceTypesPublicList,
} from "@/hooks/admin/services/useAdminServices";
import type { ServiceProvider } from "@/lib/admin/types";
import { resolveLabel } from "@/lib/admin/types";
import { useI18n } from "@/i18n/provider";

function resolveProviderSlug(provider: ServiceProvider): string {
  if (typeof provider.serviceType === "string") return provider.serviceType;
  return provider.serviceType?.slug ?? "";
}

function resolveProviderLabel(
  provider: ServiceProvider,
  locale: "ar" | "en",
): string {
  const data = provider.data ?? {};
  const name = data.name;
  if (typeof name === "string" && name.trim()) return name.trim();
  if (name && typeof name === "object") {
    const localized = name as { ar?: string; en?: string };
    return locale === "ar"
      ? localized.ar?.trim() || localized.en?.trim() || "—"
      : localized.en?.trim() || localized.ar?.trim() || "—";
  }
  const city = data.city;
  if (typeof city === "string" && city.trim()) return city.trim();
  return provider._id;
}

export default function DataEntryServiceProvidersPage() {
  const { locale, dir, t } = useI18n();
  const STATUS_LABELS: Record<string, string> = {
    active: t("common.active"),
    inactive: t("common.disabled"),
    draft: t("content.status.draft"),
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSlug = searchParams.get("type") ?? "";
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(
    null,
  );

  const typesQuery = useServiceTypesPublicList();
  const providersQuery = useServiceProvidersList(selectedSlug, cursor);

  const serviceTypes = typesQuery.data?.serviceTypes ?? [];
  const providers = providersQuery.data?.items ?? [];

  useEffect(() => {
    if (!selectedSlug && serviceTypes.length > 0) {
      setSearchParams({ type: serviceTypes[0].slug });
    }
  }, [selectedSlug, serviceTypes, setSearchParams]);

  const typeOptions = useMemo(
    () =>
      serviceTypes.map((type) => ({
        value: type.slug,
        label: resolveLabel(type.name, locale) || type.slug,
      })),
    [locale, serviceTypes],
  );

  const selectedTypeName = useMemo(() => {
    const match = serviceTypes.find((type) => type.slug === selectedSlug);
    return match ? resolveLabel(match.name, locale) : selectedSlug;
  }, [locale, selectedSlug, serviceTypes]);

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
            selectedSlug
              ? `${t("dataEntry.serviceProviders.hero.selectedTypePrefix")}: ${selectedTypeName}`
              : t("dataEntry.serviceProviders.hero.selectTypeHint")
          }
          headerIcon={<Building2 className="h-8 w-8 text-white" />}
          actionLabel={t("dataEntry.serviceProviders.hero.addAction")}
          actionIcon={<Plus className="h-4 w-4" />}
          onActionClick={() => setCreateOpen(true)}
        />

        <section className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <div className="mb-2 font-cairo text-[12px] font-extrabold text-[#667085]">
                {t("dataEntry.serviceProviders.filters.serviceType")}
              </div>
              <StyledSelect
                value={selectedSlug}
                onChange={(value) => {
                  setCursor(undefined);
                  if (value) {
                    setSearchParams({ type: value });
                  } else {
                    setSearchParams({});
                  }
                }}
                options={[
                  { value: "", label: t("dataEntry.serviceProviders.filters.selectType") },
                  ...typeOptions,
                ]}
                listboxAriaLabel={t("dataEntry.serviceProviders.filters.serviceType")}
              />
            </div>
            <div className="flex justify-start lg:col-span-6">
              <button
                type="button"
                onClick={() => void providersQuery.refetch()}
                disabled={!selectedSlug || providersQuery.isFetching}
                className="inline-flex h-[40px] items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#344054] disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${providersQuery.isFetching ? "animate-spin" : ""}`}
                />
                {t("common.refresh")}
              </button>
            </div>
          </div>
        </section>

        {typesQuery.isError ? (
          <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-4 font-cairo text-[12px] font-bold text-[#B42318]">
            {t("dataEntry.serviceProviders.error.typesLoad")}
          </div>
        ) : null}

        <section className="space-y-3">
          {!selectedSlug ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              {t("dataEntry.serviceProviders.empty.selectType")}
            </div>
          ) : providersQuery.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : providers.length === 0 ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              {t("dataEntry.serviceProviders.empty.noProviders")}
            </div>
          ) : (
            providers.map((provider) => (
              <div
                key={provider._id}
                className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.05)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-right">
                    <div className="font-cairo text-[14px] font-black text-[#111827]">
                      {resolveProviderLabel(provider, locale)}
                    </div>
                    <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                      {resolveProviderSlug(provider) || "—"} ·{" "}
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

          {providersQuery.data?.nextCursor ? (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() =>
                  setCursor(providersQuery.data?.nextCursor ?? undefined)
                }
                className="rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2 font-cairo text-[12px] font-extrabold text-primary"
              >
                {t("common.loadMore")}
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
          provider={selectedProvider}
          onSuccess={() => providersQuery.refetch()}
        />
      </div>
    </>
  );
}
