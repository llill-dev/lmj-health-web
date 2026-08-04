import { Helmet } from "react-helmet-async";
import {
  Building2,
  ChevronLeft,
  Loader2,
  RefreshCw,
  Edit3,
  Power,
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
import type { ServiceProvider } from "@/lib/admin/types";
import { resolveLabel } from "@/lib/admin/types";
import { useI18n } from "@/i18n/provider";

function resolveProviderSlug(provider: ServiceProvider): string {
  if (typeof provider.serviceType === "string") return provider.serviceType;
  return provider.serviceType?.slug ?? "";
}

function resolveProviderLabel(provider: ServiceProvider): string {
  const data = provider.data ?? {};
  const name = data.name;
  if (typeof name === "string" && name.trim()) return name.trim();
  if (name && typeof name === "object") {
    const localized = name as { ar?: string; en?: string };
    return localized.ar?.trim() || localized.en?.trim() || "—";
  }
  const city = data.city;
  if (typeof city === "string" && city.trim()) return city.trim();
  return provider._id;
}

export default function AdminServiceProvidersPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSlug = searchParams.get("type") ?? "";
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<ServiceProvider | null>(null);

  const statusLabels: Record<string, string> = {
    active: tr("نشط", "Active"),
    inactive: tr("معطّل", "Inactive"),
    draft: tr("مسودة", "Draft"),
  };

  const typesQuery = useServiceTypesList();
  const providersQuery = useServiceProvidersList(selectedSlug, cursor);

  const serviceTypes = typesQuery.data?.serviceTypes ?? [];
  const providers = providersQuery.data?.items ?? [];

  const typeOptions = useMemo(
    () =>
      serviceTypes.map((type) => ({
        value: type.slug,
        label: resolveLabel(type.name, locale) || type.slug,
      })),
    [serviceTypes, locale],
  );

  const selectedTypeName = useMemo(() => {
    const match = serviceTypes.find((type) => type.slug === selectedSlug);
    return match ? resolveLabel(match.name, locale) : selectedSlug;
  }, [selectedSlug, serviceTypes, locale]);

  const openEdit = useCallback((provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setEditOpen(true);
  }, []);

  const openStatus = useCallback((provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setStatusOpen(true);
  }, []);

  return (
    <>
      <Helmet>
        <title>
          {tr("مزودو الخدمة", "Service providers")} • LMJ Health
        </title>
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
          subtitle={
            selectedSlug
              ? tr(
                  `نوع الخدمة: ${selectedTypeName}`,
                  `Service type: ${selectedTypeName}`,
                )
              : tr(
                  "اختر نوع خدمة لعرض المزودين",
                  "Select a service type to view providers",
                )
          }
          headerIcon={<Building2 className="h-8 w-8 text-white" />}
          actionLabel={tr("إضافة مزود", "Add provider")}
          onActionClick={() => setCreateOpen(true)}
        />

        <section className="mt-4 rounded-[12px] border border-[#D6EEEC] bg-[#F3FBFA] px-5 py-4 shadow-[0_10px_24px_rgba(20,130,131,0.08)]">
          <div className="font-cairo text-[13px] font-extrabold text-[#0F766E]">
            {tr(
              "ابدأ بتحديد نوع الخدمة أولاً، ثم راجع مزوّدي هذا النوع فقط. الاسم الظاهر في كل بطاقة هو المزوّد، والحالة توضّح هل هو متاح للاستخدام أم لا.",
              "Select a service type first, then review only its providers. Each card shows the provider name clearly, and the status indicates whether it is currently available.",
            )}
          </div>
        </section>

        <section className="mt-2 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <div className="mb-2 font-cairo text-[12px] font-extrabold text-[#667085]">
                {tr("نوع الخدمة", "Service type")}
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
                  {
                    value: "",
                    label: tr("اختر نوع الخدمة…", "Select a service type…"),
                  },
                  ...typeOptions,
                ]}
                listboxAriaLabel={tr("نوع الخدمة", "Service type")}
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
                {tr("تحديث", "Refresh")}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-4 space-y-3">
          {!selectedSlug ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              {tr(
                "اختر نوع خدمة من القائمة أعلاه.",
                "Select a service type from the list above.",
              )}
            </div>
          ) : providersQuery.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : providers.length === 0 ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              {tr(
                "لا يوجد مزودون منشورون لهذا النوع حاليًا.",
                "No published providers for this type yet.",
              )}
            </div>
          ) : (
            providers.map((provider) => (
              <div
                key={provider._id}
                className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.05)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-start">
                    <div className="font-cairo text-[14px] font-black text-[#111827]">
                      {resolveProviderLabel(provider)}
                    </div>
                    <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                      {tr("نوع الخدمة:", "Service type:")}{" "}
                      {resolveProviderSlug(provider) || "—"}
                    </div>
                    <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                      {tr("الحالة:", "Status:")}{" "}
                      {statusLabels[provider.status] ?? provider.status ?? "—"}
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
                {tr("تحميل المزيد", "Load more")}
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

        {selectedProvider && (
          <UpdateProviderStatusDialog
            open={statusOpen}
            onOpenChange={setStatusOpen}
            providerId={selectedProvider._id}
            providerName={resolveProviderLabel(selectedProvider)}
            currentStatus={selectedProvider.status || "draft"}
            onSuccess={() => providersQuery.refetch()}
          />
        )}
      </div>
    </>
  );
}
