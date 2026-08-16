"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Save, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type Path,
  type Resolver,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAdminContent } from "@/hooks/admin/content/useAdminContent";
import { useAdminContentTemplates } from "@/hooks/admin/content-templates/useAdminContentTemplates";
import {
  extractFieldValidationErrors,
  userFacingErrorMessage,
} from "@/lib/admin/userFacingError";
import { useToast } from "@/components/ui/ToastProvider";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/form-field";
import StyledSelect from "@/components/ui/styled-select";
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
} from "@/components/admin/medical-content/contentBlockEditor.helpers";
import {
  collectTemplateFieldValidationIssues,
  getTemplateParentType,
} from "@/components/admin/medical-content/dynamicTemplateFieldRenderer.helpers";
import { cn } from "@/lib/utils/utils";
import { optionalLatinSlugSchema } from "@/lib/forms/slugValidation";
import type {
  AdminContentDetailsItem,
  AdminContentTemplate,
  AdminContentType,
} from "@/lib/admin/types";
import {
  getNewsDraftGuidanceMessages,
  getNewsTypeSwitchSafetyMessage,
  getReviewReadinessIssueCodes,
  getReviewReadinessIssueMessage,
  hasSeekHelpCallout,
  parseCommaSeparatedList,
  toDisplayText,
} from "./medicalContentDialogHelpers";
import { useI18n } from "@/i18n/provider";

function normalizeTemplateData(
  data: Record<string, unknown> | undefined,
  template: AdminContentTemplate | undefined,
) {
  if (!template?.fields?.length || !data) return undefined;

  const normalized = template.fields.reduce<Record<string, unknown>>(
    (acc, field) => {
      const raw = data[field.key];

      if (raw === undefined || raw === null) return acc;
      if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (!trimmed) return acc;
        acc[field.key] = trimmed;
        return acc;
      }

      if (typeof raw === "number" && Number.isNaN(raw)) return acc;

      acc[field.key] = raw;
      return acc;
    },
    {},
  );

  return Object.keys(normalized).length ? normalized : undefined;
}

function getPathErrorMessage(value: unknown, path: string): string | undefined {
  const segments = path.split(".");
  let current: unknown = value;

  for (const segment of segments) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segment];
  }

  if (
    current &&
    typeof current === "object" &&
    "message" in (current as Record<string, unknown>)
  ) {
    const message = (current as { message?: unknown }).message;
    return typeof message === "string" ? message : undefined;
  }

  return undefined;
}

function isValidNewsSourceUrl(value: string): boolean {
  const trimmed = normalizeNewsSourceUrl(value);
  if (!trimmed) return false;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;

    const hostname = url.hostname.trim().toLowerCase();
    if (!hostname) return false;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.endsWith(".local")
    ) {
      return false;
    }

    if (typeof window !== "undefined") {
      const currentOrigin = window.location.origin.toLowerCase();
      if (url.origin.toLowerCase() === currentOrigin) return false;
    }

    return true;
  } catch {
    return false;
  }
}

function normalizeNewsSourceUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    const hostname = url.hostname.trim().toLowerCase();
    const isGoogleRedirect =
      hostname.includes("google.") &&
      (url.pathname === "/url" || url.pathname.endsWith("/url"));

    if (isGoogleRedirect) {
      const redirected =
        url.searchParams.get("url")?.trim() ||
        url.searchParams.get("q")?.trim() ||
        "";
      if (redirected) return redirected;
    }

    return url.toString();
  } catch {
    return trimmed;
  }
}

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
      title: z.string().min(1, t("createContentDialog.validation.titleRequired")),
      /** English title — required only for SETTINGS_PAGE (sent as `{ ar, en }`). */
      titleEn: z.string().optional(),
      summary: z.string().optional(),
      language: z.enum(["ar", "en"]),
      slug: optionalLatinSlugSchema(),
      sourceTitle: z.string().optional(),
      originalTitle: z.string().optional(),
      sourceUrl: z
        .string()
        .optional()
        .refine((value) => {
          if (!value?.trim()) return true;
          return isValidNewsSourceUrl(value);
        }, t("createContentDialog.validation.sourceUrlInvalid")),
      publishedAt: z.string().optional(),
      pageVersion: z.string().optional(),
      coverImage: z.string().optional(),
      templateId: z.string().optional(),
      templateData: z.record(z.string(), z.unknown()).default({}),
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
    })
    .superRefine((value, ctx) => {
      if (
        value.type === "SETTINGS_PAGE" &&
        (!value.pageVersion || !value.pageVersion.trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["pageVersion"],
          message: t("createContentDialog.validation.pageVersionRequired"),
        });
      }

      if (
        value.type === "SETTINGS_PAGE" &&
        (!value.titleEn || !value.titleEn.trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["titleEn"],
          message: t("createContentDialog.validation.titleEnRequired"),
        });
      }

      if (
        value.type !== "SETTINGS_PAGE" &&
        !value.contentBlocks.some((block) => isMeaningfulBlock(block))
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["contentBlocks"],
          message: t("createContentDialog.validation.blocksRequired"),
        });
      }
    });
}

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

/**
 * Maps a server-reported 422 field path (e.g. "title", "news.sourceUrl",
 * "sources[0].url") to this dialog's matching react-hook-form path, so a
 * backend validation error attaches to the exact input instead of only
 * appearing in the generic error summary at the bottom of the form.
 * Field-path list per docs/API.md's POST /api/admin/content validation.
 */
function mapServerFieldToFormPath(field: string): Path<FormValues> | null {
  const normalized = field.replace(/\[(\d+)\]/g, ".$1");

  const direct: Partial<Record<string, Path<FormValues>>> = {
    type: "type",
    title: "title",
    language: "language",
    slug: "slug",
    summary: "summary",
    coverImage: "coverImage",
    pageVersion: "pageVersion",
    templateId: "templateId",
    data: "templateData",
    contentBlocks: "contentBlocks",
    tags: "tagsInput",
    categories: "categoriesInput",
    riskFlags: "riskFlagsInput",
    relatedContentIds: "relatedContentIdsInput",
    isFeatured: "isFeatured",
    disclaimerVersion: "disclaimerVersion",
    requiresSeekHelpBlock: "requiresSeekHelpBlock",
    sources: "sources",
    "news.sourceName": "sourceTitle",
    "news.sourceUrl": "sourceUrl",
    "news.originalTitle": "originalTitle",
    "news.publishedAt": "publishedAt",
  };
  if (direct[normalized]) return direct[normalized] ?? null;

  if (normalized.startsWith("relatedContentIds.")) return "relatedContentIdsInput";

  const dataMatch = normalized.match(/^data\.(.+)$/);
  if (dataMatch) return `templateData.${dataMatch[1]}` as Path<FormValues>;

  const sourceMatch = normalized.match(/^sources\.(\d+)\.(title|url)$/);
  if (sourceMatch) {
    return `sources.${sourceMatch[1]}.${sourceMatch[2]}` as Path<FormValues>;
  }

  if (normalized.startsWith("sources")) return "sources";
  if (normalized.startsWith("contentBlocks")) return "contentBlocks";
  if (normalized.startsWith("news")) return "sourceUrl";

  return null;
}

/**
 * Focuses (and scrolls to) the input matching a form path, so the admin
 * lands directly on the field a server-reported 422 error was attached to
 * instead of only seeing a message somewhere in a long form. Tries RHF's
 * own `setFocus` first (works for `register`/`Controller`-registered
 * fields); falls back to a plain DOM query by `name` for fields whose
 * focusable element isn't the one RHF registered (e.g. a custom listbox
 * trigger button carrying `name` but not the RHF ref).
 */
function focusFieldByPath(
  formPath: string,
  setFocus: (path: Path<FormValues>) => void,
): void {
  requestAnimationFrame(() => {
    try {
      setFocus(formPath as Path<FormValues>);
    } catch {
      // Some paths (array-root fields like "sources"/"contentBlocks")
      // aren't directly registered — fall through to the DOM fallback.
    }
    const el = document.querySelector<HTMLElement>(`[name="${formPath}"]`);
    el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    el?.focus();
  });
}

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

const EMPTY_FORM: FormValues = {
  type: "GENERAL_ADVICE",
  title: "",
  titleEn: "",
  summary: "",
  language: "ar",
  slug: "",
  sourceTitle: "",
  originalTitle: "",
  sourceUrl: "",
  publishedAt: "",
  pageVersion: "",
  coverImage: "",
  templateId: "",
  templateData: {},
  contentBlocks: [createEmptyBlock()],
  sources: [],
  tagsInput: "",
  categoriesInput: "",
  riskFlagsInput: "",
  relatedContentIdsInput: "",
  disclaimerVersion: "",
  requiresSeekHelpBlock: false,
  isFeatured: false,
};

const checkboxClass =
  "h-4 w-4 rounded border border-[#D0D5DD] text-primary focus:ring-primary/30";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** OpenAPI workflow actor for acceptance next-actions. */
  workflowRole?: WorkflowActorRole;
};

export default function CreateAdminContentDialog({
  open,
  onOpenChange,
  workflowRole = "admin",
}: Props) {
  const { dir, t } = useI18n();
  const { toast } = useToast();
  const createMut = useCreateAdminContent();
  const submitting = createMut.isPending;
  const formSchema = useMemo(() => buildFormSchema(t), [t]);
  const typeOptions = useMemo(() => getTypeOptions(t), [t]);
  const {
    register,
    handleSubmit,
    control,
    setError,
    setFocus,
    clearErrors,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // zodResolver's inferred Resolver type diverges from `FormValues` because
    // zod's `.default()` fields make the *input* type optional while
    // `z.infer` (the output/parsed type) requires them — a known
    // zodResolver v5 + zod v4 typing friction, not a real runtime mismatch.
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: EMPTY_FORM,
  });
  const contentBlocksFieldArray = useFieldArray({
    control,
    name: "contentBlocks",
  });
  const sourcesFieldArray = useFieldArray({
    control,
    name: "sources",
  });

  const selectedType = watch("type");
  const watchedTitle = watch("title");
  const watchedSummary = watch("summary");
  const selectedLanguage = watch("language");
  const selectedTemplateId = watch("templateId");
  const watchedBlocks = watch("contentBlocks") ?? [];
  const watchedTemplateData = watch("templateData") ?? {};
  const watchedCoverImage = watch("coverImage");
  const watchedSources = watch("sources") ?? [];
  const watchedTagsInput = watch("tagsInput");
  const watchedCategoriesInput = watch("categoriesInput");
  const watchedRiskFlagsInput = watch("riskFlagsInput");
  const watchedRelatedContentIdsInput = watch("relatedContentIdsInput");
  const watchedDisclaimerVersion = watch("disclaimerVersion");
  const watchedRequiresSeekHelpBlock = watch("requiresSeekHelpBlock");
  const watchedIsFeatured = watch("isFeatured");
  const watchedSourceUrl = watch("sourceUrl");
  const watchedSourceTitle = watch("sourceTitle");
  const watchedOriginalTitle = watch("originalTitle");
  const watchedPublishedAt = watch("publishedAt");
  const previousTypeRef = useRef<AdminContentType | undefined>(undefined);
  const [typeSwitchSafetyMessage, setTypeSwitchSafetyMessage] = useState<string | null>(
    null,
  );
  const templateParentType = getTemplateParentType(selectedType);
  const templateQuery = useAdminContentTemplates(
    templateParentType ? { parentType: templateParentType, active: true } : {},
  );

  const availableTemplates = useMemo(
    () =>
      (templateQuery.templates ?? []).filter(
        (template) =>
          (template.isActive ?? template.active ?? true) &&
          template.parentType === templateParentType,
      ),
    [templateParentType, templateQuery.templates],
  );

  const selectedTemplate = useMemo(
    () =>
      availableTemplates.find((template) => template._id === selectedTemplateId),
    [availableTemplates, selectedTemplateId],
  );

  const previewBlocks = buildContentBlocks(watchedBlocks);
  const previewSources = watchedSources
    .map((source) => ({
      title: (source.title ?? "").trim(),
      url: (source.url ?? "").trim(),
    }))
    .filter((item) => item.title || item.url);
  const previewTags = parseCommaSeparatedList(watchedTagsInput || "");
  const previewCategories = parseCommaSeparatedList(watchedCategoriesInput || "");
  const previewRiskFlags = parseCommaSeparatedList(watchedRiskFlagsInput || "");
  const previewRelatedContentIds = parseCommaSeparatedList(
    watchedRelatedContentIdsInput || "",
  );

  const reviewReadinessIssues = useMemo(() => {
    const draftReadinessItem = {
      type: selectedType,
      disclaimerVersion: watchedDisclaimerVersion,
      requiresSeekHelpBlock: watchedRequiresSeekHelpBlock,
      sources: previewSources,
      contentBlocks: previewBlocks,
    } as AdminContentDetailsItem;
    return getReviewReadinessIssueCodes(draftReadinessItem);
  }, [
    previewBlocks,
    previewSources,
    selectedType,
    watchedDisclaimerVersion,
    watchedRequiresSeekHelpBlock,
  ]);
  const reviewReadinessIssueSet = useMemo(
    () => new Set(reviewReadinessIssues),
    [reviewReadinessIssues],
  );

  const previewWarnings = useMemo(() => {
    const warnings = reviewReadinessIssues.map((code) =>
      getReviewReadinessIssueMessage(code, selectedLanguage),
    );

    warnings.push(
      ...getNewsDraftGuidanceMessages({
        isNewsType: selectedType === "NEWS",
        language: selectedLanguage,
        sourceUrl: watchedSourceUrl,
        publishedAt: watchedPublishedAt,
        title: watchedTitle,
        summary: watchedSummary,
      }),
    );

    return warnings;
  }, [
    reviewReadinessIssues,
    selectedLanguage,
    selectedType,
    watchedPublishedAt,
    watchedSourceUrl,
    watchedSummary,
    watchedTitle,
  ]);

  const readinessItems = useMemo(() => {
    const items = [
      {
        key: "contentBlocks",
        label: t("createContentDialog.readiness.contentBlocks"),
        done:
          selectedType === "SETTINGS_PAGE" ||
          watchedBlocks.some((block) => isMeaningfulBlock(block)),
      },
      {
        key: "sources",
        label: t("createContentDialog.readiness.sources"),
        done:
          selectedType === "SETTINGS_PAGE" ||
          !reviewReadinessIssueSet.has("sources_required"),
      },
      {
        key: "disclaimerVersion",
        label: t("createContentDialog.readiness.disclaimerVersion"),
        done:
          selectedType === "SETTINGS_PAGE" ||
          !reviewReadinessIssueSet.has("disclaimer_required"),
      },
      {
        key: "seekHelp",
        label: t("createContentDialog.readiness.seekHelp"),
        done: !reviewReadinessIssueSet.has("seek_help_required"),
      },
      {
        key: "newsMetadata",
        label: t("createContentDialog.readiness.newsMetadata"),
        done:
          selectedType !== "NEWS" ||
          Boolean(watchedSourceUrl?.trim() && watchedPublishedAt?.trim()),
      },
      {
        key: "template",
        label: t("createContentDialog.readiness.template"),
        done:
          !templateParentType ||
          availableTemplates.length === 0 ||
          Boolean(selectedTemplateId?.trim()),
      },
    ];

    if (selectedTemplate?.fields?.some((field) => field.required)) {
      items.push({
        key: "templateFields",
        label: t("createContentDialog.readiness.templateFields"),
        done:
          collectTemplateFieldValidationIssues(
            selectedTemplate,
            watchedTemplateData,
            selectedLanguage,
          ).every((issue) => issue.code !== "required"),
      });
    }

    return items;
  }, [
    availableTemplates.length,
    reviewReadinessIssueSet,
    selectedTemplate,
    selectedLanguage,
    selectedTemplateId,
    selectedType,
    t,
    templateParentType,
    watchedBlocks,
    watchedPublishedAt,
    watchedSourceUrl,
    watchedTemplateData,
  ]);

  const releaseAcceptance = useMemo(
    () =>
      buildReleaseAcceptanceSnapshot({
        type: selectedType,
        status: "DRAFT",
        sourceCount: previewSources.length,
        disclaimerVersion: watchedDisclaimerVersion,
        hasSeekHelpCallout: hasSeekHelpCallout(previewBlocks),
        hasMeaningfulBlocks:
          selectedType === "SETTINGS_PAGE" ||
          watchedBlocks.some((block) => isMeaningfulBlock(block)),
        newsSourceUrl: watchedSourceUrl,
        newsPublishedAt: watchedPublishedAt,
        role: workflowRole,
      }),
    [
      previewBlocks,
      previewSources.length,
      selectedType,
      watchedBlocks,
      watchedDisclaimerVersion,
      watchedPublishedAt,
      watchedSourceUrl,
      workflowRole,
    ],
  );

  useEffect(() => {
    if (!open) {
      reset(EMPTY_FORM);
      createMut.reset();
      previousTypeRef.current = undefined;
      setTypeSwitchSafetyMessage(null);
    }
    // `createMut` is intentionally excluded: `useMutation` returns a new
    // object identity on every state change, and `createMut.reset()` itself
    // triggers one — including it here re-fires this effect in a loop
    // ("Maximum update depth exceeded").
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reset]);

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

  useEffect(() => {
    if (!templateParentType) {
      setValue("templateId", "");
      setValue("templateData", {});
      clearErrors(["templateId", "templateData"]);
      return;
    }

    if (
      selectedTemplateId &&
      !availableTemplates.some((template) => template._id === selectedTemplateId)
    ) {
      setValue("templateId", "");
      setValue("templateData", {});
    }
  }, [
    availableTemplates,
    clearErrors,
    selectedTemplateId,
    setValue,
    templateParentType,
  ]);

  const onSubmit = handleSubmit(async (v) => {
    try {
      if (templateParentType && availableTemplates.length > 0 && !v.templateId?.trim()) {
        setError("templateId", {
          type: "custom",
          message: t("createContentDialog.validation.templateRequired"),
        });
        return;
      }

      clearErrors("templateData");
      const templateValidationIssues = collectTemplateFieldValidationIssues(
        selectedTemplate,
        v.templateData,
        v.language,
      );

      let hasTemplateErrors = false;
      templateValidationIssues.forEach((issue) => {
        hasTemplateErrors = true;
        setError(`templateData.${issue.path}` as const, {
          type: "custom",
          message: issue.message,
        });
      });

      if (hasTemplateErrors) return;

      const normalizedSourceUrl =
        v.type === "NEWS" ? normalizeNewsSourceUrl(v.sourceUrl ?? "") : "";
      const normalizedContentBlocks = buildContentBlocks(v.contentBlocks);
      const normalizedTemplateData = normalizeTemplateData(
        v.templateData,
        selectedTemplate,
      );
      const parsedSources = v.sources
        .map((source) => ({
          title: source.title.trim() || undefined,
          url: source.url.trim() || undefined,
        }))
        .filter((item) => item.title || item.url);
      const newsSource = normalizedSourceUrl
        ? {
            title: v.sourceTitle?.trim() || v.title.trim(),
            url: normalizedSourceUrl,
          }
        : null;
      const normalizedSources = newsSource
        ? [
            ...parsedSources.filter(
              (item) => item.url !== newsSource.url || item.title !== newsSource.title,
            ),
            newsSource,
          ]
        : parsedSources;

      await createMut.mutateAsync({
        type: v.type,
        title:
          v.type === "SETTINGS_PAGE"
            ? { ar: v.title.trim(), en: v.titleEn?.trim() || "" }
            : v.title.trim(),
        summary: v.summary?.trim() || undefined,
        language: v.language,
        slug: v.slug?.trim() || undefined,
        coverImage: v.coverImage?.trim() || undefined,
        pageVersion: v.pageVersion?.trim() || undefined,
        templateId: v.templateId?.trim() || undefined,
        data: normalizedTemplateData,
        contentBlocks: normalizedContentBlocks,
        tags: parseCommaSeparatedList(v.tagsInput || ""),
        categories: parseCommaSeparatedList(v.categoriesInput || ""),
        riskFlags: parseCommaSeparatedList(v.riskFlagsInput || ""),
        relatedContentIds: parseCommaSeparatedList(v.relatedContentIdsInput || ""),
        disclaimerVersion: v.disclaimerVersion?.trim() || undefined,
        requiresSeekHelpBlock: v.requiresSeekHelpBlock,
        isFeatured: v.isFeatured,
        sources: normalizedSources,
        news:
          v.type === "NEWS"
            ? {
                sourceName: v.sourceTitle?.trim() || v.title.trim(),
                sourceUrl: normalizedSourceUrl || undefined,
                originalTitle: v.originalTitle?.trim() || v.title.trim(),
                publishedAt: v.publishedAt?.trim() || undefined,
              }
            : undefined,
      });

      toast(
        t(
          "createContentDialog.toast.created.message",
          `أُضيفت مسودة «${v.title.trim()}» إلى المحتوى الطبي.`,
        ).replace("{title}", v.title.trim()),
        {
          title: t("createContentDialog.toast.created.title"),
          variant: "success",
          durationMs: 4200,
        },
      );
      onOpenChange(false);
    } catch (submitError) {
      // Attach server-reported field-path errors to their matching input,
      // in addition to the generic summary rendered from createMut.isError,
      // and focus the first offending field so the admin lands on it
      // directly instead of having to hunt for it in a long form.
      let firstFormPath: Path<FormValues> | null = null;
      extractFieldValidationErrors(submitError).forEach(({ field, message }) => {
        const formPath = field ? mapServerFieldToFormPath(field) : null;
        if (formPath) {
          setError(formPath, { type: "server", message });
          firstFormPath ??= formPath;
        }
      });
      if (firstFormPath) focusFieldByPath(firstFormPath, setFocus);
    }
  });

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/45 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={t("createContentDialog.title")}
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
            className="relative max-h-[min(92vh,860px)] w-full max-w-[720px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
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
                aria-label={t("createContentDialog.close")}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <div className="relative text-right">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  {t("createContentDialog.title")}
                </h2>
                <p className="mt-1 font-cairo text-[13px] font-semibold text-[#5B7B79]">
                  {t("createContentDialog.subtitle")}
                </p>
              </div>
            </div>

            <form dir={dir} onSubmit={onSubmit}>
              <div className="max-h-[calc(92vh-240px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                  <AdminFormField label={t("createContentDialog.field.type.label")} required>
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
                          placeholder={t("createContentDialog.field.type.placeholder")}
                          listboxAriaLabel={t("createContentDialog.field.type.label")}
                        />
                      )}
                    />
                  </AdminFormField>
                  {typeSwitchSafetyMessage ? (
                    <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2 text-right font-cairo text-[12px] font-bold text-amber-700">
                      {typeSwitchSafetyMessage}
                    </div>
                  ) : null}

                  <AdminFormField
                    label={
                      selectedType === "SETTINGS_PAGE"
                        ? t("createContentDialog.field.titleAr.label")
                        : t("createContentDialog.field.title.label")
                    }
                    required
                    error={errors.title?.message}
                  >
                    <input
                      {...register("title")}
                      placeholder={t("createContentDialog.field.title.placeholder")}
                      className={adminFieldClass(
                        cn(adminInputClass, "text-start placeholder:text-start"),
                        Boolean(errors.title),
                      )}
                    />
                  </AdminFormField>

                  {selectedType === "SETTINGS_PAGE" ? (
                    <AdminFormField
                      label={t("createContentDialog.field.titleEn.label")}
                      required
                      error={errors.titleEn?.message}
                    >
                      <input
                        {...register("titleEn")}
                        placeholder={t("createContentDialog.field.titleEn.placeholder")}
                        dir="ltr"
                        className={adminFieldClass(
                          cn(adminInputClass, "text-start placeholder:text-start"),
                          Boolean(errors.titleEn),
                        )}
                      />
                    </AdminFormField>
                  ) : null}

                  <AdminFormField
                    label={t("createContentDialog.field.summary.label")}
                    error={errors.summary?.message}
                  >
                    <textarea
                      {...register("summary")}
                      rows={3}
                      placeholder={t("createContentDialog.field.summary.placeholder")}
                      className={adminFieldClass(
                        cn(adminTextareaClass, "text-start placeholder:text-start"),
                        Boolean(errors.summary),
                      )}
                    />
                  </AdminFormField>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <AdminFormField
                      label={t("createContentDialog.field.language.label")}
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
                              {
                                value: "ar",
                                label: t("createContentDialog.field.language.ar"),
                              },
                              {
                                value: "en",
                                label: t("createContentDialog.field.language.en"),
                              },
                            ]}
                            placeholder={t(
                              "createContentDialog.field.language.placeholder",
                            )}
                            listboxAriaLabel={t(
                              "createContentDialog.field.language.ariaLabel",
                            )}
                          />
                        )}
                      />
                    </AdminFormField>

                    <AdminFormField
                      label={t("createContentDialog.field.slug.label")}
                      error={errors.slug?.message}
                    >
                      <input
                        {...register("slug")}
                        dir="ltr"
                        placeholder={t("createContentDialog.field.slug.placeholder")}
                        className={adminFieldClass(
                          cn(adminInputClass),
                          Boolean(errors.slug),
                        )}
                      />
                    </AdminFormField>
                  </div>

                  <AdminFormField
                    label={t("createContentDialog.field.coverImage.label")}
                    hint={t("createContentDialog.field.coverImage.hint")}
                    error={errors.coverImage?.message}
                  >
                    <input
                      {...register("coverImage")}
                      dir="ltr"
                      placeholder="https://example.com/image.jpg"
                      className={adminFieldClass(cn(adminInputClass))}
                    />
                  </AdminFormField>

                  {templateParentType ? (
                    <div className="rounded-[14px] border border-[#D8E6E5] bg-[#F8FBFB] p-4">
                      <div className="mb-4 text-right">
                        <h3 className="font-cairo text-[15px] font-extrabold text-primary">
                          {t("createContentDialog.section.template.title")}
                        </h3>
                        <p className="mt-1 font-cairo text-[12px] font-semibold text-[#5B7B79]">
                          {t("createContentDialog.section.template.description")}
                        </p>
                      </div>

                      <AdminFormField
                        label={t("createContentDialog.field.template.label")}
                        required={availableTemplates.length > 0}
                        hint={
                          templateQuery.isLoading
                            ? t("createContentDialog.field.template.hintLoading")
                            : availableTemplates.length > 0
                              ? t("createContentDialog.field.template.hintAvailable")
                              : t("createContentDialog.field.template.hintNone")
                        }
                        error={errors.templateId?.message}
                      >
                        <Controller
                          name="templateId"
                          control={control}
                          render={({ field }) => (
                            <StyledSelect
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                                setValue("templateData", {});
                                clearErrors(["templateId", "templateData"]);
                              }}
                              onBlur={field.onBlur}
                              name={field.name}
                              options={availableTemplates.map((template) => ({
                                value: template._id,
                                label:
                                  toDisplayText(template.name) ||
                                  template.slug ||
                                  template._id,
                              }))}
                              placeholder={
                                templateQuery.isLoading
                                  ? t("createContentDialog.field.template.placeholderLoading")
                                  : t("createContentDialog.field.template.placeholder")
                              }
                              listboxAriaLabel={t("createContentDialog.field.template.label")}
                            />
                          )}
                        />
                      </AdminFormField>

                      {selectedTemplate?.fields?.length ? (
                        <div className="mt-4">
                          <DynamicTemplateFieldRenderer
                            template={selectedTemplate}
                            value={watchedTemplateData}
                            language={selectedLanguage}
                            disabled={submitting}
                            getError={(path) =>
                              getPathErrorMessage(errors.templateData, path)
                            }
                            onChange={(nextValue) => {
                              setValue("templateData", nextValue, {
                                shouldDirty: true,
                                shouldValidate: false,
                              });
                              clearErrors("templateData");
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {selectedType === "NEWS" ? (
                    <>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AdminFormField
                          label={t("createContentDialog.field.sourceTitle.label")}
                          error={errors.sourceTitle?.message}
                        >
                          <input
                            {...register("sourceTitle")}
                            placeholder={t(
                              "createContentDialog.field.sourceTitle.placeholder",
                            )}
                            className={adminFieldClass(
                              cn(adminInputClass, "text-start placeholder:text-start"),
                              Boolean(errors.sourceTitle),
                            )}
                          />
                        </AdminFormField>

                        <AdminFormField
                          label={t("createContentDialog.field.sourceUrl.label")}
                          required
                          hint={t("createContentDialog.field.sourceUrl.hint")}
                          error={errors.sourceUrl?.message}
                        >
                          <input
                            {...register("sourceUrl")}
                            dir="ltr"
                            placeholder={t(
                              "createContentDialog.field.sourceUrl.placeholder",
                            )}
                            className={adminFieldClass(
                              cn(adminInputClass),
                              Boolean(errors.sourceUrl),
                            )}
                          />
                        </AdminFormField>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AdminFormField
                          label={t("createContentDialog.field.originalTitle.label")}
                          hint={t("createContentDialog.field.originalTitle.hint")}
                          error={errors.originalTitle?.message}
                        >
                          <input
                            {...register("originalTitle")}
                            placeholder={t(
                              "createContentDialog.field.originalTitle.placeholder",
                            )}
                            className={adminFieldClass(
                              cn(adminInputClass, "text-start placeholder:text-start"),
                              Boolean(errors.originalTitle),
                            )}
                          />
                        </AdminFormField>

                        <AdminFormField
                          label={t("createContentDialog.field.publishedAt.label")}
                          required
                          error={errors.publishedAt?.message}
                        >
                          <input
                            {...register("publishedAt")}
                            type="datetime-local"
                            dir="ltr"
                            className={adminFieldClass(
                              cn(adminInputClass),
                              Boolean(errors.publishedAt),
                            )}
                          />
                        </AdminFormField>
                      </div>
                    </>
                  ) : null}

                  <ContentBlockEditor
                    control={control}
                    register={register}
                    setValue={setValue}
                    clearErrors={clearErrors}
                    // See ContentBlockEditor's prop typing note: its
                    // `fieldArray` type can't statically unify with this
                    // form's concrete field-array type (RHF generic variance).
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    fieldArray={contentBlocksFieldArray as any}
                    blocks={watchedBlocks}
                    error={errors.contentBlocks?.root ?? errors.contentBlocks}
                    disabled={submitting}
                    description={t("createContentDialog.blockEditor.description")}
                  />

                  <AdminFormField
                    label={t("createContentDialog.field.pageVersion.label")}
                    hint={
                      selectedType === "SETTINGS_PAGE"
                        ? t("createContentDialog.field.pageVersion.hintSettings")
                        : t("createContentDialog.field.pageVersion.hintOther")
                    }
                    error={errors.pageVersion?.message}
                  >
                    <input
                      {...register("pageVersion")}
                      dir="ltr"
                      placeholder="2026-04"
                      className={adminFieldClass(
                        cn(adminInputClass),
                        Boolean(errors.pageVersion),
                      )}
                    />
                  </AdminFormField>

                  <section className="space-y-5 rounded-[14px] border border-[#E4E7EC] bg-white p-4">
                    <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                      {t("createContentDialog.section.classification")}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <AdminFormField
                        label={t("createContentDialog.field.tags.label")}
                        error={errors.tagsInput?.message}
                      >
                        <input
                          {...register("tagsInput")}
                          placeholder="tag-1, tag-2"
                          className={adminFieldClass(
                            cn(adminInputClass),
                            Boolean(errors.tagsInput),
                          )}
                        />
                      </AdminFormField>

                      <AdminFormField
                        label={t("createContentDialog.field.categories.label")}
                        error={errors.categoriesInput?.message}
                      >
                        <input
                          {...register("categoriesInput")}
                          placeholder="category-1, category-2"
                          className={adminFieldClass(
                            cn(adminInputClass),
                            Boolean(errors.categoriesInput),
                          )}
                        />
                      </AdminFormField>

                      <AdminFormField
                        label={t("createContentDialog.field.riskFlags.label")}
                        error={errors.riskFlagsInput?.message}
                      >
                        <input
                          {...register("riskFlagsInput")}
                          placeholder="flag-1, flag-2"
                          className={adminFieldClass(
                            cn(adminInputClass),
                            Boolean(errors.riskFlagsInput),
                          )}
                        />
                      </AdminFormField>

                      <AdminFormField
                        label={t("createContentDialog.field.relatedContentIds.label")}
                        error={errors.relatedContentIdsInput?.message}
                      >
                        <input
                          {...register("relatedContentIdsInput")}
                          dir="ltr"
                          placeholder="id-1, id-2"
                          className={adminFieldClass(
                            cn(adminInputClass),
                            Boolean(errors.relatedContentIdsInput),
                          )}
                        />
                      </AdminFormField>
                    </div>

                    <div className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFBFC] p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                          {t("createContentDialog.section.sources.title")}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            sourcesFieldArray.append({ title: "", url: "" })
                          }
                          className="inline-flex h-[32px] items-center gap-1.5 rounded-[10px] border border-primary bg-white px-3 font-cairo text-[12px] font-extrabold text-primary transition hover:bg-[#F0FDFA]"
                        >
                          {t("createContentDialog.action.addSource")}
                        </button>
                      </div>
                      {sourcesFieldArray.fields.length === 0 ? (
                        <p className="mt-2 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                          {t("createContentDialog.sources.empty")}
                        </p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {sourcesFieldArray.fields.map((row, index) => (
                            <div key={row.id} className="flex flex-wrap items-end gap-2">
                              <div className="min-w-[160px] flex-1">
                                <AdminFormField label={t("createContentDialog.field.sourceItemTitle.label")}>
                                  <input
                                    {...register(`sources.${index}.title` as const)}
                                    placeholder={t(
                                      "createContentDialog.field.sourceItemTitle.placeholder",
                                    )}
                                    className={adminFieldClass(
                                      cn(adminInputClass, "text-start placeholder:text-start"),
                                      false,
                                    )}
                                  />
                                </AdminFormField>
                              </div>
                              <div className="min-w-[200px] flex-[2]">
                                <AdminFormField label={t("createContentDialog.field.sourceItemUrl.label")}>
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
                                aria-label={t("createContentDialog.action.deleteSource")}
                                className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[10px] border border-[#FECACA] text-[#EF4444] transition hover:bg-[#FEF2F2]"
                              >
                                <X className="h-4 w-4" aria-hidden />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {typeof (errors.sources?.root?.message ?? errors.sources?.message) === "string" ? (
                        <p className="mt-2 text-right font-cairo text-[12px] font-bold text-red-600">
                          {errors.sources?.root?.message ?? errors.sources?.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <AdminFormField
                        label={t("createContentDialog.field.disclaimerVersion.label")}
                        error={errors.disclaimerVersion?.message}
                      >
                        <input
                          {...register("disclaimerVersion")}
                          placeholder={t(
                            "createContentDialog.field.disclaimerVersion.placeholder",
                          )}
                          className={adminFieldClass(
                            cn(adminInputClass),
                            Boolean(errors.disclaimerVersion),
                          )}
                        />
                      </AdminFormField>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="flex items-center justify-end gap-3 rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-3 font-cairo text-[13px] font-bold text-[#344054]">
                          <span>{t("createContentDialog.field.requiresSeekHelp.label")}</span>
                          <input
                            type="checkbox"
                            {...register("requiresSeekHelpBlock")}
                            className={checkboxClass}
                          />
                        </label>

                        <label className="flex items-center justify-end gap-3 rounded-[12px] border border-[#E4E7EC] bg-white px-4 py-3 font-cairo text-[13px] font-bold text-[#344054]">
                          <span>{t("createContentDialog.field.isFeatured.label")}</span>
                          <input
                            type="checkbox"
                            {...register("isFeatured")}
                            className={checkboxClass}
                          />
                        </label>
                      </div>
                    </div>
                  </section>

                  <div className="rounded-[14px] border border-[#E4E7EC] bg-[#FCFCFD] p-4">
                    <div className="text-right">
                      <h3 className="font-cairo text-[15px] font-extrabold text-primary">
                        {t("createContentDialog.readiness.title")}
                      </h3>
                      <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                        {t("createContentDialog.readiness.description")}
                      </p>
                    </div>
                    <div className="mt-4">
                      <ReleaseAcceptanceSection
                        snapshot={releaseAcceptance}
                        language={selectedLanguage === "en" ? "en" : "ar"}
                        showNextActions
                      />
                    </div>
                    <div className="mt-4 space-y-2">
                      {readinessItems.map((item) => (
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
                            ? t("createContentDialog.readiness.done")
                            : t("createContentDialog.readiness.pending")}
                          : {item.label}
                        </div>
                      ))}
                    </div>
                    {previewWarnings.length ? (
                      <ul className="mt-3 list-disc space-y-1 ps-5 text-right font-cairo text-[12px] font-bold text-amber-700">
                        {previewWarnings.map((warning, index) => (
                          <li key={`create-preview-warning-${index}`}>{warning}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  <section className="space-y-5 rounded-[14px] border border-[#E4E7EC] bg-white p-4">
                    <div className="font-cairo text-[15px] font-extrabold text-[#111827]">
                      {t("createContentDialog.section.reviewPreview.title")}
                    </div>
                    <p className="font-cairo text-[12px] font-semibold text-[#667085]">
                      {t("createContentDialog.section.reviewPreview.description")}
                    </p>
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                      <MedicalContentGovernancePanel
                        contentType={selectedType}
                        status="DRAFT"
                        disclaimerVersion={watchedDisclaimerVersion?.trim() || undefined}
                        requiresSeekHelpBlock={hasSeekHelpCallout(previewBlocks)}
                        isFeatured={watchedIsFeatured}
                        riskFlags={previewRiskFlags}
                        tags={previewTags}
                        categories={previewCategories}
                        relatedContentIds={previewRelatedContentIds}
                        sources={previewSources}
                        dynamicData={watchedTemplateData}
                        invalidDynamicData={false}
                        hasMeaningfulBlocks={
                          selectedType === "SETTINGS_PAGE" ||
                          watchedBlocks.some((block) => isMeaningfulBlock(block))
                        }
                        role={workflowRole}
                        language={selectedLanguage === "en" ? "en" : "ar"}
                        showAcceptanceMatrix={false}
                        news={{
                          sourceName: watchedSourceTitle?.trim() || undefined,
                          sourceUrl: watchedSourceUrl?.trim() || undefined,
                          originalTitle: watchedOriginalTitle?.trim() || undefined,
                          publishedAt: watchedPublishedAt?.trim() || undefined,
                        }}
                      />
                      <MedicalContentPatientPreview
                        title={watch("title")?.trim() || undefined}
                        summary={watch("summary")?.trim() || undefined}
                        coverImage={watchedCoverImage?.trim() || undefined}
                        language={selectedLanguage}
                        contentBlocks={previewBlocks}
                        disclaimerVersion={watchedDisclaimerVersion?.trim() || undefined}
                        requiresSeekHelpBlock={watchedRequiresSeekHelpBlock}
                        riskFlags={previewRiskFlags}
                        sources={previewSources}
                        newsSourceName={watchedSourceTitle?.trim() || undefined}
                        newsSourceUrl={watchedSourceUrl?.trim() || undefined}
                        newsPublishedAt={watchedPublishedAt?.trim() || undefined}
                        previewWarnings={previewWarnings}
                      />
                    </div>
                  </section>

                  {createMut.isError ? (
                    <div className="rounded-[12px] border border-[#FECDCA] bg-red-50 px-4 py-3 text-right font-cairo text-[12px] font-bold text-red-600">
                      {userFacingErrorMessage(
                        createMut.error,
                        t("createContentDialog.error.createFailed"),
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
                  {t("createContentDialog.action.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
                >
                  <Save className="h-4 w-4" aria-hidden />
                  {submitting
                    ? t("createContentDialog.action.saving")
                    : t("createContentDialog.action.save")}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
