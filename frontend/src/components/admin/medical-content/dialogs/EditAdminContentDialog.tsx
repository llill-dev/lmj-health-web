"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Loader2, Save, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type Resolver,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAdminContentById,
  useUpdateAdminContent,
} from "@/hooks/admin/content/useAdminContent";
import { useAdminContentTemplates } from "@/hooks/admin/content-templates/useAdminContentTemplates";
import ContentBlockEditor from "@/components/admin/medical-content/ContentBlockEditor";
import DynamicTemplateFieldRenderer from "@/components/admin/medical-content/DynamicTemplateFieldRenderer";
import MedicalContentGovernancePanel, {
  ReleaseAcceptanceSection,
} from "@/components/admin/medical-content/MedicalContentGovernancePanel";
import { buildReleaseAcceptanceSnapshot, type WorkflowActorRole } from "@/components/admin/medical-content/releaseAcceptanceMatrix";
import MedicalContentPatientPreview from "@/components/admin/medical-content/MedicalContentPatientPreview";
import {
  buildContentBlocks,
  contentBlockSchema,
  createEmptyBlock,
  isMeaningfulBlock,
  normalizeContentBlocksForForm,
} from "@/components/admin/medical-content/contentBlockEditor.helpers";
import {
  collectTemplateFieldValidationIssues,
  getTemplateParentType,
  isDynamicRecord,
} from "@/components/admin/medical-content/dynamicTemplateFieldRenderer.helpers";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
import { useToast } from "@/components/ui/ToastProvider";
import { useI18n } from "@/i18n/provider";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/form-field";
import StyledSelect from "@/components/ui/styled-select";
import { normalizeItemLanguage } from "@/components/admin/medical-content/contentListUtils";
import { cn } from "@/lib/utils/utils";
import { optionalLatinSlugSchema } from "@/lib/forms/slugValidation";
import type {
  AdminContentDynamicRecord,
  AdminContentType,
} from "@/lib/admin/types";
import {
  extractMedicalContentDetails,
  getNewsDraftGuidanceMessages,
  getNewsTypeSwitchSafetyMessage,
  hasNewsFields,
  hasSeekHelpCallout,
  parseCommaSeparatedList,
  parseJsonInput,
  toDisplayText,
  toPrettyJson,
} from "./medicalContentDialogHelpers";

type Translate = (key: string, fallback?: string) => string;

function buildFormSchema(t: Translate) {
  return z
    .object({
      type: z.enum([
        "CONDITION",
        "SYMPTOM",
        "GENERAL_ADVICE",
        "NEWS",
        "MEDICATION",
        "SETTINGS_PAGE",
      ]),
      title: z.string().min(1, t("editContentDialog.validation.titleRequired")),
      /** English title — required only for SETTINGS_PAGE (sent as `{ ar, en }`). */
      titleEn: z.string().optional(),
      summary: z.string().optional(),
      language: z.enum(["ar", "en"]),
      slug: optionalLatinSlugSchema(),
      pageVersion: z.string().optional(),
      templateId: z.string().optional(),
      coverImage: z.string().optional(),
      dataJson: z.string().optional(),
      contentBlocks: z.array(contentBlockSchema).default([createEmptyBlock()]),
      sources: z
        .array(z.object({ title: z.string(), url: z.string() }))
        .default([]),
      tagsInput: z.string().optional(),
      categoriesInput: z.string().optional(),
      riskFlagsInput: z.string().optional(),
      relatedContentIdsInput: z.string().optional(),
      disclaimerVersion: z.string().optional(),
      requiresSeekHelpBlock: z.boolean().default(false),
      isFeatured: z.boolean().default(false),
      newsSourceName: z.string().optional(),
      newsSourceUrl: z.string().optional(),
      newsOriginalTitle: z.string().optional(),
      newsPublishedAt: z.string().optional(),
      newsAiSummary: z.string().optional(),
      newsDedupeHash: z.string().optional(),
      newsImportedAt: z.string().optional(),
    })
    .superRefine((value, ctx) => {
      if (
        value.type === "SETTINGS_PAGE" &&
        (!value.pageVersion || !value.pageVersion.trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pageVersion"],
          message: t("editContentDialog.validation.pageVersionRequired"),
        });
      }

      if (
        value.type === "SETTINGS_PAGE" &&
        (!value.titleEn || !value.titleEn.trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["titleEn"],
          message: t("editContentDialog.validation.titleEnRequired"),
        });
      }

      if (
        value.type !== "SETTINGS_PAGE" &&
        !value.contentBlocks.some((block) => isMeaningfulBlock(block))
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contentBlocks"],
          message: t("editContentDialog.validation.blocksRequired"),
        });
      }
    });
}

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

function getTypeOptions(t: Translate): { value: AdminContentType; label: string }[] {
  return [
    { value: "CONDITION", label: t("createContentDialog.type.condition") },
    { value: "SYMPTOM", label: t("createContentDialog.type.symptom") },
    { value: "GENERAL_ADVICE", label: t("createContentDialog.type.generalAdvice") },
    { value: "NEWS", label: t("createContentDialog.type.news") },
    { value: "MEDICATION", label: t("createContentDialog.type.medication") },
    { value: "SETTINGS_PAGE", label: t("createContentDialog.type.settingsPage") },
  ];
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string | null;
  /** OpenAPI workflow actor for acceptance next-actions. */
  workflowRole?: WorkflowActorRole;
};

const checkboxClass =
  "h-4 w-4 rounded border border-[#D0D5DD] text-primary focus:ring-primary/30";

function parseTemplateRecordInput(
  value: string,
  fallback: AdminContentDynamicRecord = {},
) {
  const result = parseJsonInput(value, fallback);
  return isDynamicRecord(result.value) ? result.value : fallback;
}

/**
 * Collapsible wrapper for the raw-JSON dynamic-data fallback. It's an
 * escape hatch for legacy/untemplated data (see the compatibility
 * requirement — old content without a template must stay editable), not a
 * primary input, so it shouldn't sit at the same visual level as the typed
 * template fields when a template is available. `defaultOpen` lets the
 * caller keep it open when it's genuinely the only way to edit the data
 * (no template selected).
 */
function AdvancedFieldSection({
  title,
  hint,
  defaultOpen,
  forceOpen,
  children,
}: {
  title: string;
  hint?: string;
  defaultOpen: boolean;
  /** Expands the section (and keeps it expanded) once true — e.g. a validation error inside it. */
  forceOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);
  return (
    <div className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFBFC] p-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 text-start"
        aria-expanded={open}
      >
        <div>
          <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
            {title}
          </div>
          {hint ? (
            <div className="mt-0.5 font-cairo text-[11px] font-semibold text-[#667085]">
              {hint}
            </div>
          ) : null}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-[#98A2B3]" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-[#98A2B3]" />
        )}
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

export default function EditAdminContentDialog({
  open,
  onOpenChange,
  contentId,
  workflowRole = "admin",
}: Props) {
  const { dir, t } = useI18n();
  const { toast } = useToast();
  const detailsQuery = useAdminContentById(open ? contentId : null);
  const details = extractMedicalContentDetails(detailsQuery.data);
  const updateMut = useUpdateAdminContent();
  const submitting = updateMut.isPending;
  const formSchema = useMemo(() => buildFormSchema(t), [t]);
  const typeOptions = useMemo(() => getTypeOptions(t), [t]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    // See CreateAdminContentDialog: zodResolver's inferred type diverges from
    // `FormValues` for schemas using `.default()` (input vs. output types) —
    // a known zodResolver v5 + zod v4 typing friction, not a runtime issue.
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      type: "GENERAL_ADVICE",
      title: "",
      titleEn: "",
      summary: "",
      language: "ar",
      slug: "",
      pageVersion: "",
      templateId: "",
      coverImage: "",
      dataJson: "",
      contentBlocks: [createEmptyBlock()],
      sources: [],
      tagsInput: "",
      categoriesInput: "",
      riskFlagsInput: "",
      relatedContentIdsInput: "",
      disclaimerVersion: "",
      requiresSeekHelpBlock: false,
      isFeatured: false,
      newsSourceName: "",
      newsSourceUrl: "",
      newsOriginalTitle: "",
      newsPublishedAt: "",
      newsAiSummary: "",
      newsDedupeHash: "",
      newsImportedAt: "",
    },
  });

  const selectedType = watch("type");
  const selectedLanguage = watch("language");
  const selectedTemplateId = watch("templateId");
  const watchedBlocks = watch("contentBlocks") ?? [];
  const previewTitle = watch("title");
  const previewSummary = watch("summary");
  const previewCoverImage = watch("coverImage");
  const previewDataJson = watch("dataJson");
  const watchedSources = watch("sources") ?? [];
  const previewTagsInput = watch("tagsInput");
  const previewCategoriesInput = watch("categoriesInput");
  const previewRiskFlagsInput = watch("riskFlagsInput");
  const previewRelatedContentIdsInput = watch("relatedContentIdsInput");
  const previewDisclaimerVersion = watch("disclaimerVersion");
  const previewRequiresSeekHelpBlock = watch("requiresSeekHelpBlock");
  const previewIsFeatured = watch("isFeatured");
  const previewNewsSourceName = watch("newsSourceName");
  const previewNewsSourceUrl = watch("newsSourceUrl");
  const previewNewsOriginalTitle = watch("newsOriginalTitle");
  const previewNewsPublishedAt = watch("newsPublishedAt");
  const previewNewsAiSummary = watch("newsAiSummary");
  const previousTypeRef = useRef<AdminContentType | undefined>(undefined);
  const [typeSwitchSafetyMessage, setTypeSwitchSafetyMessage] = useState<string | null>(
    null,
  );
  const templateParentType = getTemplateParentType(selectedType);
  const templateQuery = useAdminContentTemplates(
    templateParentType ? { parentType: templateParentType, active: true } : {},
  );
  const contentBlocksFieldArray = useFieldArray({
    control,
    name: "contentBlocks",
  });
  const sourcesFieldArray = useFieldArray({
    control,
    name: "sources",
  });
  const availableTemplates = useMemo(
    () =>
      (templateQuery.templates ?? []).filter(
        (template) =>
          (template.isActive ?? template.active ?? true) &&
          template.parentType === templateParentType,
      ),
    [templateParentType, templateQuery.templates],
  );
  const selectedTemplate = useMemo(() => {
    const fromQuery = availableTemplates.find(
      (template) => template._id === selectedTemplateId,
    );
    if (fromQuery) return fromQuery;

    const detailTemplate = details?.template;
    const detailTemplateId =
      detailTemplate &&
      typeof detailTemplate === "object" &&
      !Array.isArray(detailTemplate)
        ? toDisplayText((detailTemplate as Record<string, unknown>)._id)
        : "";
    if (
      detailTemplate &&
      typeof detailTemplate === "object" &&
      !Array.isArray(detailTemplate) &&
      (!selectedTemplateId || detailTemplateId === selectedTemplateId)
    ) {
      return detailTemplate as any;
    }

    return undefined;
  }, [availableTemplates, details?.template, selectedTemplateId]);

  // Keep an inactive/legacy template visible as a select option instead of
  // rendering a blank dropdown for content that still references it — an
  // empty-looking select invites silently swapping the template on save.
  const templateOptions = useMemo(() => {
    const templateLabel = (t: { name?: unknown; slug?: string; _id: string }) =>
      toDisplayText(t.name) || t.slug || t._id;
    const options = availableTemplates.map((template) => ({
      value: template._id,
      label: templateLabel(template),
    }));
    if (
      selectedTemplate &&
      !availableTemplates.some((template) => template._id === selectedTemplate._id)
    ) {
      options.push({
        value: selectedTemplate._id,
        label: `${templateLabel(selectedTemplate)} ${t("editContentDialog.field.template.inactiveSuffix")}`,
      });
    }
    return options;
  }, [availableTemplates, selectedTemplate, t]);

  const previewDataResult = parseJsonInput(previewDataJson || "", undefined);
  const previewTags = parseCommaSeparatedList(previewTagsInput || "");
  const previewCategories = parseCommaSeparatedList(previewCategoriesInput || "");
  const previewRiskFlags = parseCommaSeparatedList(previewRiskFlagsInput || "");
  const previewRelatedContentIds = parseCommaSeparatedList(
    previewRelatedContentIdsInput || "",
  );
  const previewBlocks = buildContentBlocks(watchedBlocks);
  const previewSources = watchedSources
    .map((source) => ({
      title: (source.title ?? "").trim(),
      url: (source.url ?? "").trim(),
    }))
    .filter((item) => item.title || item.url);
  const governanceChecklist = useMemo(
    () => [
      {
        key: "sources",
        label: t("editContentDialog.readiness.sources"),
        done: selectedType === "SETTINGS_PAGE" || previewSources.length > 0,
      },
      {
        key: "disclaimerVersion",
        label: t("editContentDialog.readiness.disclaimerVersion"),
        done:
          selectedType === "SETTINGS_PAGE" ||
          Boolean(previewDisclaimerVersion?.trim()),
      },
      {
        key: "seekHelp",
        label: t("editContentDialog.readiness.seekHelp"),
        done:
          (selectedType !== "CONDITION" && selectedType !== "SYMPTOM") ||
          hasSeekHelpCallout(previewBlocks),
      },
    ],
    [
      previewBlocks,
      previewDisclaimerVersion,
      previewSources.length,
      selectedType,
      t,
    ],
  );
  const releaseAcceptance = useMemo(
    () =>
      buildReleaseAcceptanceSnapshot({
        type: selectedType,
        status: details?.status ?? "DRAFT",
        sourceCount: previewSources.length,
        disclaimerVersion: previewDisclaimerVersion,
        hasSeekHelpCallout: hasSeekHelpCallout(previewBlocks),
        hasMeaningfulBlocks:
          selectedType === "SETTINGS_PAGE" ||
          watchedBlocks.some((block) => isMeaningfulBlock(block)),
        newsSourceUrl: previewNewsSourceUrl,
        newsPublishedAt: previewNewsPublishedAt,
        role: workflowRole,
      }),
    [
      details?.status,
      previewBlocks,
      previewDisclaimerVersion,
      previewNewsPublishedAt,
      previewNewsSourceUrl,
      previewSources.length,
      selectedType,
      watchedBlocks,
      workflowRole,
    ],
  );
  const fallbackTemplateData = useMemo(
    () =>
      isDynamicRecord(details?.dataValue)
        ? (details.dataValue as AdminContentDynamicRecord)
        : {},
    [details?.dataValue],
  );
  const templateDataValue = useMemo(() => {
    if (!previewDataJson?.trim()) return fallbackTemplateData;
    return parseTemplateRecordInput(previewDataJson, fallbackTemplateData);
  }, [fallbackTemplateData, previewDataJson]);
  const previewWarnings = useMemo(() => {
    const warnings: string[] = [];

    if (previewDataResult.error) {
      warnings.push(t("editContentDialog.warning.invalidDynamicData"));
    }

    if (selectedType !== "SETTINGS_PAGE" && previewBlocks.length === 0) {
      warnings.push(t("editContentDialog.warning.noContentBlocks"));
    }

    if (selectedType !== "SETTINGS_PAGE" && previewSources.length === 0) {
      warnings.push(t("editContentDialog.warning.noSources"));
    }

    if (selectedType !== "SETTINGS_PAGE" && !previewDisclaimerVersion?.trim()) {
      warnings.push(t("editContentDialog.warning.noDisclaimer"));
    }

    if (
      (selectedType === "CONDITION" || selectedType === "SYMPTOM") &&
      !hasSeekHelpCallout(previewBlocks)
    ) {
      warnings.push(t("editContentDialog.warning.seekHelp"));
    }

    warnings.push(
      ...getNewsDraftGuidanceMessages({
        isNewsType: selectedType === "NEWS",
        language: selectedLanguage,
        sourceUrl: previewNewsSourceUrl,
        publishedAt: previewNewsPublishedAt,
        title: previewTitle,
        summary: previewSummary,
      }),
    );

    return warnings;
  }, [
    previewBlocks,
    previewDataResult.error,
    previewDisclaimerVersion,
    previewNewsPublishedAt,
    previewNewsSourceUrl,
    previewSummary,
    previewSources.length,
    previewTitle,
    selectedLanguage,
    selectedType,
    t,
  ]);

  useEffect(() => {
    if (!open || !details) return;

    const lang = normalizeItemLanguage(details.language);
    const news = details.news ?? null;
    const fallbackTemplateId =
      toDisplayText(details.templateId) ||
      (details.template && typeof details.template === "object"
        ? toDisplayText((details.template as Record<string, unknown>)._id)
        : "");

    reset({
      type: details.type ?? "GENERAL_ADVICE",
      title: toDisplayText(details.title),
      titleEn:
        details.title && typeof details.title === "object"
          ? toDisplayText((details.title as Record<string, unknown>).en)
          : "",
      summary: toDisplayText(details.summary),
      language: lang === "en" ? "en" : "ar",
      slug: toDisplayText(details.slug),
      pageVersion: toDisplayText(details.pageVersion),
      templateId: fallbackTemplateId,
      coverImage: toDisplayText(details.coverImage),
      dataJson: toPrettyJson(details.dataValue),
      contentBlocks: normalizeContentBlocksForForm(details.contentBlocks),
      sources: details.sources.map((source) => ({
        title: toDisplayText(source.title),
        url: toDisplayText(source.url),
      })),
      tagsInput: details.tags.join(", "),
      categoriesInput: details.categories.join(", "),
      riskFlagsInput: details.riskFlags.join(", "),
      relatedContentIdsInput: details.relatedContentIds.join(", "),
      disclaimerVersion: toDisplayText(details.disclaimerVersion),
      requiresSeekHelpBlock: Boolean(details.requiresSeekHelpBlock),
      isFeatured: Boolean(details.isFeatured),
      newsSourceName: toDisplayText(news?.sourceName ?? details.sourceName),
      newsSourceUrl: toDisplayText(news?.sourceUrl),
      newsOriginalTitle: toDisplayText(
        news?.originalTitle ?? details.originalTitle,
      ),
      newsPublishedAt: toDisplayText(news?.publishedAt),
      newsAiSummary: toDisplayText(news?.aiSummary ?? details.aiSummary),
      newsDedupeHash: toDisplayText(news?.dedupeHash),
      newsImportedAt: toDisplayText(news?.importedAt),
    });
    previousTypeRef.current = details.type as AdminContentType | undefined;
    setTypeSwitchSafetyMessage(null);
  }, [open, details, reset]);

  useEffect(() => {
    if (!open) return;
    const previousType = previousTypeRef.current;
    const nextMessage = getNewsTypeSwitchSafetyMessage(
      previousType,
      selectedType,
      selectedLanguage,
    );
    if (nextMessage) {
      setTypeSwitchSafetyMessage(nextMessage);
    }
    previousTypeRef.current = selectedType;
  }, [open, selectedLanguage, selectedType]);

  useEffect(() => {
    if (!open) updateMut.reset();
  }, [open, updateMut]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onOpenChange(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange, submitting]);

  const loading = detailsQuery.isAwaitingData;
  const loadError = detailsQuery.isError;

  const onSubmit = handleSubmit(async (v) => {
    if (!contentId) return;

    clearErrors(["dataJson", "contentBlocks"]);

    const dataResult = parseJsonInput(v.dataJson || "", undefined);

    if (dataResult.error) {
      setError("dataJson", { message: dataResult.error });
      return;
    }

    const parsedTemplateData = isDynamicRecord(dataResult.value)
      ? (dataResult.value as AdminContentDynamicRecord)
      : undefined;
    const language = v.language === "en" ? "en" : "ar";
    const templateIssues = collectTemplateFieldValidationIssues(
      selectedTemplate,
      parsedTemplateData,
      language,
    );
    if (templateIssues.length) {
      setError("dataJson", {
        message:
          templateIssues[0]?.message ||
          t("editContentDialog.validation.templateDataInvalid"),
      });
      return;
    }

    const news = {
      sourceName: v.newsSourceName?.trim() || undefined,
      sourceUrl: v.newsSourceUrl?.trim() || undefined,
      originalTitle: v.newsOriginalTitle?.trim() || undefined,
      publishedAt: v.newsPublishedAt?.trim() || undefined,
      aiSummary: v.newsAiSummary?.trim() || undefined,
      dedupeHash: v.newsDedupeHash?.trim() || undefined,
      importedAt: v.newsImportedAt?.trim() || undefined,
    };

    try {
      await updateMut.mutateAsync({
        id: contentId,
        body: {
          type: v.type,
          title:
            v.type === "SETTINGS_PAGE"
              ? { ar: v.title.trim(), en: v.titleEn?.trim() || "" }
              : v.title.trim(),
          summary: v.summary?.trim() || undefined,
          language: v.language,
          slug: v.slug?.trim() || undefined,
          pageVersion: v.pageVersion?.trim() || undefined,
          templateId: v.templateId?.trim() || undefined,
          coverImage: v.coverImage?.trim() || undefined,
          data: dataResult.value,
          contentBlocks: buildContentBlocks(v.contentBlocks),
          sources: v.sources
            .map((source) => ({
              title: source.title.trim() || undefined,
              url: source.url.trim() || undefined,
            }))
            .filter((item) => item.title || item.url),
          tags: parseCommaSeparatedList(v.tagsInput || ""),
          categories: parseCommaSeparatedList(v.categoriesInput || ""),
          riskFlags: parseCommaSeparatedList(v.riskFlagsInput || ""),
          relatedContentIds: parseCommaSeparatedList(
            v.relatedContentIdsInput || "",
          ),
          disclaimerVersion: v.disclaimerVersion?.trim() || undefined,
          requiresSeekHelpBlock: v.requiresSeekHelpBlock,
          isFeatured: v.isFeatured,
          news: hasNewsFields(news) ? news : undefined,
        } as Parameters<typeof updateMut.mutateAsync>[0]["body"],
      });
      toast(
        t(
          "editContentDialog.toast.updated.message",
          `تم حفظ التعديلات على «${v.title.trim()}».`,
        ).replace("{title}", v.title.trim()),
        {
          title: t("editContentDialog.toast.updated.title"),
          variant: "success",
          durationMs: 4200,
        },
      );
      onOpenChange(false);
    } catch {
      // Surface API errors through the existing mutation error rendering.
    }
  });

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={t("editContentDialog.title")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              onOpenChange(false);
            }
          }}
        >
          <motion.div
            className="relative max-h-[min(94vh,980px)] w-full max-w-[960px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="relative overflow-hidden border-b border-[#EEF2F6] px-8 pb-5 pt-8">
              <div
                className="pointer-events-none absolute inset-0 bg-[#E6F4F3]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[url('/images/bg-status-from-appotiment.png')] bg-cover bg-center opacity-80"
                aria-hidden
              />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
                className="absolute left-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50"
                aria-label={t("editContentDialog.close")}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <div className="relative text-right">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  {t("editContentDialog.title")}
                </h2>
                <p className="mt-1 font-cairo text-[13px] font-semibold text-[#5B7B79]">
                  {t("editContentDialog.subtitle")}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 px-8 py-20 font-cairo text-[13px] font-bold text-[#667085]">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("editContentDialog.loading")}
              </div>
            ) : loadError || !details ? (
              <div className="px-8 py-12">
                <div className="rounded-[12px] border border-[#FECDCA] bg-red-50 px-4 py-3 text-right font-cairo text-[13px] font-bold text-red-600">
                  {t("editContentDialog.loadError")}
                </div>
              </div>
            ) : (
              <form dir={dir} onSubmit={onSubmit}>
                <div className="max-h-[calc(94vh-240px)] overflow-y-auto px-8 py-6">
                  <div className="space-y-6">
                    <section className="space-y-5">
                      <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                        {t("editContentDialog.section.basicInfo")}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AdminFormField label={t("editContentDialog.field.type.label")} required>
                          <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                              <StyledSelect
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                options={typeOptions}
                                placeholder={t("editContentDialog.field.type.placeholder")}
                                listboxAriaLabel={t("editContentDialog.field.type.label")}
                              />
                            )}
                          />
                        </AdminFormField>
                        {typeSwitchSafetyMessage ? (
                          <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2 text-right font-cairo text-[12px] font-bold text-amber-700 sm:col-span-2">
                            {typeSwitchSafetyMessage}
                          </div>
                        ) : null}

                        <AdminFormField
                          label={t("editContentDialog.field.language.label")}
                          required
                          error={errors.language?.message}
                        >
                          <Controller
                            name="language"
                            control={control}
                            render={({ field }) => (
                              <StyledSelect
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                options={[
                                  { value: "ar", label: t("createContentDialog.field.language.ar") },
                                  { value: "en", label: t("createContentDialog.field.language.en") },
                                ]}
                                placeholder={t("editContentDialog.field.language.placeholder")}
                                listboxAriaLabel={t("editContentDialog.field.language.ariaLabel")}
                              />
                            )}
                          />
                        </AdminFormField>
                      </div>

                      <AdminFormField
                        label={
                          selectedType === "SETTINGS_PAGE"
                            ? t("editContentDialog.field.titleAr.label")
                            : t("editContentDialog.field.title.label")
                        }
                        required
                        error={errors.title?.message}
                      >
                        <input
                          {...register("title")}
                          placeholder={t("editContentDialog.field.title.placeholder")}
                          className={adminFieldClass(
                            cn(
                              adminInputClass,
                              "text-start placeholder:text-start",
                            ),
                            Boolean(errors.title),
                          )}
                        />
                      </AdminFormField>

                      {selectedType === "SETTINGS_PAGE" ? (
                        <AdminFormField
                          label={t("editContentDialog.field.titleEn.label")}
                          required
                          error={errors.titleEn?.message}
                        >
                          <input
                            {...register("titleEn")}
                            placeholder="Clear English title"
                            dir="ltr"
                            className={adminFieldClass(
                              cn(
                                adminInputClass,
                                "text-start placeholder:text-start",
                              ),
                              Boolean(errors.titleEn),
                            )}
                          />
                        </AdminFormField>
                      ) : null}

                      <AdminFormField
                        label={t("editContentDialog.field.summary.label")}
                        error={errors.summary?.message}
                      >
                        <textarea
                          {...register("summary")}
                          rows={3}
                          placeholder={t("editContentDialog.field.summary.placeholder")}
                          className={adminFieldClass(
                            cn(
                              adminTextareaClass,
                              "text-start placeholder:text-start",
                            ),
                            Boolean(errors.summary),
                          )}
                        />
                      </AdminFormField>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AdminFormField
                          label={t("editContentDialog.field.slug.label")}
                          error={errors.slug?.message}
                        >
                          <input
                            {...register("slug")}
                            dir="ltr"
                            placeholder="my-article"
                            className={adminFieldClass(
                              cn(adminInputClass),
                              Boolean(errors.slug),
                            )}
                          />
                        </AdminFormField>

                        <AdminFormField
                          label={t("editContentDialog.field.pageVersion.label")}
                          hint={
                            selectedType === "SETTINGS_PAGE"
                              ? t("editContentDialog.field.pageVersion.hintSettings")
                              : t("editContentDialog.field.pageVersion.hintOther")
                          }
                          error={errors.pageVersion?.message}
                        >
                          <input
                            {...register("pageVersion")}
                            dir="ltr"
                            placeholder="v1"
                            className={adminFieldClass(
                              cn(adminInputClass),
                              Boolean(errors.pageVersion),
                            )}
                          />
                        </AdminFormField>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AdminFormField
                          label={t("editContentDialog.field.template.label")}
                          hint={
                            templateParentType
                              ? templateQuery.isLoading
                                ? t("editContentDialog.field.template.hintLoading")
                                : availableTemplates.length > 0
                                  ? t("editContentDialog.field.template.hintSwitchable")
                                  : t("editContentDialog.field.template.hintNone")
                              : t("editContentDialog.field.template.hintUnsupportedType")
                          }
                        >
                          {templateParentType ? (
                            <Controller
                              name="templateId"
                              control={control}
                              render={({ field }) => (
                                <StyledSelect
                                  value={field.value}
                                  onChange={(nextValue) => {
                                    field.onChange(nextValue);
                                    if (!previewDataJson?.trim()) {
                                      setValue("dataJson", "{}", {
                                        shouldDirty: true,
                                      });
                                    }
                                  }}
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  options={templateOptions}
                                  placeholder={
                                    templateQuery.isLoading
                                      ? t("editContentDialog.field.template.placeholderLoading")
                                      : t("editContentDialog.field.template.placeholder")
                                  }
                                  listboxAriaLabel={t("editContentDialog.field.template.label")}
                                />
                              )}
                            />
                          ) : (
                            <input
                              {...register("templateId")}
                              dir="ltr"
                              placeholder="64f0c0000000000000000001"
                              className={adminFieldClass(cn(adminInputClass))}
                            />
                          )}
                        </AdminFormField>

                        <AdminFormField label={t("editContentDialog.field.coverImage.label")}>
                          <input
                            {...register("coverImage")}
                            dir="ltr"
                            placeholder="https://..."
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>
                      </div>
                    </section>

                    <section className="space-y-5 rounded-[14px] border border-[#E4E7EC] bg-[#FCFCFD] p-4">
                      <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                        {t("editContentDialog.section.dynamicAndContent")}
                      </div>

                      {selectedTemplate?.fields?.length ? (
                        <div className="rounded-[14px] border border-[#D8E6E5] bg-white p-4">
                          <div className="mb-4 text-right">
                            <div className="font-cairo text-[14px] font-extrabold text-primary">
                              {t("editContentDialog.templateFields.title")}
                            </div>
                            <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                              {t("editContentDialog.templateFields.description")}
                            </div>
                          </div>

                          <DynamicTemplateFieldRenderer
                            template={selectedTemplate}
                            value={templateDataValue}
                            language={selectedLanguage === "en" ? "en" : "ar"}
                            disabled={submitting}
                            onChange={(nextValue) => {
                              setValue(
                                "dataJson",
                                JSON.stringify(nextValue, null, 2),
                                {
                                  shouldDirty: true,
                                  shouldValidate: false,
                                },
                              );
                              clearErrors("dataJson");
                            }}
                          />
                        </div>
                      ) : null}

                      <AdvancedFieldSection
                        title={t("editContentDialog.field.dataJsonAdvanced.label", "البيانات الديناميكية (JSON متقدم)")}
                        hint={
                          selectedTemplate?.fields?.length
                            ? t("editContentDialog.field.dataJsonAdvanced.hintWithTemplate", "حقل متقدم للتوافق مع بيانات قديمة أو حالات لا تغطيها الحقول المنظمة أعلاه — التعديل هنا يُطبَّق مباشرة.")
                            : t("editContentDialog.field.dataJsonAdvanced.hintNoTemplate", "لا يوجد قالب لهذا المحتوى، لذا هذا هو الحقل الوحيد لتحرير بياناته الديناميكية.")
                        }
                        defaultOpen={!selectedTemplate?.fields?.length}
                        forceOpen={Boolean(errors.dataJson)}
                      >
                        <AdminFormField
                          label="JSON"
                          error={errors.dataJson?.message}
                        >
                          <textarea
                            {...register("dataJson")}
                            dir="ltr"
                            rows={8}
                            placeholder='{"key":"value"}'
                            className={adminFieldClass(
                              cn(adminTextareaClass, "font-mono text-[12px]"),
                              Boolean(errors.dataJson),
                            )}
                          />
                        </AdminFormField>
                      </AdvancedFieldSection>

                      <ContentBlockEditor
                        control={control}
                        register={register}
                        setValue={setValue}
                        clearErrors={clearErrors}
                        // See ContentBlockEditor's prop typing note and
                        // CreateAdminContentDialog: RHF generic variance
                        // prevents static unification here.
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        fieldArray={contentBlocksFieldArray as any}
                        blocks={watchedBlocks}
                        error={errors.contentBlocks}
                        disabled={submitting}
                        description={t("editContentDialog.blockEditor.description")}
                      />
                    </section>

                    <section className="space-y-5 rounded-[14px] border border-[#E4E7EC] bg-white p-4">
                      <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                        {t("editContentDialog.section.classification")}
                      </div>
                      <div className="rounded-[12px] border border-[#E4E7EC] bg-[#FCFCFD] p-3">
                        <div className="mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                          {t("editContentDialog.readiness.title")}
                        </div>
                        <div className="mb-3">
                          <ReleaseAcceptanceSection
                            snapshot={releaseAcceptance}
                            language={selectedLanguage === "en" ? "en" : "ar"}
                            showNextActions
                          />
                        </div>
                        <div className="space-y-2">
                          {governanceChecklist.map((item) => (
                            <div
                              key={item.key}
                              className={cn(
                                "rounded-[10px] px-3 py-2 text-right font-cairo text-[12px] font-bold",
                                item.done
                                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border border-amber-200 bg-amber-50 text-amber-700",
                              )}
                            >
                              {item.done
                                ? t("editContentDialog.readiness.done")
                                : t("editContentDialog.readiness.pending")}
                              : {item.label}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AdminFormField label={t("editContentDialog.field.tags.label")}>
                          <input
                            {...register("tagsInput")}
                            placeholder="tag-1, tag-2"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <AdminFormField label={t("editContentDialog.field.categories.label")}>
                          <input
                            {...register("categoriesInput")}
                            placeholder="category-1, category-2"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <AdminFormField label={t("editContentDialog.field.riskFlags.label")}>
                          <input
                            {...register("riskFlagsInput")}
                            placeholder="flag-1, flag-2"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <AdminFormField label={t("editContentDialog.field.relatedContentIds.label")}>
                          <input
                            {...register("relatedContentIdsInput")}
                            dir="ltr"
                            placeholder="id-1, id-2"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>
                      </div>

                      <div className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFBFC] p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                            {t("editContentDialog.section.sources.title")}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              sourcesFieldArray.append({ title: "", url: "" })
                            }
                            className="inline-flex h-[32px] items-center gap-1.5 rounded-[10px] border border-primary bg-white px-3 font-cairo text-[12px] font-extrabold text-primary transition hover:bg-[#F0FDFA]"
                          >
                            {t("editContentDialog.action.addSource")}
                          </button>
                        </div>
                        {sourcesFieldArray.fields.length === 0 ? (
                          <p className="mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                            {t("editContentDialog.sources.empty")}
                          </p>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {sourcesFieldArray.fields.map((row, index) => (
                              <div key={row.id} className="flex flex-wrap items-end gap-2">
                                <div className="min-w-[160px] flex-1">
                                  <AdminFormField label={t("editContentDialog.field.sourceItemTitle.label")}>
                                    <input
                                      {...register(`sources.${index}.title` as const)}
                                      placeholder={t("editContentDialog.field.sourceItemTitle.placeholder")}
                                      className={adminFieldClass(
                                        cn(adminInputClass, "text-start placeholder:text-start"),
                                        false,
                                      )}
                                    />
                                  </AdminFormField>
                                </div>
                                <div className="min-w-[200px] flex-[2]">
                                  <AdminFormField label={t("editContentDialog.field.sourceItemUrl.label")}>
                                    <input
                                      {...register(`sources.${index}.url` as const)}
                                      dir="ltr"
                                      placeholder="https://example.com"
                                      className={adminFieldClass(cn(adminInputClass), false)}
                                    />
                                  </AdminFormField>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => sourcesFieldArray.remove(index)}
                                  aria-label={t("editContentDialog.action.deleteSource")}
                                  className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[10px] border border-[#FECACA] text-[#EF4444] transition hover:bg-[#FEF2F2]"
                                >
                                  <X className="h-4 w-4" aria-hidden />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AdminFormField label={t("editContentDialog.field.disclaimerVersion.label")}>
                          <input
                            {...register("disclaimerVersion")}
                            placeholder="v1 / 2026-08"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <label className="flex items-center justify-end gap-3 rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-3 font-cairo text-[13px] font-bold text-[#344054]">
                            <span>{t("editContentDialog.field.requiresSeekHelp.label")}</span>
                            <input
                              type="checkbox"
                              {...register("requiresSeekHelpBlock")}
                              className={checkboxClass}
                            />
                          </label>

                          <label className="flex items-center justify-end gap-3 rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-3 font-cairo text-[13px] font-bold text-[#344054]">
                            <span>{t("editContentDialog.field.isFeatured.label")}</span>
                            <input
                              type="checkbox"
                              {...register("isFeatured")}
                              className={checkboxClass}
                            />
                          </label>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-5 rounded-[14px] border border-[#E4E7EC] bg-[#FCFCFD] p-4">
                      <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                        {t("editContentDialog.section.newsData")}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AdminFormField label={t("editContentDialog.field.newsSourceName.label")}>
                          <input
                            {...register("newsSourceName")}
                            placeholder="Reuters"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <AdminFormField label={t("editContentDialog.field.newsSourceUrl.label")}>
                          <input
                            {...register("newsSourceUrl")}
                            dir="ltr"
                            placeholder="https://..."
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <AdminFormField label={t("editContentDialog.field.newsOriginalTitle.label")}>
                          <input
                            {...register("newsOriginalTitle")}
                            placeholder="Original headline"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <AdminFormField label={t("editContentDialog.field.newsPublishedAt.label")}>
                          <input
                            {...register("newsPublishedAt")}
                            dir="ltr"
                            placeholder="2026-08-05T10:00:00.000Z"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <AdminFormField label={t("editContentDialog.field.newsDedupeHash.label")}>
                          <input
                            {...register("newsDedupeHash")}
                            dir="ltr"
                            placeholder="hash"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <AdminFormField label={t("editContentDialog.field.newsImportedAt.label")}>
                          <input
                            {...register("newsImportedAt")}
                            dir="ltr"
                            placeholder="2026-08-05T10:00:00.000Z"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>
                      </div>

                      <AdminFormField label={t("editContentDialog.field.newsAiSummary.label")}>
                        <textarea
                          {...register("newsAiSummary")}
                          rows={4}
                          className={adminFieldClass(
                            cn(
                              adminTextareaClass,
                              "text-start placeholder:text-start",
                            ),
                          )}
                        />
                      </AdminFormField>
                    </section>

                    <section className="space-y-5 rounded-[14px] border border-[#E4E7EC] bg-white p-4">
                      <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                        {t("editContentDialog.section.reviewPreview.title")}
                      </div>
                      <p className="font-cairo text-[12px] font-semibold text-[#667085]">
                        {t("editContentDialog.section.reviewPreview.description")}
                      </p>

                      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        <MedicalContentGovernancePanel
                          contentType={selectedType}
                          status={details.status}
                          disclaimerVersion={previewDisclaimerVersion?.trim() || undefined}
                          requiresSeekHelpBlock={hasSeekHelpCallout(previewBlocks)}
                          isFeatured={previewIsFeatured}
                          riskFlags={previewRiskFlags}
                          tags={previewTags}
                          categories={previewCategories}
                          relatedContentIds={previewRelatedContentIds}
                          sources={previewSources}
                          dynamicData={previewDataResult.value}
                          invalidDynamicData={Boolean(previewDataResult.error)}
                          hasMeaningfulBlocks={
                            selectedType === "SETTINGS_PAGE" ||
                            watchedBlocks.some((block) => isMeaningfulBlock(block))
                          }
                          role={workflowRole}
                          language={selectedLanguage === "en" ? "en" : "ar"}
                          showAcceptanceMatrix={false}
                          news={{
                            sourceName: previewNewsSourceName?.trim() || undefined,
                            sourceUrl: previewNewsSourceUrl?.trim() || undefined,
                            originalTitle: previewNewsOriginalTitle?.trim() || undefined,
                            publishedAt: previewNewsPublishedAt?.trim() || undefined,
                            aiSummary: previewNewsAiSummary?.trim() || undefined,
                          }}
                        />

                        <div className="space-y-3">
                          <MedicalContentPatientPreview
                            title={previewTitle?.trim() || details.title}
                            summary={previewSummary?.trim() || details.summary}
                            coverImage={previewCoverImage?.trim() || details.coverImage}
                            language={selectedLanguage}
                            contentBlocks={previewBlocks}
                            disclaimerVersion={
                              previewDisclaimerVersion?.trim() ||
                              toDisplayText(details.disclaimerVersion)
                            }
                            requiresSeekHelpBlock={previewRequiresSeekHelpBlock}
                            riskFlags={previewRiskFlags}
                            sources={previewSources}
                            newsSourceName={previewNewsSourceName?.trim() || undefined}
                            newsSourceUrl={previewNewsSourceUrl?.trim() || undefined}
                            newsPublishedAt={previewNewsPublishedAt?.trim() || undefined}
                            previewWarnings={previewWarnings}
                          />
                        </div>
                      </div>
                    </section>

                    {updateMut.isError ? (
                      <div className="rounded-[12px] border border-[#FECDCA] bg-red-50 px-4 py-3 text-right font-cairo text-[12px] font-bold text-red-600">
                        {userFacingErrorMessage(
                          updateMut.error,
                          t("editContentDialog.error.updateFailed"),
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-[#EEF2F6] px-8 py-5">
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    disabled={submitting}
                    className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-primary bg-white font-cairo text-[14px] font-extrabold text-primary disabled:opacity-50"
                  >
                    {t("editContentDialog.action.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" aria-hidden />
                    {submitting
                      ? t("editContentDialog.action.saving")
                      : t("editContentDialog.action.save")}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
