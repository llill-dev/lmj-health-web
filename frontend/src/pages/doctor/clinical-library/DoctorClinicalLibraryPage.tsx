'use client';



import { BookOpen, FileText, Pill, Plus, Star } from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';

import { Helmet } from 'react-helmet-async';

import ConfirmActionDialog from '@/components/doctor/confirm-action-dialog';

import {

  ClinicalLibraryItemsTable,

  ClinicalLibraryTemplatesTable,

} from '@/components/doctor/clinical-library/clinical-library-table';

import {

  ClinicalLibraryToolbar,

  type ClinicalLibrarySection,

  type ClinicalLibraryTypeFilter,

  type ClinicalTemplateTypeFilter,

} from '@/components/doctor/clinical-library/clinical-library-toolbar';

import { ClinicalLibraryItemFormDialog } from '@/components/doctor/clinical-library/clinical-library-item-form-dialog';

import {
  ClinicalLibraryTemplateFormDialog,
  type ClinicalLibraryTemplateFormValues,
} from '@/components/doctor/clinical-library/clinical-library-template-form-dialog';
import { ClinicalLibraryTemplateApplyDialog } from '@/components/doctor/clinical-library/clinical-library-template-apply-dialog';
import { ClinicalLibraryRecentStrip } from '@/components/doctor/clinical-library/clinical-library-recent-strip';

import DoctorDashboardOverview from '@/components/doctor/dashboard/doctor-dashboard-overview';

import { MedicalRecordsPagination } from '@/components/doctor/medical-records/medical-records-pagination';

import { DoctorListEmptyIllustration } from '@/components/doctor/shared/doctor-list-empty-illustration';

import {

  DoctorTableSkeleton,

  DoctorToolbarSkeleton,

} from '@/components/doctor/shared/skeletons';

import { useToast } from '@/components/ui/ToastProvider';
import { useI18n } from '@/i18n/provider';

import {

  useApplyDoctorTemplate,

  useCreateDoctorLibraryItem,

  useCreateDoctorTemplate,

  useDeleteDoctorLibraryItem,

  useDeleteDoctorTemplate,

  useDoctorLibraryItems,

  useDoctorLibraryRecent,

  useDoctorTemplates,

  useToggleDoctorLibraryFavorite,

  useUpdateDoctorTemplate,

} from '@/hooks/doctor/patients/useDoctorClinicalShortcuts';

import { getUserFacingRequestErrorMessage } from '@/lib/api';

import type { DoctorLibraryItemType } from '@/lib/doctor/library/libraryTypes';

import type { DoctorTemplateRecord, DoctorTemplateType } from '@/lib/doctor/templates/templateTypes';



function buildLibraryTypeLabels(
  tr: (ar: string, en: string) => string,
): Record<DoctorLibraryItemType, string> {
  return {
    MEDICATION: tr('دواء', 'Medication'),
    LAB: tr('تحليل', 'Lab test'),
    IMAGING: tr('أشعة', 'Imaging'),
    PROCEDURE: tr('إجراء', 'Procedure'),
  };
}

function buildTemplateTypeLabels(
  tr: (ar: string, en: string) => string,
): Record<DoctorTemplateType, string> {
  return {
    PRESCRIPTION: tr('وصفة', 'Prescription'),
    LAB_ORDER: tr('طلب مخبري', 'Lab order'),
    IMAGING_ORDER: tr('طلب أشعة', 'Imaging order'),
    PROCEDURE_ORDER: tr('طلب إجراء', 'Procedure order'),
    REFERRAL_ORDER: tr('إحالة', 'Referral'),
  };
}



export default function DoctorClinicalLibraryPage() {

  const { locale, dir } = useI18n();
  const tr = (ar: string, en: string) => (locale === 'ar' ? ar : en);
  const libraryTypeLabels = buildLibraryTypeLabels(tr);
  const templateTypeLabels = buildTemplateTypeLabels(tr);
  const { toast } = useToast();

  const [section, setSection] = useState<ClinicalLibrarySection>('library');

  const [search, setSearch] = useState('');

  const [libraryTypeFilter, setLibraryTypeFilter] =

    useState<ClinicalLibraryTypeFilter>('all');

  const [templateTypeFilter, setTemplateTypeFilter] =

    useState<ClinicalTemplateTypeFilter>('all');

  const [libraryPage, setLibraryPage] = useState(1);

  const [templatesPage, setTemplatesPage] = useState(1);

  const [pageSize, setPageSize] = useState(8);

  const [libraryFormOpen, setLibraryFormOpen] = useState(false);

  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [templateFormMode, setTemplateFormMode] = useState<'create' | 'edit'>('create');
  const [editTemplate, setEditTemplate] = useState<DoctorTemplateRecord | null>(null);
  const [applyPreview, setApplyPreview] = useState<{
    templateName: string;
    templateType?: DoctorTemplateType;
    application?: Record<string, unknown>;
  } | null>(null);

  const [deleteLibraryId, setDeleteLibraryId] = useState<string | null>(null);

  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);



  const libraryQuery = useDoctorLibraryItems({

    search,

    page: libraryPage,

    limit: pageSize,

    type: libraryTypeFilter === 'all' ? undefined : libraryTypeFilter,

  });

  const recentLibraryQuery = useDoctorLibraryRecent(8);

  const templatesQuery = useDoctorTemplates({

    search,

    page: templatesPage,

    limit: pageSize,

    type: templateTypeFilter === 'all' ? undefined : templateTypeFilter,

  });

  const libraryStatsQuery = useDoctorLibraryItems({ limit: 1 });

  const favoriteStatsQuery = useDoctorLibraryItems({ favorite: true, limit: 1 });

  const medicationStatsQuery = useDoctorLibraryItems({

    type: 'MEDICATION',

    limit: 1,

  });

  const templatesStatsQuery = useDoctorTemplates({ limit: 1 });

  const createLibrary = useCreateDoctorLibraryItem();

  const deleteLibrary = useDeleteDoctorLibraryItem();

  const toggleLibraryFavorite = useToggleDoctorLibraryFavorite();

  const createTemplate = useCreateDoctorTemplate();
  const updateTemplate = useUpdateDoctorTemplate();
  const applyTemplate = useApplyDoctorTemplate();
  const deleteTemplate = useDeleteDoctorTemplate();



  const isBusy =

    createLibrary.isPending ||

    deleteLibrary.isPending ||

    toggleLibraryFavorite.isPending ||

    createTemplate.isPending ||

    updateTemplate.isPending ||

    applyTemplate.isPending ||

    deleteTemplate.isPending;



  const libraryTotalPages = Math.max(

    1,

    Math.ceil(libraryQuery.total / pageSize),

  );

  const templatesTotalPages = Math.max(

    1,

    Math.ceil(templatesQuery.total / pageSize),

  );



  useEffect(() => {

    setLibraryPage(1);

    setTemplatesPage(1);

  }, [search, pageSize, libraryTypeFilter, templateTypeFilter, section]);



  useEffect(() => {

    if (libraryPage > libraryTotalPages) setLibraryPage(libraryTotalPages);

  }, [libraryPage, libraryTotalPages]);



  useEffect(() => {

    if (templatesPage > templatesTotalPages) setTemplatesPage(templatesTotalPages);

  }, [templatesPage, templatesTotalPages]);



  const libraryShowingFrom =

    libraryQuery.total === 0 ? 0 : (libraryPage - 1) * pageSize + 1;

  const libraryShowingTo = Math.min(libraryPage * pageSize, libraryQuery.total);



  const templatesShowingFrom =

    templatesQuery.total === 0 ? 0 : (templatesPage - 1) * pageSize + 1;

  const templatesShowingTo = Math.min(

    templatesPage * pageSize,

    templatesQuery.total,

  );



  const libraryTrulyEmpty =

    section === 'library' &&

    libraryQuery.items.length === 0 &&

    !libraryQuery.isAwaitingData &&

    !search.trim() &&

    libraryTypeFilter === 'all';



  const libraryFilteredEmpty =

    section === 'library' &&

    libraryQuery.items.length === 0 &&

    !libraryQuery.isAwaitingData &&

    !libraryTrulyEmpty;



  const templatesTrulyEmpty =

    section === 'templates' &&

    templatesQuery.templates.length === 0 &&

    !templatesQuery.isAwaitingData &&

    !search.trim() &&

    templateTypeFilter === 'all';



  const templatesFilteredEmpty =

    section === 'templates' &&

    templatesQuery.templates.length === 0 &&

    !templatesQuery.isAwaitingData &&

    !templatesTrulyEmpty;

  const handleToggleLibraryFavorite = async (
    itemId: string,
    isFavorite: boolean,
  ) => {
    try {
      await toggleLibraryFavorite.mutateAsync({ itemId, isFavorite });
      toast(isFavorite ? tr('أُضيف إلى المفضلة.', 'Added to favorites.') : tr('أُزيل من المفضلة.', 'Removed from favorites.'), {
        variant: 'success',
      });
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: tr('تعذّر تحديث المفضلة', 'Could not update favorites'),
        variant: 'error',
      });
    }
  };

  const handleCreateLibrary = async (values: {
    type: DoctorLibraryItemType;
    label: string;
    dosage?: string;
    frequency?: string;
  }) => {
    try {
      await createLibrary.mutateAsync({
        type: values.type,
        label: values.label,
        data:
          values.type === 'MEDICATION'
            ? {
                name: values.label,
                dosage: values.dosage,
                frequency: values.frequency,
              }
            : { displayName: values.label },
      });
      toast(tr('تمت إضافة العنصر للمكتبة.', 'The item was added to the library.'), { variant: 'success' });
      setLibraryFormOpen(false);
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: tr('تعذّر الحفظ', 'Could not save'),
        variant: 'error',
      });
    }
  };



  const handleCreateTemplate = async (values: ClinicalLibraryTemplateFormValues) => {
    try {
      if (templateFormMode === 'edit' && editTemplate?._id) {
        await updateTemplate.mutateAsync({
          templateId: editTemplate._id,
          body: {
            type: values.type,
            name: values.name,
            description: values.description,
          },
        });
        toast(tr('تم تحديث القالب.', 'The template was updated.'), { variant: 'success' });
      } else {
        await createTemplate.mutateAsync({
          type: values.type,
          name: values.name,
          description: values.description,
          payload: {},
        });
        toast(tr('تم إنشاء القالب.', 'The template was created.'), { variant: 'success' });
      }
      setTemplateFormOpen(false);
      setEditTemplate(null);
      setTemplateFormMode('create');
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: templateFormMode === 'edit' ? tr('تعذّر تحديث القالب', 'Could not update the template') : tr('تعذّر إنشاء القالب', 'Could not create the template'),
        variant: 'error',
      });
    }
  };

  const handleApplyTemplate = async (templateId: string) => {
    const template = templatesQuery.templates.find((item) => item._id === templateId);
    try {
      const response = await applyTemplate.mutateAsync(templateId);
      if (!response.storedLocally) {
        toast(tr('تعذّر حفظ مسودة القالب في المتصفح. يمكنك نسخها من المعاينة.', 'Could not save the template draft in the browser. You can copy it from the preview.'), {
          variant: 'warning',
        });
      }
      setApplyPreview({
        templateName: response.name?.trim() || template?.name?.trim() || tr('قالب', 'Template'),
        templateType: response.type ?? (template?.type as DoctorTemplateType | undefined),
        application: response.application,
      });
      if (response.storedLocally) {
        toast(tr('تم تحميل مسودة القالب.', 'The template draft was loaded.'), { variant: 'success' });
      }
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: tr('تعذّر استخدام القالب', 'Could not use the template'),
        variant: 'error',
      });
    }
  };



  const toolbarSkeletonTabs = useMemo(

    () => (section === 'library' ? 5 : 3),

    [section],

  );



  return (

    <>

      <Helmet>

        <title>
          {tr('المكتبة السريرية • LMJ Health', 'Clinical Library • LMJ Health')}
        </title>

      </Helmet>



      <div dir={dir} lang={locale} className="w-full pb-8 sm:pb-10">

        <DoctorDashboardOverview

          variant="medical-records"

          surface="mint"

          kpiColumns={4}

          title={tr('المكتبة السريرية والقوالب', 'Clinical library & templates')}

          headerIcon={<BookOpen className="h-8 w-8 text-white" />}

          subtitle={

            <span>

              <span className="font-extrabold text-primary">

                {libraryStatsQuery.isAwaitingData

                  ? '—'

                  : libraryStatsQuery.total}

              </span>

              <span className="text-primary/90">

                {' '}

                {tr(
                  '— اختصارات الأدوية والتحاليل والقوالب القابلة لإعادة الاستخدام',
                  '— reusable medicine, lab, and template shortcuts',
                )}

              </span>

            </span>

          }

          actionLabel={
            section === 'library'
              ? tr('إضافة للمكتبة', 'Add to library')
              : tr('قالب جديد', 'New template')
          }

          actionIcon={<Plus className="h-4 w-4" />}

          onActionClick={() =>

            section === 'library'

              ? setLibraryFormOpen(true)

              : (() => {
                  setTemplateFormMode('create');
                  setEditTemplate(null);
                  setTemplateFormOpen(true);
                })()

          }

          kpis={[

            {

              key: 'library',

              icon: <BookOpen className="h-5 w-5 shrink-0" />,

              value: libraryStatsQuery.isAwaitingData

                ? '—'

                : libraryStatsQuery.total,

              label: tr('عناصر المكتبة', 'Library items'),

            },

            {

              key: 'templates',

              icon: <FileText className="h-5 w-5 shrink-0" />,

              value: templatesStatsQuery.isAwaitingData

                ? '—'

                : templatesStatsQuery.total,

              label: tr('القوالب', 'Templates'),

            },

            {

              key: 'favorites',

              icon: <Star className="h-5 w-5 shrink-0" />,

              value: favoriteStatsQuery.isAwaitingData

                ? '—'

                : favoriteStatsQuery.total,

              label: tr('المفضلة', 'Favorites'),

            },

            {

              key: 'medications',

              icon: <Pill className="h-5 w-5 shrink-0" />,

              value: medicationStatsQuery.isAwaitingData

                ? '—'

                : medicationStatsQuery.total,

              label: tr('اختصارات الأدوية', 'Medication shortcuts'),

            },

          ]}

        />



        <section className="rounded-[12px] border border-[#EEF2F6] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)] sm:p-6">

          <ClinicalLibraryToolbar

            search={search}

            onSearchChange={setSearch}

            onClear={() => {
              setSearch('');
              if (section === 'library') {
                setLibraryTypeFilter('all');
              } else {
                setTemplateTypeFilter('all');
              }
            }}

            section={section}

            onSectionChange={setSection}

            libraryTypeFilter={libraryTypeFilter}

            onLibraryTypeFilterChange={setLibraryTypeFilter}

            templateTypeFilter={templateTypeFilter}

            onTemplateTypeFilterChange={setTemplateTypeFilter}

          />

          {section === 'library' ? (
            <ClinicalLibraryRecentStrip
              items={recentLibraryQuery.items}
              typeLabels={libraryTypeLabels}
              isAwaitingData={recentLibraryQuery.isAwaitingData}
            />
          ) : null}

          <div className="mt-5 sm:mt-6">

            {section === 'library' ? (

              libraryQuery.isAwaitingData && !libraryQuery.items.length ? (

                <div className="space-y-4">

                  <DoctorToolbarSkeleton tabs={toolbarSkeletonTabs} />

                  <DoctorTableSkeleton rows={8} columns={4} />

                </div>

              ) : libraryTrulyEmpty || libraryFilteredEmpty ? (

                <DoctorListEmptyIllustration

                  variant="teal"

                  imageSrc="/images/photo-not-medicines.png"

                  imageClassName="drop-shadow-[0_12px_32px_rgba(15,118,110,0.1)]"

            title={libraryFilteredEmpty ? tr('لا توجد عناصر تطابق البحث أو الفلتر الحالي', 'No items match the current search or filter') : tr('لا توجد عناصر في المكتبة بعد', 'No items in the library yet')}

            subtitle={libraryFilteredEmpty ? tr('جرّب تعديل كلمات البحث أو إعادة ضبط الفلاتر لعرض النتائج', 'Try adjusting the search terms or resetting the filters to see results') : tr('احفظ اختصارات الأدوية والتحاليل والإجراءات لإعادة استخدامها بسرعة', 'Save shortcuts for medications, lab tests, and procedures to reuse them quickly')}

            actionLabel={tr('إضافة للمكتبة', 'Add to library')}

                  onAction={() => setLibraryFormOpen(true)}

                  actionIcon={<Plus className="h-4 w-4" />}

                />

              ) : (

                <ClinicalLibraryItemsTable

                  items={libraryQuery.items}

                  typeLabels={libraryTypeLabels}

                  onArchive={setDeleteLibraryId}

                  onToggleFavorite={(itemId, isFavorite) => {
                    void handleToggleLibraryFavorite(itemId, isFavorite);
                  }}

                  togglingFavoriteId={
                    toggleLibraryFavorite.isPending
                      ? (toggleLibraryFavorite.variables?.itemId ?? null)
                      : null
                  }

                />

              )

            ) : templatesQuery.isAwaitingData && !templatesQuery.templates.length ? (

              <div className="space-y-4">

                <DoctorToolbarSkeleton tabs={toolbarSkeletonTabs} />

                <DoctorTableSkeleton rows={8} columns={4} />

              </div>

            ) : templatesTrulyEmpty || templatesFilteredEmpty ? (

              <DoctorListEmptyIllustration

                variant="violet"

                imageSrc="/images/photo-not-meduical-file.png"

                imageClassName="drop-shadow-[0_12px_32px_rgba(99,102,241,0.1)]"

            title={templatesFilteredEmpty ? tr('لا توجد قوالب تطابق البحث أو الفلتر الحالي', 'No templates match the current search or filter') : tr('لا توجد قوالب بعد', 'No templates yet')}

            subtitle={templatesFilteredEmpty ? tr('جرّب تعديل كلمات البحث أو إعادة ضبط الفلاتر لعرض النتائج', 'Try adjusting the search terms or resetting the filters to see results') : tr('أنشئ قوالب جاهزة للوصفات وطلبات المختبر والأشعة والإحالات', 'Create ready-made templates for prescriptions, lab and imaging orders, and referrals')}

            actionLabel={tr('قالب جديد', 'New template')}

                onAction={() => setTemplateFormOpen(true)}

                actionIcon={<Plus className="h-4 w-4" />}

              />

            ) : (

              <ClinicalLibraryTemplatesTable

                templates={templatesQuery.templates}

                typeLabels={templateTypeLabels}

                applyingTemplateId={
                  applyTemplate.isPending ? applyTemplate.variables : null
                }

                onApply={handleApplyTemplate}

                onEdit={(templateId) => {
                  const template = templatesQuery.templates.find(
                    (item) => item._id === templateId,
                  );
                  if (!template) return;
                  setEditTemplate(template as DoctorTemplateRecord);
                  setTemplateFormMode('edit');
                  setTemplateFormOpen(true);
                }}

                onDelete={setDeleteTemplateId}

              />

            )}

          </div>

        </section>



        {section === 'library' &&

        !libraryQuery.isAwaitingData &&

        libraryQuery.items.length > 0 ? (

          <div className="mt-5">

            <MedicalRecordsPagination

              page={libraryPage}

              totalPages={libraryTotalPages}

              showingFrom={libraryShowingFrom}

              showingTo={libraryShowingTo}

              total={libraryQuery.total}

              pageSize={pageSize}

              itemLabel={tr('عنصر', 'item')}

              onPageChange={setLibraryPage}

              onPageSizeChange={(size) => {

                setPageSize(size);

                setLibraryPage(1);

                setTemplatesPage(1);

              }}

            />

          </div>

        ) : null}



        {section === 'templates' &&

        !templatesQuery.isAwaitingData &&

        templatesQuery.templates.length > 0 ? (

          <div className="mt-5">

            <MedicalRecordsPagination

              page={templatesPage}

              totalPages={templatesTotalPages}

              showingFrom={templatesShowingFrom}

              showingTo={templatesShowingTo}

              total={templatesQuery.total}

              pageSize={pageSize}

              itemLabel={tr('قالب', 'template')}

              onPageChange={setTemplatesPage}

              onPageSizeChange={(size) => {

                setPageSize(size);

                setLibraryPage(1);

                setTemplatesPage(1);

              }}

            />

          </div>

        ) : null}

      </div>



      <ClinicalLibraryItemFormDialog
        open={libraryFormOpen}
        busy={createLibrary.isPending}
        onClose={() => setLibraryFormOpen(false)}
        onSubmit={handleCreateLibrary}
      />



      <ClinicalLibraryTemplateFormDialog
        open={templateFormOpen}
        mode={templateFormMode}
        initialTemplate={editTemplate}
        busy={createTemplate.isPending || updateTemplate.isPending}
        onClose={() => {
          setTemplateFormOpen(false);
          setEditTemplate(null);
          setTemplateFormMode('create');
        }}
        onSubmit={handleCreateTemplate}
      />

      <ClinicalLibraryTemplateApplyDialog
        open={Boolean(applyPreview)}
        templateName={applyPreview?.templateName ?? tr('قالب', 'Template')}
        templateType={applyPreview?.templateType}
        application={applyPreview?.application}
        onClose={() => setApplyPreview(null)}
      />



      <ConfirmActionDialog

        open={Boolean(deleteLibraryId)}

        title={tr('أرشفة عنصر المكتبة', 'Archive library item')}

        description={tr('سيتم إخفاء العنصر من القائمة النشطة.', 'The item will be hidden from the active list.')}

        confirmLabel={tr('أرشفة', 'Archive')}

        onOpenChange={(open) => {
          if (!open) setDeleteLibraryId(null);
        }}

        onConfirm={async () => {

          if (!deleteLibraryId) return;

          try {

            await deleteLibrary.mutateAsync(deleteLibraryId);

            toast(tr('تمت أرشفة العنصر.', 'The item was archived.'), { variant: 'success' });

            setDeleteLibraryId(null);

          } catch (error) {

            toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });

          }

        }}

      />



      <ConfirmActionDialog

        open={Boolean(deleteTemplateId)}

        title={tr('حذف القالب', 'Delete template')}

        description={tr('لا يمكن التراجع عن هذا الإجراء.', 'This action cannot be undone.')}

        confirmLabel={tr('حذف', 'Delete')}

        onOpenChange={(open) => {
          if (!open) setDeleteTemplateId(null);
        }}

        onConfirm={async () => {

          if (!deleteTemplateId) return;

          try {

            await deleteTemplate.mutateAsync(deleteTemplateId);

            toast(tr('تم حذف القالب.', 'The template was deleted.'), { variant: 'success' });

            setDeleteTemplateId(null);

          } catch (error) {

            toast(getUserFacingRequestErrorMessage(error), { variant: 'error' });

          }

        }}

      />

    </>

  );

}


