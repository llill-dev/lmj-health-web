'use client';

import { BookOpen, Plus, Star, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';
import DoctorListErrorState from '@/components/doctor/shared/doctor-list-error-state';
import { useToast } from '@/components/ui/ToastProvider';
import {
  useCreateDoctorLibraryItem,
  useCreateDoctorTemplate,
  useDeleteDoctorLibraryItem,
  useDeleteDoctorTemplate,
  useDoctorLibraryItems,
  useDoctorTemplates,
} from '@/hooks/doctor/useDoctorClinicalShortcuts';
import { getUserFacingRequestErrorMessage } from '@/lib/api';
import type { DoctorLibraryItemType } from '@/lib/doctor/libraryTypes';
import type { DoctorTemplateType } from '@/lib/doctor/templateTypes';
import { cn } from '@/lib/utils/utils';

const LIBRARY_TYPE_LABELS: Record<DoctorLibraryItemType, string> = {
  MEDICATION: 'دواء',
  LAB: 'تحليل',
  IMAGING: 'أشعة',
  PROCEDURE: 'إجراء',
};

const TEMPLATE_TYPE_LABELS: Record<DoctorTemplateType, string> = {
  PRESCRIPTION: 'وصفة',
  LAB_ORDER: 'طلب مخبري',
  IMAGING_ORDER: 'طلب أشعة',
  PROCEDURE_ORDER: 'طلب إجراء',
  REFERRAL_ORDER: 'إحالة',
};

export default function DoctorClinicalLibraryPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<'library' | 'templates'>('library');
  const [search, setSearch] = useState('');
  const [libraryFormOpen, setLibraryFormOpen] = useState(false);
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [deleteLibraryId, setDeleteLibraryId] = useState<string | null>(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

  const [libraryType, setLibraryType] = useState<DoctorLibraryItemType>('MEDICATION');
  const [libraryLabel, setLibraryLabel] = useState('');
  const [libraryDosage, setLibraryDosage] = useState('');
  const [libraryFrequency, setLibraryFrequency] = useState('');

  const [templateType, setTemplateType] =
    useState<DoctorTemplateType>('PRESCRIPTION');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  const libraryQuery = useDoctorLibraryItems({ search, limit: 50 });
  const templatesQuery = useDoctorTemplates({ search, limit: 50 });
  const createLibrary = useCreateDoctorLibraryItem();
  const deleteLibrary = useDeleteDoctorLibraryItem();
  const createTemplate = useCreateDoctorTemplate();
  const deleteTemplate = useDeleteDoctorTemplate();

  const isBusy =
    createLibrary.isPending ||
    deleteLibrary.isPending ||
    createTemplate.isPending ||
    deleteTemplate.isPending;

  const tabs = useMemo(
    () => [
      { id: 'library' as const, label: 'المكتبة السريرية' },
      { id: 'templates' as const, label: 'القوالب' },
    ],
    [],
  );

  const handleCreateLibrary = async () => {
    const label = libraryLabel.trim();
    if (!label) {
      toast('أدخل عنواناً للعنصر.', { variant: 'error' });
      return;
    }
    try {
      await createLibrary.mutateAsync({
        type: libraryType,
        label,
        data:
          libraryType === 'MEDICATION'
            ? {
                name: label,
                dosage: libraryDosage.trim() || undefined,
                frequency: libraryFrequency.trim() || undefined,
              }
            : { displayName: label },
      });
      toast('تمت إضافة العنصر للمكتبة.', { variant: 'success' });
      setLibraryFormOpen(false);
      setLibraryLabel('');
      setLibraryDosage('');
      setLibraryFrequency('');
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر الحفظ',
        variant: 'error',
      });
    }
  };

  const handleCreateTemplate = async () => {
    const name = templateName.trim();
    if (!name) {
      toast('اسم القالب مطلوب.', { variant: 'error' });
      return;
    }
    try {
      await createTemplate.mutateAsync({
        type: templateType,
        name,
        description: templateDescription.trim() || undefined,
        payload: {},
      });
      toast('تم إنشاء القالب.', { variant: 'success' });
      setTemplateFormOpen(false);
      setTemplateName('');
      setTemplateDescription('');
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر إنشاء القالب',
        variant: 'error',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>المكتبة السريرية • LMJ Health</title>
      </Helmet>

      <div dir="rtl" lang="ar" className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-cairo text-[28px] font-black text-[#111827]">
              المكتبة السريرية والقوالب
            </h1>
            <p className="mt-1 font-cairo text-[14px] font-semibold text-[#667085]">
              اختصارات الأدوية والتحاليل والقوالب القابلة لإعادة الاستخدام
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              tab === 'library'
                ? setLibraryFormOpen(true)
                : setTemplateFormOpen(true)
            }
            className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-4 py-2.5 font-cairo text-[13px] font-extrabold text-white"
          >
            <Plus className="h-4 w-4" />
            {tab === 'library' ? 'إضافة للمكتبة' : 'قالب جديد'}
          </button>
        </header>

        <div className="flex flex-wrap gap-2 border-b border-[#E4E7EC]">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'border-b-2 px-4 py-2 font-cairo text-[13px] font-extrabold transition',
                tab === item.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-[#667085]',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="بحث..."
          className="h-11 w-full max-w-md rounded-[10px] border border-[#E4E7EC] bg-white px-3 font-cairo text-[13px] font-semibold outline-none focus:border-primary"
        />

        {tab === 'library' ? (
          libraryQuery.isAwaitingData ? (
            <div className="rounded-[12px] border border-dashed border-[#E4E7EC] px-6 py-16 text-center font-cairo text-[14px] font-semibold text-[#667085]">
              جارٍ تحميل المكتبة...
            </div>
          ) : libraryQuery.items.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-[#E4E7EC] px-6 py-16 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-primary" />
              <p className="mt-3 font-cairo text-[15px] font-extrabold text-[#111827]">
                لا توجد عناصر في المكتبة بعد
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {libraryQuery.items.map((item) => (
                <article
                  key={item._id}
                  className="flex items-center justify-between gap-4 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-4"
                >
                  <div className="min-w-0 text-start">
                    <div className="flex items-center gap-2">
                      {item.isFavorite ? (
                        <Star className="h-4 w-4 fill-[#D97706] text-[#D97706]" />
                      ) : null}
                      <p className="font-cairo text-[15px] font-extrabold text-[#111827]">
                        {item.label ?? '—'}
                      </p>
                    </div>
                    <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                      {item.type ? LIBRARY_TYPE_LABELS[item.type] : '—'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteLibraryId(item._id)}
                    className="inline-flex items-center gap-1 rounded-[8px] bg-[#FEF3F2] px-3 py-2 font-cairo text-[12px] font-extrabold text-[#B42318]"
                  >
                    <Trash2 className="h-4 w-4" />
                    أرشفة
                  </button>
                </article>
              ))}
            </div>
          )
        ) : templatesQuery.isAwaitingData ? (
          <div className="rounded-[12px] border border-dashed border-[#E4E7EC] px-6 py-16 text-center font-cairo text-[14px] font-semibold text-[#667085]">
            جارٍ تحميل القوالب...
          </div>
        ) : templatesQuery.templates.length === 0 ? (
          <DoctorListErrorState
            title="لا توجد قوالب"
            brief="أنشئ قالباً لوصفة أو طلب مخبري أو إجراء."
            onRetry={() => setTemplateFormOpen(true)}
          />
        ) : (
          <div className="grid gap-3">
            {templatesQuery.templates.map((template) => (
              <article
                key={template._id}
                className="flex items-center justify-between gap-4 rounded-[12px] border border-[#EEF2F6] bg-white px-4 py-4"
              >
                <div className="min-w-0 text-start">
                  <p className="font-cairo text-[15px] font-extrabold text-[#111827]">
                    {template.name ?? '—'}
                  </p>
                  <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                    {template.type ? TEMPLATE_TYPE_LABELS[template.type] : '—'}
                  </p>
                  {template.description ? (
                    <p className="mt-1 font-cairo text-[12px] text-[#98A2B3]">
                      {template.description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTemplateId(template._id)}
                  className="inline-flex items-center gap-1 rounded-[8px] bg-[#FEF3F2] px-3 py-2 font-cairo text-[12px] font-extrabold text-[#B42318]"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {libraryFormOpen ? (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/45 p-4">
          <div
            dir="rtl"
            lang="ar"
            className="w-full max-w-[480px] rounded-[12px] bg-white p-6 shadow-xl"
          >
            <h2 className="font-cairo text-[18px] font-extrabold text-[#111827]">
              إضافة عنصر للمكتبة
            </h2>
            <div className="mt-4 space-y-3">
              <select
                value={libraryType}
                onChange={(event) =>
                  setLibraryType(event.target.value as DoctorLibraryItemType)
                }
                className="h-11 w-full rounded-[10px] border border-[#E4E7EC] px-3 font-cairo text-[13px]"
              >
                {Object.entries(LIBRARY_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                value={libraryLabel}
                onChange={(event) => setLibraryLabel(event.target.value)}
                placeholder="العنوان"
                className="h-11 w-full rounded-[10px] border border-[#E4E7EC] px-3 font-cairo text-[13px]"
              />
              {libraryType === 'MEDICATION' ? (
                <>
                  <input
                    value={libraryDosage}
                    onChange={(event) => setLibraryDosage(event.target.value)}
                    placeholder="الجرعة"
                    className="h-11 w-full rounded-[10px] border border-[#E4E7EC] px-3 font-cairo text-[13px]"
                  />
                  <input
                    value={libraryFrequency}
                    onChange={(event) => setLibraryFrequency(event.target.value)}
                    placeholder="التكرار"
                    className="h-11 w-full rounded-[10px] border border-[#E4E7EC] px-3 font-cairo text-[13px]"
                  />
                </>
              ) : null}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void handleCreateLibrary()}
                className="flex-1 rounded-[10px] bg-primary py-2.5 font-cairo text-[13px] font-extrabold text-white disabled:opacity-60"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={() => setLibraryFormOpen(false)}
                className="flex-1 rounded-[10px] border border-[#E4E7EC] py-2.5 font-cairo text-[13px] font-extrabold text-[#667085]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {templateFormOpen ? (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/45 p-4">
          <div
            dir="rtl"
            lang="ar"
            className="w-full max-w-[480px] rounded-[12px] bg-white p-6 shadow-xl"
          >
            <h2 className="font-cairo text-[18px] font-extrabold text-[#111827]">
              قالب جديد
            </h2>
            <div className="mt-4 space-y-3">
              <select
                value={templateType}
                onChange={(event) =>
                  setTemplateType(event.target.value as DoctorTemplateType)
                }
                className="h-11 w-full rounded-[10px] border border-[#E4E7EC] px-3 font-cairo text-[13px]"
              >
                {Object.entries(TEMPLATE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder="اسم القالب"
                className="h-11 w-full rounded-[10px] border border-[#E4E7EC] px-3 font-cairo text-[13px]"
              />
              <textarea
                value={templateDescription}
                onChange={(event) => setTemplateDescription(event.target.value)}
                placeholder="وصف (اختياري)"
                rows={3}
                className="w-full rounded-[10px] border border-[#E4E7EC] px-3 py-2 font-cairo text-[13px]"
              />
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void handleCreateTemplate()}
                className="flex-1 rounded-[10px] bg-primary py-2.5 font-cairo text-[13px] font-extrabold text-white disabled:opacity-60"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={() => setTemplateFormOpen(false)}
                className="flex-1 rounded-[10px] border border-[#E4E7EC] py-2.5 font-cairo text-[13px] font-extrabold text-[#667085]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmActionDialog
        open={Boolean(deleteLibraryId)}
        title="أرشفة عنصر المكتبة"
        description="سيتم إخفاء العنصر من القائمة النشطة."
        confirmLabel="أرشفة"
        onClose={() => setDeleteLibraryId(null)}
        onConfirm={async () => {
          if (!deleteLibraryId) return;
          try {
            await deleteLibrary.mutateAsync(deleteLibraryId);
            toast('تمت أرشفة العنصر.', { variant: 'success' });
            setDeleteLibraryId(null);
          } catch (error) {
            toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });
          }
        }}
      />

      <ConfirmActionDialog
        open={Boolean(deleteTemplateId)}
        title="حذف القالب"
        description="لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        onClose={() => setDeleteTemplateId(null)}
        onConfirm={async () => {
          if (!deleteTemplateId) return;
          try {
            await deleteTemplate.mutateAsync(deleteTemplateId);
            toast('تم حذف القالب.', { variant: 'success' });
            setDeleteTemplateId(null);
          } catch (error) {
            toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });
          }
        }}
      />
    </>
  );
}
