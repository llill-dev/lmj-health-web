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
import AdminDashboardOverview from "@/components/admin/dashboard/admin-dashboard-overview";

export default function AdminMedicalOrdersPage() {
  const [kind, setKind] = useState<MedicalOrderCatalogKind>("lab");
  const [search, setSearch] = useState("");
  const [showVisibleOnly, setShowVisibleOnly] = useState(false);
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
  const { data, isAwaitingData, isError, error, refetch } =
    useAdminMedicalOrderCatalog(kind, debouncedSearch, showVisibleOnly);
  const deleteMut = useDeleteMedicalOrderCatalogItem(kind);

  useEffect(() => {
    setEditTarget(null);
    setDialogOpen(false);
    setShowVisibleOnly(false);
  }, [kind]);

  const items = data?.items ?? [];

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
        <title>كتالوج الطلبات الطبية • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="space-y-5">
        <AdminDashboardOverview
          variant="admin"
          surface="mint"
          title="كتالوج الطلبات الطبية"
          subtitle="إدارة الطلبات الطبية التي يحتاجها الطبيب من المريض"
          headerIcon={<ClipboardList className="h-8 w-8 text-white" />}
          actionLabel="إضافة نوع جديد"
          actionDisabled={isAwaitingData}
          onActionClick={openAdd}
          kpis={[
            {
              key: "items",
              icon: <ClipboardList className="h-5 w-5 shrink-0" />,
              value: isAwaitingData ? "—" : items.length,
              label: "عناصر معروضة",
            },
          ]}
        />

        <div className="flex flex-col gap-3 items-stretch md:flex-row md:items-center md:justify-between">
          <div className="order-1 min-w-0 flex-1 md:order-2 md:flex md:min-h-[44px] md:items-center">
            <MedicalOrderCategoryTabs active={kind} onChange={setKind} />
          </div>
          <div className="order-2 w-full md:order-1 md:w-auto md:min-w-[16rem] md:max-w-md md:shrink-0 md:flex md:items-center">
            <MedicalOrderCatalogToolbar
              search={search}
              onSearchChange={setSearch}
              showVisibleOnly={showVisibleOnly}
              onShowVisibleOnlyChange={setShowVisibleOnly}
            />
          </div>
        </div>

        {isError && (
          <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-right">
            <p className="font-cairo text-[13px] font-bold text-red-800">
              تعذر تحميل الكتالوج.
            </p>
            <p className="mt-1 font-cairo text-[12px] font-semibold text-red-700">
              {userFacingErrorMessage(
                error,
                "تحقق من الاتصال أو من واجهة الـ API.",
              )}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-2 font-cairo text-[12px] font-extrabold text-primary underline"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {isAwaitingData ? (
          <div className="rounded-[10px] border border-[#E5E7EB] bg-white p-10 text-center font-cairo text-[14px] font-semibold text-[#667085]">
            جاري التحميل…
          </div>
        ) : (
          <MedicalOrderCatalogCard
            kind={kind}
            items={items}
            onView={openView}
            onEdit={openEdit}
            onDelete={openDeleteConfirm}
            isBusy={deleteMut.isPending}
          />
        )}

        <ConfirmActionDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          variant="destructive"
          title="حذف بند من الكتالوج؟"
          icon={<Trash2 className="w-6 h-6" strokeWidth={2} aria-hidden />}
          description={
            deleteTarget ? (
              <>
                سيتم حذف «
                <span className="font-extrabold text-[#344054]">
                  {deleteTarget.label}
                </span>
                » نهائياً من فئة{" "}
                {kind === "lab"
                  ? "مختبر"
                  : kind === "imaging"
                    ? "تصوير"
                    : kind === "procedure"
                      ? "إجراء"
                      : "تحويل"}
                . لا يمكن التراجع عن الحذف من الواجهة.
              </>
            ) : (
              "—"
            )
          }
          confirmLabel="حذف"
          confirmDisabled={deleteMut.isPending}
          onConfirm={async () => {
            if (!deleteTarget) return;
            await deleteMut.mutateAsync(deleteTarget._id);
          }}
          successToast={{
            title: "تم الحذف",
            message: "حُذف بند الكتالوج من القائمة.",
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
