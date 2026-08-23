'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  useCreateMedicalOrderCatalogItem,
  useUpdateMedicalOrderCatalogItem,
} from '@/hooks/admin/medical-orders/useAdminMedicalOrderCatalog';
import { AppCheckbox } from '@/components/ui';
import StyledSelect from '@/components/ui/styled-select';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';
import { useToast } from '@/components/ui/ToastProvider';
import { useI18n } from '@/i18n/provider';
import type {
  MedicalOrderCatalogItem,
  MedicalOrderCatalogKind,
} from '@/lib/admin/types';

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
  editTarget?: MedicalOrderCatalogItem | null;
};

export default function UpsertMedicalOrderItemDialog({
  open,
  onOpenChange,
  kind,
  editTarget,
}: Props) {
  const { locale, dir, t } = useI18n();
  const { toast } = useToast();
  const isEdit = !!editTarget;
  const [label, setLabel] = useState('');
  const [code, setCode] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [synonyms, setSynonyms] = useState('');
  const [notes, setNotes] = useState('');
  const [loincCode, setLoincCode] = useState('');
  const [sampleType, setSampleType] = useState('');
  const [resultType, setResultType] = useState('');
  const [fastingRequired, setFastingRequired] = useState(false);
  const [modality, setModality] = useState('');
  const [bodyArea, setBodyArea] = useState('');
  const [supportsContrast, setSupportsContrast] = useState(false);
  const [defaultPreparation, setDefaultPreparation] = useState('');
  const [defaultAftercare, setDefaultAftercare] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const createMut = useCreateMedicalOrderCatalogItem();
  const updateMut = useUpdateMedicalOrderCatalogItem(kind);
  const pending = createMut.isPending || updateMut.isPending;

  useEffect(() => {
    if (open) {
      setLabel(editTarget?.label ?? '');
      setCode(editTarget?.code ?? '');
      setShortCode(editTarget?.shortCode ?? '');
      setNameAr(editTarget?.nameAr ?? '');
      setNameEn(editTarget?.nameEn ?? '');
      setCategory(editTarget?.category ?? '');
      setPriorityLevel(editTarget?.priorityLevel ?? '');
      setSortOrder(
        typeof editTarget?.sortOrder === "number" ? String(editTarget.sortOrder) : "",
      );
      setSynonyms(Array.isArray(editTarget?.synonyms) ? editTarget.synonyms.join(", ") : "");
      setNotes(editTarget?.notes ?? '');
      setLoincCode(editTarget?.loincCode ?? '');
      setSampleType(editTarget?.sampleType ?? '');
      setResultType(editTarget?.resultType ?? '');
      setFastingRequired(editTarget?.fastingRequired === true);
      setModality(editTarget?.modality ?? '');
      setBodyArea(editTarget?.bodyArea ?? '');
      setSupportsContrast(editTarget?.supportsContrast === true);
      setDefaultPreparation(editTarget?.defaultPreparation ?? '');
      setDefaultAftercare(editTarget?.defaultAftercare ?? '');
      setIsActive(editTarget?.isActive ?? true);
      setIsVisible(editTarget?.isVisible ?? true);
    }
  }, [open, editTarget]);

  const serverErr = createMut.error ?? updateMut.error;
  const serverError = serverErr
    ? userFacingErrorMessage(serverErr)
    : undefined;

  const inputClass =
    'h-[42px] w-full rounded-[8px] border border-[#D0D5DD] bg-white px-3 text-right font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/20';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    const trimmedAr = nameAr.trim();
    const trimmedEn = nameEn.trim();
    if (!trimmed && !trimmedAr && !trimmedEn) return;

    const parsedSortOrder = Number(sortOrder);
    const payload = {
      label: trimmed || undefined,
      code: code.trim() || undefined,
      shortCode: shortCode.trim() || undefined,
      nameAr: trimmedAr || undefined,
      nameEn: trimmedEn || undefined,
      category: category.trim() || undefined,
      priorityLevel: priorityLevel || undefined,
      sortOrder:
        sortOrder.trim() && Number.isFinite(parsedSortOrder)
          ? parsedSortOrder
          : undefined,
      synonyms: synonyms
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      isActive,
      isVisible,
      notes: notes.trim() || undefined,
      loincCode: loincCode.trim() || undefined,
      sampleType: sampleType.trim() || undefined,
      fastingRequired: kind === "lab" ? fastingRequired : undefined,
      resultType: resultType.trim() || undefined,
      modality: modality.trim() || undefined,
      bodyArea: bodyArea.trim() || undefined,
      supportsContrast: kind === "imaging" ? supportsContrast : undefined,
      defaultPreparation: defaultPreparation.trim() || undefined,
      defaultAftercare: defaultAftercare.trim() || undefined,
    };

    const kindLabel = t(KIND_KEY[kind] ?? kind);
    const itemName = trimmed || trimmedAr || trimmedEn;
    if (isEdit && editTarget) {
      updateMut.mutate(
        {
          id: editTarget._id,
          body: payload,
        },
        {
          onSuccess: () => {
            toast(
              t('adminMedicalOrders.toast.updated.body')
                .replace('{name}', itemName)
                .replace('{kind}', kindLabel),
              { title: t('adminMedicalOrders.toast.updated.title'), variant: 'success', durationMs: 3800 },
            );
            onOpenChange(false);
          },
        },
      );
    } else {
      createMut.mutate(
        { kind, ...payload },
        {
          onSuccess: () => {
            toast(
              t('adminMedicalOrders.toast.created.body')
                .replace('{name}', itemName)
                .replace('{kind}', kindLabel),
              { title: t('adminMedicalOrders.toast.created.title'), variant: 'success', durationMs: 4000 },
            );
            onOpenChange(false);
          },
        },
      );
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{
              open: {
                opacity: 1,
                visibility: 'visible' as const,
                pointerEvents: 'auto' as const,
                transition: { duration: 0.22 },
              },
              closed: {
                opacity: 0,
                pointerEvents: 'none' as const,
                transition: { duration: 0.18 },
                transitionEnd: { visibility: 'hidden' as const },
              },
            }}
            className='fixed inset-0 z-[9999] bg-black/45 backdrop-blur-[2px]'
          />
        </Dialog.Overlay>

        <Dialog.Content forceMount asChild>
          <motion.div
            initial={false}
            animate={open ? 'open' : 'closed'}
            variants={{
              open: {
                opacity: 1,
                visibility: 'visible' as const,
                pointerEvents: 'auto' as const,
                x: '-50%',
                y: '-50%',
                scale: 1,
                transition: { type: 'spring', stiffness: 520, damping: 38 },
              },
              closed: {
                opacity: 0,
                x: '-50%',
                y: 'calc(-50% + 20px)',
                scale: 0.97,
                pointerEvents: 'none' as const,
                transition: { duration: 0.18, ease: 'easeOut' },
                transitionEnd: { visibility: 'hidden' as const },
              },
            }}
            className='fixed left-1/2 top-1/2 z-[10000] w-[760px] max-h-[85vh] max-w-[calc(100vw-24px)] overflow-y-auto rounded-[16px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)] outline-none'
            dir={dir}
            lang={locale}
          >
            <div className='flex items-center justify-between border-b border-[#F2F4F7] px-5 py-4'>
              <Dialog.Title className='font-cairo text-[16px] font-extrabold text-[#101828]'>
                {isEdit ? t('adminMedicalOrders.upsert.editTitle') : t('adminMedicalOrders.upsert.createTitle')}
              </Dialog.Title>
              <Dialog.Description className='sr-only'>
                {isEdit
                  ? t('adminMedicalOrders.upsert.editDescription')
                  : t('adminMedicalOrders.upsert.createDescription')}
              </Dialog.Description>
              <Dialog.Close asChild>
                <button
                  type='button'
                  className='flex h-8 w-8 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]'
                >
                  <X className='h-4 w-4' />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit}>
              <div className='space-y-4 px-5 py-4'>
                <div className='grid gap-3 sm:grid-cols-2'>
                  <div>
                    <label className='mb-1.5 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
                      {t('adminMedicalOrders.field.displayName.label')}
                    </label>
                    <input
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder={t('adminMedicalOrders.field.exampleName.placeholder')}
                      className={inputClass}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className='mb-1.5 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
                      {t('adminMedicalOrders.field.category.label')}
                    </label>
                    <input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder='LAB / IMAGING / PROCEDURE'
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className='grid gap-3 sm:grid-cols-2'>
                  <div>
                    <label className='mb-1.5 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
                      {t('adminMedicalOrders.field.nameAr.label')}
                    </label>
                    <input
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      placeholder={t('adminMedicalOrders.field.nameAr.placeholder')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className='mb-1.5 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
                      {t('adminMedicalOrders.field.nameEn.label')}
                    </label>
                    <input
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder='Order name in English'
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className='grid gap-3 sm:grid-cols-2'>
                  <div>
                    <label className='mb-1.5 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
                      Code
                    </label>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder='CBC_AUTO'
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className='mb-1.5 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
                      Short Code
                    </label>
                    <input
                      value={shortCode}
                      onChange={(e) => setShortCode(e.target.value)}
                      placeholder='CBC'
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className='grid gap-3 sm:grid-cols-3'>
                  <div>
                    <label className='mb-1.5 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
                      {t('adminMedicalOrders.field.priorityLevel.label')}
                    </label>
                    <StyledSelect
                      value={priorityLevel}
                      onChange={setPriorityLevel}
                      options={[
                        { value: '', label: t('adminMedicalOrders.field.priorityLevel.none') },
                        { value: 'critical', label: 'critical' },
                        { value: 'high', label: 'high' },
                        { value: 'normal', label: 'normal' },
                        { value: 'low', label: 'low' },
                      ]}
                      listboxAriaLabel={t('adminMedicalOrders.field.priorityLevel.label')}
                      triggerClassName='h-[42px] rounded-[8px]'
                    />
                  </div>
                  <div>
                    <label className='mb-1.5 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
                      {t('adminMedicalOrders.field.sortOrder.label')}
                    </label>
                    <input
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      placeholder='0'
                      inputMode='numeric'
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className='mb-1.5 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
                      {t('adminMedicalOrders.field.synonyms.label')}
                    </label>
                    <input
                      value={synonyms}
                      onChange={(e) => setSynonyms(e.target.value)}
                      placeholder='value1, value2'
                      className={inputClass}
                    />
                  </div>
                </div>

                {kind === "lab" ? (
                  <div className='grid gap-3 rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFB] p-3 sm:grid-cols-3'>
                    <input
                      value={loincCode}
                      onChange={(e) => setLoincCode(e.target.value)}
                      placeholder='LOINC code'
                      className={inputClass}
                    />
                    <input
                      value={sampleType}
                      onChange={(e) => setSampleType(e.target.value)}
                      placeholder={t('adminMedicalOrders.field.specimenType.placeholder')}
                      className={inputClass}
                    />
                    <input
                      value={resultType}
                      onChange={(e) => setResultType(e.target.value)}
                      placeholder={t('adminMedicalOrders.field.resultType.placeholder')}
                      className={inputClass}
                    />
                    <label className='sm:col-span-3 flex items-center justify-end gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3 font-cairo text-[12px] font-bold text-[#344054]'>
                      <span>{t('adminMedicalOrders.field.fastingRequired.label')}</span>
                      <AppCheckbox
                        size='sm'
                        checked={fastingRequired}
                        onChange={(event) => setFastingRequired(event.target.checked)}
                      />
                    </label>
                  </div>
                ) : null}

                {kind === "imaging" ? (
                  <div className='grid gap-3 rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFB] p-3 sm:grid-cols-2'>
                    <input
                      value={modality}
                      onChange={(e) => setModality(e.target.value)}
                      placeholder='Modality (CT, MRI...)'
                      className={inputClass}
                    />
                    <input
                      value={bodyArea}
                      onChange={(e) => setBodyArea(e.target.value)}
                      placeholder={t('adminMedicalOrders.field.bodyRegion.placeholder')}
                      className={inputClass}
                    />
                    <label className='sm:col-span-2 flex items-center justify-end gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 py-3 font-cairo text-[12px] font-bold text-[#344054]'>
                      <span>{t('adminMedicalOrders.field.supportsContrast.label')}</span>
                      <AppCheckbox
                        size='sm'
                        checked={supportsContrast}
                        onChange={(event) => setSupportsContrast(event.target.checked)}
                      />
                    </label>
                  </div>
                ) : null}

                {kind === "procedure" ? (
                  <div className='grid gap-3 rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFB] p-3 sm:grid-cols-2'>
                    <textarea
                      value={defaultPreparation}
                      onChange={(e) => setDefaultPreparation(e.target.value)}
                      placeholder={t('adminMedicalOrders.field.defaultPrep.placeholder')}
                      className='min-h-[84px] w-full rounded-[8px] border border-[#D0D5DD] bg-white p-3 text-right font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/20'
                    />
                    <textarea
                      value={defaultAftercare}
                      onChange={(e) => setDefaultAftercare(e.target.value)}
                      placeholder={t('adminMedicalOrders.field.postInstructions.placeholder')}
                      className='min-h-[84px] w-full rounded-[8px] border border-[#D0D5DD] bg-white p-3 text-right font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/20'
                    />
                  </div>
                ) : null}

                <div>
                  <label className='mb-1.5 block text-right font-cairo text-[12px] font-bold text-[#344054]'>
                    {t('adminMedicalOrders.field.notes.label')}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('adminMedicalOrders.field.notes.placeholder')}
                    className='min-h-[72px] w-full rounded-[8px] border border-[#D0D5DD] bg-white p-3 text-right font-cairo text-[13px] font-semibold text-[#101828] outline-none placeholder:text-[#98A2B3] focus:border-primary focus:ring-2 focus:ring-primary/20'
                  />
                </div>
                {serverError && (
                  <p className='mt-2 text-right font-cairo text-[12px] font-semibold text-[#D92D20]'>
                    {serverError}
                  </p>
                )}
                <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                  <label className='flex items-center justify-end gap-2 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 font-cairo text-[12px] font-bold text-[#344054]'>
                    <span>{t('adminMedicalOrders.field.isActive.label')}</span>
                    <AppCheckbox
                      size='sm'
                      checked={isActive}
                      onChange={(event) => setIsActive(event.target.checked)}
                    />
                  </label>
                  <label className='flex items-center justify-end gap-2 rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 font-cairo text-[12px] font-bold text-[#344054]'>
                    <span>{t('adminMedicalOrders.field.isVisible.label')}</span>
                    <AppCheckbox
                      size='sm'
                      checked={isVisible}
                      onChange={(event) => setIsVisible(event.target.checked)}
                    />
                  </label>
                </div>
              </div>
              <div className='flex justify-end gap-2 border-t border-[#F2F4F7] px-5 py-4'>
                <Dialog.Close asChild>
                  <button
                    type='button'
                    className='h-10 rounded-[8px] px-4 font-cairo text-[13px] font-extrabold text-[#667085] hover:bg-[#F2F4F7]'
                  >
                    {t('common.cancel')}
                  </button>
                </Dialog.Close>
                <button
                  type='submit'
                  disabled={pending || (!label.trim() && !nameAr.trim() && !nameEn.trim())}
                  className='h-10 rounded-[8px] bg-primary px-5 font-cairo text-[13px] font-extrabold text-white shadow-sm hover:opacity-95 disabled:pointer-events-none disabled:opacity-50'
                >
                  {pending ? t('adminMedicalOrders.upsert.saving') : isEdit ? t('adminMedicalOrders.upsert.saveEdit') : t('adminMedicalFileOptions.action.add')}
                </button>
              </div>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
