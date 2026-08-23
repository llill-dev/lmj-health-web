import { Helmet } from 'react-helmet-async';
import {
  AlertTriangle,
  Droplets,
  FileCog,
  Heart,
  Loader2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';
import ConfirmActionDialog from '@/components/admin/dialogs/ConfirmActionDialog';
import {
  MedicalFileOptionCard,
  type MedicalFileOptionItem,
} from '@/components/admin/medical-file-options/MedicalFileOptionCard';
import { useToast } from '@/components/ui/ToastProvider';
import StyledSelect from '@/components/ui/styled-select';
import { useI18n } from '@/i18n/provider';
import {
  useCreateLookup,
  usePatchLookup,
  useRemoveLookup,
} from '@/hooks/admin/lookups/useAdminLookupMutations';
import {
  useAdminLookups,
  useHealthProfileOptions,
} from '@/hooks/admin/lookups/useAdminLookups';
import { generateLookupMachineKey } from '@/lib/admin/lookups/lookupKey';
import { resolveLookupText } from '@/lib/admin/lookups/lookupUtils';
import type {
  AdminLookupCategory,
  AdminLookupRecord,
  HealthProfileOptionEntry,
} from '@/lib/admin/types';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';

// قيم داخلية للحالة/الربط بواجهة API فقط، وليست نصاً معروضاً — لا تُترجم.
type AddCategoryUiKey = 'الأمراض المزمنة' | 'أنواع الحساسية';

const ADD_CATEGORY_UI_TO_API: Record<AddCategoryUiKey, AdminLookupCategory> = {
  'الأمراض المزمنة': 'MEDICAL_CONDITION',
  'أنواع الحساسية': 'ALLERGY',
};

const ADD_CATEGORY_API_TO_UI: Record<
  'MEDICAL_CONDITION' | 'ALLERGY',
  AddCategoryUiKey
> = {
  MEDICAL_CONDITION: 'الأمراض المزمنة',
  ALLERGY: 'أنواع الحساسية',
};

type LookupCardItem = MedicalFileOptionItem & {
  category: AdminLookupCategory;
  key: string;
  order: number;
};

function mapLookupItems(
  records: AdminLookupRecord[],
  locale: 'ar' | 'en',
): LookupCardItem[] {
  return [...records]
    .sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0) || a.key.localeCompare(b.key, 'en'),
    )
    .map((row) => ({
      id: row._id,
      label: resolveLookupText(row.text, locale) || row.key,
      isActive: row.isActive,
      category: row.category,
      key: row.key,
      order: row.order ?? 0,
    }));
}

function mapHealthProfileEntries(
  entries: HealthProfileOptionEntry[],
  locale: 'ar' | 'en',
): LookupCardItem[] {
  return [...entries]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((row) => ({
      id: row.id,
      label: resolveLookupText(row.text, locale) || row.key,
      isActive: true,
      category: 'BLOOD_TYPE',
      key: row.key,
      order: row.order ?? 0,
    }));
}

export default function AdminMedicalFileOptionsPage() {
  const { locale, dir, t } = useI18n();
  const { toast } = useToast();
  const createLookup = useCreateLookup();
  const patchLookup = usePatchLookup();
  const removeLookup = useRemoveLookup();
  const [langOnly, setLangOnly] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);

  const chronicQuery = useAdminLookups({
    category: 'MEDICAL_CONDITION',
    langOnly,
    includeInactive,
  });
  const allergyQuery = useAdminLookups({
    category: 'ALLERGY',
    langOnly,
    includeInactive,
  });
  // Blood Type has no admin CRUD and is never sourced from /admin/lookups —
  // see useHealthProfileOptions.
  const bloodQuery = useHealthProfileOptions();

  const chronicDiseases = useMemo(
    () => mapLookupItems(chronicQuery.data?.lookups ?? [], locale),
    [chronicQuery.data?.lookups, locale],
  );
  const allergies = useMemo(
    () => mapLookupItems(allergyQuery.data?.lookups ?? [], locale),
    [allergyQuery.data?.lookups, locale],
  );
  const bloodTypes = useMemo(
    () => mapHealthProfileEntries(bloodQuery.data?.bloodTypes ?? [], locale),
    [bloodQuery.data?.bloodTypes, locale],
  );

  const [selectedCategory, setSelectedCategory] =
    useState<AddCategoryUiKey>('الأمراض المزمنة');
  const [newOption, setNewOption] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<LookupCardItem | null>(null);
  const [editTarget, setEditTarget] = useState<LookupCardItem | null>(null);
  const [editValue, setEditValue] = useState('');
  const [quickAddCategory, setQuickAddCategory] =
    useState<AdminLookupCategory | null>(null);

  const isBusy =
    createLookup.isPending || removeLookup.isPending || patchLookup.isPending;
  const isAwaitingAnyData =
    chronicQuery.isAwaitingData ||
    allergyQuery.isAwaitingData ||
    bloodQuery.isAwaitingData;
  const isRefetchingAnyData =
    !isAwaitingAnyData &&
    (chronicQuery.isRefetching ||
      allergyQuery.isRefetching ||
      bloodQuery.isRefetching);
  const loadError =
    chronicQuery.error || allergyQuery.error || bloodQuery.error || null;
  const hasLookupItems =
    chronicDiseases.length > 0 || allergies.length > 0 || bloodTypes.length > 0;

  const categoryUiLabel = (key: AddCategoryUiKey) =>
    key === 'الأمراض المزمنة'
      ? t('adminMedicalFileOptions.section.chronicDiseases')
      : t('adminMedicalFileOptions.section.allergyTypes');

  function refetchAll() {
    void chronicQuery.refetch();
    void allergyQuery.refetch();
    void bloodQuery.refetch();
  }

  async function createLookupOption(
    category: AdminLookupCategory,
    label: string,
  ) {
    if (category === 'BLOOD_TYPE') return;

    const trimmed = label.trim();
    if (!trimmed) {
      toast(t('adminMedicalFileOptions.toast.nameRequired'), { variant: 'error' });
      return;
    }

    try {
      await createLookup.mutateAsync({
        category,
        key: generateLookupMachineKey(),
        text: { ar: trimmed },
        order: 0,
      });
      toast(t('adminMedicalFileOptions.toast.added'), { variant: 'success' });
      setNewOption('');
      setQuickAddCategory(null);
    } catch (error) {
      toast(userFacingErrorMessage(error), {
        title: t('adminMedicalFileOptions.toast.addFailedTitle'),
        variant: 'error',
      });
    }
  }

  async function handleBottomAdd() {
    const category = ADD_CATEGORY_UI_TO_API[selectedCategory];
    await createLookupOption(category, newOption);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await removeLookup.mutateAsync(deleteTarget.id);
      toast(t('adminMedicalFileOptions.toast.deleted'), { variant: 'success' });
      setDeleteTarget(null);
    } catch (error) {
      toast(userFacingErrorMessage(error), {
        title: t('adminMedicalFileOptions.toast.deleteFailedTitle'),
        variant: 'error',
      });
    }
  }

  async function confirmEdit() {
    if (!editTarget) return;
    const trimmed = editValue.trim();
    if (!trimmed) {
      toast(t('adminMedicalFileOptions.toast.newNameRequired'), {
        title: t('adminMedicalFileOptions.toast.incompleteDataTitle'),
        variant: 'error',
      });
      return;
    }

    try {
      await patchLookup.mutateAsync({
        id: editTarget.id,
        body: {
          text: { ar: trimmed },
          order: editTarget.order,
          isActive: editTarget.isActive,
        },
      });
      toast(t('adminMedicalFileOptions.toast.updated'), { variant: 'success' });
      setEditTarget(null);
      setEditValue('');
    } catch (error) {
      toast(userFacingErrorMessage(error), {
        title: t('adminMedicalFileOptions.toast.updateFailedTitle'),
        variant: 'error',
      });
    }
  }

  function openQuickAdd(category: AdminLookupCategory) {
    if (category !== 'MEDICAL_CONDITION' && category !== 'ALLERGY') return;
    setQuickAddCategory(category);
    setSelectedCategory(ADD_CATEGORY_API_TO_UI[category]);
    setNewOption('');
  }

  function openEdit(item: LookupCardItem) {
    setEditTarget(item);
    setEditValue(item.label);
  }

  function buildEditHandler(items: LookupCardItem[]) {
    return (id: string) => {
      const row = items.find((item) => item.id === id);
      if (!row) return;
      openEdit(row);
    };
  }

  return (
    <>
      <Helmet>
        <title>{`${t('adminMedicalFileOptions.header.title')} • LMJ Health`}</title>
      </Helmet>

      <div dir={dir} lang={locale}>
        <AdminDashboardOverview
          variant='admin'
          surface='mint'
          title={t('adminMedicalFileOptions.header.title')}
          subtitle={t('adminMedicalFileOptions.header.subtitle')}
          headerIcon={<FileCog className='h-8 w-8 text-white' />}
          kpiColumns={3}
          kpis={[
            {
              key: 'chronic',
              icon: <Heart className='h-5 w-5 shrink-0' />,
              value: chronicQuery.isAwaitingData ? '—' : chronicDiseases.length,
              label: t('adminMedicalFileOptions.kpi.chronicDiseases'),
            },
            {
              key: 'allergies',
              icon: <AlertTriangle className='h-5 w-5 shrink-0' />,
              value: allergyQuery.isAwaitingData ? '—' : allergies.length,
              label: t('adminMedicalFileOptions.kpi.allergyTypes'),
            },
            {
              key: 'blood',
              icon: <Droplets className='h-5 w-5 shrink-0' />,
              value: bloodQuery.isAwaitingData ? '—' : bloodTypes.length,
              label: t('adminMedicalFileOptions.kpi.bloodTypes'),
            },
          ]}
        />

        <section className='mt-4 rounded-[12px] border border-[#D6EEEC] bg-[#F3FBFA] px-6 py-4 shadow-[0_10px_24px_rgba(20,130,131,0.08)]'>
          <div className='font-cairo text-[13px] font-extrabold text-[#0F766E]'>
            {t('adminMedicalFileOptions.banner')}
          </div>
        </section>

        <div>
          <div className='mt-2 flex justify-end'>
            <label className='flex cursor-pointer select-none items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-2.5 font-cairo text-[12px] font-bold text-[#344054] shadow-[0_10px_22px_rgba(0,0,0,0.05)]'>
              <input
                type='checkbox'
                className='h-4 w-4 rounded border-[#D0D5DD] text-primary focus:ring-primary/40'
                checked={langOnly}
                onChange={(e) => setLangOnly(e.target.checked)}
              />
              {t('adminMedicalFileOptions.filter.currentLangOnly')}
            </label>
            <label className='mr-2 flex cursor-pointer select-none items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-2.5 font-cairo text-[12px] font-bold text-[#344054] shadow-[0_10px_22px_rgba(0,0,0,0.05)]'>
              <input
                type='checkbox'
                className='h-4 w-4 rounded border-[#D0D5DD] text-primary focus:ring-primary/40'
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              />
              {t('adminMedicalFileOptions.filter.showDisabled')}
            </label>
            <button
              type='button'
              onClick={refetchAll}
              disabled={isRefetchingAnyData}
              className='mr-2 inline-flex items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-2.5 font-cairo text-[12px] font-bold text-[#344054] shadow-[0_10px_22px_rgba(0,0,0,0.05)] disabled:cursor-not-allowed disabled:opacity-60'
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefetchingAnyData ? 'animate-spin' : ''}`}
              />
              {isRefetchingAnyData
                ? t('adminMedicalFileOptions.action.refreshing')
                : t('common.refresh')}
            </button>
          </div>

          {isRefetchingAnyData ? (
            <div className='mt-4 inline-flex items-center gap-2 rounded-[10px] border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-2 font-cairo text-[12px] font-bold text-[#047857]'>
              <RefreshCw className='h-4 w-4 animate-spin' />
              {t('adminMedicalFileOptions.refreshingBanner')}
            </div>
          ) : null}

          {loadError ? (
            <div className='mt-4 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-5 text-right shadow-[0_12px_24px_rgba(0,0,0,0.06)]'>
              <div className='font-cairo text-[13px] font-semibold text-[#B42318]'>
                {userFacingErrorMessage(
                  loadError,
                  t('adminMedicalFileOptions.loadError'),
                )}
              </div>
              <button
                type='button'
                onClick={refetchAll}
                disabled={isRefetchingAnyData}
                className='mt-3 inline-flex h-[36px] items-center gap-2 rounded-[10px] border border-[#FCA5A5] bg-white px-4 font-cairo text-[12px] font-extrabold text-[#B42318] disabled:cursor-not-allowed disabled:opacity-60'
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefetchingAnyData ? 'animate-spin' : ''}`}
                />
                {isRefetchingAnyData
                  ? t('adminMedicalFileOptions.retrying')
                  : t('adminMedicalOrders.details.retry')}
              </button>
            </div>
          ) : null}

          {isAwaitingAnyData ? (
            <div className='mt-4 rounded-[12px] border border-[#EEF2F6] bg-white px-6 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085] shadow-[0_12px_24px_rgba(0,0,0,0.06)]'>
              {t('adminMedicalFileOptions.loadingOptions')}
            </div>
          ) : !loadError && !hasLookupItems ? (
            <div className='mt-4 rounded-[12px] border border-dashed border-[#D0D5DD] bg-white px-6 py-8 text-center font-cairo text-[13px] font-semibold text-[#667085] shadow-[0_12px_24px_rgba(0,0,0,0.06)]'>
              {t('adminMedicalFileOptions.noOptionsRegistered')}
            </div>
          ) : !loadError ? (
            <div className='mt-2 grid grid-cols-1 gap-6 lg:grid-cols-3'>
              <MedicalFileOptionCard
                title={t('adminMedicalFileOptions.section.chronicDiseases')}
                items={chronicDiseases}
                icon={Heart}
                addLabel={t('adminMedicalFileOptions.action.addDisease')}
                onAdd={() => openQuickAdd('MEDICAL_CONDITION')}
                onEdit={buildEditHandler(chronicDiseases)}
                onRemove={(id) => {
                  const row = chronicDiseases.find((item) => item.id === id);
                  if (!row) return;
                  setDeleteTarget(row);
                }}
                editingId={patchLookup.isPending ? editTarget?.id ?? null : null}
                removingId={removeLookup.isPending ? deleteTarget?.id ?? null : null}
                tone={{
                  border: 'border-[#16C5C0]',
                  headerBg: 'bg-[#E7FBFA]',
                  titleText: 'text-primary',
                  itemBg: 'bg-[#EFF6FF]',
                  itemText: 'text-[#667085]',
                  addText: 'text-primary',
                }}
              />
              <MedicalFileOptionCard
                title={t('adminMedicalFileOptions.section.allergyTypes')}
                items={allergies}
                icon={AlertTriangle}
                addLabel={t('adminMedicalFileOptions.action.addAllergy')}
                onAdd={() => openQuickAdd('ALLERGY')}
                onEdit={buildEditHandler(allergies)}
                onRemove={(id) => {
                  const row = allergies.find((item) => item.id === id);
                  if (!row) return;
                  setDeleteTarget(row);
                }}
                editingId={patchLookup.isPending ? editTarget?.id ?? null : null}
                removingId={removeLookup.isPending ? deleteTarget?.id ?? null : null}
                tone={{
                  border: 'border-[#F59E0B]',
                  headerBg: 'bg-[#FFF7ED]',
                  titleText: 'text-[#F97316]',
                  itemBg: 'bg-[#FFF7ED]',
                  itemText: 'text-[#667085]',
                  addText: 'text-[#F97316]',
                }}
              />
              <MedicalFileOptionCard
                title={t('adminMedicalFileOptions.section.bloodTypes')}
                items={bloodTypes}
                icon={Droplets}
                variant='chips'
                tone={{
                  border: 'border-[#FCA5A5]',
                  headerBg: 'bg-[#FFF1F2]',
                  titleText: 'text-[#EF4444]',
                  itemBg: 'bg-[#FFE4E6]',
                  itemText: 'text-[#EF4444]',
                  addText: 'text-[#EF4444]',
                }}
              />
            </div>
          ) : null}

          <div className='mt-6 rounded-[10px] bg-white px-6 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.18)]'>
            <div className='flex items-center justify-start gap-2'>
              <FileCog className='h-5 w-5 text-primary' />
              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                {t('adminMedicalFileOptions.manageOptionsTitle')}
              </div>
            </div>

            <div className='mt-6 grid grid-cols-1 items-center gap-4 lg:grid-cols-12'>
              <div className='lg:col-span-5'>
                <div className='mb-2 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>
                  {t('adminMedicalFileOptions.addNewOptionLabel')}
                </div>
                <input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder={t('adminMedicalFileOptions.field.newOption.placeholder')}
                  className='h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
                />
              </div>

              <div className='mt-6 lg:col-span-1'>
                <button
                  type='button'
                  onClick={() => void handleBottomAdd()}
                  disabled={isBusy || !newOption.trim()}
                  className='mx-auto flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-primary text-white disabled:opacity-50'
                  aria-label={t('adminMedicalFileOptions.action.add')}
                >
                  {createLookup.isPending ? (
                    <Loader2 className='h-5 w-5 animate-spin' />
                  ) : (
                    <Plus className='h-5 w-5' />
                  )}
                </button>
              </div>

              <div className='lg:col-span-6'>
                <div className='mb-2 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>
                  {t('adminMedicalFileOptions.selectCategoryLabel')}
                </div>
                <StyledSelect
                  value={selectedCategory}
                  onChange={(v) => setSelectedCategory(v as AddCategoryUiKey)}
                  options={[
                    {
                      value: 'الأمراض المزمنة',
                      label: t('adminMedicalFileOptions.section.chronicDiseases'),
                    },
                    {
                      value: 'أنواع الحساسية',
                      label: t('adminMedicalFileOptions.section.allergyTypes'),
                    },
                  ]}
                  listboxAriaLabel={t('adminMedicalFileOptions.categoryAriaLabel')}
                />
              </div>
            </div>

            {quickAddCategory ? (
              <p className='mt-4 text-right font-cairo text-[12px] font-semibold text-[#667085]'>
                {t('adminMedicalFileOptions.quickAdd.prefix')}{' '}
                {categoryUiLabel(ADD_CATEGORY_API_TO_UI[quickAddCategory])}{' '}
                {t('adminMedicalFileOptions.quickAdd.suffix')}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmActionDialog
        open={Boolean(editTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setEditTarget(null);
            setEditValue('');
          }
        }}
        variant='primary'
        title={t('adminMedicalFileOptions.updateDialog.title')}
        description={
          editTarget ? (
            <div className='space-y-3 text-right'>
              <div className='font-cairo text-[12px] font-semibold text-[#667085]'>
                {t('adminMedicalFileOptions.editDialog.description')}
              </div>
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={t('adminMedicalFileOptions.field.newName.placeholder')}
                className='h-[44px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
              />
            </div>
          ) : (
            ''
          )
        }
        confirmLabel={t('adminUsersDialog.action.save')}
        confirmDisabled={patchLookup.isPending || !editValue.trim()}
        onConfirm={() => void confirmEdit()}
      />

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant='destructive'
        title={t('adminMedicalFileOptions.deleteDialog.title')}
        description={
          deleteTarget
            ? t('adminMedicalFileOptions.deleteDialog.confirmQuestion').replace(
                '{name}',
                deleteTarget.label,
              )
            : ''
        }
        confirmLabel={t('adminFacilityDialog.delete.confirmButton')}
        confirmDisabled={removeLookup.isPending}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
