import * as Dialog from '@radix-ui/react-dialog';
import { Eye, X } from 'lucide-react';
import { useAdminMedicalOrderCatalogItem } from '@/hooks/admin/medical-orders/useAdminMedicalOrderCatalog';
import type { MedicalOrderCatalogKind } from '@/lib/admin/types';

const KIND_AR: Record<MedicalOrderCatalogKind, string> = {
  lab: 'مختبر',
  imaging: 'تصوير',
  procedure: 'إجراء',
  referral: 'تحويل',
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: MedicalOrderCatalogKind;
  itemId: string | null;
};

export default function MedicalOrderCatalogDetailsDialog({
  open,
  onOpenChange,
  kind,
  itemId,
}: Props) {
  const { item, isAwaitingData, isError } = useAdminMedicalOrderCatalogItem(
    kind,
    open ? itemId : null,
  );

  const detailRows =
    item == null
      ? []
      : [
          { label: "Code", value: item.code },
          { label: "Short Code", value: item.shortCode },
          { label: "الاسم العربي", value: item.nameAr },
          { label: "الاسم الإنجليزي", value: item.nameEn },
          { label: "Category", value: item.category },
          { label: "Priority", value: item.priorityLevel },
          {
            label: "Sort Order",
            value: typeof item.sortOrder === "number" ? String(item.sortOrder) : undefined,
          },
          {
            label: "Synonyms",
            value: item.synonyms?.length ? item.synonyms.join("، ") : undefined,
          },
        ].filter((row) => Boolean(row.value?.trim?.() ?? row.value));

  const kindSpecificRows =
    item == null
      ? []
      : [
          ...(kind === "lab"
            ? [
                { label: "LOINC", value: item.loincCode },
                { label: "نوع العينة", value: item.sampleType },
                { label: "نوع النتيجة", value: item.resultType },
                {
                  label: "يتطلب صيام",
                  value:
                    typeof item.fastingRequired === "boolean"
                      ? item.fastingRequired
                        ? "نعم"
                        : "لا"
                      : undefined,
                },
              ]
            : []),
          ...(kind === "imaging"
            ? [
                { label: "Modality", value: item.modality },
                { label: "منطقة الجسم", value: item.bodyArea },
                {
                  label: "يدعم المادة الظليلة",
                  value:
                    typeof item.supportsContrast === "boolean"
                      ? item.supportsContrast
                        ? "نعم"
                        : "لا"
                      : undefined,
                },
              ]
            : []),
          ...(kind === "procedure"
            ? [
                { label: "التحضير الافتراضي", value: item.defaultPreparation },
                { label: "تعليمات ما بعد الإجراء", value: item.defaultAftercare },
              ]
            : []),
          { label: "ملاحظات", value: item.notes },
        ].filter((row) => Boolean(row.value?.trim?.() ?? row.value));

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-[9998] bg-black/45 backdrop-blur-[2px]' />
        <Dialog.Content
          className='fixed left-1/2 top-1/2 z-[9999] w-[460px] max-w-[calc(100vw-24px)] -translate-x-1/2 -translate-y-1/2 rounded-[16px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)] outline-none'
          dir='rtl'
          lang='ar'
        >
          <div className='flex items-center justify-between border-b border-[#F2F4F7] px-5 py-4'>
            <div className='flex items-center gap-2'>
              <Eye className='h-5 w-5 text-primary' />
              <Dialog.Title className='font-cairo text-[16px] font-extrabold text-[#101828]'>
                تفاصيل بند الكتالوج
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type='button'
                className='flex h-8 w-8 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]'
              >
                <X className='h-4 w-4' />
              </button>
            </Dialog.Close>
          </div>

          <div className='space-y-4 px-5 py-4'>
            {isAwaitingData ? (
              <div className='rounded-[10px] border border-[#EEF2F6] bg-[#FAFAFB] px-4 py-6 text-center font-cairo text-[12px] font-semibold text-[#667085]'>
                جاري تحميل التفاصيل...
              </div>
            ) : isError || !item ? (
              <div className='rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-6 text-center font-cairo text-[12px] font-semibold text-[#B42318]'>
                تعذر تحميل تفاصيل البند.
              </div>
            ) : (
              <>
                <div className='rounded-[12px] border border-[#E5E7EB] bg-[#FCFCFD] px-4 py-4'>
                  <div className='font-cairo text-[15px] font-extrabold text-[#111827]'>
                    {item.label}
                  </div>
                  <div className='mt-2 font-cairo text-[12px] font-semibold text-[#667085]'>
                    الفئة: {KIND_AR[kind]}
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 text-right'>
                    <div className='font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
                      حالة التفعيل
                    </div>
                    <div className='mt-1 font-cairo text-[13px] font-extrabold text-[#111827]'>
                      {item.isActive !== false ? 'نشط' : 'معطّل'}
                    </div>
                  </div>
                  <div className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 text-right'>
                    <div className='font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
                      الظهور للأطباء
                    </div>
                    <div className='mt-1 font-cairo text-[13px] font-extrabold text-[#111827]'>
                      {item.isVisible !== false ? 'ظاهر' : 'مخفي'}
                    </div>
                  </div>
                </div>

                <div className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 text-right'>
                  <div className='font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
                    المعرّف
                  </div>
                  <div className='mt-1 font-mono text-[12px] font-semibold text-[#344054]' dir='ltr'>
                    {item._id}
                  </div>
                </div>

                {detailRows.length > 0 ? (
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    {detailRows.map((row) => (
                      <div
                        key={row.label}
                        className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 text-right'
                      >
                        <div className='font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
                          {row.label}
                        </div>
                        <div className='mt-1 font-cairo text-[13px] font-extrabold text-[#111827]'>
                          {row.value}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {kindSpecificRows.length > 0 ? (
                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                    {kindSpecificRows.map((row) => (
                      <div
                        key={row.label}
                        className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 text-right'
                      >
                        <div className='font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
                          {row.label}
                        </div>
                        <div className='mt-1 font-cairo text-[13px] font-extrabold text-[#111827]'>
                          {row.value}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
