import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useState } from 'react';
import {
  MedicalOrderCatalogCard,
  MedicalOrderCatalogToolbar,
  MedicalOrderCategoryTabs,
  UpsertMedicalOrderItemDialog,
} from '@/components/admin/medical-orders';
import {
  useAdminMedicalOrderCatalog,
  useDeleteMedicalOrderCatalogItem,
} from '@/hooks/useAdminMedicalOrderCatalog';
import type {
  MedicalOrderCatalogItem,
  MedicalOrderCatalogKind,
} from '@/lib/admin/types';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';

export default function AdminMedicalOrdersPage() {
  const [kind, setKind] = useState<MedicalOrderCatalogKind>('lab');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MedicalOrderCatalogItem | null>(
    null,
  );

  const { data, isLoading, isError, error, refetch } =
    useAdminMedicalOrderCatalog(kind);
  const deleteMut = useDeleteMedicalOrderCatalogItem(kind);

  useEffect(() => {
    setEditTarget(null);
    setDialogOpen(false);
  }, [kind]);

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [data?.items, search]);

  function openAdd() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function openEdit(item: MedicalOrderCatalogItem) {
    setEditTarget(item);
    setDialogOpen(true);
  }

  function confirmDelete(item: MedicalOrderCatalogItem) {
    const ok = window.confirm(
      `هل تريد حذف «${item.label}»؟ لا يمكن التراجع عن هذا الإجراء.`,
    );
    if (!ok) return;
    deleteMut.mutate(item._id);
  }

  return (
    <>
      <Helmet>
        <title>كتالوج الطلبات الطبية • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar' className='space-y-6'>
        <header className='text-right'>
          <h1 className='font-cairo text-[26px] font-black leading-[34px] text-[#111827]'>
            كتالوج الطلبات الطبية
          </h1>
          <p className='mt-1 font-cairo text-[13px] font-semibold leading-[18px] text-[#667085]'>
            إدارة الطلبات الطبية التي يحتاجها الطبيب من المريض
          </p>
        </header>

        <MedicalOrderCategoryTabs active={kind} onChange={setKind} />

        <MedicalOrderCatalogToolbar
          search={search}
          onSearchChange={setSearch}
          onAddClick={openAdd}
          addDisabled={isLoading}
        />

        {isError && (
          <div className='rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-right'>
            <p className='font-cairo text-[13px] font-bold text-red-800'>
              تعذر تحميل الكتالوج.
            </p>
            <p className='mt-1 font-cairo text-[12px] font-semibold text-red-700'>
              {userFacingErrorMessage(
                error,
                'تحقق من الاتصال أو من واجهة الـ API.',
              )}
            </p>
            <button
              type='button'
              onClick={() => void refetch()}
              className='mt-2 font-cairo text-[12px] font-extrabold text-primary underline'
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {isLoading ? (
          <div className='rounded-[10px] border border-[#E5E7EB] bg-white p-10 text-center font-cairo text-[14px] font-semibold text-[#667085]'>
            جاري التحميل…
          </div>
        ) : (
          <MedicalOrderCatalogCard
            kind={kind}
            items={filteredItems}
            onEdit={openEdit}
            onDelete={confirmDelete}
            isBusy={deleteMut.isPending}
          />
        )}

        <UpsertMedicalOrderItemDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          kind={kind}
          editTarget={editTarget}
        />
      </div>
    </>
  );
}
