"use client";

import { BookOpen, FileText, Pill, Plus, Star } from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { Helmet } from "react-helmet-async";

import ConfirmActionDialog from "@/components/doctor/confirm-action-dialog";

import {
  ClinicalLibraryItemsTable,
  ClinicalLibraryTemplatesTable,
} from "@/components/doctor/clinical-library/clinical-library-table";

import {
  ClinicalLibraryToolbar,
  type ClinicalLibrarySection,
  type ClinicalLibraryTypeFilter,
  type ClinicalTemplateTypeFilter,
} from "@/components/doctor/clinical-library/clinical-library-toolbar";

import { ClinicalLibraryItemFormDialog } from "@/components/doctor/clinical-library/clinical-library-item-form-dialog";

import {
  ClinicalLibraryTemplateFormDialog,
  type ClinicalLibraryTemplateFormValues,
} from "@/components/doctor/clinical-library/clinical-library-template-form-dialog";
import { ClinicalLibraryTemplateApplyDialog } from "@/components/doctor/clinical-library/clinical-library-template-apply-dialog";
import { ClinicalLibraryRecentStrip } from "@/components/doctor/clinical-library/clinical-library-recent-strip";

import DoctorDashboardOverview from "@/components/doctor/dashboard/doctor-dashboard-overview";

import { MedicalRecordsPagination } from "@/components/doctor/medical-records/medical-records-pagination";

import { DoctorListEmptyIllustration } from "@/components/doctor/shared/doctor-list-empty-illustration";

import {
  DoctorTableSkeleton,
  DoctorToolbarSkeleton,
} from "@/components/doctor/shared/skeletons";

import { useToast } from "@/components/ui/ToastProvider";
import { useI18n } from "@/i18n/provider";

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
} from "@/hooks/doctor/patients/useDoctorClinicalShortcuts";

import { getUserFacingRequestErrorMessage } from "@/lib/api";

import type { DoctorLibraryItemType } from "@/lib/doctor/library/libraryTypes";

import type {
  DoctorTemplateRecord,
  DoctorTemplateType,
} from "@/lib/doctor/templates/templateTypes";

function buildLibraryTypeLabels(
  t: (key: string) => string,
): Record<DoctorLibraryItemType, string> {
  return {
    MEDICATION: t("doctor.clinicalLibrary.type.medication"),
    LAB: t("doctor.clinicalLibrary.type.lab"),
    IMAGING: t("doctor.clinicalLibrary.type.imaging"),
    PROCEDURE: t("doctor.clinicalLibrary.type.procedure"),
  };
}

function buildTemplateTypeLabels(
  t: (key: string) => string,
): Record<DoctorTemplateType, string> {
  return {
    PRESCRIPTION: t("doctor.clinicalLibrary.templateType.prescription"),
    LAB_ORDER: t("doctor.clinicalLibrary.templateType.labOrder"),
    IMAGING_ORDER: t("doctor.clinicalLibrary.templateType.imagingOrder"),
    PROCEDURE_ORDER: t("doctor.clinicalLibrary.templateType.procedureOrder"),
    REFERRAL_ORDER: t("doctor.clinicalLibrary.templateType.referralOrder"),
  };
}

export default function DoctorClinicalLibraryPage() {
  const { t, locale, dir } = useI18n();
  const libraryTypeLabels = buildLibraryTypeLabels(t);
  const templateTypeLabels = buildTemplateTypeLabels(t);
  const { toast } = useToast();

  const [section, setSection] = useState<ClinicalLibrarySection>("library");

  const [search, setSearch] = useState("");

  const [libraryTypeFilter, setLibraryTypeFilter] =
    useState<ClinicalLibraryTypeFilter>("all");

  const [templateTypeFilter, setTemplateTypeFilter] =
    useState<ClinicalTemplateTypeFilter>("all");

  const [libraryPage, setLibraryPage] = useState(1);

  const [templatesPage, setTemplatesPage] = useState(1);

  const [pageSize, setPageSize] = useState(8);

  const [libraryFormOpen, setLibraryFormOpen] = useState(false);

  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [templateFormMode, setTemplateFormMode] = useState<"create" | "edit">(
    "create",
  );
  const [editTemplate, setEditTemplate] = useState<DoctorTemplateRecord | null>(
    null,
  );
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

    type: libraryTypeFilter === "all" ? undefined : libraryTypeFilter,
  });

  const recentLibraryQuery = useDoctorLibraryRecent(8);

  const templatesQuery = useDoctorTemplates({
    search,

    page: templatesPage,

    limit: pageSize,

    type: templateTypeFilter === "all" ? undefined : templateTypeFilter,
  });

  const libraryStatsQuery = useDoctorLibraryItems({ limit: 1 });

  const favoriteStatsQuery = useDoctorLibraryItems({
    favorite: true,
    limit: 1,
  });

  const medicationStatsQuery = useDoctorLibraryItems({
    type: "MEDICATION",

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
    if (templatesPage > templatesTotalPages)
      setTemplatesPage(templatesTotalPages);
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
    section === "library" &&
    libraryQuery.items.length === 0 &&
    !libraryQuery.isAwaitingData &&
    !search.trim() &&
    libraryTypeFilter === "all";

  const libraryFilteredEmpty =
    section === "library" &&
    libraryQuery.items.length === 0 &&
    !libraryQuery.isAwaitingData &&
    !libraryTrulyEmpty;

  const templatesTrulyEmpty =
    section === "templates" &&
    templatesQuery.templates.length === 0 &&
    !templatesQuery.isAwaitingData &&
    !search.trim() &&
    templateTypeFilter === "all";

  const templatesFilteredEmpty =
    section === "templates" &&
    templatesQuery.templates.length === 0 &&
    !templatesQuery.isAwaitingData &&
    !templatesTrulyEmpty;

  const handleToggleLibraryFavorite = async (
    itemId: string,
    isFavorite: boolean,
  ) => {
    try {
      await toggleLibraryFavorite.mutateAsync({ itemId, isFavorite });
      toast(
        isFavorite
          ? t("doctor.clinicalLibrary.favorite.added")
          : t("doctor.clinicalLibrary.favorite.removed"),
        {
          variant: "success",
        },
      );
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: t("doctor.clinicalLibrary.favorite.updateFailed"),
        variant: "error",
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
          values.type === "MEDICATION"
            ? {
                name: values.label,
                dosage: values.dosage,
                frequency: values.frequency,
              }
            : { displayName: values.label },
      });
      toast(t("doctor.clinicalLibrary.item.added"), { variant: "success" });
      setLibraryFormOpen(false);
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: t("doctor.clinicalLibrary.item.saveFailed"),
        variant: "error",
      });
    }
  };

  const handleCreateTemplate = async (
    values: ClinicalLibraryTemplateFormValues,
  ) => {
    try {
      if (templateFormMode === "edit" && editTemplate?._id) {
        await updateTemplate.mutateAsync({
          templateId: editTemplate._id,
          body: {
            type: values.type,
            name: values.name,
            description: values.description,
            payload: values.payload,
          },
        });
        toast(t("doctor.clinicalLibrary.template.updated"), {
          variant: "success",
        });
      } else {
        await createTemplate.mutateAsync({
          type: values.type,
          name: values.name,
          description: values.description,
          payload: values.payload,
        });
        toast(t("doctor.clinicalLibrary.template.created"), {
          variant: "success",
        });
      }
      setTemplateFormOpen(false);
      setEditTemplate(null);
      setTemplateFormMode("create");
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title:
          templateFormMode === "edit"
            ? t("doctor.clinicalLibrary.template.updateFailed")
            : t("doctor.clinicalLibrary.template.createFailed"),
        variant: "error",
      });
    }
  };

  const handleApplyTemplate = async (templateId: string) => {
    const template = templatesQuery.templates.find(
      (item) => item._id === templateId,
    );
    try {
      const response = await applyTemplate.mutateAsync(templateId);
      if (!response.storedLocally) {
        toast(t("doctor.clinicalLibrary.template.draftSaveFailed"), {
          variant: "warning",
        });
      }
      setApplyPreview({
        templateName:
          response.name?.trim() ||
          template?.name?.trim() ||
          t("doctor.clinicalLibrary.templateLabel"),
        templateType:
          response.type ?? (template?.type as DoctorTemplateType | undefined),
        application: response.application,
      });
      if (response.storedLocally) {
        toast(t("doctor.clinicalLibrary.template.draftLoaded"), {
          variant: "success",
        });
      }
    } catch (error) {
      toast(getUserFacingRequestErrorMessage(error), {
        title: t("doctor.clinicalLibrary.template.useFailed"),
        variant: "error",
      });
    }
  };

  const toolbarSkeletonTabs = useMemo(
    () => (section === "library" ? 5 : 3),

    [section],
  );

  return (
    <>
      <Helmet>
        <title>{t("doctor.clinicalLibrary.page.title")}</title>
      </Helmet>

      <div dir={dir} lang={locale} className="w-full pb-8 sm:pb-10">
        <DoctorDashboardOverview
          variant="medical-records"
          surface="mint"
          kpiColumns={4}
          title={t("doctor.clinicalLibrary.title")}
          headerIcon={<BookOpen className="h-8 w-8 text-white" />}
          subtitle={
            <span>
              <span className="font-extrabold text-primary">
                {libraryStatsQuery.isAwaitingData
                  ? "—"
                  : libraryStatsQuery.total}
              </span>

              <span className="text-primary/90">
                {" "}
                {t("doctor.clinicalLibrary.subtitle")}
              </span>
            </span>
          }
          actionLabel={
            section === "library"
              ? t("doctor.clinicalLibrary.addToLibrary")
              : t("doctor.clinicalLibrary.newTemplate")
          }
          actionIcon={<Plus className="h-4 w-4" />}
          onActionClick={() =>
            section === "library"
              ? setLibraryFormOpen(true)
              : (() => {
                  setTemplateFormMode("create");
                  setEditTemplate(null);
                  setTemplateFormOpen(true);
                })()
          }
          kpis={[
            {
              key: "library",

              icon: <BookOpen className="h-5 w-5 shrink-0" />,

              value: libraryStatsQuery.isAwaitingData
                ? "—"
                : libraryStatsQuery.total,

              label: t("doctor.clinicalLibrary.libraryItems"),
            },

            {
              key: "templates",

              icon: <FileText className="h-5 w-5 shrink-0" />,

              value: templatesStatsQuery.isAwaitingData
                ? "—"
                : templatesStatsQuery.total,

              label: t("doctor.clinicalLibrary.templates"),
            },

            {
              key: "favorites",

              icon: <Star className="h-5 w-5 shrink-0" />,

              value: favoriteStatsQuery.isAwaitingData
                ? "—"
                : favoriteStatsQuery.total,

              label: t("doctor.clinicalLibrary.favorites"),
            },

            {
              key: "medications",

              icon: <Pill className="h-5 w-5 shrink-0" />,

              value: medicationStatsQuery.isAwaitingData
                ? "—"
                : medicationStatsQuery.total,

              label: t("doctor.clinicalLibrary.medicationShortcuts"),
            },
          ]}
        />

        <section className="rounded-[12px] border border-[#EEF2F6] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.08)] sm:p-6">
          <ClinicalLibraryToolbar
            search={search}
            onSearchChange={setSearch}
            onClear={() => {
              setSearch("");
              if (section === "library") {
                setLibraryTypeFilter("all");
              } else {
                setTemplateTypeFilter("all");
              }
            }}
            section={section}
            onSectionChange={setSection}
            libraryTypeFilter={libraryTypeFilter}
            onLibraryTypeFilterChange={setLibraryTypeFilter}
            templateTypeFilter={templateTypeFilter}
            onTemplateTypeFilterChange={setTemplateTypeFilter}
          />

          {section === "library" ? (
            <ClinicalLibraryRecentStrip
              items={recentLibraryQuery.items}
              typeLabels={libraryTypeLabels}
              isAwaitingData={recentLibraryQuery.isAwaitingData}
            />
          ) : null}

          <div className="mt-5 sm:mt-6">
            {section === "library" ? (
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
                  title={
                    libraryFilteredEmpty
                      ? t("doctor.clinicalLibrary.empty.matching")
                      : t("doctor.clinicalLibrary.empty.none")
                  }
                  subtitle={
                    libraryFilteredEmpty
                      ? t("doctor.clinicalLibrary.empty.matchingSubtitle")
                      : t("doctor.clinicalLibrary.empty.noneSubtitle")
                  }
                  actionLabel={t("doctor.clinicalLibrary.addToLibrary")}
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
            ) : templatesQuery.isAwaitingData &&
              !templatesQuery.templates.length ? (
              <div className="space-y-4">
                <DoctorToolbarSkeleton tabs={toolbarSkeletonTabs} />

                <DoctorTableSkeleton rows={8} columns={4} />
              </div>
            ) : templatesTrulyEmpty || templatesFilteredEmpty ? (
              <DoctorListEmptyIllustration
                variant="violet"
                imageSrc="/images/photo-not-meduical-file.png"
                imageClassName="drop-shadow-[0_12px_32px_rgba(99,102,241,0.1)]"
                title={
                  templatesFilteredEmpty
                    ? t("doctor.clinicalLibrary.templatesEmpty.matching")
                    : t("doctor.clinicalLibrary.templatesEmpty.none")
                }
                subtitle={
                  templatesFilteredEmpty
                    ? t(
                        "doctor.clinicalLibrary.templatesEmpty.matchingSubtitle",
                      )
                    : t("doctor.clinicalLibrary.templatesEmpty.noneSubtitle")
                }
                actionLabel={t("doctor.clinicalLibrary.newTemplate")}
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
                  setTemplateFormMode("edit");
                  setTemplateFormOpen(true);
                }}
                onDelete={setDeleteTemplateId}
              />
            )}
          </div>
        </section>

        {section === "library" &&
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
              itemLabel={t("doctor.clinicalLibrary.itemLabel")}
              onPageChange={setLibraryPage}
              onPageSizeChange={(size) => {
                setPageSize(size);

                setLibraryPage(1);

                setTemplatesPage(1);
              }}
            />
          </div>
        ) : null}

        {section === "templates" &&
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
              itemLabel={t("doctor.clinicalLibrary.templateLabel")}
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
          setTemplateFormMode("create");
        }}
        onSubmit={handleCreateTemplate}
      />

      <ClinicalLibraryTemplateApplyDialog
        open={Boolean(applyPreview)}
        templateName={
          applyPreview?.templateName ??
          t("doctor.clinicalLibrary.templateLabel")
        }
        templateType={applyPreview?.templateType}
        application={applyPreview?.application}
        onClose={() => setApplyPreview(null)}
      />

      <ConfirmActionDialog
        open={Boolean(deleteLibraryId)}
        title={t("doctor.clinicalLibrary.archiveDialog.title")}
        description={t("doctor.clinicalLibrary.archiveDialog.description")}
        confirmLabel={t("doctor.clinicalLibrary.archiveDialog.confirm")}
        onOpenChange={(open) => {
          if (!open) setDeleteLibraryId(null);
        }}
        onConfirm={async () => {
          if (!deleteLibraryId) return;

          try {
            await deleteLibrary.mutateAsync(deleteLibraryId);

            toast(t("doctor.clinicalLibrary.archive.success"), {
              variant: "success",
            });

            setDeleteLibraryId(null);
          } catch (error) {
            toast(getUserFacingRequestErrorMessage(error), {
              variant: "error",
            });
          }
        }}
      />

      <ConfirmActionDialog
        open={Boolean(deleteTemplateId)}
        title={t("doctor.clinicalLibrary.deleteDialog.title")}
        description={t("doctor.clinicalLibrary.deleteDialog.description")}
        confirmLabel={t("doctor.clinicalLibrary.deleteDialog.confirm")}
        onOpenChange={(open) => {
          if (!open) setDeleteTemplateId(null);
        }}
        onConfirm={async () => {
          if (!deleteTemplateId) return;

          try {
            await deleteTemplate.mutateAsync(deleteTemplateId);

            toast(t("doctor.clinicalLibrary.delete.success"), {
              variant: "success",
            });

            setDeleteTemplateId(null);
          } catch (error) {
            toast(getUserFacingRequestErrorMessage(error), {
              variant: "error",
            });
          }
        }}
      />
    </>
  );
}
