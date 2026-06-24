import { Helmet } from 'react-helmet-async';
import {
  AlertTriangle,
  Droplets,
  FileCog,
  Heart,
  Loader2,
  Plus,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminDashboardOverview from '@/components/admin/dashboard/admin-dashboard-overview';
import ConfirmActionDialog from '@/components/admin/dialogs/ConfirmActionDialog';
import { MedicalFileOptionCard } from '@/components/admin/medical-file-options/MedicalFileOptionCard';
import { useToast } from '@/components/ui/ToastProvider';
import StyledSelect from '@/components/ui/styled-select';
import {
  useCreateLookup,
  useRemoveLookup,
} from '@/hooks/admin/useAdminLookupMutations';
import { useAdminLookups } from '@/hooks/admin/useAdminLookups';
import { generateLookupMachineKey } from '@/lib/admin/lookupKey';
import { resolveLookupText } from '@/lib/admin/lookupUtils';
import type { AdminLookupCategory, AdminLookupRecord } from '@/lib/admin/types';
import { userFacingErrorMessage } from '@/lib/admin/userFacingError';

type CategoryUiKey =
  | 'الأمراض المزمنة'
  | 'أنواع الحساسية'
  | 'فصائل الدم';

const CATEGORY_UI_TO_API: Record<CategoryUiKey, AdminLookupCategory> = {
  'الأمراض المزمنة': 'MEDICAL_CONDITION',
  'أنواع الحساسية': 'ALLERGY',
  'فصائل الدم': 'BLOOD_TYPE',
};

const CATEGORY_API_TO_UI: Record<AdminLookupCategoryDoc, CategoryUiKey> = {
  MEDICAL_CONDITION: 'الأمراض المزمنة',
  ALLERGY: 'أنواع الحساسية',
  BLOOD_TYPE: 'فصائل الدم',
};

type AdminLookupCategoryDoc = 'MEDICAL_CONDITION' | 'ALLERGY' | 'BLOOD_TYPE';

function mapLookupItems(records: AdminLookupRecord[]) {
  return [...records]
    .filter((row) => row.isActive)
    .sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0) ||
        a.key.localeCompare(b.key, 'en'),
    )
    .map((row) => ({
      id: row._id,
      label: resolveLookupText(row.text, 'ar') || row.key,
    }));
}

export default function AdminMedicalFileOptionsPage() {
  const { toast } = useToast();
  const createLookup = useCreateLookup();
  const removeLookup = useRemoveLookup();

  const chronicQuery = useAdminLookups({ category: 'MEDICAL_CONDITION' });
  const allergyQuery = useAdminLookups({ category: 'ALLERGY' });
  const bloodQuery = useAdminLookups({ category: 'BLOOD_TYPE' });

  const chronicDiseases = useMemo(
    () => mapLookupItems(chronicQuery.data?.lookups ?? []),
    [chronicQuery.data?.lookups],
  );
  const allergies = useMemo(
    () => mapLookupItems(allergyQuery.data?.lookups ?? []),
    [allergyQuery.data?.lookups],
  );
  const bloodTypes = useMemo(
    () => mapLookupItems(bloodQuery.data?.lookups ?? []),
    [bloodQuery.data?.lookups],
  );

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryUiKey>('الأمراض المزمنة');
  const [newOption, setNewOption] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
    category: AdminLookupCategory;
  } | null>(null);
  const [quickAddCategory, setQuickAddCategory] =
    useState<AdminLookupCategory | null>(null);

  const isBusy = createLookup.isPending || removeLookup.isPending;

  async function createLookupOption(
    category: AdminLookupCategory,
    label: string,
  ) {
    const trimmed = label.trim();
    if (!trimmed) {
      toast('أدخل اسم الخيار أولاً.', { variant: 'error' });
      return;
    }

    try {
      await createLookup.mutateAsync({
        category,
        key: generateLookupMachineKey(),
        text: { ar: trimmed },
        order: 0,
      });
      toast('تمت إضافة الخيار.', { variant: 'success' });
      setNewOption('');
      setQuickAddCategory(null);
    } catch (error) {
      toast(userFacingErrorMessage(error), {
        title: 'تعذّر الإضافة',
        variant: 'error',
      });
    }
  }

  async function handleBottomAdd() {
    const category = CATEGORY_UI_TO_API[selectedCategory];
    await createLookupOption(category, newOption);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await removeLookup.mutateAsync(deleteTarget.id);
      toast('تم حذف الخيار.', { variant: 'success' });
      setDeleteTarget(null);
    } catch (error) {
      toast(userFacingErrorMessage(error), {
        title: 'تعذّر الحذف',
        variant: 'error',
      });
    }
  }

  function openQuickAdd(category: AdminLookupCategory) {
    setQuickAddCategory(category);
    setSelectedCategory(CATEGORY_API_TO_UI[category as AdminLookupCategoryDoc]);
    setNewOption('');
  }

  return (
    <>
      <Helmet>
        <title>خيارات الملف الطبي • LMJ Health</title>
      </Helmet>

      <div dir='rtl' lang='ar'>
        <AdminDashboardOverview
          variant='admin'
          surface='mint'
          title='خيارات الملف الطبي'
          subtitle='إضافة وإدارة الخيارات ضمن الملف الطبي للمريض'
          headerIcon={<FileCog className='h-8 w-8 text-white' />}
          kpiColumns={3}
          kpis={[
            {
              key: 'chronic',
              icon: <Heart className='h-5 w-5 shrink-0' />,
              value: chronicQuery.isAwaitingData ? '—' : chronicDiseases.length,
              label: 'أمراض مزمنة',
            },
            {
              key: 'allergies',
              icon: <AlertTriangle className='h-5 w-5 shrink-0' />,
              value: allergyQuery.isAwaitingData ? '—' : allergies.length,
              label: 'أنواع حساسية',
            },
            {
              key: 'blood',
              icon: <Droplets className='h-5 w-5 shrink-0' />,
              value: bloodQuery.isAwaitingData ? '—' : bloodTypes.length,
              label: 'فصائل دم',
            },
          ]}
        />

        <div>
          <div className='mt-2 grid grid-cols-1 gap-6 lg:grid-cols-3'>
            <MedicalFileOptionCard
              title='الأمراض المزمنة'
              items={chronicDiseases}
              icon={Heart}
              addLabel='إضافة مرض'
              onAdd={() => openQuickAdd('MEDICAL_CONDITION')}
              onRemove={(id) => {
                const row = chronicDiseases.find((item) => item.id === id);
                if (!row) return;
                setDeleteTarget({
                  id,
                  label: row.label,
                  category: 'MEDICAL_CONDITION',
                });
              }}
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
              title='أنواع الحساسية'
              items={allergies}
              icon={AlertTriangle}
              addLabel='إضافة حساسية'
              onAdd={() => openQuickAdd('ALLERGY')}
              onRemove={(id) => {
                const row = allergies.find((item) => item.id === id);
                if (!row) return;
                setDeleteTarget({
                  id,
                  label: row.label,
                  category: 'ALLERGY',
                });
              }}
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
              title='فصائل الدم'
              items={bloodTypes}
              icon={Droplets}
              addLabel='إضافة فصيلة'
              variant='chips'
              onAdd={() => openQuickAdd('BLOOD_TYPE')}
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

          <div className='mt-6 rounded-[10px] bg-white px-6 py-6 shadow-[0_14px_30px_rgba(0,0,0,0.18)]'>
            <div className='flex items-center gap-2 justify-start'>
              <FileCog className='h-5 w-5 text-primary' />
              <div className='font-cairo text-[14px] font-extrabold text-[#111827]'>
                إدارة الخيارات
              </div>
            </div>

            <div className='mt-6 grid grid-cols-1 items-center gap-4 lg:grid-cols-12'>
              <div className='lg:col-span-5'>
                <div className='mb-2 text-right font-cairo text-[12px] font-extrabold text-[#667085]'>
                  إضافة خيار جديد
                </div>
                <input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder='ادخل الخيار الجديد...'
                  className='h-[44px] w-full rounded-[6px] border border-[#E5E7EB] bg-white px-4 text-right font-cairo text-[12px] font-bold text-[#111827] placeholder:text-[#98A2B3]'
                />
              </div>

              <div className='mt-6 lg:col-span-1'>
                <button
                  type='button'
                  onClick={() => void handleBottomAdd()}
                  disabled={isBusy || !newOption.trim()}
                  className='mx-auto flex h-[44px] w-[44px] items-center justify-center rounded-[6px] bg-primary text-white disabled:opacity-50'
                  aria-label='إضافة'
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
                  اختر الفئة
                </div>
                <StyledSelect
                  value={selectedCategory}
                  onChange={(v) => setSelectedCategory(v as CategoryUiKey)}
                  options={[
                    { value: 'الأمراض المزمنة', label: 'الأمراض المزمنة' },
                    { value: 'أنواع الحساسية', label: 'أنواع الحساسية' },
                    { value: 'فصائل الدم', label: 'فصائل الدم' },
                  ]}
                  listboxAriaLabel='فئة الخيار'
                />
              </div>
            </div>

            {quickAddCategory ? (
              <p className='mt-4 text-right font-cairo text-[12px] font-semibold text-[#667085]'>
                إضافة سريعة لفئة{' '}
                {CATEGORY_API_TO_UI[quickAddCategory as AdminLookupCategoryDoc]} —
                اكتب الاسم واضغط إضافة.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        variant='destructive'
        title='حذف الخيار'
        description={
          deleteTarget
            ? `هل تريد حذف «${deleteTarget.label}» من خيارات الملف الطبي؟`
            : ''
        }
        confirmLabel='حذف'
        confirmDisabled={removeLookup.isPending}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
