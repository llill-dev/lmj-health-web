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

import DoctorDashboardOverview from '@/components/doctor/dashboard/doctor-dashboard-overview';

import { MedicalRecordsPagination } from '@/components/doctor/medical-records/medical-records-pagination';

import { DoctorListEmptyIllustration } from '@/components/doctor/shared/doctor-list-empty-illustration';

import {

  DoctorTableSkeleton,

  DoctorToolbarSkeleton,

} from '@/components/doctor/shared/skeletons';

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

  const [deleteLibraryId, setDeleteLibraryId] = useState<string | null>(null);

  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);



  const libraryQuery = useDoctorLibraryItems({

    search,

    page: libraryPage,

    limit: pageSize,

    type: libraryTypeFilter === 'all' ? undefined : libraryTypeFilter,

  });

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

  const createTemplate = useCreateDoctorTemplate();

  const deleteTemplate = useDeleteDoctorTemplate();



  const isBusy =

    createLibrary.isPending ||

    deleteLibrary.isPending ||

    createTemplate.isPending ||

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
      toast('تمت إضافة العنصر للمكتبة.', { variant: 'success' });
      setLibraryFormOpen(false);
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر الحفظ',
        variant: 'error',
      });
    }
  };



  const handleCreateTemplate = async (values: ClinicalLibraryTemplateFormValues) => {
    try {
      await createTemplate.mutateAsync({
        type: values.type,
        name: values.name,
        description: values.description,
        payload: {},
      });
      toast('تم إنشاء القالب.', { variant: 'success' });
      setTemplateFormOpen(false);
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: 'تعذّر إنشاء القالب',
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

        <title>المكتبة السريرية • LMJ Health</title>

      </Helmet>



      <div dir="rtl" lang="ar" className="w-full pb-10">

        <DoctorDashboardOverview

          variant="medical-records"

          surface="mint"

          kpiColumns={4}

          title="المكتبة السريرية والقوالب"

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

                — اختصارات الأدوية والتحاليل والقوالب القابلة لإعادة الاستخدام

              </span>

            </span>

          }

          actionLabel={section === 'library' ? 'إضافة للمكتبة' : 'قالب جديد'}

          actionIcon={<Plus className="h-4 w-4" />}

          onActionClick={() =>

            section === 'library'

              ? setLibraryFormOpen(true)

              : setTemplateFormOpen(true)

          }

          kpis={[

            {

              key: 'library',

              icon: <BookOpen className="h-5 w-5 shrink-0" />,

              value: libraryStatsQuery.isAwaitingData

                ? '—'

                : libraryStatsQuery.total,

              label: 'عناصر المكتبة',

            },

            {

              key: 'templates',

              icon: <FileText className="h-5 w-5 shrink-0" />,

              value: templatesStatsQuery.isAwaitingData

                ? '—'

                : templatesStatsQuery.total,

              label: 'القوالب',

            },

            {

              key: 'favorites',

              icon: <Star className="h-5 w-5 shrink-0" />,

              value: favoriteStatsQuery.isAwaitingData

                ? '—'

                : favoriteStatsQuery.total,

              label: 'المفضلة',

            },

            {

              key: 'medications',

              icon: <Pill className="h-5 w-5 shrink-0" />,

              value: medicationStatsQuery.isAwaitingData

                ? '—'

                : medicationStatsQuery.total,

              label: 'اختصارات الأدوية',

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



          <div className="mt-6">

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

                  title={libraryFilteredEmpty ? "لا توجد عناصر تطابق البحث أو الفلتر الحالي" : "لا توجد عناصر في المكتبة بعد"}

                  subtitle={libraryFilteredEmpty ? "جرّب تعديل كلمات البحث أو إعادة ضبط الفلاتر لعرض النتائج" : "احفظ اختصارات الأدوية والتحاليل والإجراءات لإعادة استخدامها بسرعة"}

                  actionLabel="إضافة للمكتبة"

                  onAction={() => setLibraryFormOpen(true)}

                  actionIcon={<Plus className="h-4 w-4" />}

                />

              ) : (

                <ClinicalLibraryItemsTable

                  items={libraryQuery.items}

                  typeLabels={LIBRARY_TYPE_LABELS}

                  onArchive={setDeleteLibraryId}

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

                title={templatesFilteredEmpty ? "لا توجد قوالب تطابق البحث أو الفلتر الحالي" : "لا توجد قوالب بعد"}

                subtitle={templatesFilteredEmpty ? "جرّب تعديل كلمات البحث أو إعادة ضبط الفلاتر لعرض النتائج" : "أنشئ قوالب جاهزة للوصفات وطلبات المختبر والأشعة والإحالات"}

                actionLabel="قالب جديد"

                onAction={() => setTemplateFormOpen(true)}

                actionIcon={<Plus className="h-4 w-4" />}

              />

            ) : (

              <ClinicalLibraryTemplatesTable

                templates={templatesQuery.templates}

                typeLabels={TEMPLATE_TYPE_LABELS}

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

              itemLabel="عنصر"

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

              itemLabel="قالب"

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
        busy={createTemplate.isPending}
        onClose={() => setTemplateFormOpen(false)}
        onSubmit={handleCreateTemplate}
      />



      <ConfirmActionDialog

        open={Boolean(deleteLibraryId)}

        title="أرشفة عنصر المكتبة"

        description="سيتم إخفاء العنصر من القائمة النشطة."

        confirmLabel="أرشفة"

        onOpenChange={(open) => {
          if (!open) setDeleteLibraryId(null);
        }}

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

        onOpenChange={(open) => {
          if (!open) setDeleteTemplateId(null);
        }}

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


