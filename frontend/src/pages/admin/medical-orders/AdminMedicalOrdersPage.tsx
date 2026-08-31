import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import {
  MedicalOrderCatalogCard,
  MedicalOrderCatalogDetailsDialog,
  MedicalOrderCatalogToolbar,
  MedicalOrderCategoryTabs,
  UpsertMedicalOrderItemDialog,
} from "@/components/admin/medical-orders";
import { MedicalOrderCardSkeleton } from "@/components/admin/skeletons/MedicalOrderCardSkeleton";
import { SkeletonList } from "@/components/admin/skeletons/SkeletonList";
import {
  useAdminMedicalOrderCatalog,
  ADMIN_MEDICAL_ORDER_DELETE_SUPPORTED,
} from "@/hooks/admin/medical-orders/useAdminMedicalOrderCatalog";
import type {
  MedicalOrderCatalogItem,
  MedicalOrderCatalogKind,
} from "@/lib/admin/types";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import { AlertCircle, ClipboardList } from "lucide-react";
import { Pagination } from "@/components/admin/services/Pagination";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import StyledSelect from "@/components/ui/styled-select";
import { useI18n } from "@/i18n/provider";
import {
  medicalOrderCatalogDeleteSupported,
  medicalOrderCatalogKindSupported,
} from "@/components/admin/medical-orders";

type AdminMedicalOrdersPageProps = {
  roleVariant?: "admin" | "data-entry";
};

function kindLabel(kind: MedicalOrderCatalogKind, t: (key: string) => string) {
  if (kind === "lab") return t("admin.medicalOrders.kind.lab");
  if (kind === "imaging") return t("admin.medicalOrders.kind.imaging");
  if (kind === "procedure") return t("admin.medicalOrders.kind.procedure");
  return t("admin.medicalOrders.kind.referral");
}

export default function AdminMedicalOrdersPage({
  roleVariant = "admin",
}: AdminMedicalOrdersPageProps) {
  const { t, locale, dir } = useI18n();
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";
  const isDataEntry = roleVariant === "data-entry";

  const [kind, setKind] = useState<MedicalOrderCatalogKind>("lab");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priorityLevel, setPriorityLevel] = useState("");
  const [visibility, setVisibility] = useState<"" | "visible" | "hidden">("");
  const [activeStatus, setActiveStatus] = useState<"" | "active" | "inactive">(
    "",
  );
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<MedicalOrderCatalogItem | null>(
    null,
  );
  const [editTarget, setEditTarget] = useState<MedicalOrderCatalogItem | null>(
    null,
  );

  const [debouncedSearch] = useDebounce(search, 300);
  const [debouncedCategory] = useDebounce(category, 350);
  const { data, isAwaitingData, isError, error, refetch, isRefetching } =
    useAdminMedicalOrderCatalog(kind, {
      search: debouncedSearch,
      category: debouncedCategory || undefined,
      priorityLevel: priorityLevel || undefined,
      isVisible:
        visibility === "visible"
          ? true
          : visibility === "hidden"
            ? false
            : undefined,
      isActive:
        activeStatus === "active"
          ? true
          : activeStatus === "inactive"
            ? false
            : undefined,
      sort: sort || undefined,
      page,
      limit: pageSize,
    });
  const deleteSupported =
    medicalOrderCatalogDeleteSupported() &&
    ADMIN_MEDICAL_ORDER_DELETE_SUPPORTED;

  useEffect(() => {
    setEditTarget(null);
    setDialogOpen(false);
    setPage(1);
  }, [kind]);

  // The server now applies search/category/priorityLevel/isVisible/isActive
  // and pagination itself — `data.items` is already the correct page, so no
  // client-side re-filtering or slicing on top of it.
  const visibleItems = data?.items ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? page;
  const totalPages = Math.max(
    1,
    Math.ceil(total / Math.max(data?.limit ?? pageSize, 1)),
  );
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(currentPage * pageSize, total);

  useEffect(() => {
    if (!isAwaitingData && page > totalPages) {
      setPage(totalPages);
    }
  }, [isAwaitingData, page, totalPages]);

  function openAdd() {
    if (!medicalOrderCatalogKindSupported(kind)) return;
    setEditTarget(null);
    setDialogOpen(true);
  }

  function openEdit(item: MedicalOrderCatalogItem) {
    if (!medicalOrderCatalogKindSupported(kind)) return;
    setEditTarget(item);
    setDialogOpen(true);
  }

  function openView(item: MedicalOrderCatalogItem) {
    setViewTarget(item);
  }

  function openDeleteConfirm(item: MedicalOrderCatalogItem) {
    void item;
  }

  return (
    <>
      <Helmet>
        <title>
          {isDataEntry
            ? t("admin.medicalOrders.page.title.dataEntry")
            : t("admin.medicalOrders.page.title.admin")}{" "}
          • LMJ Health
        </title>
      </Helmet>

      <div dir={dir} lang={locale} className="space-y-5">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={t("admin.medicalOrders.overview.title")}
          subtitle={
            isDataEntry
              ? t("admin.medicalOrders.overview.subtitle.dataEntry")
              : t("admin.medicalOrders.overview.subtitle.admin")
          }
          headerIcon={<ClipboardList className="h-8 w-8 text-white" />}
          actionLabel={
            isDataEntry
              ? t("admin.medicalOrders.overview.actionLabel.dataEntry")
              : t("admin.medicalOrders.overview.actionLabel.admin")
          }
          actionDisabled={
            isAwaitingData || !medicalOrderCatalogKindSupported(kind)
          }
          onActionClick={openAdd}
          kpis={[
            {
              key: "items",
              icon: <ClipboardList className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : total,
              label: t("admin.medicalOrders.overview.kpi.totalItems"),
            },
          ]}
        />

        <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#D1E9FF] bg-[#F5FAFF] px-4 py-3 text-start">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#175CD3]" />
          <div className="font-cairo text-[12px] font-bold leading-6 text-[#175CD3]">
            {isDataEntry
              ? t("admin.medicalOrders.disclaimer.dataEntry")
              : t("admin.medicalOrders.disclaimer.admin")}
          </div>
        </div>

        {isDataEntry ? (
          <div className="rounded-[10px] border border-[#D5E8E6] bg-[#F8FFFE] px-4 py-3 text-start">
            <p className="font-cairo text-[13px] font-bold text-[#0F766E]">
              {t("admin.medicalOrders.dataEntryScope.title")}
            </p>
            <p className="mt-1 font-cairo text-[12px] font-semibold text-[#0F766E]">
              {t("admin.medicalOrders.dataEntryScope.description")}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          <div className="min-w-0">
            <MedicalOrderCategoryTabs active={kind} onChange={setKind} />
          </div>
          <div className="w-full">
            <MedicalOrderCatalogToolbar
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              category={category}
              onCategoryChange={(value) => {
                setCategory(value);
                setPage(1);
              }}
              priorityLevel={priorityLevel}
              onPriorityLevelChange={(value) => {
                setPriorityLevel(value);
                setPage(1);
              }}
              visibility={visibility}
              onVisibilityChange={(value) => {
                setVisibility(value);
                setPage(1);
              }}
              activeStatus={activeStatus}
              onActiveStatusChange={(value) => {
                setActiveStatus(value);
                setPage(1);
              }}
              sort={sort}
              onSortChange={(value) => {
                setSort(value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {!medicalOrderCatalogKindSupported(kind) && (
          <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-start">
            <p className="font-cairo text-[13px] font-bold text-amber-900">
              {t("admin.medicalOrders.unsupportedKind.title")}
            </p>
            <p className="mt-1 font-cairo text-[12px] font-semibold text-amber-800">
              {t("admin.medicalOrders.unsupportedKind.description")}
            </p>
          </div>
        )}

        {isError && (
          <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-start">
            <p className="font-cairo text-[13px] font-bold text-red-800">
              {t("admin.medicalOrders.error.loadCatalog")}
            </p>
            <p className="mt-1 font-cairo text-[12px] font-semibold text-red-700">
              {userFacingErrorMessage(
                error,
                t("admin.medicalOrders.error.checkConnection"),
              )}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isRefetching}
              className="mt-2 font-cairo text-[12px] font-extrabold text-primary underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefetching
                ? t("admin.medicalOrders.error.retrying")
                : t("admin.medicalOrders.error.retry")}
            </button>
          </div>
        )}

        {!isAwaitingData && !isError && isRefetching ? (
          <div className="rounded-[10px] border border-[#D0D5DD] bg-white px-4 py-3 text-start">
            <p className="font-cairo text-[12px] font-semibold text-[#667085]">
              {t("admin.medicalOrders.refreshing")}
            </p>
          </div>
        ) : null}

        {isAwaitingData ? (
          <SkeletonList
            count={5}
            SkeletonComponent={MedicalOrderCardSkeleton}
            className="space-y-3"
          />
        ) : (
          <MedicalOrderCatalogCard
            kind={kind}
            items={visibleItems}
            onView={openView}
            onEdit={openEdit}
            onDelete={openDeleteConfirm}
            isBusy={false}
            deleteUnsupported={!deleteSupported}
          />
        )}

        {!isAwaitingData && !isError && total > 0 ? (
          <section className="rounded-[10px] border border-[#E5E7EB] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="font-cairo text-[12px] font-bold text-[#667085]">
                {t("admin.medicalOrders.pagination.showing")
                  .replace("{start}", rangeStart.toLocaleString(numberLocale))
                  .replace("{end}", rangeEnd.toLocaleString(numberLocale))
                  .replace("{total}", total.toLocaleString(numberLocale))}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <div className="w-[108px]">
                  <StyledSelect
                    value={String(pageSize)}
                    onChange={(value) => {
                      setPageSize(Number(value) || 10);
                      setPage(1);
                    }}
                    options={[10, 20, 50].map((value) => ({
                      value: String(value),
                      label: String(value),
                    }))}
                    listboxAriaLabel={t(
                      "admin.medicalOrders.pagination.itemsPerPage",
                    )}
                    triggerClassName="h-[36px] rounded-[10px]"
                  />
                </div>

                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPage={setPage}
                />
              </div>
            </div>
          </section>
        ) : null}

        <UpsertMedicalOrderItemDialog
          open={dialogOpen && medicalOrderCatalogKindSupported(kind)}
          onOpenChange={setDialogOpen}
          kind={kind}
          editTarget={editTarget}
        />

        <MedicalOrderCatalogDetailsDialog
          open={viewTarget !== null}
          onOpenChange={(open) => {
            if (!open) setViewTarget(null);
          }}
          kind={kind}
          itemId={viewTarget?._id ?? null}
        />
      </div>
    </>
  );
}
