import * as Dialog from '@radix-ui/react-dialog';
import { Eye, X } from 'lucide-react';
import { useAdminMedicalOrderCatalogItem } from '@/hooks/admin/medical-orders/useAdminMedicalOrderCatalog';
import type { MedicalOrderCatalogKind } from '@/lib/admin/types';
import { useI18n } from '@/i18n/provider';

const KIND_KEY: Record<MedicalOrderCatalogKind, string> = {
  lab: 'adminMedicalOrders.tab.lab',
  imaging: 'adminMedicalOrders.tab.imaging',
  procedure: 'adminMedicalOrders.tab.procedure',
  referral: 'adminMedicalOrders.tab.referral',
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
  const { locale, dir, t } = useI18n();
  const { item, isAwaitingData, isError, refetch, isRefetching } =
    useAdminMedicalOrderCatalogItem(kind, open ? itemId : null);

  const detailRows =
    item == null
      ? []
      : [
          { label: "Code", value: item.code },
          { label: "Short Code", value: item.shortCode },
          { label: t('adminMedicalOrders.field.nameAr.label'), value: item.nameAr },
          { label: t('adminMedicalOrders.field.nameEn.label'), value: item.nameEn },
          { label: "Category", value: item.category },
          { label: "Priority", value: item.priorityLevel },
          {
            label: "Sort Order",
            value: typeof item.sortOrder === "number" ? String(item.sortOrder) : undefined,
          },
          {
            label: "Synonyms",
            value: item.synonyms?.length
              ? item.synonyms.join(locale === "ar" ? "، " : ", ")
              : undefined,
          },
        ].filter((row) => Boolean(row.value?.trim?.() ?? row.value));

  const kindSpecificRows =
    item == null
      ? []
      : [
          ...(kind === "lab"
            ? [
                { label: "LOINC", value: item.loincCode },
                { label: t('adminMedicalOrders.field.specimenType.placeholder'), value: item.sampleType },
                { label: t('adminMedicalOrders.field.resultType.placeholder'), value: item.resultType },
                {
                  label: t('adminMedicalOrders.field.fastingRequired.label'),
                  value:
                    typeof item.fastingRequired === "boolean"
                      ? item.fastingRequired
                        ? t('common.yes')
                        : t('common.no')
                      : undefined,
                },
              ]
            : []),
          ...(kind === "imaging"
            ? [
                { label: "Modality", value: item.modality },
                { label: t('adminMedicalOrders.field.bodyRegion.placeholder'), value: item.bodyArea },
                {
                  label: t('adminMedicalOrders.details.supportsContrast'),
                  value:
                    typeof item.supportsContrast === "boolean"
                      ? item.supportsContrast
                        ? t('common.yes')
                        : t('common.no')
                      : undefined,
                },
              ]
            : []),
          ...(kind === "procedure"
            ? [
                { label: t('adminMedicalOrders.field.defaultPrep.placeholder'), value: item.defaultPreparation },
                { label: t('adminMedicalOrders.field.postInstructions.placeholder'), value: item.defaultAftercare },
              ]
            : []),
          { label: t('adminMedicalOrders.field.notes.label'), value: item.notes },
        ].filter((row) => Boolean(row.value?.trim?.() ?? row.value));

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-[9998] bg-black/45 backdrop-blur-[2px]' />
        <Dialog.Content
          className='fixed start-1/2 top-1/2 z-[9999] w-[460px] max-w-[calc(100vw-24px)] -translate-x-1/2 -translate-y-1/2 rounded-[16px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)] outline-none'
          dir={dir}
          lang={locale}
        >
          <div className='flex items-center justify-between border-b border-[#F2F4F7] px-5 py-4'>
            <div className='flex items-center gap-2'>
              <Eye className='h-5 w-5 text-primary' />
              <Dialog.Title className='font-cairo text-[16px] font-extrabold text-[#101828]'>
                {t('adminMedicalOrders.details.title')}
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
                {t('adminMedicalOrders.details.loading')}
              </div>
            ) : isError || !item ? (
              <div className='rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-6 text-center font-cairo text-[12px] font-semibold text-[#B42318]'>
                <p>{t('adminMedicalOrders.details.loadError')}</p>
                <button
                  type='button'
                  onClick={() => void refetch()}
                  disabled={isRefetching}
                  className='mt-3 font-cairo text-[12px] font-extrabold text-[#B42318] underline disabled:opacity-60'
                >
                  {isRefetching ? t('adminMedicalOrders.details.retrying') : t('adminMedicalOrders.details.retry')}
                </button>
              </div>
            ) : (
              <>
                <div className='rounded-[12px] border border-[#E5E7EB] bg-[#FCFCFD] px-4 py-4'>
                  <div className='font-cairo text-[15px] font-extrabold text-[#111827]'>
                    {item.label}
                  </div>
                  <div className='mt-2 font-cairo text-[12px] font-semibold text-[#667085]'>
                    {t('adminMedicalOrders.details.categoryPrefix')}{t(KIND_KEY[kind])}
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <div className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 text-start'>
                    <div className='font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
                      {t('adminMedicalOrders.details.activationStatus')}
                    </div>
                    <div className='mt-1 font-cairo text-[13px] font-extrabold text-[#111827]'>
                      {item.isActive !== false ? t('common.active') : t('common.disabled')}
                    </div>
                  </div>
                  <div className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 text-start'>
                    <div className='font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
                      {t('adminMedicalOrders.details.visibilityToDoctors')}
                    </div>
                    <div className='mt-1 font-cairo text-[13px] font-extrabold text-[#111827]'>
                      {item.isVisible !== false ? t('common.visible') : t('common.hidden')}
                    </div>
                  </div>
                </div>

                <div className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 text-start'>
                  <div className='font-cairo text-[11px] font-extrabold text-[#98A2B3]'>
                    {t('adminMedicalOrders.details.id')}
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
                        className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 text-start'
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
                        className='rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3 text-start'
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
