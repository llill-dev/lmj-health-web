"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Save, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAdminContentById,
  useUpdateAdminContent,
} from "@/hooks/admin/content/useAdminContent";
import { useAdminContentTemplates } from "@/hooks/admin/content-templates/useAdminContentTemplates";
import ContentBlockEditor from "@/components/admin/medical-content/ContentBlockEditor";
import DynamicTemplateFieldRenderer from "@/components/admin/medical-content/DynamicTemplateFieldRenderer";
import MedicalContentGovernancePanel from "@/components/admin/medical-content/MedicalContentGovernancePanel";
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
  hasNewsFields,
  parseCommaSeparatedList,
  parseJsonInput,
  toDisplayText,
  toPrettyJson,
} from "./medicalContentDialogHelpers";

const formSchema = z
  .object({
    type: z.enum([
      "CONDITION",
      "SYMPTOM",
      "GENERAL_ADVICE",
      "NEWS",
      "MEDICATION",
      "SETTINGS_PAGE",
    ]),
    title: z.string().min(1, "عنوان المحتوى مطلوب"),
    summary: z.string().optional(),
    language: z.enum(["ar", "en"]),
    slug: optionalLatinSlugSchema(),
    pageVersion: z.string().optional(),
    templateId: z.string().optional(),
    coverImage: z.string().optional(),
    dataJson: z.string().optional(),
    contentBlocks: z.array(contentBlockSchema).default([createEmptyBlock()]),
    sourcesJson: z.string().optional(),
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
        message: "إصدار الصفحة مطلوب لصفحات الإعدادات",
      });
    }

    if (
      value.type !== "SETTINGS_PAGE" &&
      !value.contentBlocks.some((block) => isMeaningfulBlock(block))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contentBlocks"],
        message: "أضف على الأقل بلوك محتوى واحدًا فعليًا قبل حفظ التعديلات.",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const typeOptions: { value: AdminContentType; label: string }[] = [
  { value: "CONDITION", label: "الحالات الطبية" },
  { value: "SYMPTOM", label: "الأعراض" },
  { value: "GENERAL_ADVICE", label: "نصائح عامة" },
  { value: "NEWS", label: "الأخبار" },
  { value: "MEDICATION", label: "الأدوية" },
  { value: "SETTINGS_PAGE", label: "صفحات الإعدادات" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string | null;
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

export default function EditAdminContentDialog({
  open,
  onOpenChange,
  contentId,
}: Props) {
  const { toast } = useToast();
  const detailsQuery = useAdminContentById(open ? contentId : null);
  const details = extractMedicalContentDetails(detailsQuery.data);
  const updateMut = useUpdateAdminContent();
  const submitting = updateMut.isPending;

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
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "GENERAL_ADVICE",
      title: "",
      summary: "",
      language: "ar",
      slug: "",
      pageVersion: "",
      templateId: "",
      coverImage: "",
      dataJson: "",
      contentBlocks: [createEmptyBlock()],
      sourcesJson: "[]",
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
  const previewSourcesJson = watch("sourcesJson");
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
  const templateParentType = getTemplateParentType(selectedType);
  const templateQuery = useAdminContentTemplates(
    templateParentType ? { parentType: templateParentType, active: true } : {},
  );
  const contentBlocksFieldArray = useFieldArray({
    control,
    name: "contentBlocks",
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

  const previewDataResult = parseJsonInput(previewDataJson || "", undefined);
  const previewSourcesResult = parseJsonInput(previewSourcesJson || "", []);
  const previewTags = parseCommaSeparatedList(previewTagsInput || "");
  const previewCategories = parseCommaSeparatedList(previewCategoriesInput || "");
  const previewRiskFlags = parseCommaSeparatedList(previewRiskFlagsInput || "");
  const previewRelatedContentIds = parseCommaSeparatedList(
    previewRelatedContentIdsInput || "",
  );
  const previewBlocks = buildContentBlocks(watchedBlocks);
  const previewSources = Array.isArray(previewSourcesResult.value)
    ? previewSourcesResult.value
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const source = item as Record<string, unknown>;
          return {
            title: toDisplayText(source.title),
            url: toDisplayText(source.url),
          };
        })
        .filter((item) => item.title || item.url)
    : [];
  const governanceChecklist = useMemo(
    () => [
      {
        key: "sources",
        label: "إضافة مصدر موثوق واحد على الأقل قبل الإرسال للمراجعة",
        done: selectedType === "SETTINGS_PAGE" || previewSources.length > 0,
      },
      {
        key: "disclaimerVersion",
        label: "تحديد إصدار التنبيه الطبي (Disclaimer Version)",
        done:
          selectedType === "SETTINGS_PAGE" ||
          Boolean(previewDisclaimerVersion?.trim()),
      },
      {
        key: "seekHelp",
        label: "تفعيل Seek Help Block لأن النوع حالة/عرض",
        done:
          (selectedType !== "CONDITION" && selectedType !== "SYMPTOM") ||
          previewRequiresSeekHelpBlock === true,
      },
    ],
    [
      previewDisclaimerVersion,
      previewRequiresSeekHelpBlock,
      previewSources.length,
      selectedType,
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
    const isEnglish = selectedLanguage === "en";

    if (previewDataResult.error) {
      warnings.push(
        isEnglish
          ? "Dynamic data JSON is invalid and will not be reflected accurately."
          : "JSON الخاص بالبيانات الديناميكية غير صالح ولن ينعكس بدقة في المعاينة.",
      );
    }

    if (previewSourcesResult.error) {
      warnings.push(
        isEnglish
          ? "Sources JSON is invalid, so source references may be missing in preview."
          : "JSON الخاص بالمصادر غير صالح، لذلك قد تغيب بعض المراجع من المعاينة.",
      );
    }

    if (selectedType !== "SETTINGS_PAGE" && previewBlocks.length === 0) {
      warnings.push(
        isEnglish
          ? "No meaningful content blocks are currently available."
          : "لا توجد بلوكات محتوى فعليّة متاحة حاليًا.",
      );
    }

    if (selectedType !== "SETTINGS_PAGE" && previewSources.length === 0) {
      warnings.push(
        isEnglish
          ? "No source references are currently attached."
          : "لا توجد مراجع مصادر مرفقة حاليًا.",
      );
    }

    if (selectedType !== "SETTINGS_PAGE" && !previewDisclaimerVersion?.trim()) {
      warnings.push(
        isEnglish
          ? "Disclaimer version is missing."
          : "إصدار التنبيه الطبي غير مضاف.",
      );
    }

    if (
      (selectedType === "CONDITION" || selectedType === "SYMPTOM") &&
      !previewRequiresSeekHelpBlock
    ) {
      warnings.push(
        isEnglish
          ? "Seek Help block requirement is not enabled."
          : "متطلب Seek Help Block غير مفعّل.",
      );
    }

    if (
      selectedType === "NEWS" &&
      (!previewNewsSourceUrl?.trim() || !previewNewsPublishedAt?.trim())
    ) {
      warnings.push(
        isEnglish
          ? "News source URL and publish date should be completed."
          : "يجب استكمال رابط مصدر الخبر وتاريخ النشر.",
      );
    }

    return warnings;
  }, [
    previewBlocks.length,
    previewDataResult.error,
    previewDisclaimerVersion,
    previewNewsPublishedAt,
    previewNewsSourceUrl,
    previewRequiresSeekHelpBlock,
    previewSources.length,
    previewSourcesResult.error,
    selectedLanguage,
    selectedType,
  ]);

  useEffect(() => {
    if (!open || !details) return;

    const lang = normalizeItemLanguage(details.language);
    const news = details.news ?? null;

    reset({
      type: details.type ?? "GENERAL_ADVICE",
      title: toDisplayText(details.title),
      summary: toDisplayText(details.summary),
      language: lang === "en" ? "en" : "ar",
      slug: toDisplayText(details.slug),
      pageVersion: toDisplayText(details.pageVersion),
      templateId: toDisplayText(details.templateId),
      coverImage: toDisplayText(details.coverImage),
      dataJson: toPrettyJson(details.dataValue),
      contentBlocks: normalizeContentBlocksForForm(details.contentBlocks),
      sourcesJson: toPrettyJson(details.sources, "[]"),
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
  }, [open, details, reset]);

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

    clearErrors(["dataJson", "contentBlocks", "sourcesJson"]);

    const dataResult = parseJsonInput(v.dataJson || "", undefined);
    const sourcesResult = parseJsonInput(v.sourcesJson || "", []);

    if (dataResult.error) {
      setError("dataJson", { message: dataResult.error });
      return;
    }
    if (sourcesResult.error) {
      setError("sourcesJson", { message: sourcesResult.error });
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
        message: templateIssues[0]?.message || "تحقق من بيانات القالب.",
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
          title: v.title.trim(),
          summary: v.summary?.trim() || undefined,
          language: v.language,
          slug: v.slug?.trim() || undefined,
          pageVersion: v.pageVersion?.trim() || undefined,
          templateId: v.templateId?.trim() || undefined,
          coverImage: v.coverImage?.trim() || undefined,
          data: dataResult.value,
          contentBlocks: buildContentBlocks(v.contentBlocks),
          sources: sourcesResult.value,
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
      toast(`تم حفظ التعديلات على «${v.title.trim()}».`, {
        title: "تم تحديث المحتوى",
        variant: "success",
        durationMs: 4200,
      });
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
          aria-label="تعديل المحتوى الطبي"
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
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <div className="relative text-right">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  تعديل المحتوى الطبي
                </h2>
                <p className="mt-1 font-cairo text-[13px] font-semibold text-[#5B7B79]">
                  حدّث البيانات الأساسية، والحقول الديناميكية، ومحتوى المقال من
                  نفس النافذة.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 px-8 py-20 font-cairo text-[13px] font-bold text-[#667085]">
                <Loader2 className="h-4 w-4 animate-spin" />
                جارٍ تحميل بيانات المحتوى...
              </div>
            ) : loadError || !details ? (
              <div className="px-8 py-12">
                <div className="rounded-[12px] border border-[#FECDCA] bg-red-50 px-4 py-3 text-right font-cairo text-[13px] font-bold text-red-600">
                  تعذر تحميل بيانات المحتوى للتعديل.
                </div>
              </div>
            ) : (
              <form dir="rtl" onSubmit={onSubmit}>
                <div className="max-h-[calc(94vh-240px)] overflow-y-auto px-8 py-6">
                  <div className="space-y-6">
                    <section className="space-y-5">
                      <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                        البيانات الأساسية
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AdminFormField label="نوع المحتوى" required>
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
                                placeholder="اختر نوع المحتوى"
                                listboxAriaLabel="نوع المحتوى"
                              />
                            )}
                          />
                        </AdminFormField>

                        <AdminFormField
                          label="اللغة"
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
                                  { value: "ar", label: "العربية" },
                                  { value: "en", label: "English" },
                                ]}
                                placeholder="اختر اللغة"
                                listboxAriaLabel="لغة المحتوى"
                              />
                            )}
                          />
                        </AdminFormField>
                      </div>

                      <AdminFormField
                        label="العنوان"
                        required
                        error={errors.title?.message}
                      >
                        <input
                          {...register("title")}
                          placeholder="عنوان واضح للمحتوى"
                          className={adminFieldClass(
                            cn(
                              adminInputClass,
                              "text-start placeholder:text-start",
                            ),
                            Boolean(errors.title),
                          )}
                        />
                      </AdminFormField>

                      <AdminFormField
                        label="ملخص"
                        error={errors.summary?.message}
                      >
                        <textarea
                          {...register("summary")}
                          rows={3}
                          placeholder="مقدمة قصيرة تصف المحتوى…"
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
                          label="Slug (اختياري)"
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
                          label="إصدار الصفحة (اختياري)"
                          hint={
                            selectedType === "SETTINGS_PAGE"
                              ? "مطلوب لصفحات الإعدادات (SETTINGS_PAGE)."
                              : "استخدمه عند الحاجة، ويصبح مطلوبًا مع SETTINGS_PAGE."
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
                          label="القالب"
                          hint={
                            templateParentType
                              ? templateQuery.isLoading
                                ? "جارٍ تحميل القوالب المتاحة…"
                                : availableTemplates.length > 0
                                  ? "يمكنك تبديل القالب عند الحاجة، وسيتم تحديث الحقول الديناميكية أدناه."
                                  : "لا توجد قوالب نشطة لهذا النوع حالياً."
                              : "هذا النوع لا يستخدم قوالب ديناميكية حالياً."
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
                                  options={availableTemplates.map((template) => ({
                                    value: template._id,
                                    label: template.name || template.slug || template._id,
                                  }))}
                                  placeholder={
                                    templateQuery.isLoading
                                      ? "جارٍ تحميل القوالب..."
                                      : "اختر قالبًا"
                                  }
                                  listboxAriaLabel="القالب"
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

                        <AdminFormField label="رابط صورة الغلاف">
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
                        الحقول الديناميكية ومحتوى المقال
                      </div>

                      {selectedTemplate?.fields?.length ? (
                        <div className="rounded-[14px] border border-[#D8E6E5] bg-white p-4">
                          <div className="mb-4 text-right">
                            <div className="font-cairo text-[14px] font-extrabold text-primary">
                              القالب المختار والبيانات المنظمة
                            </div>
                            <div className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                              هذا المحرر يعكس الحقول المعروفة في القالب، بينما يبقى
                              JSON الخام متاحًا كخيار احتياطي أدناه.
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

                      <AdminFormField
                        label="البيانات الديناميكية (JSON متقدم)"
                        hint={
                          selectedTemplate?.fields?.length
                            ? "حقل متقدم للتوافق مع بيانات قديمة أو حالات لا تغطيها الحقول المنظمة."
                            : "مثال: structured template data القادمة من القالب."
                        }
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

                      <ContentBlockEditor
                        control={control}
                        register={register}
                        setValue={setValue}
                        clearErrors={clearErrors}
                        fieldArray={contentBlocksFieldArray}
                        blocks={watchedBlocks}
                        error={errors.contentBlocks}
                        disabled={submitting}
                        description="حدّث ترتيب البلوكات ومحتوى المقال من هنا مع إبقاء البيانات الديناميكية منفصلة."
                      />
                    </section>

                    <section className="space-y-5 rounded-[14px] border border-[#E4E7EC] bg-white p-4">
                      <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                        التصنيف والحوكمة
                      </div>
                      <div className="rounded-[12px] border border-[#E4E7EC] bg-[#FCFCFD] p-3">
                        <div className="mb-2 font-cairo text-[12px] font-extrabold text-[#111827]">
                          متطلبات الجاهزية قبل المراجعة
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
                              {item.done ? "مكتمل" : "بحاجة لاستكمال"}: {item.label}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AdminFormField label="الوسوم">
                          <input
                            {...register("tagsInput")}
                            placeholder="tag-1, tag-2"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <AdminFormField label="الفئات">
                          <input
                            {...register("categoriesInput")}
                            placeholder="category-1, category-2"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <AdminFormField label="Risk Flags">
                          <input
                            {...register("riskFlagsInput")}
                            placeholder="flag-1, flag-2"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <AdminFormField label="Related Content IDs">
                          <input
                            {...register("relatedContentIdsInput")}
                            dir="ltr"
                            placeholder="id-1, id-2"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>
                      </div>

                      <AdminFormField
                        label="المصادر (JSON متقدم)"
                        hint='مثال: [{"title":"WHO","url":"https://..."}]'
                        error={errors.sourcesJson?.message}
                      >
                        <textarea
                          {...register("sourcesJson")}
                          dir="ltr"
                          rows={6}
                          className={adminFieldClass(
                            cn(adminTextareaClass, "font-mono text-[12px]"),
                            Boolean(errors.sourcesJson),
                          )}
                        />
                      </AdminFormField>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AdminFormField label="إصدار التنبيه">
                          <input
                            {...register("disclaimerVersion")}
                            placeholder="v1 / 2026-08"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <label className="flex items-center justify-end gap-3 rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-3 font-cairo text-[13px] font-bold text-[#344054]">
                            <span>يتطلب Seek Help Block</span>
                            <input
                              type="checkbox"
                              {...register("requiresSeekHelpBlock")}
                              className={checkboxClass}
                            />
                          </label>

                          <label className="flex items-center justify-end gap-3 rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-3 font-cairo text-[13px] font-bold text-[#344054]">
                            <span>محتوى مميز</span>
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
                        بيانات الخبر
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AdminFormField label="اسم المصدر">
                          <input
                            {...register("newsSourceName")}
                            placeholder="Reuters"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <AdminFormField label="رابط المصدر">
                          <input
                            {...register("newsSourceUrl")}
                            dir="ltr"
                            placeholder="https://..."
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <AdminFormField label="العنوان الأصلي">
                          <input
                            {...register("newsOriginalTitle")}
                            placeholder="Original headline"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <AdminFormField label="تاريخ النشر الأصلي">
                          <input
                            {...register("newsPublishedAt")}
                            dir="ltr"
                            placeholder="2026-08-05T10:00:00.000Z"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <AdminFormField label="Dedupe Hash">
                          <input
                            {...register("newsDedupeHash")}
                            dir="ltr"
                            placeholder="hash"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>

                        <AdminFormField label="Imported At">
                          <input
                            {...register("newsImportedAt")}
                            dir="ltr"
                            placeholder="2026-08-05T10:00:00.000Z"
                            className={adminFieldClass(cn(adminInputClass))}
                          />
                        </AdminFormField>
                      </div>

                      <AdminFormField label="AI Summary">
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
                        مراجعة الحوكمة والمعاينة
                      </div>
                      <p className="font-cairo text-[12px] font-semibold text-[#667085]">
                        هذه المعاينة تساعد على التأكد من وضوح المصادر وعناصر السلامة
                        وشكل العرض قبل الحفظ.
                      </p>

                      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        <MedicalContentGovernancePanel
                          contentType={selectedType}
                          disclaimerVersion={previewDisclaimerVersion?.trim() || undefined}
                          requiresSeekHelpBlock={previewRequiresSeekHelpBlock}
                          isFeatured={previewIsFeatured}
                          riskFlags={previewRiskFlags}
                          tags={previewTags}
                          categories={previewCategories}
                          relatedContentIds={previewRelatedContentIds}
                          sources={previewSources}
                          dynamicData={previewDataResult.value}
                          invalidDynamicData={Boolean(previewDataResult.error)}
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
                          "تعذر التعديل",
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
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" aria-hidden />
                    {submitting ? "جارٍ الحفظ…" : "حفظ التعديلات"}
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
