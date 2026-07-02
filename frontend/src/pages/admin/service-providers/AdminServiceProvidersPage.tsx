import { Helmet } from "react-helmet-async";
import {
  Building2,
  ChevronLeft,
  Loader2,
  RefreshCw,
  Plus,
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

const STATUS_LABELS: Record<string, string> = {
  active: "نشط",
  inactive: "معطّل",
  draft: "مسودة",
};

export default function AdminServiceProvidersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSlug = searchParams.get("type") ?? "";
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<ServiceProvider | null>(null);

  const typesQuery = useServiceTypesList();
  const providersQuery = useServiceProvidersList(selectedSlug, cursor);

  const serviceTypes = typesQuery.data?.serviceTypes ?? [];
  const providers = providersQuery.data?.items ?? [];

  const typeOptions = useMemo(
    () =>
      serviceTypes.map((type) => ({
        value: type.slug,
        label: resolveLabel(type.name, "ar") || type.slug,
      })),
    [serviceTypes],
  );

  const selectedTypeName = useMemo(() => {
    const match = serviceTypes.find((type) => type.slug === selectedSlug);
    return match ? resolveLabel(match.name, "ar") : selectedSlug;
  }, [selectedSlug, serviceTypes]);

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
        <title>مزودو الخدمة • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar">
        <Link
          to="/admin/service-types"
          className="mb-5 inline-flex items-center gap-2 font-cairo text-[12px] font-extrabold text-[#667085] transition hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          العودة إلى أنواع الخدمات
        </Link>

        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title="مزودو الخدمة"
          subtitle={
            selectedSlug
              ? `نوع الخدمة: ${selectedTypeName}`
              : "اختر نوع خدمة لعرض المزودين"
          }
          headerIcon={<Building2 className="h-8 w-8 text-white" />}
          actionLabel="إضافة مزود"
          onActionClick={() => setCreateOpen(true)}
        />

        <section className="mt-2 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-5 shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <div className="mb-2 font-cairo text-[12px] font-extrabold text-[#667085]">
                نوع الخدمة
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
                  { value: "", label: "اختر نوع الخدمة…" },
                  ...typeOptions,
                ]}
                listboxAriaLabel="نوع الخدمة"
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
                تحديث
              </button>
            </div>
          </div>
        </section>

        <section className="mt-4 space-y-3">
          {!selectedSlug ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              اختر نوع خدمة من القائمة أعلاه.
            </div>
          ) : providersQuery.isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : providers.length === 0 ? (
            <div className="rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-10 text-center font-cairo text-[13px] font-semibold text-[#667085]">
              لا يوجد مزودون منشورون لهذا النوع حاليًا.
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
                      {resolveProviderLabel(provider)}
                    </div>
                    <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                      {resolveProviderSlug(provider) || "—"} ·{" "}
                      {STATUS_LABELS[provider.status] ?? provider.status ?? "—"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(provider)}
                      title="تعديل البيانات"
                      className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#BBF7D0] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#16A34A] transition hover:bg-[#F0FDF4]"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => openStatus(provider)}
                      title="تغيير الحالة"
                      className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#FDE68A] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#D97706] transition hover:bg-[#FFFBEB]"
                    >
                      <Power className="h-3.5 w-3.5" />
                      الحالة
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
                تحميل المزيد
              </button>
            </div>
          ) : null}
        </section>

        {/* Create Provider Dialog */}
        <CreateServiceProviderDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          serviceTypes={serviceTypes}
          onSuccess={() => providersQuery.refetch()}
        />

        {/* Edit Provider Dialog */}
        <EditServiceProviderDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          provider={selectedProvider}
          onSuccess={() => providersQuery.refetch()}
        />

        {/* Update Status Dialog */}
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
