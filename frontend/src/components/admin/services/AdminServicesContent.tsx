import { AlertCircle, Edit3, Power, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/admin/services/EmptyState";
import { Pagination } from "@/components/admin/services/Pagination";
import { ADMIN_SERVICES_PAGE_SIZE } from "@/components/admin/services/tabsConfig";
import { FacilityCardSkeleton } from "@/components/admin/skeletons/FacilityCardSkeleton";
import { resolveLabel } from "@/lib/admin/types";
import type { ManagedServiceProvider } from "@/lib/admin/types";

function resolveProviderLabel(provider: ManagedServiceProvider): string {
  if (provider.name?.trim()) return provider.name.trim();
  if (provider.city?.trim()) return provider.city.trim();
  return provider.id;
}

export function AdminServicesContent({
  isAwaitingData,
  isError,
  onRetry,
  providers,
  page,
  total,
  totalPages,
  onPageChange,
  onEditProvider,
  onChangeStatus,
  locale,
}: {
  isAwaitingData: boolean;
  isError: boolean;
  onRetry: () => void;
  providers: ManagedServiceProvider[];
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onEditProvider: (provider: ManagedServiceProvider) => void;
  onChangeStatus: (provider: ManagedServiceProvider) => void;
  locale: "ar" | "en";
}) {
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const statusLabels: Record<string, string> = {
    active: tr("نشط", "Active"),
    inactive: tr("معطّل", "Inactive"),
    draft: tr("مسودة", "Draft"),
  };

  return (
    <section className="mt-6 space-y-4">
      {isAwaitingData && (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <FacilityCardSkeleton key={i} index={i} />
          ))}
        </>
      )}

      {isError && !isAwaitingData && (
        <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[#FEE2E2] bg-white py-12 text-center">
          <AlertCircle className="h-8 w-8 text-[#F04438]" />
          <p className="font-cairo text-[14px] font-bold text-[#F04438]">
            {tr("حدث خطأ أثناء تحميل البيانات", "Something went wrong loading the data")}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-4 py-2 font-cairo text-[12px] font-bold text-[#667085]"
          >
            <RefreshCw className="h-4 w-4" />
            {tr("إعادة المحاولة", "Retry")}
          </button>
        </div>
      )}

      {!isAwaitingData && !isError && (
        <>
          {providers.length === 0 ? (
            <EmptyState
              message={tr(
                "لا يوجد مزوّدون يطابقون هذه الفلاتر. أضف مزوّدًا جديدًا من الزر أعلاه.",
                "No providers match these filters. Add a new provider from the button above.",
              )}
            />
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
                        onClick={() => onEditProvider(provider)}
                        title={tr("تعديل البيانات", "Edit details")}
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[8px] border border-[#BBF7D0] bg-white px-3 font-cairo text-[11px] font-extrabold text-[#16A34A] transition hover:bg-[#F0FDF4]"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        {tr("تعديل", "Edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeStatus(provider)}
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

          {total > 0 && (
            <div className="flex items-center justify-between pt-2">
              <p className="font-cairo text-[12px] font-semibold text-[#98A2B3]">
                {tr(
                  `عرض ${(page - 1) * ADMIN_SERVICES_PAGE_SIZE + 1}–${Math.min(page * ADMIN_SERVICES_PAGE_SIZE, total)} من ${total} مزوّد`,
                  `Showing ${(page - 1) * ADMIN_SERVICES_PAGE_SIZE + 1}-${Math.min(page * ADMIN_SERVICES_PAGE_SIZE, total)} of ${total} providers`,
                )}
              </p>
              <Pagination page={page} totalPages={totalPages} onPage={onPageChange} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
