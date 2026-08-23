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

function kindLabel(
  kind: MedicalOrderCatalogKind,
  tr: (ar: string, en: string) => string,
) {
  if (kind === "lab") return tr("مختبر", "Lab");
  if (kind === "imaging") return tr("تصوير", "Imaging");
  if (kind === "procedure") return tr("إجراء", "Procedure");
  return tr("تحويل", "Referral");
}

export default function AdminMedicalOrdersPage({
  roleVariant = "admin",
}: AdminMedicalOrdersPageProps) {
  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === "ar" ? ar : en);
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
            ? tr(
                "كتالوج الطلبات الطبية • مدخل البيانات",
                "Medical orders catalog • Data Entry",
              )
            : tr("كتالوج الطلبات الطبية", "Medical orders catalog")}{" "}
          • LMJ Health
        </title>
      </Helmet>

      <div dir={dir} lang={locale} className="space-y-5">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title={
            isDataEntry
              ? tr("كتالوج الطلبات الطبية", "Medical orders catalog")
              : tr("كتالوج الطلبات الطبية", "Medical orders catalog")
          }
          subtitle={
            isDataEntry
              ? tr(
                  "إدارة عناصر الكتالوج التي يستخدمها فريق مدخل البيانات مع نفس القيود المدعومة من الواجهة.",
                  "Manage catalog items used by the data entry team within the same supported UI constraints.",
                )
              : tr(
                  "إدارة الطلبات الطبية التي يحتاجها الطبيب من المريض",
                  "Manage medical orders doctors request from patients",
                )
          }
          headerIcon={<ClipboardList className="h-8 w-8 text-white" />}
          actionLabel={
            isDataEntry
              ? tr("إضافة عنصر جديد", "Add new item")
              : tr("إضافة نوع جديد", "Add new item")
          }
          actionDisabled={isAwaitingData || !medicalOrderCatalogKindSupported(kind)}
          onActionClick={openAdd}
          kpis={[
            {
              key: "items",
              icon: <ClipboardList className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : total,
              label: tr("إجمالي العناصر المطابقة", "Total matching items"),
            },
          ]}
        />

        <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#D1E9FF] bg-[#F5FAFF] px-4 py-3 text-start">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#175CD3]" />
          <div className="font-cairo text-[12px] font-bold leading-6 text-[#175CD3]">
            {isDataEntry
              ? tr(
                  "هذه الشاشة مخصّصة لإدارة عناصر كتالوج الطلبات الطبية المرجعية ضمن الصلاحيات المتاحة لمدخل البيانات. ما يظهر هنا يخص تعريف العنصر وفهرسته فقط، وليس تنفيذ طلب طبي على مريض بعينه.",
                  "This page is for managing reference medical-order catalog items within the data entry role’s supported permissions. What appears here is only the item definition and cataloging, not the execution of a medical order for a specific patient.",
                )
              : tr(
                  "هذه الشاشة مخصّصة لإدارة كتالوج الطلبات الطبية المرجعية فقط. الإضافة أو التعديل هنا يغيّر العناصر المتاحة للأطباء لاحقًا، لكنه لا ينشئ طلبًا طبيًا فعليًا داخل ملف مريض محدد.",
                  "This page is for managing the reference medical-order catalog only. Additions or edits here change the items available to doctors later, but do not create an actual medical order inside a specific patient record.",
                )}
          </div>
        </div>

        {isDataEntry ? (
          <div className="rounded-[10px] border border-[#D5E8E6] bg-[#F8FFFE] px-4 py-3 text-start">
            <p className="font-cairo text-[13px] font-bold text-[#0F766E]">
              {tr(
                "تعمل هذه الشاشة ضمن صلاحيات مدخل البيانات فقط.",
                "This screen runs within the data entry role scope only.",
              )}
            </p>
            <p className="mt-1 font-cairo text-[12px] font-semibold text-[#0F766E]">
              {tr(
                "ستظهر فقط الإجراءات المدعومة فعليًا من الواجهة والعقد الحالي، مع إخفاء أي مسارات غير مكتملة أو غير آمنة.",
                "Only actions supported by the current UI and verified contract are shown, while incomplete or unsafe paths stay hidden.",
              )}
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
              {tr("قسم التحويلات غير مدعوم حالياً من الواجهة.", "Referral catalog is currently unsupported in the UI.")}
            </p>
            <p className="mt-1 font-cairo text-[12px] font-semibold text-amber-800">
              {tr(
                "تم إخفاء هذا المسار من التبويبات النشطة لمنع الوصول إلى تكامل غير صحيح.",
                "This route is kept out of active tabs to avoid an invalid integration path.",
              )}
            </p>
          </div>
        )}

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
              disabled={isRefetching}
              className="mt-2 font-cairo text-[12px] font-extrabold text-primary underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefetching ? tr("جارٍ إعادة المحاولة…", "Retrying...") : tr("إعادة المحاولة", "Retry")}
            </button>
          </div>
        )}

        {!isAwaitingData && !isError && isRefetching ? (
          <div className="rounded-[10px] border border-[#D0D5DD] bg-white px-4 py-3 text-start">
            <p className="font-cairo text-[12px] font-semibold text-[#667085]">
              {tr("جارٍ تحديث بيانات الكتالوج…", "Refreshing catalog data...")}
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
                {tr(
                  `عرض ${rangeStart.toLocaleString(numberLocale)}–${rangeEnd.toLocaleString(numberLocale)} من ${total.toLocaleString(numberLocale)} عنصر`,
                  `Showing ${rangeStart.toLocaleString(numberLocale)}–${rangeEnd.toLocaleString(numberLocale)} of ${total.toLocaleString(numberLocale)} items`,
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
