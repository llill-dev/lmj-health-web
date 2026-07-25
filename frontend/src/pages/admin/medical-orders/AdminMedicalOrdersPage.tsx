import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
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
  useDeleteMedicalOrderCatalogItem,
} from "@/hooks/admin/medical-orders/useAdminMedicalOrderCatalog";
import type {
  MedicalOrderCatalogItem,
  MedicalOrderCatalogKind,
} from "@/lib/admin/types";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import { ConfirmActionDialog } from "@/components/admin/dialogs";
import { ClipboardList, Trash2 } from "lucide-react";
import { Pagination } from "@/components/admin/services/Pagination";
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";
import StyledSelect from "@/components/ui/styled-select";
import { useI18n } from "@/i18n/provider";

function kindLabel(
  kind: MedicalOrderCatalogKind,
  tr: (ar: string, en: string) => string,
) {
  if (kind === "lab") return tr("مختبر", "Lab");
  if (kind === "imaging") return tr("تصوير", "Imaging");
  if (kind === "procedure") return tr("إجراء", "Procedure");
  return tr("تحويل", "Referral");
}

export default function AdminMedicalOrdersPage() {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const numberLocale = locale === "ar" ? "ar-SA" : "en-US";

  const [kind, setKind] = useState<MedicalOrderCatalogKind>("lab");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priorityLevel, setPriorityLevel] = useState("");
  const [visibility, setVisibility] = useState<"" | "visible" | "hidden">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<MedicalOrderCatalogItem | null>(
    null,
  );
  const [editTarget, setEditTarget] = useState<MedicalOrderCatalogItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    useState<MedicalOrderCatalogItem | null>(null);

  const [debouncedSearch] = useDebounce(search, 300);
  const [debouncedCategory] = useDebounce(category, 350);
  const { data, isAwaitingData, isError, error, refetch } =
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
    });
  const deleteMut = useDeleteMedicalOrderCatalogItem(kind);

  useEffect(() => {
    setEditTarget(null);
    setDialogOpen(false);
    setPage(1);
  }, [kind]);

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (
        priorityLevel &&
        (i.priorityLevel ?? "").toLowerCase() !== priorityLevel
      ) {
        return false;
      }
      if (visibility === "visible" && i.isVisible === false) return false;
      if (visibility === "hidden" && i.isVisible !== false) return false;
      if (category.trim()) {
        const cat = (i.category ?? "").toLowerCase();
        if (!cat.includes(category.trim().toLowerCase())) return false;
      }
      if (!q) return true;
      const aggregate = [
        i.label,
        i.code,
        i.shortCode,
        i.nameAr,
        i.nameEn,
        i.category,
        i.modality,
        i.bodyArea,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return aggregate.includes(q);
    });
  }, [category, data?.items, priorityLevel, search, visibility]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / Math.max(pageSize, 1)),
  );
  const currentPage = Math.min(page, totalPages);
  const visibleItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [currentPage, filteredItems, pageSize]);
  const rangeStart =
    filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd =
    filteredItems.length === 0
      ? 0
      : Math.min(currentPage * pageSize, filteredItems.length);

  function openAdd() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function openEdit(item: MedicalOrderCatalogItem) {
    setEditTarget(item);
    setDialogOpen(true);
  }

  function openView(item: MedicalOrderCatalogItem) {
    setViewTarget(item);
  }

  function openDeleteConfirm(item: MedicalOrderCatalogItem) {
    setDeleteTarget(item);
  }

  return (
    <>
      <Helmet>
        <title>
          {tr("كتالوج الطلبات الطبية", "Medical orders catalog")} • LMJ Health
        </title>
      </Helmet>

      <div dir={dir} lang={locale} className="space-y-5">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={tr("كتالوج الطلبات الطبية", "Medical orders catalog")}
          subtitle={tr(
            "إدارة الطلبات الطبية التي يحتاجها الطبيب من المريض",
            "Manage medical orders doctors request from patients",
          )}
          headerIcon={<ClipboardList className="h-8 w-8 text-white" />}
          actionLabel={tr("إضافة نوع جديد", "Add new item")}
          actionDisabled={isAwaitingData}
          onActionClick={openAdd}
          kpis={[
            {
              key: "items",
              icon: <ClipboardList className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : filteredItems.length,
              label: tr("عناصر معروضة", "Visible items"),
            },
          ]}
        />

        <div className="flex flex-col gap-3 items-stretch md:flex-row md:items-center md:justify-between">
          <div className="order-1 min-w-0 flex-1 md:order-2 md:flex md:min-h-[44px] md:items-center">
            <MedicalOrderCategoryTabs active={kind} onChange={setKind} />
          </div>
          <div className="order-2 w-full md:order-1 md:flex-1">
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
            />
          </div>
        </div>

        {isError && (
          <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-start">
            <p className="font-cairo text-[13px] font-bold text-red-800">
              {tr("تعذر تحميل الكتالوج.", "Failed to load the catalog.")}
            </p>
            <p className="mt-1 font-cairo text-[12px] font-semibold text-red-700">
              {userFacingErrorMessage(
                error,
                tr(
                  "تحقق من الاتصال أو من واجهة الـ API.",
                  "Check your connection or the API.",
                ),
              )}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-2 font-cairo text-[12px] font-extrabold text-primary underline"
            >
              {tr("إعادة المحاولة", "Retry")}
            </button>
          </div>
        )}

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
            isBusy={deleteMut.isPending}
          />
        )}

        {!isAwaitingData && !isError && filteredItems.length > 0 ? (
          <section className="rounded-[10px] border border-[#E5E7EB] bg-white px-5 py-4 shadow-[0_14px_30px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="font-cairo text-[12px] font-bold text-[#667085]">
                {tr(
                  `عرض ${rangeStart.toLocaleString(numberLocale)}–${rangeEnd.toLocaleString(numberLocale)} من ${filteredItems.length.toLocaleString(numberLocale)} عنصر`,
                  `Showing ${rangeStart.toLocaleString(numberLocale)}–${rangeEnd.toLocaleString(numberLocale)} of ${filteredItems.length.toLocaleString(numberLocale)} items`,
                )}
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
                    listboxAriaLabel={tr(
                      "عدد العناصر في الصفحة",
                      "Items per page",
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

        <ConfirmActionDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          variant="destructive"
          title={tr(
            "حذف بند من الكتالوج؟",
            "Delete catalog item?",
          )}
          icon={<Trash2 className="w-6 h-6" strokeWidth={2} aria-hidden />}
          description={
            deleteTarget ? (
              <>
                {tr("سيتم حذف «", "“")}
                <span className="font-extrabold text-[#344054]">
                  {deleteTarget.label}
                </span>
                {tr(
                  `» نهائياً من فئة ${kindLabel(kind, tr)}. لا يمكن التراجع عن الحذف من الواجهة.`,
                  `” will be permanently deleted from ${kindLabel(kind, tr)}. This cannot be undone from the UI.`,
                )}
              </>
            ) : (
              "—"
            )
          }
          confirmLabel={tr("حذف", "Delete")}
          confirmDisabled={deleteMut.isPending}
          onConfirm={async () => {
            if (!deleteTarget) return;
            await deleteMut.mutateAsync(deleteTarget._id);
          }}
          successToast={{
            title: tr("تم الحذف", "Deleted"),
            message: tr(
              "حُذف بند الكتالوج من القائمة.",
              "Catalog item removed from the list.",
            ),
            variant: "success",
          }}
        />

        <UpsertMedicalOrderItemDialog
          open={dialogOpen}
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
