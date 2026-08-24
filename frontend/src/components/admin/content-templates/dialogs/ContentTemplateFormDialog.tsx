"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useForm, Controller, useFieldArray, type Path } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateAdminContentTemplate,
  useUpdateAdminContentTemplate,
} from "@/hooks/admin/content-templates/useAdminContentTemplates";
import {
  extractFieldValidationErrors,
  userFacingErrorMessage,
} from "@/lib/admin/userFacingError";
import { useToast } from "@/components/ui/ToastProvider";
import {
  AdminFormField,
  adminFieldClass,
  adminInputClass,
} from "@/components/admin/form-field";
import StyledSelect from "@/components/ui/styled-select";
import { cn } from "@/lib/utils/utils";
import { optionalLatinSlugSchema, slugifyLatin } from "@/lib/forms/slugValidation";
import type {
  AdminContentTemplate,
  AdminContentTemplateParentType,
  CreateAdminContentTemplateBody,
} from "@/lib/admin/types";
import {
  enumToOptionsText,
  getLocalizedTextParts,
  getPreferredLocalizedText,
  getSchemaFieldTypeOptions,
  normalizeSchemaFieldType,
  optionsTextToEnum,
  serializeLocalizedLabel,
} from "./contentTemplateFormDialog.helpers";
import { useI18n } from "@/i18n/provider";

type Translate = (key: string, fallback?: string) => string;

// Every primitive here gets an explicit `error` message so a stray
// `undefined` (e.g. a race between useFieldArray.append and the first
// render) never falls through to zod's default English technical message
// ("Invalid input: expected string, received undefined") — the project
// convention is to never surface raw technical text to the admin. Built as
// a function of `t` (recreated per locale via useMemo below) so validation
// messages are bilingual too, not just the surrounding UI labels.
function buildFieldSchema(t: Translate) {
  return z
    .object({
      key: z
        .string({ error: t("contentTemplateDialog.validation.keyRequired") })
        .min(1, t("contentTemplateDialog.validation.keyRequired"))
        .regex(
          /^[a-zA-Z][a-zA-Z0-9_]*$/,
          t("contentTemplateDialog.validation.keyPattern"),
        ),
      labelAr: z.string({
        error: t("contentTemplateDialog.validation.labelArInvalid"),
      }),
      labelEn: z.string({
        error: t("contentTemplateDialog.validation.labelEnInvalid"),
      }),
      type: z.enum(["string", "number", "boolean", "array", "object"], {
        error: t("contentTemplateDialog.validation.typeInvalid"),
      }),
      required: z.boolean({
        error: t("contentTemplateDialog.validation.requiredInvalid"),
      }),
      // Comma-separated option values for a "select"-style string field. Maps
      // to ContentTemplateField.enum in docs/openapi.json — the backend has
      // no distinct "select" type, so any string field may optionally carry
      // enum options.
      optionsText: z.string({
        error: t("contentTemplateDialog.validation.optionsInvalid"),
      }),
    })
    .superRefine((value, ctx) => {
      if (!value.labelAr.trim() && !value.labelEn.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("contentTemplateDialog.validation.labelRequired"),
          path: ["labelAr"],
        });
      }
    });
}

function buildFormSchema(t: Translate) {
  const fieldSchema = buildFieldSchema(t);
  return z
    .object({
      nameAr: z.string({ error: t("contentTemplateDialog.validation.nameInvalid") }),
      nameEn: z.string({ error: t("contentTemplateDialog.validation.nameInvalid") }),
      slug: optionalLatinSlugSchema(),
      parentType: z.enum(
        ["CONDITION", "SYMPTOM", "GENERAL_ADVICE", "MEDICATION"],
        { error: t("contentTemplateDialog.validation.parentTypeInvalid") },
      ),
      fields: z
        .array(fieldSchema, {
          error: t("contentTemplateDialog.validation.fieldsMinOne"),
        })
        .min(1, t("contentTemplateDialog.validation.fieldsMinOne")),
    })
    .superRefine((value, ctx) => {
      if (!value.nameAr.trim() && !value.nameEn.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("contentTemplateDialog.validation.nameRequired"),
          path: ["nameAr"],
        });
      }
    });
}

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

function getParentTypeOptions(
  t: Translate,
): { value: AdminContentTemplateParentType; label: string }[] {
  return [
    { value: "CONDITION", label: t("contentTemplateDialog.parentType.condition") },
    { value: "SYMPTOM", label: t("contentTemplateDialog.parentType.symptom") },
    {
      value: "GENERAL_ADVICE",
      label: t("contentTemplateDialog.parentType.generalAdvice"),
    },
    { value: "MEDICATION", label: t("contentTemplateDialog.parentType.medication") },
  ];
}

const EMPTY_FORM: FormValues = {
  nameAr: "",
  nameEn: "",
  slug: "",
  parentType: "CONDITION",
  fields: [],
};

function templateToForm(template: AdminContentTemplate): FormValues {
  const parent = (
    ["CONDITION", "SYMPTOM", "GENERAL_ADVICE", "MEDICATION"] as const
  ).includes(template.parentType as AdminContentTemplateParentType)
    ? (template.parentType as AdminContentTemplateParentType)
    : "CONDITION";
  const name = getLocalizedTextParts(template.name);
  return {
    nameAr: name.ar,
    nameEn: name.en,
    slug: template.slug ?? "",
    parentType: parent,
    fields: (template.fields ?? []).map((f) => {
      const label = getLocalizedTextParts(f.label);
      return {
        key: f.key ?? "",
        labelAr: label.ar,
        labelEn: label.en,
        type: normalizeSchemaFieldType(f.type),
        required: Boolean(f.required),
        optionsText: enumToOptionsText(f.enum),
      };
    }),
  };
}

/**
 * Maps a server-reported 422 field path (e.g. "name", "fields[0].label") to
 * the matching react-hook-form path in this dialog's form state, so the
 * error can be attached to the exact input instead of only the generic
 * summary block.
 */
function mapServerFieldToFormPath(field: string): Path<FormValues> | null {
  const normalized = field.replace(/\[(\d+)\]/g, ".$1");
  if (normalized === "name") return "nameAr";
  if (normalized === "slug") return "slug";
  if (normalized === "parentType") return "parentType";

  const rowMatch = normalized.match(/^fields\.(\d+)\.(key|type|required)$/);
  if (rowMatch) {
    return `fields.${rowMatch[1]}.${rowMatch[2]}` as Path<FormValues>;
  }

  const labelMatch = normalized.match(/^fields\.(\d+)\.label$/);
  if (labelMatch) {
    return `fields.${labelMatch[1]}.labelAr` as Path<FormValues>;
  }

  const enumMatch = normalized.match(/^fields\.(\d+)\.enum$/);
  if (enumMatch) {
    return `fields.${enumMatch[1]}.optionsText` as Path<FormValues>;
  }

  return null;
}

/**
 * Focuses (and scrolls to) the input matching a form path, so the admin
 * lands directly on the field a server-reported 422 error was attached to
 * instead of only seeing a message somewhere in a long form. Tries RHF's
 * own `setFocus` first (works for `register`/`Controller`-registered
 * fields); falls back to a plain DOM query by `name` for fields whose
 * focusable element isn't the one RHF registered.
 */
function focusFieldByPath(
  formPath: string,
  setFocus: (path: Path<FormValues>) => void,
): void {
  requestAnimationFrame(() => {
    try {
      setFocus(formPath as Path<FormValues>);
    } catch {
      // Some paths aren't directly registered — fall through to the DOM
      // fallback below.
    }
    const el = document.querySelector<HTMLElement>(`[name="${formPath}"]`);
    el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    el?.focus();
  });
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** عند تمريره يتحوّل الحوار لوضع التحرير. */
  template?: AdminContentTemplate | null;
};

export default function ContentTemplateFormDialog({
  open,
  onOpenChange,
  template,
}: Props) {
  const { dir, t } = useI18n();
  const { toast } = useToast();
  const isEdit = Boolean(template?._id);
  const createMut = useCreateAdminContentTemplate();
  const updateMut = useUpdateAdminContentTemplate();
  const activeMut = isEdit ? updateMut : createMut;
  const submitting = activeMut.isPending;

  const formSchema = useMemo(() => buildFormSchema(t), [t]);
  const parentTypeOptions = useMemo(() => getParentTypeOptions(t), [t]);
  const schemaFieldTypeOptions = useMemo(() => getSchemaFieldTypeOptions(t), [t]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    setFocus,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: EMPTY_FORM,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "fields" });

  // Tracks whether the admin has manually edited the slug, so the
  // auto-suggestion below only fills it in and never overwrites a
  // deliberate choice.
  const slugTouchedRef = useRef(false);
  const slugRegistration = register("slug");
  const watchedNameEn = watch("nameEn");

  useEffect(() => {
    if (open) {
      reset(template ? templateToForm(template) : EMPTY_FORM);
      slugTouchedRef.current = isEdit;
      createMut.reset();
      updateMut.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, template]);

  useEffect(() => {
    if (!open || isEdit || slugTouchedRef.current) return;
    const suggestion = slugifyLatin(watchedNameEn || "");
    if (suggestion) {
      setValue("slug", suggestion, { shouldValidate: false });
    }
  }, [open, isEdit, watchedNameEn, setValue]);

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

  const onSubmit = handleSubmit(async (v) => {
    const name = serializeLocalizedLabel({ ar: v.nameAr, en: v.nameEn });
    const body: CreateAdminContentTemplateBody = {
      name,
      slug: v.slug?.trim() || undefined,
      parentType: v.parentType,
      fields: v.fields.map((f) => ({
        key: f.key.trim(),
        label: serializeLocalizedLabel({
          ar: f.labelAr,
          en: f.labelEn,
        }) as CreateAdminContentTemplateBody["fields"][number]["label"],
        type: f.type,
        required: f.required,
        ...(optionsTextToEnum(f.optionsText)
          ? { enum: optionsTextToEnum(f.optionsText) }
          : {}),
      })),
    };
    const displayName = getPreferredLocalizedText(name);
    try {
      if (isEdit && template) {
        await updateMut.mutateAsync({ id: template._id, body });
        toast(
          t(
            "contentTemplateDialog.toast.updated.message",
            `حُدّث القالب «${displayName}».`,
          ).replace("{name}", displayName),
          {
            title: t("contentTemplateDialog.toast.updated.title"),
            variant: "success",
          },
        );
      } else {
        await createMut.mutateAsync(body);
        toast(
          t(
            "contentTemplateDialog.toast.created.message",
            `أُضيف القالب «${displayName}».`,
          ).replace("{name}", displayName),
          {
            title: t("contentTemplateDialog.toast.created.title"),
            variant: "success",
          },
        );
      }
      onOpenChange(false);
    } catch (submitError) {
      // Attach any server-reported field-path errors to their matching input
      // in addition to the generic summary shown below via activeMut.isError,
      // and focus the first offending field so the admin lands on it
      // directly instead of having to hunt for it in the form.
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
          aria-label={
            isEdit
              ? t("contentTemplateDialog.title.edit")
              : t("contentTemplateDialog.title.create")
          }
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
            className="relative max-h-[min(92vh,920px)] w-full max-w-[680px] overflow-hidden rounded-[16px] border border-[#EEF2F6] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
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
                className="absolute start-6 top-6 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#98A2B3] transition hover:bg-[#F3F4F6] hover:text-[#111827] disabled:opacity-50"
                aria-label={t("contentTemplateDialog.close")}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <div className="relative text-start">
                <h2 className="font-cairo text-[22px] font-extrabold text-primary">
                  {isEdit
                    ? t("contentTemplateDialog.title.edit")
                    : t("contentTemplateDialog.title.create")}
                </h2>
                <p className="mt-1 font-cairo text-[13px] font-semibold text-[#5B7B79]">
                  {t("contentTemplateDialog.subtitle")}
                </p>
              </div>
            </div>

            <form dir={dir} onSubmit={onSubmit}>
              <div className="max-h-[calc(92vh-240px)] overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <AdminFormField
                      label={t("contentTemplateDialog.field.nameAr.label")}
                      required
                      error={errors.nameAr?.message}
                    >
                      <input
                        {...register("nameAr")}
                        placeholder={t(
                          "contentTemplateDialog.field.nameAr.placeholder",
                        )}
                        className={adminFieldClass(
                          cn(
                            adminInputClass,
                            "text-start placeholder:text-start",
                          ),
                          Boolean(errors.nameAr),
                        )}
                      />
                    </AdminFormField>

                    <AdminFormField
                      label={t("contentTemplateDialog.field.nameEn.label")}
                      error={errors.nameEn?.message}
                    >
                      <input
                        {...register("nameEn")}
                        dir="ltr"
                        placeholder={t(
                          "contentTemplateDialog.field.nameEn.placeholder",
                        )}
                        className={adminFieldClass(
                          cn(adminInputClass),
                          Boolean(errors.nameEn),
                        )}
                      />
                    </AdminFormField>

                    <AdminFormField
                      label={t("contentTemplateDialog.field.parentType.label")}
                      required
                      error={errors.parentType?.message}
                    >
                      <Controller
                        name="parentType"
                        control={control}
                        render={({ field }) => (
                          <StyledSelect
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            options={parentTypeOptions}
                            placeholder={t(
                              "contentTemplateDialog.field.parentType.placeholder",
                            )}
                            listboxAriaLabel={t(
                              "contentTemplateDialog.field.parentType.label",
                            )}
                          />
                        )}
                      />
                    </AdminFormField>
                  </div>

                  <AdminFormField
                    label={t("contentTemplateDialog.field.slug.label")}
                    hint={t("contentTemplateDialog.field.slug.hint")}
                    error={errors.slug?.message}
                  >
                    <input
                      {...slugRegistration}
                      onChange={(event) => {
                        slugTouchedRef.current = true;
                        slugRegistration.onChange(event);
                      }}
                      dir="ltr"
                      placeholder={t(
                        "contentTemplateDialog.field.slug.placeholder",
                      )}
                      className={adminFieldClass(
                        cn(adminInputClass),
                        Boolean(errors.slug),
                      )}
                    />
                  </AdminFormField>

                  <div className="rounded-[12px] border border-[#EEF2F6] bg-[#FAFBFC] p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-cairo text-[13px] font-extrabold text-[#111827]">
                        {t("contentTemplateDialog.section.fields.title")}
                        <span className="me-2 rounded-full bg-[#EEF2F6] px-2 py-0.5 font-cairo text-[11px] font-bold text-[#667085]">
                          {fields.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          append({
                            key: "",
                            labelAr: "",
                            labelEn: "",
                            type: "string",
                            required: false,
                            optionsText: "",
                          })
                        }
                        className="inline-flex h-[34px] items-center gap-1.5 rounded-[10px] border border-primary bg-white px-3 font-cairo text-[12px] font-extrabold text-primary transition hover:bg-[#F0FDFA]"
                      >
                        <Plus className="h-4 w-4" aria-hidden />
                        {t("contentTemplateDialog.action.addField")}
                      </button>
                    </div>

                    {fields.length === 0 ? (
                      <p className="mt-3 font-cairo text-[12px] font-semibold text-[#98A2B3]">
                        {t("contentTemplateDialog.empty.noFields")}
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {fields.map((row, index) => (
                          <div
                            key={row.id}
                            className="rounded-[12px] border border-[#EEF2F6] bg-white p-3"
                          >
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <AdminFormField
                                label={t("contentTemplateDialog.field.key.label")}
                                required
                                error={errors.fields?.[index]?.key?.message}
                              >
                                <input
                                  {...register(`fields.${index}.key` as const)}
                                  dir="ltr"
                                  placeholder={t(
                                    "contentTemplateDialog.field.key.placeholder",
                                  )}
                                  className={adminFieldClass(
                                    cn(adminInputClass),
                                    Boolean(errors.fields?.[index]?.key),
                                  )}
                                />
                              </AdminFormField>

                              <AdminFormField
                                label={t(
                                  "contentTemplateDialog.field.labelAr.label",
                                )}
                                required
                                error={errors.fields?.[index]?.labelAr?.message}
                              >
                                <input
                                  {...register(
                                    `fields.${index}.labelAr` as const,
                                  )}
                                  placeholder={t(
                                    "contentTemplateDialog.field.labelAr.placeholder",
                                  )}
                                  className={adminFieldClass(
                                    cn(
                                      adminInputClass,
                                      "text-start placeholder:text-start",
                                    ),
                                    Boolean(errors.fields?.[index]?.labelAr),
                                  )}
                                />
                              </AdminFormField>

                              <AdminFormField
                                label={t(
                                  "contentTemplateDialog.field.labelEn.label",
                                )}
                                error={errors.fields?.[index]?.labelEn?.message}
                              >
                                <input
                                  {...register(
                                    `fields.${index}.labelEn` as const,
                                  )}
                                  dir="ltr"
                                  placeholder={t(
                                    "contentTemplateDialog.field.labelEn.placeholder",
                                  )}
                                  className={adminFieldClass(
                                    cn(adminInputClass),
                                    Boolean(errors.fields?.[index]?.labelEn),
                                  )}
                                />
                              </AdminFormField>
                            </div>

                            <div className="mt-3 flex flex-wrap items-end gap-3">
                              <div className="min-w-[180px] flex-1">
                                <AdminFormField
                                  label={t("contentTemplateDialog.field.type.label")}
                                >
                                  <Controller
                                    name={`fields.${index}.type` as const}
                                    control={control}
                                    render={({ field }) => (
                                      <StyledSelect
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        options={schemaFieldTypeOptions}
                                        placeholder={t(
                                          "contentTemplateDialog.field.type.placeholder",
                                        )}
                                        listboxAriaLabel={t(
                                          "contentTemplateDialog.field.type.label",
                                        )}
                                      />
                                    )}
                                  />
                                </AdminFormField>
                              </div>

                              <label className="inline-flex h-[44px] cursor-pointer items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 font-cairo text-[12px] font-extrabold text-[#344054]">
                                <input
                                  type="checkbox"
                                  {...register(
                                    `fields.${index}.required` as const,
                                  )}
                                  className="h-4 w-4 accent-[#0F8F8B]"
                                />
                                {t("contentTemplateDialog.field.required.label")}
                              </label>

                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[10px] border border-[#FECACA] text-[#EF4444] transition hover:bg-[#FEF2F2]"
                                aria-label={t(
                                  "contentTemplateDialog.action.deleteField",
                                )}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden />
                              </button>
                            </div>

                            <div className="mt-3">
                              <AdminFormField
                                label={t(
                                  "contentTemplateDialog.field.options.label",
                                )}
                                hint={t(
                                  "contentTemplateDialog.field.options.hint",
                                )}
                                error={
                                  errors.fields?.[index]?.optionsText?.message
                                }
                              >
                                <input
                                  {...register(
                                    `fields.${index}.optionsText` as const,
                                  )}
                                  dir="ltr"
                                  placeholder={t(
                                    "contentTemplateDialog.field.options.placeholder",
                                  )}
                                  className={adminFieldClass(
                                    cn(adminInputClass),
                                    Boolean(
                                      errors.fields?.[index]?.optionsText,
                                    ),
                                  )}
                                />
                              </AdminFormField>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {typeof errors.fields?.message === "string" ? (
                      <p className="mt-3 text-start font-cairo text-[12px] font-bold text-red-600">
                        {errors.fields.message}
                      </p>
                    ) : null}
                  </div>

                  {activeMut.isError ? (
                    <div className="rounded-[12px] border border-[#FECDCA] bg-red-50 px-4 py-3 text-start font-cairo text-[12px] font-bold text-red-600">
                      {userFacingErrorMessage(
                        activeMut.error,
                        isEdit
                          ? t("contentTemplateDialog.error.updateFailed")
                          : t("contentTemplateDialog.error.createFailed"),
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
                  {t("contentTemplateDialog.action.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-primary font-cairo text-[14px] font-extrabold text-white disabled:opacity-60"
                >
                  <Save className="h-4 w-4" aria-hidden />
                  {submitting
                    ? t("contentTemplateDialog.action.saving")
                    : isEdit
                      ? t("contentTemplateDialog.action.saveEdit")
                      : t("contentTemplateDialog.action.saveCreate")}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
