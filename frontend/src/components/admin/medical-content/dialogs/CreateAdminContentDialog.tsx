"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Save, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAdminContent } from "@/hooks/admin/content/useAdminContent";
import { useAdminContentTemplates } from "@/hooks/admin/content-templates/useAdminContentTemplates";
import { userFacingErrorMessage } from "@/lib/admin/userFacingError";
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
  AdminContentTemplate,
  AdminContentType,
} from "@/lib/admin/types";

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
    sourceTitle: z.string().optional(),
    originalTitle: z.string().optional(),
    sourceUrl: z
      .string()
      .optional()
      .refine((value) => {
        if (!value?.trim()) return true;
        return isValidNewsSourceUrl(value);
      }, "أدخل رابط مصدر خارجي صحيح يبدأ بـ http:// أو https://،  ."),
    publishedAt: z.string().optional(),
    pageVersion: z.string().optional(),
    templateId: z.string().optional(),
    templateData: z.record(z.string(), z.unknown()).default({}),
    contentBlocks: z.array(contentBlockSchema).default([createEmptyBlock()]),
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

    if (value.type === "NEWS" && (!value.sourceUrl || !value.sourceUrl.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sourceUrl"],
        message: "رابط مصدر الخبر مطلوب",
      });
    }

    if (value.type === "NEWS" && (!value.publishedAt || !value.publishedAt.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["publishedAt"],
        message: "تاريخ نشر الخبر مطلوب",
      });
    }

    if (
      value.type !== "SETTINGS_PAGE" &&
      !value.contentBlocks.some((block) => isMeaningfulBlock(block))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["contentBlocks"],
        message: "أضف على الأقل بلوك محتوى واحدًا فعليًا قبل حفظ المسودة.",
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

const EMPTY_FORM: FormValues = {
  type: "GENERAL_ADVICE",
  title: "",
  summary: "",
  language: "ar",
  slug: "",
  sourceTitle: "",
  originalTitle: "",
  sourceUrl: "",
  publishedAt: "",
  pageVersion: "",
  templateId: "",
  templateData: {},
  contentBlocks: [createEmptyBlock()],
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreateAdminContentDialog({
  open,
  onOpenChange,
}: Props) {
  const { toast } = useToast();
  const createMut = useCreateAdminContent();
  const submitting = createMut.isPending;
  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: EMPTY_FORM,
  });
  const contentBlocksFieldArray = useFieldArray({
    control,
    name: "contentBlocks",
  });

  const selectedType = watch("type");
  const selectedLanguage = watch("language");
  const selectedTemplateId = watch("templateId");
  const watchedBlocks = watch("contentBlocks") ?? [];
  const watchedTemplateData = watch("templateData") ?? {};
  const watchedSourceUrl = watch("sourceUrl");
  const watchedPublishedAt = watch("publishedAt");
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

  const readinessItems = useMemo(() => {
    const items = [
      {
        key: "contentBlocks",
        label: "إضافة محتوى فعلي داخل المقال",
        done:
          selectedType === "SETTINGS_PAGE" ||
          watchedBlocks.some((block) => isMeaningfulBlock(block)),
      },
      {
        key: "newsMetadata",
        label: "استكمال بيانات الخبر الأساسية",
        done:
          selectedType !== "NEWS" ||
          Boolean(watchedSourceUrl?.trim() && watchedPublishedAt?.trim()),
      },
      {
        key: "template",
        label: "اختيار قالب مناسب عند توفره",
        done:
          !templateParentType ||
          availableTemplates.length === 0 ||
          Boolean(selectedTemplateId?.trim()),
      },
    ];

    if (selectedTemplate?.fields?.some((field) => field.required)) {
      items.push({
        key: "templateFields",
        label: "استكمال الحقول الإلزامية في القالب",
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
    selectedTemplate,
    selectedLanguage,
    selectedTemplateId,
    selectedType,
    templateParentType,
    watchedBlocks,
    watchedPublishedAt,
    watchedSourceUrl,
    watchedTemplateData,
  ]);

  useEffect(() => {
    if (!open) {
      reset(EMPTY_FORM);
      createMut.reset();
    }
  }, [createMut, open, reset]);

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
          message: "اختر قالبًا مناسبًا قبل حفظ المسودة.",
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

      await createMut.mutateAsync({
        type: v.type,
        title: v.title.trim(),
        summary: v.summary?.trim() || undefined,
        language: v.language,
        slug: v.slug?.trim() || undefined,
        pageVersion: v.pageVersion?.trim() || undefined,
        templateId: v.templateId?.trim() || undefined,
        data: normalizedTemplateData,
        contentBlocks: normalizedContentBlocks,
        sources:
          v.type === "NEWS" && normalizedSourceUrl
            ? [
                {
                  title: v.sourceTitle?.trim() || v.title.trim(),
                  url: normalizedSourceUrl,
                },
              ]
            : undefined,
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

      toast(`أُضيفت مسودة «${v.title.trim()}» إلى المحتوى الطبي.`, {
        title: "تم إضافة المحتوى",
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
          aria-label="إضافة محتوى طبي"
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
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <div className="relative text-right">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  إضافة محتوى طبي
                </h2>
                <p className="mt-1 font-cairo text-[13px] font-semibold text-[#5B7B79]">
                  أنشئ مسودة حقيقية بالمحتوى الأساسي والقالب المناسب ثم أكمل المراجعة
                  والنشر لاحقًا.
                </p>
              </div>
            </div>

            <form dir="rtl" onSubmit={onSubmit}>
              <div className="max-h-[calc(92vh-240px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
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
                    label="العنوان"
                    required
                    error={errors.title?.message}
                  >
                    <input
                      {...register("title")}
                      placeholder="عنوان واضح للمحتوى"
                      className={adminFieldClass(
                        cn(adminInputClass, "text-start placeholder:text-start"),
                        Boolean(errors.title),
                      )}
                    />
                  </AdminFormField>

                  <AdminFormField label="ملخص" error={errors.summary?.message}>
                    <textarea
                      {...register("summary")}
                      rows={3}
                      placeholder="مقدمة قصيرة تصف المحتوى…"
                      className={adminFieldClass(
                        cn(adminTextareaClass, "text-start placeholder:text-start"),
                        Boolean(errors.summary),
                      )}
                    />
                  </AdminFormField>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  </div>

                  {templateParentType ? (
                    <div className="rounded-[14px] border border-[#D8E6E5] bg-[#F8FBFB] p-4">
                      <div className="mb-4 text-right">
                        <h3 className="font-cairo text-[15px] font-extrabold text-primary">
                          القالب والبيانات المنظمة
                        </h3>
                        <p className="mt-1 font-cairo text-[12px] font-semibold text-[#5B7B79]">
                          اختر قالبًا نشطًا لهذا النوع لإدخال البيانات الطبية المنظمة من
                          البداية.
                        </p>
                      </div>

                      <AdminFormField
                        label="القالب"
                        required={availableTemplates.length > 0}
                        hint={
                          templateQuery.isLoading
                            ? "جارٍ تحميل القوالب المتاحة…"
                            : availableTemplates.length > 0
                              ? "اختر القالب الأنسب ثم أكمل الحقول الإلزامية."
                              : "لا توجد قوالب نشطة لهذا النوع حاليًا، ويمكنك المتابعة بدون قالب."
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
                          label="اسم المصدر"
                          error={errors.sourceTitle?.message}
                        >
                          <input
                            {...register("sourceTitle")}
                            placeholder="مثال: WHO أو Mayo Clinic"
                            className={adminFieldClass(
                              cn(adminInputClass, "text-start placeholder:text-start"),
                              Boolean(errors.sourceTitle),
                            )}
                          />
                        </AdminFormField>

                        <AdminFormField
                          label="رابط المصدر"
                          required
                          hint="أدخل رابط الخبر الأصلي من موقع خارجي، وليس رابطاً من لوحة التحكم أو localhost."
                          error={errors.sourceUrl?.message}
                        >
                          <input
                            {...register("sourceUrl")}
                            dir="ltr"
                            placeholder="https://example.com/news"
                            className={adminFieldClass(
                              cn(adminInputClass),
                              Boolean(errors.sourceUrl),
                            )}
                          />
                        </AdminFormField>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <AdminFormField
                          label="العنوان الأصلي"
                          hint="سيُستخدم داخل بيانات الخبر إذا اختلف عن عنوان المحتوى."
                          error={errors.originalTitle?.message}
                        >
                          <input
                            {...register("originalTitle")}
                            placeholder="عنوان المادة كما نُشرت في المصدر"
                            className={adminFieldClass(
                              cn(adminInputClass, "text-start placeholder:text-start"),
                              Boolean(errors.originalTitle),
                            )}
                          />
                        </AdminFormField>

                        <AdminFormField
                          label="تاريخ النشر"
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
                    fieldArray={contentBlocksFieldArray}
                    blocks={watchedBlocks}
                    error={errors.contentBlocks}
                    disabled={submitting}
                    description="أنشئ البلوكات الفعلية للمقال الآن بدل الاعتماد على مسودة افتراضية فارغة."
                  />

                  <AdminFormField
                    label="إصدار الصفحة (اختياري)"
                    hint={
                      selectedType === "SETTINGS_PAGE"
                        ? "هذا الحقل مطلوب لصفحات الإعدادات."
                        : "استخدمه عند الحاجة، ويصبح مطلوبًا مع SETTINGS_PAGE."
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

                  <div className="rounded-[14px] border border-[#E4E7EC] bg-[#FCFCFD] p-4">
                    <div className="text-right">
                      <h3 className="font-cairo text-[15px] font-extrabold text-primary">
                        جاهزية المسودة
                      </h3>
                      <p className="mt-1 font-cairo text-[12px] font-semibold text-[#667085]">
                        يساعدك هذا الملخص على التقاط النواقص قبل إرسال المحتوى للمراجعة
                        لاحقًا.
                      </p>
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
                          {item.done ? "مكتمل" : "بحاجة لاستكمال"}: {item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {createMut.isError ? (
                    <div className="rounded-[12px] border border-[#FECDCA] bg-red-50 px-4 py-3 text-right font-cairo text-[12px] font-bold text-red-600">
                      {userFacingErrorMessage(createMut.error, "تعذر الإنشاء")}
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
                  {submitting ? "جارٍ الحفظ…" : "حفظ كمسودة"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
